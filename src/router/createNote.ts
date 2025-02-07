import express from "express";

import { note } from "../controllers/notesController";

export default (router: express.Router) => {
  router.post('/create-note', note);
};