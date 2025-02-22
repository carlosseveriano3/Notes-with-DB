import { Request, Response } from 'express';
import { createNote, getNotesById, NotesModel } from '../db/notes'
import { redisClient } from '../redisClient'
import RabbitmqController from '../rabbitmqController'
import { ConsumeMessage } from 'amqplib'

const rabbitmqController = new RabbitmqController

type Note = {
  token: string
  title: string
  body: string
}
export default class NotesController {
  createNote = async (/*req: Request, res: Response*/) => {
    try {
      const channelCreateNote = await rabbitmqController.consumeCreateNoteRB()
      console.log("rabbitmq connected")
    
      channelCreateNote.consume('create-note', async (message: ConsumeMessage | null) => {
        if (message) {
          let receivedNote: Note
          try {
            receivedNote = JSON.parse(message.content.toString());
            channelCreateNote.ack(message);
          } catch (error) {
            console.log(`Something went wrong ${error}`)
            channelCreateNote.ack(message)
            return
          }

          console.log(receivedNote);

          const { token, title, body } = receivedNote;
          
          if (!token) {
            console.log("error: 'Token is required'")
            //res.status(401).json({error: 'Header is required'});
            return
          }

          await redisClient.connect();

          const redisToken = await redisClient.get("token");

          console.log({redisToken});

          if (token != redisToken) {
            console.log("error: 'unauthenticated'")
            //res.status(401).json({error: 'unauthenticated'})
            return;
          }

          console.log("criando a nota no Mongo")

          const note = await createNote({
            token,
            title,
            body
          });

          await rabbitmqController.publishReturningNotes(JSON.stringify(note));

          // res.status(200).json(note);
        }
      })
    } catch (error) {
      console.log(error);
      // res.sendStatus(400);
    }
  };

  getSingleNote = async (req: Request, res: Response): Promise<void> => {
    try {
      const clientToken = req.headers["clientToken"];

      if (!clientToken) {
        console.log("error: 'Client Token is required'")
        res.status(401).json({error: 'Client Token is required'});
        return
      }

      await redisClient.connect();

      const redisToken = await redisClient.get("token");

      if (clientToken != redisToken) {
        console.log("error: 'unauthenticated'")
        res.status(401).json({error: 'unauthenticated'})
        return;
      }

      const { id } = req.params
      
      const cachedNote = await redisClient.get(id);
      
      if (cachedNote) {
        console.log("in cache")
        res.json(cachedNote)
      }

      const noteFromDB = await NotesModel.findById(id)

      // await redisClient.set(`note:${id}`, JSON.stringify(noteFromDB), "EX", 600);

      const note: Note = await getNotesById(id)

      const { title, body } = note

      

      

      res.json(note);
    } catch (error) {
      console.log(error);
      res.sendStatus(400);
    }
  }
}