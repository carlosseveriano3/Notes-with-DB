import { Request, Response } from 'express';
import { createNote } from '../db/notes'
import { redisClient } from '../redisClient'
import { rabbitmqClient } from '../rabbitMQ'
import { ConsumeMessage } from 'amqplib'
import { Types } from 'mongoose';

type Note = {
  header: string
  title: string
  body: string
}

export const note = async (req: Request, res: Response) => {
   try {
    const channel = await rabbitmqClient()

    await channel.assertExchange('notes', 'direct', {durable: false});
    await channel.assertQueue('create-note', {durable: false});
  
    channel.bindQueue('create-note', 'notes', 'create-note-bq');
  
    channel.consume('create-note', async (message: ConsumeMessage | null) => {
      if (message) {
        let receivedNote: Note
        try {
          receivedNote = JSON.parse(message.content.toString());
          channel.ack(message);
        } catch (error) {
          console.log(`Something went wrong ${error}`)
          channel.ack(message)
          return
        }

        console.log(receivedNote)

        const { header, title, body } = receivedNote
        
        if (!header) {
          res.status(401).json({error: 'Header is required'});
          return;
        }

        await redisClient.connect();

        const token = await redisClient.get("token");

        console.log({token})

        if (header != token) {
          res.status(401).json({error: 'unauthenticated'})
          return;
        }

        const note = await createNote({
          title,
          body
        })

        res.status(200).json(note);
      }
    })
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
};

export const getNote = async (req: Request, res: Response) => {
  try {
    
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
}