const Demarche = require('../models/Demarche');
const fs = require('fs');
const path = require('path');

// @desc    Get all demarches
// @route   GET /api/demarches
// @access  Public (published) / Private (all for admin)
exports.getDemarches = async (req, res) => {
  try {
    const isAdmin = req.query.admin === 'true';
    const query = isAdmin ? {} : { status: 'publié' };
    const demarches = await Demarche.find(query).sort({ createdAt: -1 });
    res.status(200).json(demarches);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des démarches', error: error.message });
  }
};

// @desc    Get demarche by ID
// @route   GET /api/demarches/:id
// @access  Public
exports.getDemarcheById = async (req, res) => {
  try {
    const demarche = await Demarche.findById(req.params.id);
    if (!demarche) {
      return res.status(404).json({ message: 'Démarche non trouvée' });
    }
    
    // Increment views
    demarche.views += 1;
    await demarche.save();
    
    res.status(200).json(demarche);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Create a new demarche
// @route   POST /api/demarches
// @access  Private/Admin
exports.createDemarche = async (req, res) => {
  try {
    const demarcheData = req.body;
    
    // Parse nested objects if sent as strings (from FormData)
    if (typeof demarcheData.fullContent === 'string') {
      demarcheData.fullContent = JSON.parse(demarcheData.fullContent);
    }

    const demarche = new Demarche(demarcheData);
    await demarche.save();
    res.status(201).json(demarche);
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la création de la démarche', error: error.message });
  }
};

// @desc    Update a demarche
// @route   PUT /api/demarches/:id
// @access  Private/Admin
exports.updateDemarche = async (req, res) => {
  try {
    const demarcheData = req.body;
    
    // Parse nested objects if sent as strings
    if (typeof demarcheData.fullContent === 'string') {
      demarcheData.fullContent = JSON.parse(demarcheData.fullContent);
    }

    demarcheData.lastUpdate = Date.now();

    const demarche = await Demarche.findByIdAndUpdate(
      req.params.id,
      demarcheData,
      { new: true, runValidators: true }
    );

    if (!demarche) {
      return res.status(404).json({ message: 'Démarche non trouvée' });
    }

    res.status(200).json(demarche);
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la mise à jour', error: error.message });
  }
};

// @desc    Delete a demarche
// @route   DELETE /api/demarches/:id
// @access  Private/Admin
exports.deleteDemarche = async (req, res) => {
  try {
    const demarche = await Demarche.findById(req.params.id);
    if (!demarche) {
      return res.status(404).json({ message: 'Démarche non trouvée' });
    }

    // Delete associated files if any
    if (demarche.fullContent && demarche.fullContent.downloads) {
      demarche.fullContent.downloads.forEach(dl => {
        if (dl.url && dl.url.startsWith('/uploads/')) {
          const filePath = path.join(__dirname, '..', dl.url);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      });
    }

    await Demarche.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Démarche supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Upload a document for a demarche
// @route   POST /api/demarches/upload
// @access  Private/Admin
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier téléchargé' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    res.status(200).json({ 
      url: fileUrl, 
      label: req.file.originalname,
      filename: req.file.filename 
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du téléchargement', error: error.message });
  }
};
