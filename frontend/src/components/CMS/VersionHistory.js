import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { History, RotateCcw, X } from 'lucide-react';

const VersionHistory = ({ contentId, onRollback, onClose }) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };
        const { data } = await axios.get(`http://localhost:5000/api/pages/versions/${contentId}`, config);
        setVersions(data);
      } catch (error) {
        console.error('Error fetching versions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVersions();
  }, [contentId]);

  const handleRollback = async (versionId) => {
    if (window.confirm('Voulez-vous vraiment restaurer cette version ?')) {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };
        const { data } = await axios.post(`http://localhost:5000/api/pages/rollback/${versionId}`, {}, config);
        onRollback(data);
      } catch (error) {
        alert('Erreur lors de la restauration');
      }
    }
  };

  return (
    <div className="version-history-modal">
      <div className="version-history-content">
        <div className="version-history-header">
          <h3><History size={18} /> Historique des versions</h3>
          <button onClick={onClose} className="btn-close-modal"><X size={18} /></button>
        </div>

        {loading ? (
          <p>Chargement...</p>
        ) : versions.length === 0 ? (
          <p className="no-versions">Aucun historique disponible pour ce contenu.</p>
        ) : (
          <div className="versions-list">
            {versions.map((v) => (
              <div key={v.id} className="version-item">
                <div className="version-info">
                  <span className="version-number">v{v.versionNumber}</span>
                  <span className="version-date">{new Date(v.createdAt).toLocaleString()}</span>
                </div>
                <div className="version-preview">
                  {v.contentValue.substring(0, 100)}{v.contentValue.length > 100 ? '...' : ''}
                </div>
                <button onClick={() => handleRollback(v.id)} className="btn-rollback">
                  <RotateCcw size={14} /> Restaurer
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VersionHistory;
