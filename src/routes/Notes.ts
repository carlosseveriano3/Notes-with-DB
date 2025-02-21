import express from "express";

import NotesController from "../controllers/notesController";
const notesController = new NotesController

export default (router: express.Router) => {
  router.post('/create-note', notesController.createNote);
  router.get('notes/:id', )
};