import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axiosInstance';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { CornerDownRight, Trash2, Send, X, Lock, User, MessageCircle } from 'lucide-react';
import '../styles/ProjectComments.css';

const ProjectComments = ({ projectId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [commentTree, setCommentTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCommentContent, setNewCommentContent] = useState('');
  const [activeReplyId, setActiveReplyId] = useState(null); // stores comment ID being replied to
  const [replyContent, setReplyContent] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 1. Fetch Comments
  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/comments/project/${projectId}`);
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // 2. Build Comment Tree when comments list changes
  useEffect(() => {
    if (!comments.length) {
      setCommentTree([]);
      return;
    }

    const map = {};
    const tree = [];

    // Map comments with empty replies
    comments.forEach(comment => {
      map[comment.id] = { ...comment, replies: [] };
    });

    // Link replies to parent comments
    comments.forEach(comment => {
      if (comment.parentId && map[comment.parentId]) {
        map[comment.parentId].replies.push(map[comment.id]);
      } else {
        // Root comment
        tree.push(map[comment.id]);
      }
    });

    setCommentTree(tree);
  }, [comments]);

  // 3. Post New Root Comment
  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newCommentContent.trim()) return;

    setSubmitting(true);
    setErrorMsg('');
    try {
      const { data } = await api.post('/api/comments', {
        content: newCommentContent,
        projectId
      });

      setComments(prev => [...prev, data]);
      setNewCommentContent('');
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Erreur lors de la publication.');
    } finally {
      setSubmitting(false);
    }
  };

  // 4. Post Reply to a Comment
  const handlePostReply = async (e, parentId) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setSubmitting(true);
    setErrorMsg('');
    try {
      const { data } = await api.post('/api/comments', {
        content: replyContent,
        projectId,
        parentId
      });

      setComments(prev => [...prev, data]);
      setReplyContent('');
      setActiveReplyId(null);
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Erreur lors de la réponse.');
    } finally {
      setSubmitting(false);
    }
  };

  // 5. Delete Comment
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ? (Toutes ses réponses associées seront également supprimées)')) return;

    setErrorMsg('');
    try {
      await api.delete(`/api/comments/${commentId}`);

      // Remove deleted comment and all of its recursive children from local state
      setComments(prev => {
        const toDeleteIds = new Set([commentId]);

        // Find children and subchildren to delete from local state array
        let lengthChanged = true;
        while (lengthChanged) {
          const currentSize = toDeleteIds.size;
          prev.forEach(c => {
            if (c.parentId && toDeleteIds.has(c.parentId)) {
              toDeleteIds.add(c.id);
            }
          });
          lengthChanged = toDeleteIds.size !== currentSize;
        }

        return prev.filter(c => !toDeleteIds.has(c.id));
      });
    } catch (error) {
      setErrorMsg('Erreur lors de la suppression du commentaire.');
    }
  };

  // Check user rights
  const isUserConnected = !!user;
  const isApprovedCitizen = user?.role === 'CITOYEN' && user?.status === 'APPROVED';
  const isAdmin = user?.role === 'ADMIN';
  const canPost = isAdmin || isApprovedCitizen;

  // Format Date beautifully
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Recursive Comment Renderer
  const renderComment = (comment, depth = 0) => {
    const isAuthor = user?.id === comment.userId;
    const showDelete = isAdmin || isAuthor;
    const initials = `${comment.author?.firstName?.charAt(0) || ''}${comment.author?.lastName?.charAt(0) || ''}`.toUpperCase();

    return (
      <motion.div
        key={comment.id}
        className="comment-node"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        style={{ marginLeft: depth > 0 ? `${Math.min(depth * 32, 96)}px` : '0px' }}
      >
        <div className="comment-bubble">
          <div className="comment-header">
            <div className={`author-avatar ${comment.author?.role.toLowerCase()}`}>
              {initials || <User size={16} />}
            </div>
            <div className="author-meta">
              <div className="author-name-row">
                <span className="author-name">
                  {comment.author?.firstName} {comment.author?.lastName}
                </span>
                <span className={`author-badge ${comment.author?.role.toLowerCase()}`}>
                  {comment.author?.role === 'ADMIN' ? 'Mairie' : 'Citoyen'}
                </span>
              </div>
              <span className="comment-date">{formatDate(comment.createdAt)}</span>
            </div>
          </div>

          <p className="comment-text">{comment.content}</p>

          <div className="comment-actions">
            {canPost && (
              <button
                className="btn-action-reply"
                onClick={() => {
                  setActiveReplyId(activeReplyId === comment.id ? null : comment.id);
                  setReplyContent('');
                }}
              >
                <CornerDownRight size={14} /> Répondre
              </button>
            )}

            {showDelete && (
              <button className="btn-action-delete-comment" onClick={() => handleDeleteComment(comment.id)}>
                <Trash2 size={14} /> Supprimer
              </button>
            )}
          </div>
        </div>

        {/* Inline Reply Input */}
        <AnimatePresence>
          {activeReplyId === comment.id && (
            <motion.form
              className="comment-reply-form"
              onSubmit={(e) => handlePostReply(e, comment.id)}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <input
                type="text"
                placeholder={`Répondre à ${comment.author?.firstName}...`}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                required
                autoFocus
              />
              <div className="reply-form-buttons">
                <button type="button" className="btn-cancel-reply" onClick={() => setActiveReplyId(null)}>
                  <X size={14} />
                </button>
                <button type="submit" className="btn-submit-reply" disabled={submitting}>
                  <Send size={14} />
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Render nested replies */}
        <div className="replies-container">
          {comment.replies && comment.replies.map(reply => renderComment(reply, depth + 1))}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="project-comments-section">
      <div className="comments-section-header">
        <div className="header-icon-wrapper">
          <MessageCircle size={22} className="header-icon" />
          <span className="comments-count-badge">{comments.length}</span>
        </div>
        <div className="header-text">
          <h4>Discussions citoyennes</h4>
          <p className="header-subtitle">Échangez et donnez votre avis sur ce projet</p>
        </div>
      </div>

      {errorMsg && (
        <motion.div
          className="comment-error-alert"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {errorMsg}
        </motion.div>
      )}

      {/* 1. Comment Posting Form */}
      {isUserConnected ? (
        canPost ? (
          <form onSubmit={handlePostComment} className="comment-post-form">
            <div className="form-avatar">
              {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
            </div>
            <div className="form-content">
              <textarea
                placeholder="Écrivez un commentaire constructif sur ce projet..."
                value={newCommentContent}
                onChange={(e) => setNewCommentContent(e.target.value)}
                required
                rows={3}
              />
              <div className="form-footer">
                <span className="char-count">{newCommentContent.length} / 500</span>
                <button type="submit" className="btn-submit-comment" disabled={submitting || !newCommentContent.trim()}>
                  <Send size={16} />
                  <span>{submitting ? 'Publication...' : 'Publier le commentaire'}</span>
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="comments-auth-banner pending">
            <div className="banner-icon"><Lock size={24} /></div>
            <div className="banner-text">
              <h5>Participation restreinte</h5>
              <p>Votre compte citoyen est en attente d'approbation. Vous pourrez participer dès validation.</p>
            </div>
          </div>
        )
      ) : (
        <div className="comments-auth-banner visitor">
          <div className="banner-icon"><Lock size={24} /></div>
          <div className="banner-text">
            <h5>Espace Citoyen</h5>
            <p>Connectez-vous pour participer aux échanges et donner votre avis sur les projets municipaux.</p>
            <a href="/signup" className="btn-banner-login">S'inscrire / Se connecter</a>
          </div>
        </div>
      )}

      {/* 2. Comments List */}
      <div className="comments-main-container">
        {loading ? (
          <div className="comments-loading">
            <div className="spinner"></div>
            Chargement des discussions...
          </div>
        ) : (
          <div className="comments-tree-container">
            {commentTree.length === 0 ? (
              <motion.div
                className="no-comments-msg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="empty-icon">💬</div>
                <p>Aucun commentaire pour le moment.</p>
                <span>Soyez le premier citoyen à réagir !</span>
              </motion.div>
            ) : (
              <AnimatePresence>
                {commentTree.map(comment => renderComment(comment, 0))}
              </AnimatePresence>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectComments;
