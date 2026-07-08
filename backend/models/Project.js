const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  startDate: {
    type: String,
    required: true,
  },
  endDate: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['En cours', 'À venir', 'Terminé'],
    default: 'À venir'
  },
  budget: {
    type: String,
    required: false,
  },
  fullDescription: {
    type: String,
    required: false,
  },
  objectives: [{
    type: String
  }],
  timeline: [{
    phase: String,
    period: String,
    done: Boolean
  }],
  beneficiaries: {
    type: String,
    required: false,
  },
  duration: {
    type: String,
    required: false,
  },
  manager: {
    type: String,
    required: false,
  },
  progress: {
    type: Number,
    default: 0
  },
  visibilityStatus: {
    type: String,
    enum: ['brouillon', 'publié'],
    default: 'publié'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
