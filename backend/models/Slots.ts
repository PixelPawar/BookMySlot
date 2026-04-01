import mongoose, { Schema, Document } from "mongoose";

export interface ISlot extends Document {
  date: string;
  time: string;
  isBooked: boolean;
  bookedBy: string | null;
}

const slotSchema: Schema = new Schema({
  date: { type: String, required: true },
  time: { type: String, required: true },
  isBooked: { type: Boolean, default: false },
  bookedBy: { type: String, default: null }
}, { timestamps: true });

export default mongoose.model<ISlot>("Slot", slotSchema);