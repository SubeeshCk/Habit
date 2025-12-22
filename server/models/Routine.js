import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  startTime: {
    type: String,
    required: true,
    match: [/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide a valid time in HH:MM format']
  },
  endTime: {
    type: String,
    match: [/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide a valid time in HH:MM format']
  },
  completedDates: [{
    type: Date
  }]
}, { _id: true });

const routineSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide a routine title'],
    trim: true
  },
  tasks: [taskSchema]
}, {
  timestamps: true
});

// Add index for userId queries
routineSchema.index({ userId: 1 });

const Routine = mongoose.model('Routine', routineSchema);

export default Routine;


