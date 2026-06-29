const mongoose = require('mongoose');

const cultureSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  adresse: {
    type: String,
    required: true,
  },
  horaires: {
    type: String,
    required: true,
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
  actif: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const Culture = mongoose.model('Culture', cultureSchema);
module.exports = Culture;
