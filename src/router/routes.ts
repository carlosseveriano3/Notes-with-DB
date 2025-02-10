import express from 'express';
import noteRouter from './notes';
const router = express.Router();

noteRouter(router);

export default router;