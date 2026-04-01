import mongoose, { Document, Schema } from 'mongoose';

export interface ISlot extends Document {
  slotTime: string;
  isAvailable: boolean;
  bookedBy: string | null;
}

const SlotSchema: Schema = new Schema({
  slotTime: { type: String, required: true },
  isAvailable: { type: Boolean, default: true },
  bookedBy: { type: String, default: null }
}, { timestamps: true });

export default mongoose.model<ISlot>('Slot', SlotSchema);
