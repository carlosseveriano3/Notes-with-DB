import { Request, Response } from 'express';
import { createNote } from '../db/notes'
import { redisClient } from '../redisClient'
import { enqueue } from '../rabbitMQ'

export const note = async (req: Request, res: Response) => {
   try {
    const { title, body } = req.body
    const header = req.headers["header"] as string | undefined;

    enqueue('We got the message')

    if (!header) {
      res.status(400).json({error: 'Header is required'});
      return;
    }

    await redisClient.connect();

    const token = await redisClient.get("token");

    if (header != token) {
      res.status(401).json({error: 'unauthenticated'})
      return;
    }

    console.log({token})

    const note = await createNote({
      title,
      body
    })
    
    res.status(200).json(note);
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
};