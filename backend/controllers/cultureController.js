const Culture = require('../models/Culture');
const fs = require('fs');
const path = require('path');

// Helper to delete image file
const deleteFile = (filePath) => {
  if (!filePath) return;
  const fullPath = path.join(__dirname, '..', filePath);
  if (fs.existsSync(fullPath)) {
    try {
      fs.unlinkSync(fullPath);
    } catch (err) {
      console.error('Error deleting file:', err);
    }
  }
};

exports.createStructure = async (req, res) => {
  try {
    const { nom, description, adresse, horaires } = req.body;
    
    if (!nom || !description || !adresse || !horaires) {
      return res.status(400).json({ message: 'Veuillez remplir tous les champs obligatoires' });
    }

    const structure = new Culture(req.body);
    await structure.save();
    res.status(201).json(structure);
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la création de la structure', error: error.message });
  }
};

exports.getStructures = async (req, res) => {
  try {
    const isAdmin = req.query.admin === 'true';
    const query = isAdmin ? {} : { status: 'publié' };
    const structures = await Culture.find(query).sort({ createdAt: -1 });
    res.status(200).json(structures);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des structures', error: error.message });
  }
};

exports.getStructureById = async (req, res) => {
  try {
    const structure = await Culture.findById(req.params.id);
    if (!structure) {
      return res.status(404).json({ message: 'Structure non trouvée' });
    }
    res.status(200).json(structure);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.updateStructure = async (req, res) => {
  try {
    const oldStructure = await Culture.findById(req.params.id);
    if (!oldStructure) {
      return res.status(404).json({ message: 'Structure non trouvée' });
    }

    // If image is being updated, delete old one
    if (req.body.image && oldStructure.image && req.body.image !== oldStructure.image) {
      // Only delete if it's a local file path
      if (!oldStructure.image.startsWith('http')) {
        deleteFile(oldStructure.image);
      }
    }

    const structure = await Culture.findByIdAndUpdate(req.params.id, req.body, { 
      new: true, 
      runValidators: true 
    });
    
    res.status(200).json(structure);
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la mise à jour', error: error.message });
  }
};

exports.deleteStructure = async (req, res) => {
  try {
    const structure = await Culture.findById(req.params.id);
    if (!structure) {
      return res.status(404).json({ message: 'Structure non trouvée' });
    }

    // Delete associated image
    if (structure.image && !structure.image.startsWith('http')) {
      deleteFile(structure.image);
    }

    await Culture.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Structure supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier téléchargé' });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.status(200).json({ url: imageUrl });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du téléchargement', error: error.message });
  }
};
