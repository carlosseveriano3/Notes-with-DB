import mongoose from "mongoose";
import { NotesModel } from "./db/notes"; // Update the import path

async function fetchNotes(): Promise<void> {
  try {
    const notes = await NotesModel.find();
    console.log("Notes from database:", notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
  } finally {
    mongoose.connection.close();
  }
}

fetchNotes();