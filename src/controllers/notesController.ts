import express from 'express';
import { createNote } from '../db/notes'

export const note = async (req: express.Request, res: express.Response) => {
   try {
    const { title, body } = req.body
    const header = req.headers["header"] as string | undefined;

    if (!header) {
      return res.status(400).json({error: 'Header is required'});
    }

    const note = await createNote({
      header,
      title,
      body
    })

    //REDIS

    return res.status(200).json(note);
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};