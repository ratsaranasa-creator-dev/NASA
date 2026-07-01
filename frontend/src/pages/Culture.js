import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Music, Users, Trophy, MapPin, Clock, Calendar, Ticket, Palette, Dumbbell, Activity, Landmark } from 'lucide-react';
import { API_URL } from '../apiConfig';
import '../styles/PublicPages.css';

// Dynamic icon mapping
const IconMap = {
  BookOpen: BookOpen,
  Music: Music,
  Users: Users,
  Trophy: Trophy,
  MapPin: MapPin,
  Calendar: Calendar,
  Ticket: Ticket,
  Palette: Palette,
  Dumbbell: Dumbbell,
  Activity: Activity,
  Landmark: Landmark
};

const Culture = () => {
  const [structures, setStructures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStructures = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/culture`);
        // Filter only active structures for the public page
        const activeStructures = data.filter(item => item.actif);
        setStructures(activeStructures);
      } catch (error) {
        console.error('Error fetching structures:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStructures();
  }, []);

  // Helper to get random color class based on index if no image is present
  const colors = ['orange', 'purple', 'blue', 'green', 'red'];

  const renderIcon = (iconName) => {
    const IconComponent = IconMap[iconName] || MapPin;
    return <IconComponent size={32} />;
  };

  return (
    <div className="public-page">
      <section className="page-hero hero-culture">
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>Culture, Sport & Loisirs</h1>
          <p>Parce que la culture, l'art et le sport sont essentiels au vivre-ensemble et à l'épanouissement personnel, Dembéni vous propose des infrastructures modernes et une programmation riche tout au long de l'année.</p>
        </motion.div>
      </section>

      <div className="page-container">
        <h2 className="section-title">Infrastructures et Activités</h2>

        {loading ? (
          <div className="loading-spinner" style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} style={{ display: 'inline-block', marginBottom: '10px' }}>
              <Activity size={32} color="#0B6B4A" />
            </motion.div>
            <p>Chargement des structures en cours...</p>
          </div>
        ) : structures.length === 0 ? (
          <div className="no-data-msg" style={{ textAlign: 'center', padding: '40px', background: '#f8f9fa', borderRadius: '15px' }}>
            <MapPin size={40} color="#ccc" style={{ margin: '0 auto 15px' }} />
            <h3>Aucune structure disponible pour le moment</h3>
            <p style={{ color: '#666' }}>Les infrastructures seront bientôt ajoutées.</p>
          </div>
        ) : (
          <div className="grid-2">
            <AnimatePresence>
              {structures.map((item, idx) => (
                <motion.div
                  key={item.id || item._id}
                  className="premium-card"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                >
                  {item.image ? (
                    <div style={{ width: '100%', height: '200px', marginBottom: '20px', borderRadius: '15px', overflow: 'hidden' }}>
                      <img
                        src={item.image.startsWith('http') ? item.image : `${API_URL}${item.image.startsWith('/') ? '' : '/'}${item.image}`}
                        alt={item.nom}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  ) : (
                    <div className={`card-icon ${colors[idx % colors.length]}`}>
                      {renderIcon(item.icone)}
                    </div>
                  )}

                  <h3>{item.nom}</h3>
                  <p>{item.description}</p>

                  <div className="info-block">
                    <div className="info-item">
                      <MapPin size={16} /> <span>{item.adresse}</span>
                    </div>
                    <div className="info-item">
                      <Clock size={16} /> <span>{item.horaires}</span>
                    </div>
                    {item.modalite_acces && (
                      <div className="info-item">
                        <Ticket size={16} /> <span>{item.modalite_acces}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default Culture;
