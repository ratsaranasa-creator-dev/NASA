import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Image as ImageIcon, Save } from 'lucide-react';
import { useCMS } from '../../context/CMSContext';

const AdminCMS = () => {
  const { updateContent, uploadImage } = useCMS();
  const pages = ['home', 'projet', 'contact'];
  const [selectedPage, setSelectedPage] = useState('home');
  const [pageContent, setPageContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const fetchContent = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`http://localhost:5000/api/pages/${selectedPage}`);
      setPageContent(data);
    } catch (error) {
      console.error('Error fetching page content:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedPage]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const handleUpdate = async (item) => {
    try {
      await updateContent(selectedPage, item.sectionKey, item.contentValue, item.contentType, item.metadata);
      setEditingItem(null);
      fetchContent();
      alert('Contenu mis à jour avec succès');
    } catch (error) {
      alert('Erreur lors de la mise à jour');
    }
  };

  const handleFileChange = async (item, file) => {
    try {
      const url = await uploadImage(file);
      const updatedItem = { ...item, contentValue: url };
      handleUpdate(updatedItem);
    } catch (error) {
      alert('Erreur lors du téléchargement');
    }
  };

  return (
    <div className="admin-cms-container">
      <div className="cms-page-selector">
        <div className="page-tabs">
          {pages.map(page => (
            <button 
              key={page} 
              className={`page-tab ${selectedPage === page ? 'active' : ''}`}
              onClick={() => setSelectedPage(page)}
            >
              {page.toUpperCase()}
            </button>
          ))}
        </div>
        <button className="btn-add-section" onClick={() => setEditingItem({ pageName: selectedPage, sectionKey: '', contentValue: '', contentType: 'text', isNew: true })}>
          + Nouvelle Section
        </button>
      </div>

      <div className="cms-content-list">
        {loading ? (
          <p>Chargement...</p>
        ) : (
          <>
            {editingItem?.isNew && (
              <div className="cms-item-card new-item">
                <div className="item-header">
                  <input 
                    placeholder="Clé de la section (ex: hero_title)" 
                    className="input-key-new"
                    value={editingItem.sectionKey}
                    onChange={(e) => setEditingItem({ ...editingItem, sectionKey: e.target.value })}
                  />
                  <select 
                    value={editingItem.contentType}
                    onChange={(e) => setEditingItem({ ...editingItem, contentType: e.target.value })}
                  >
                    <option value="text">Texte</option>
                    <option value="image">Image</option>
                    <option value="html">HTML</option>
                  </select>
                </div>
                <div className="item-body">
                  <textarea 
                    placeholder="Contenu..." 
                    className="cms-textarea"
                    value={editingItem.contentValue}
                    onChange={(e) => setEditingItem({ ...editingItem, contentValue: e.target.value })}
                  />
                </div>
                <div className="item-footer">
                  <button className="btn-save-item" onClick={() => handleUpdate(editingItem)}>
                    <Save size={16} /> Créer
                  </button>
                  <button className="btn-cancel-new" onClick={() => setEditingItem(null)}>Annuler</button>
                </div>
              </div>
            )}
            
            <div className="cms-items-grid">
              {pageContent.map(item => (
                <div key={item.id} className="cms-item-card">
                  <div className="item-header">
                    <span className="item-key">{item.sectionKey}</span>
                    <span className={`item-type type-${item.contentType}`}>{item.contentType}</span>
                  </div>
                  
                  <div className="item-body">
                    {item.contentType === 'image' ? (
                      <div className="image-preview-admin">
                        <img src={item.contentValue.startsWith('http') ? item.contentValue : `http://localhost:5000${item.contentValue}`} alt="" />
                        <label className="btn-change-image">
                          <ImageIcon size={16} /> Remplacer
                          <input type="file" onChange={(e) => handleFileChange(item, e.target.files[0])} style={{ display: 'none' }} />
                        </label>
                      </div>
                    ) : (
                      <textarea 
                        value={editingItem?.id === item.id ? editingItem.contentValue : item.contentValue}
                        onChange={(e) => setEditingItem({ ...item, contentValue: e.target.value })}
                        onFocus={() => setEditingItem(item)}
                        className="cms-textarea"
                      />
                    )}
                  </div>

                  {editingItem?.id === item.id && item.contentType !== 'image' && (
                    <div className="item-footer">
                      <button className="btn-save-item" onClick={() => handleUpdate(editingItem)}>
                        <Save size={16} /> Enregistrer
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminCMS;
