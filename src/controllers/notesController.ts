import { Request, Response } from 'express';
import { createNote, getNotesById } from '../db/notes'
import { redisClient } from '../redisClient'
import RabbitmqController from '../rabbitmqController'
import { ConsumeMessage } from 'amqplib'

const rabbitmqController = new RabbitmqController

type Note = {
  header: string
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

          const { header, title, body } = receivedNote;
          
          if (!header) {
            console.log("error: 'Header is required'")
            //res.status(401).json({error: 'Header is required'});
            return
          }

          await redisClient.connect();

          const token = await redisClient.get("token");

          console.log({token});

          if (header != token) {
            console.log("error: 'unauthenticated'")
            //res.status(401).json({error: 'unauthenticated'})
            return;
          }

          const note = await createNote({
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
      const { id } = req.params

      const note = await getNotesById(id)

      res.json(note)
    } catch (error) {
      console.log(error);
      res.sendStatus(400);
    }
  }
}