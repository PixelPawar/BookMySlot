import express, { Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());


// ✅ Local MongoDB Connection
const MONGO_URI: string = "mongodb://127.0.0.1:27017/bookmyslot";

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err: Error) => console.log("❌ DB Error:", err));


// ================= SCHEMA =================
interface ISlot extends mongoose.Document {
  date: string;
  time: string;
  isBooked: boolean;
  bookedBy: string | null;
}

const slotSchema = new mongoose.Schema<ISlot>({
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  isBooked: {
    type: Boolean,
    default: false
  },
  bookedBy: {
    type: String,
    default: null
  }
}, { timestamps: true });

const Slot = mongoose.model<ISlot>("Slot", slotSchema);


// ================= ROUTES =================

// ✅ 1. POST /slot → Create New Slot (Admin)
app.post("/slot", async (req: Request, res: Response) => {
  try {
    const { date, time } = req.body;

    const newSlot = new Slot({
      date,
      time
    });

    await newSlot.save();

    res.status(201).json({
      message: "Slot created successfully",
      slot: newSlot
    });

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ 2. GET /slots → Fetch All Slots (with availability)
app.get("/slots", async (req: Request, res: Response) => {
  try {
    const slots = await Slot.find();

    res.json({
      total: slots.length,
      slots: slots
    });

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


// ================= SERVER =================
const PORT: number = 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});