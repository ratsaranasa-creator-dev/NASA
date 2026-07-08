const mongoose = require('mongoose');

const cultureSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom est obligatoire'],
    trim: true,
    minlength: [2, 'Le nom doit contenir au moins 2 caractères']
  },
  description: {
    type: String,
    required: [true, 'La description est obligatoire'],
    trim: true,
    minlength: [10, 'La description doit être plus détaillée']
  },
  adresse: {
    type: String,
    required: [true, 'L\'adresse est obligatoire'],
    trim: true
  },
  horaires: {
    type: String,
    required: [true, 'Les horaires sont obligatoires'],
    trim: true
  },
  modalite_acces: {
    type: String,
    default: '',
  },
  icone: {
    type: String,
    default: 'MapPin', // Default Lucide icon name
  },
  image: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['brouillon', 'publié'],
    default: 'publié',
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const Culture = mongoose.model('Culture', cultureSchema);
module.exports = Culture;
