const Comment = require('../models/Comment');
const User = require('../models/User');

// @desc    Get all comments for a project
// @route   GET /api/comments/project/:projectId
// @access  Public
exports.getProjectComments = async (req, res) => {
  try {
    const { projectId } = req.params;

    const comments = await Comment.find({ projectId })
      .populate({
        path: 'author',
        select: 'id firstName lastName role status'
      })
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des commentaires', error: error.message });
  }
};

// @desc    Create a new comment or reply
// @route   POST /api/comments
// @access  Private
exports.createComment = async (req, res) => {
  try {
    const { content, projectId, parentId } = req.body;
    const userId = req.user._id;

    // 1. Strict Permission Check: Only Admin or Approved Citizens can comment/reply
    const isCitizen = req.user.role === 'CITOYEN' && req.user.status === 'APPROVED';
    const isAdmin = req.user.role === 'ADMIN';

    if (!isAdmin && !isCitizen) {
      return res.status(403).json({ 
        message: 'Accès refusé. Seuls les citoyens inscrits et approuvés peuvent publier ou répondre à des commentaires.' 
      });
    }

    if (!content || !projectId) {
      return res.status(400).json({ message: 'Le contenu et le projet ID sont obligatoires.' });
    }

    // 2. Create comment
    const commentData = {
      content,
      projectId,
      userId
    };
    if (parentId) {
      commentData.parentId = parentId;
    }
    
    const comment = await Comment.create(commentData);

    // Fetch the newly created comment with author details to return
    const createdComment = await Comment.findById(comment._id)
      .populate({
        path: 'author',
        select: 'id firstName lastName role'
      });

    res.status(201).json(createdComment);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la publication du commentaire', error: error.message });
  }
};

// @desc    Delete a comment (Admin moderation or author self-delete)
// @route   DELETE /api/comments/:id
// @access  Private
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ message: 'Commentaire non trouvé' });
    }

    // Strict Permission Check: Only Admin or the comment author can delete
    const isAuthor = comment.userId.toString() === req.user.id.toString();
    const isAdmin = req.user.role === 'ADMIN';

    if (!isAdmin && !isAuthor) {
      return res.status(403).json({ message: 'Accès refusé. Vous n\'êtes pas autorisé à supprimer ce commentaire.' });
    }

    // Delete comment and all its child replies recursively
    await comment.deleteOne();

    res.json({ message: 'Commentaire supprimé avec succès.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression du commentaire', error: error.message });
  }
};
