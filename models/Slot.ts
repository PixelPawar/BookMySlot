import mongoose, { Document, Schema } from 'mongoose';

export interface ISlot extends Document {
  slotDate: string;
  slotDay: string;
  slotTime: string;
  isAvailable: boolean;
  bookedBy: string | null;
}

const SlotSchema: Schema = new Schema({
  slotDate: { type: String, required: true },
  slotDay: { type: String, required: true },
  slotTime: { type: String, required: true },
  isAvailable: { type: Boolean, default: true },
  bookedBy: { type: String, default: null }
}, { timestamps: true });

export default mongoose.model<ISlot>('Slot', SlotSchema);
