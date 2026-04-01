import express, { Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import Slot from "./models/Slots";


const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Atlas Connection
const MONGO_URI: string = "mongodb+srv://admin:yourpassword@cluster0.xxxxx.mongodb.net/bookmyslot?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas Connected"))
  .catch((err: Error) => console.log("❌ Error:", err));


// ================= ROUTES =================

// Create Slot
app.post("/slot", async (req: Request, res: Response) => {
  try {
    const slot = new Slot(req.body);
    await slot.save();
    res.status(201).json(slot);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get All Slots
app.get("/slots", async (req: Request, res: Response) => {
  try {
    const slots = await Slot.find();
    res.json(slots);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Book Slot
app.post("/book/:id", async (req: Request, res: Response) => {
  try {
    const { rollNumber } = req.body;

    const slot = await Slot.findById(req.params.id);

    if (!slot) return res.status(404).json({ message: "Slot not found" });
    if (slot.isBooked) return res.status(400).json({ message: "Already booked" });

    slot.isBooked = true;
    slot.bookedBy = rollNumber;

    await slot.save();
    res.json(slot);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Cancel Slot
app.post("/cancel/:id", async (req: Request, res: Response) => {
  try {
    const slot = await Slot.findById(req.params.id);

    if (!slot) return res.status(404).json({ message: "Slot not found" });

    slot.isBooked = false;
    slot.bookedBy = null;

    await slot.save();
    res.json(slot);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Default Route
app.get("/", (req: Request, res: Response) => {
  res.send("🚀 BookMySlot Backend Running");
});

// Start Server
const PORT: number = 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});