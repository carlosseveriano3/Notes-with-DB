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
  createNote = async () => {
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
      const clientToken = req.headers['header']
      console.log(clientToken)

      if (!clientToken) {
        console.log("error: 'Client Token is required'")
        res.status(401).json({error: 'Client Token is required'});
        return
      }

      await redisClient.connect();

      const redisToken = await redisClient.get("token");

      if (clientToken != redisToken) {
        res.status(401).json({error: 'unauthenticated'})
        return;
      }

      const { id } = req.params
      
      const cachedNote = await redisClient.get(`note:${id}`);
      
      if (cachedNote) {
        console.log("in cache")
        const parsedCache = JSON.parse(cachedNote)
        res.json(parsedCache)
        return
      }

      console.log('getting note from DB')
      const noteFromDB = await NotesModel.findById(id)

      if (!noteFromDB) {
        res.status(404).json('Not found')
        return;
      }

      console.log('putting note in cache')
      await redisClient.set(`note:${id}`, JSON.stringify(noteFromDB));

      //with expiration option:
      // await redisClient.set(`note:${id}`, JSON.stringify(noteFromDB), { EX: 600 });

      res.json(noteFromDB);
    } catch (error) {
      console.log(error);
      res.sendStatus(400);
    }
  }
}