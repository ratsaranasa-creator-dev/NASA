const Culture = require('../models/Culture');

exports.createStructure = async (req, res) => {
  try {
    const structure = new Culture(req.body);
    await structure.save();
    res.status(201).json(structure);
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la création de la structure', error: error.message });
  }
};

exports.getStructures = async (req, res) => {
  try {
    // If not admin, maybe only return active ones? The prompt didn't specify.
    // For now, return all and handle filtering on the frontend.
    const structures = await Culture.find().sort({ createdAt: -1 });
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
    const structure = await Culture.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!structure) {
      return res.status(404).json({ message: 'Structure non trouvée' });
    }
    res.status(200).json(structure);
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la mise à jour', error: error.message });
  }
};

exports.deleteStructure = async (req, res) => {
  try {
    const structure = await Culture.findByIdAndDelete(req.params.id);
    if (!structure) {
      return res.status(404).json({ message: 'Structure non trouvée' });
    }
    res.status(200).json({ message: 'Structure supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
