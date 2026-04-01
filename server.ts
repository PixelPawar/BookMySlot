import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import Slot from './models/Slot';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// MongoDB connection setup
mongoose.connect('mongodb://127.0.0.1:27017/bookmyslot')
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- REST API ENDPOINTS ---

// GET /slots - fetch all slots with availability status
app.get('/slots', async (req: Request, res: Response) => {
  try {
    const slots = await Slot.find().sort({ slotTime: 1 });
    res.json(slots);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch slots' });
  }
});

// POST /slot - create new slot OR update mapping (book/cancel) by ID
app.post('/slot', async (req: Request, res: Response) => {
  try {
    const { _id, slotDate, slotDay, slotTime, isAvailable, bookedBy } = req.body;
    
    // If _id is provided, it's an update operation (book/cancel)
    if (_id) {
      const updatedSlot = await Slot.findByIdAndUpdate(
        _id,
        { isAvailable, bookedBy: bookedBy || null },
        { new: true }
      );
      if (!updatedSlot) return res.status(404).json({ error: 'Slot not found' });
      return res.json(updatedSlot);
    } else {
      // Create new slot
      if (!slotDate || !slotDay || !slotTime) return res.status(400).json({ error: 'slotDate, slotDay, and slotTime are required' });
      const newSlot = new Slot({ slotDate, slotDay, slotTime, isAvailable: true, bookedBy: null });
      await newSlot.save();
      return res.status(201).json(newSlot);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Operation failed' });
  }
});

// Fallback to index.html for AngularJS client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
