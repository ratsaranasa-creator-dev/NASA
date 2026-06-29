const Project = require('../models/Project');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des projets', error: error.message });
  }
};

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private/Admin
exports.createProject = async (req, res) => {
  try {
    const { title, description, location, startDate, endDate, image, category, status } = req.body;

    // Validate required fields
    if (!title || !description || !location || !startDate || !endDate || !image || !category || !status) {
      return res.status(400).json({ 
        message: 'Toutes les informations (dont la date de début, la date de fin, et l\'image représentative) sont obligatoires.' 
      });
    }

    const newProject = await Project.create({
      title,
      description,
      location,
      startDate,
      endDate,
      image,
      category,
      status
    });

    res.status(201).json(newProject);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création du projet', error: error.message });
  }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private/Admin
exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, location, startDate, endDate, image, category, status } = req.body;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    // Update fields
    project.title = title || project.title;
    project.description = description || project.description;
    project.location = location || project.location;
    project.startDate = startDate || project.startDate;
    project.endDate = endDate || project.endDate;
    project.image = image || project.image;
    project.category = category || project.category;
    project.status = status || project.status;

    await project.save();

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du projet', error: error.message });
  }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    await project.deleteOne();
    res.json({ message: 'Projet supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression du projet', error: error.message });
  }
};
