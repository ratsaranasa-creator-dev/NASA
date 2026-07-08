import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { jsPDF } from 'jspdf';
import { FileDown, Send, FileText, ClipboardList } from 'lucide-react';
import api from '../apiConfig';


const CitizenDashboard = () => {
  const { user } = useAuth();
  const [request, setRequest] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text('Mairie de Dembéni', 105, 20, { align: 'center' });
    doc.setFontSize(16);
    doc.text('Attestation de Citoyenneté', 105, 40, { align: 'center' });

    doc.setFontSize(12);
    doc.text(`Nom: ${user.lastName}`, 20, 60);
    doc.text(`Prénom: ${user.firstName}`, 20, 70);
    doc.text(`Email: ${user.email}`, 20, 80);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 90);

    doc.text('Ce document atteste que la personne susnommée est enregistrée', 20, 110);
    doc.text('en tant que citoyen dans le portail numérique de la Mairie de Dembéni.', 20, 120);

    doc.save(`Attestation_${user.lastName}.pdf`);
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await api.post('/api/citizen/request', { content: request });
      setMessage('Votre demande a été envoyée avec succès.');
      setRequest('');
    } catch (error) {
      setMessage('Erreur lors de l\'envoi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="citizen-dashboard-page">
      <header className="dashboard-header">
        <div className="container">
          <h2>Espace Citoyen</h2>
          <p>Bienvenue, {user.firstName} {user.lastName}</p>
        </div>
      </header>

      <div className="dashboard-container">
        <div className="dashboard-grid">
          {/* Section Documents */}
          <section className="dashboard-card">
            <div className="card-header">
              <FileText size={24} />
              <h3>Mes Documents</h3>
            </div>
            <p>Téléchargez vos attestations administratives.</p>
            <button onClick={handleDownloadPDF} className="btn-download">
              <FileDown size={20} /> Télécharger Attestation (PDF)
            </button>
          </section>

          {/* Section Demandes */}
          <section className="dashboard-card">
            <div className="card-header">
              <ClipboardList size={24} />
              <h3>Nouvelle Demande</h3>
            </div>
            <form onSubmit={handleSubmitRequest}>
              <textarea
                placeholder="Décrivez votre demande ici..."
                value={request}
                onChange={(e) => setRequest(e.target.value)}
                required
              />
              <button type="submit" disabled={loading} className="btn-submit-req">
                {loading ? 'Envoi...' : <><Send size={18} /> Envoyer la demande</>}
              </button>
            </form>
            {message && <p className="form-msg">{message}</p>}
          </section>
        </div>
      </div>
    </div>
  );
};

export default CitizenDashboard;
