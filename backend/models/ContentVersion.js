const mongoose = require('mongoose');

const contentVersionSchema = new mongoose.Schema({
  pageContentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PageContent',
    required: true,
  },
  contentValue: {
    type: String,
    required: true,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    required: false,
  },
  versionNumber: {
    type: Number,
    required: true,
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const ContentVersion = mongoose.model('ContentVersion', contentVersionSchema);

module.exports = ContentVersion;
