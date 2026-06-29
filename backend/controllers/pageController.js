const PageContent = require('../models/PageContent');
const ContentVersion = require('../models/ContentVersion');
const path = require('path');
const fs = require('fs');

// @desc    Get all content for a page
// @route   GET /api/pages/:pageName
// @access  Public
exports.getPageContent = async (req, res) => {
  try {
    const { pageName } = req.params;
    const content = await PageContent.find({ pageName });
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération du contenu', error: error.message });
  }
};

// @desc    Update page content
// @route   PUT /api/pages/content
// @access  Private/Admin
exports.updatePageContent = async (req, res) => {
  try {
    const { pageName, sectionKey, contentValue, contentType, metadata } = req.body;
    const userId = req.user ? req.user.id : null;

    let content = await PageContent.findOne({ pageName, sectionKey });

    if (content) {
      // Create version before update
      const lastVersion = await ContentVersion.findOne({
        pageContentId: content._id
      }).sort({ versionNumber: -1 });

      const nextVersionNumber = lastVersion ? lastVersion.versionNumber + 1 : 1;

      await ContentVersion.create({
        pageContentId: content._id,
        contentValue: content.contentValue,
        metadata: content.metadata,
        versionNumber: nextVersionNumber,
        changedBy: userId
      });

      // Update current content
      content.contentValue = contentValue;
      if (contentType) content.contentType = contentType;
      if (metadata) content.metadata = metadata;
      await content.save();
    } else {
      // Create new content if it doesn't exist
      content = await PageContent.create({
        pageName,
        sectionKey,
        contentValue,
        contentType: contentType || 'text',
        metadata
      });
    }

    res.json(content);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du contenu', error: error.message });
  }
};

// @desc    Upload image
// @route   POST /api/pages/upload
// @access  Private/Admin
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier téléchargé' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du téléchargement de l\'image', error: error.message });
  }
};

// @desc    Get version history
// @route   GET /api/pages/versions/:contentId
// @access  Private/Admin
exports.getContentVersions = async (req, res) => {
  try {
    const { contentId } = req.params;
    const versions = await ContentVersion.find({ pageContentId: contentId })
      .sort({ versionNumber: -1 })
      .limit(10);
    res.json(versions);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des versions', error: error.message });
  }
};

// @desc    Rollback to a version
// @route   POST /api/pages/rollback/:versionId
// @access  Private/Admin
exports.rollbackVersion = async (req, res) => {
  try {
    const { versionId } = req.params;
    const version = await ContentVersion.findById(versionId);

    if (!version) {
      return res.status(404).json({ message: 'Version non trouvée' });
    }

    const content = await PageContent.findById(version.pageContentId);
    if (!content) {
      return res.status(404).json({ message: 'Contenu original non trouvé' });
    }

    // Save current as a new version before rollback
    const lastVersion = await ContentVersion.findOne({
      pageContentId: content._id
    }).sort({ versionNumber: -1 });

    await ContentVersion.create({
      pageContentId: content._id,
      contentValue: content.contentValue,
      metadata: content.metadata,
      versionNumber: lastVersion.versionNumber + 1,
      changedBy: req.user.id
    });

    // Rollback
    content.contentValue = version.contentValue;
    content.metadata = version.metadata;
    await content.save();

    res.json(content);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la restauration', error: error.message });
  }
};
