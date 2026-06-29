import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CMSProvider } from './context/CMSContext';
import { DemarchesProvider } from './context/DemarchesContext';
import Navbar from './components/Navbar';
import CMSToggle from './components/CMS/CMSToggle';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Contact from './pages/Contact';
import Project from './pages/Project';
import ProjectsPage from './pages/ProjectsPage';
import Demarches from './pages/Demarches';
import Services from './pages/Services';
import Actualites from './pages/Actualites';
import Sante from './pages/Sante';
import Culture from './pages/Culture';
import AdminDashboard from './pages/AdminDashboard';
import CitizenDashboard from './pages/CitizenDashboard';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading-screen">Chargement...</div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;

  return children;
};

function App() {
  return (
    <AuthProvider>
      <CMSProvider>
        <DemarchesProvider>
          <Router>
            <div className="app">
              <Navbar />
              <CMSToggle />
              <main className="content">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password/:token" element={<ResetPassword />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/projet" element={<Project />} />
                  <Route path="/projets" element={<ProjectsPage />} />
                  <Route path="/demarches" element={<Demarches />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/actualites" element={<Actualites />} />
                  <Route path="/solidarite" element={<Sante />} />
                  <Route path="/culture" element={<Culture />} />
                  
                  <Route 
                    path="/admin" 
                    element={ 
                      <PrivateRoute roles={['ADMIN']}>
                        <AdminDashboard />
                      </PrivateRoute>
                    } 
                  />
                  
                  <Route 
                    path="/dashboard" 
                    element={ 
                      <PrivateRoute roles={['CITOYEN']}>
                        <CitizenDashboard />
                      </PrivateRoute>
                    } 
                  />
                </Routes>
              </main>
              <footer className="footer">
                <p>&copy; 2026 Mairie de Dembéni. Tous droits réservés.</p>
              </footer>
              <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
            </div>
          </Router>
        </DemarchesProvider>
      </CMSProvider>
    </AuthProvider>
  );
}

export default App;
