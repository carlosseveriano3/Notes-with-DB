import express from "express";

import NoteController from "../controllers/notesController";
const noteController = new NoteController();

export default (router: express.Router) => {
  router.post('/create-note', noteController.createNote);
};