import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema({
  title: { type: String, require: true },
  body: { type: String, require: true }
})

export const NotesModel = mongoose.model('Note', NoteSchema);

export const getNotes = () => NotesModel.find();
export const getNotesById = (id: string) => NotesModel.findById(id);
export const createNote = (values: Record<string, any>) => new NotesModel(values)
  .save().then((note) => note.toObject());
export const deleteNoteById = (id: string) => NotesModel.findOneAndDelete({ _id: id });
export const updateNoteById = (id: string, values: Record<string, any>) => NotesModel.findByIdAndDelete(id, values);