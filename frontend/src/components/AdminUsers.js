import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Search, Filter, ArrowUpDown, Check, X, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';
import '../styles/AdminUsers.css';

const AdminUsers = ({ onRefreshNotification }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, name-az, name-za
  const [toast, setToast] = useState(null); // { message, type: 'success' | 'error' }

  // 1. Fetch all users from API
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/admin/users`, config);
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      showToast('Impossible de récupérer la liste des utilisateurs.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // 2. Helper to display visual confirmations
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // 3. Status Action Handler (Approve / Reject)
  const handleUpdateStatus = async (userId, newStatus, userFullName) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      await axios.put(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/admin/citizen-status/${userId}`, {
        status: newStatus
      }, config);

      // Update local state list
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));

      // Notify parent component to update pending notifications badge
      if (onRefreshNotification) {
        onRefreshNotification();
      }

      const statusText = newStatus === 'APPROVED' ? 'approuvé et activé' : 'refusé/suspendu';
      showToast(`Le compte de ${userFullName} a été ${statusText} avec succès !`, 'success');
    } catch (error) {
      console.error('Error updating citizen status:', error);
      showToast('Erreur lors de la mise à jour du statut.', 'error');
    }
  };

  // 4. Filtering and Sorting logic
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    if (sortBy === 'oldest') {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
    if (sortBy === 'name-az') {
      return `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`);
    }
    if (sortBy === 'name-za') {
      return `${b.lastName} ${b.firstName}`.localeCompare(`${a.lastName} ${a.firstName}`);
    }
    return 0;
  });

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  return (
    <div className="admin-users-manager">
      <header className="main-header">
        <h2>Gestion des Comptes & Citoyens</h2>
        <p>Gérez les droits d'accès, validez les inscriptions citoyennes et modérez les profils de la commune.</p>
      </header>

      {/* Visual Toast Notification Banner */}
      {toast && (
        <div className={`toast-banner ${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Filter and controls bar */}
      <div className="users-controls-bar">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Rechercher par nom, prénom ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filters-group-users">
          <div className="filter-select-wrapper">
            <Filter size={14} />
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="all">Tous les rôles</option>
              <option value="ADMIN">Administrateurs</option>
              <option value="CITOYEN">Citoyens</option>
              <option value="VISITEUR">Visiteurs</option>
            </select>
          </div>

          <div className="filter-select-wrapper">
            <Filter size={14} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">Tous les statuts</option>
              <option value="APPROVED">Approuvés</option>
              <option value="PENDING">En attente</option>
              <option value="REJECTED">Refusés</option>
            </select>
          </div>

          <div className="filter-select-wrapper">
            <ArrowUpDown size={14} />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Plus récents</option>
              <option value="oldest">Plus anciens</option>
              <option value="name-az">Nom (A - Z)</option>
              <option value="name-za">Nom (Z - A)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table view */}
      {loading ? (
        <div className="loading-users">Chargement de la liste des utilisateurs...</div>
      ) : (
        <div className="table-responsive-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Utilisateur / Citoyen</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Date d'inscription</th>
                <th>Statut</th>
                <th>Actions administratives</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-users-row">Aucun utilisateur ne correspond à ces filtres.</td>
                </tr>
              ) : (
                filteredUsers.map(user => {
                  const fullName = `${user.firstName} ${user.lastName}`;
                  return (
                    <tr key={user.id} className={user.status === 'PENDING' ? 'highlight-pending' : ''}>
                      <td className="user-name-cell">
                        <div className="avatar-placeholder">
                          {user.profilePicture ? (
                            <img src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${user.profilePicture}`} alt={fullName} className="avatar-img" />
                          ) : (
                            <>{user.firstName[0] || ''}{user.lastName[0] || ''}</>
                          )}
                        </div>
                        <span className="user-full-name">{fullName}</span>
                      </td>
                      <td className="user-email-cell">{user.email}</td>
                      <td>
                        <span className={`role-badge ${user.role.toLowerCase()}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="user-date-cell">{formatDate(user.createdAt)}</td>
                      <td>
                        <span className={`status-badge-table ${user.status.toLowerCase()}`}>
                          {user.status === 'PENDING' ? 'EN ATTENTE' : user.status === 'APPROVED' ? 'APPROUVÉ' : 'REFUSÉ'}
                        </span>
                      </td>
                      <td className="user-actions-cell">
                        {user.role === 'ADMIN' ? (
                          <span className="admin-protected-msg"><ShieldAlert size={14} /> Protégé</span>
                        ) : (
                          <div className="action-buttons-group">
                            {user.status !== 'APPROVED' && (
                              <button
                                className="btn-table-action approve"
                                onClick={() => handleUpdateStatus(user.id, 'APPROVED', fullName)}
                                title="Approuver l'utilisateur"
                              >
                                <Check size={16} /> Approuver
                              </button>
                            )}

                            {user.status !== 'REJECTED' && (
                              <button
                                className="btn-table-action reject"
                                onClick={() => handleUpdateStatus(user.id, 'REJECTED', fullName)}
                                title="Rejeter/Bloquer l'utilisateur"
                              >
                                <X size={16} /> Rejeter
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
