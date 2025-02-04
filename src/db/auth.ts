import mongoose from "mongoose";

const AuthSchema = new mongoose.Schema({
  password: { type: String, required: true }
})

export const AuthModel = mongoose.model('Auth', AuthSchema);

export const getPassword = (password: string) => AuthModel.findOne({ password });
