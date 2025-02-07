import { Router } from 'express';

import createNote from './createNote';

const router = Router();

export default (): Router => {
  createNote(router);
  return router;
};