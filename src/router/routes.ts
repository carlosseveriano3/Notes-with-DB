import express from 'express';
import createNote from './createNote';
const router = express.Router();

createNote(router);

export default router;