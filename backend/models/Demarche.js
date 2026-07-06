const mongoose = require('mongoose');

const demarcheSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Le titre est obligatoire'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'La catégorie est obligatoire'],
    enum: ['État Civil', 'Identité', 'Vie Quotidienne', 'Urbanisme', 'Santé', 'Social', 'Économie'],
    default: 'État Civil'
  },
  shortDesc: {
    type: String,
    required: [true, 'La description courte est obligatoire'],
    trim: true
  },
  iconName: {
    type: String,
    default: 'FileText'
  },
  fullContent: {
    presentation: { type: String, trim: true },
    steps: [{
      title: String,
      desc: String
    }],
    documents: [String],
    delays: String,
    fees: String,
    onlineLink: String,
    externalLink: String,
    downloads: [{
      label: String,
      url: String
    }]
  },
  status: {
    type: String,
    enum: ['À jour', 'En révision', 'Obsolète', 'publié', 'brouillon'],
    default: 'publié'
  },
  assignedTo: {
    type: String,
    trim: true
  },
  deadline: {
    type: Date
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  lastUpdate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Demarche = mongoose.model('Demarche', demarcheSchema);

module.exports = Demarche;
