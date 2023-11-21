import mongoose, { Schema, model } from "mongoose";

const placeSchema = Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    url: { type: String, required: true },
    address: { type: String, required: true },
    location: {
      lat: { type: Number, required: true },
      lan: { type: Number, required: true }
    },
    creatorId: { type: mongoose.Types.ObjectId , required:true , ref: 'User' }
  }
);

export const Place = model('Place', placeSchema);
