const mongoose = require('mongoose');

const pageContentSchema = new mongoose.Schema({
  pageName: {
    type: String,
    required: true,
  },
  sectionKey: {
    type: String,
    required: true,
  },
  contentType: {
    type: String,
    enum: ['text', 'image', 'html', 'json'],
    required: true,
    default: 'text',
  },
  contentValue: {
    type: String,
    required: true,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    required: false,
  },
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

pageContentSchema.index({ pageName: 1, sectionKey: 1 }, { unique: true });

const PageContent = mongoose.model('PageContent', pageContentSchema);

module.exports = PageContent;
