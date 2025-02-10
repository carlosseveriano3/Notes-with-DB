import { Request, Response } from 'express';
import { createNote } from '../db/notes';

export default class NoteController {
  async createNote(req: Request, res: Response) {
    try {
      const { title, body } = req.body
      const header = req.headers["header"] as string | undefined;
  
      if (!header) {
        res.status(400).json({error: 'Header is required'});
        return;
      }
  
      const note = await createNote({
        header,
        title,
        body
      })
  
      //REDIS
      console.log(note)
      console.log(header)
      res.status(200).json(note);
    } catch (error) {
      console.log(error);
      res.sendStatus(400);
    } 
  }
}
