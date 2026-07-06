const News = require('../models/News');
const fs = require('fs');
const path = require('path');

exports.createNews = async (req, res) => {
  try {
    const newsData = { ...req.body };
    // If status is not provided, default to 'brouillon' or whatever logic is preferred.
    // The user wants a "Publier" button, so maybe it starts as 'brouillon'.
    if (!newsData.status) newsData.status = 'brouillon';
    
    const news = new News(newsData);
    await news.save();
    res.status(201).json(news);
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la création de l\'actualité', error: error.message });
  }
};

exports.getNews = async (req, res) => {
  try {
    // Admin might want to see all, public only published.
    // We can check for a query param or just filter if not admin (but this route is public).
    // Let's filter by published by default unless a special flag is passed.
    const query = req.query.admin === 'true' ? {} : { status: 'publié' };
    const news = await News.find(query).sort({ createdAt: -1 });
    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des actualités', error: error.message });
  }
};

exports.getNewsById = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ message: 'Actualité non trouvée' });
    }
    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.updateNews = async (req, res) => {
  try {
    const oldNews = await News.findById(req.params.id);
    if (!oldNews) {
      return res.status(404).json({ message: 'Actualité non trouvée' });
    }

    // If image is being updated, delete the old one
    if (req.body.image && oldNews.image && req.body.image !== oldNews.image) {
      const oldImagePath = path.join(__dirname, '..', oldNews.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    const news = await News.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json(news);
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la mise à jour', error: error.message });
  }
};

exports.deleteNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ message: 'Actualité non trouvée' });
    }

    // Delete associated image file
    if (news.image) {
      const imagePath = path.join(__dirname, '..', news.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await News.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Actualité supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
