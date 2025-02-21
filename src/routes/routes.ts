import express from 'express';
import Notes from './notes';
const router = express.Router();

Notes(router);

export default router;