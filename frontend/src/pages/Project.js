import React, { useState, useEffect, useRef, useCallback } from 'react';
import api, { API_URL } from '../apiConfig';
import { Filter, MapPin, Calendar, Users, CheckCircle2, ArrowRight, TrendingUp, Wallet, ChevronRight, ChevronLeft, GraduationCap, Palmtree, X, Building2, Leaf, Heart, BookOpen, Lightbulb, ChevronDown, Mail, Phone, Star, Award } from 'lucide-react';
import ProjectComments from '../components/ProjectComments';
import heroImg from '../images/0002.jpg';
import spotlightImg from '../images/00001.jpg';
import gallery1 from '../images/0002.jpg';
import gallery2 from '../images/0004.jpg';
import gallery3 from '../images/0005.jpg';
import gallery4 from '../images/0006.jpg';
import gallery5 from '../images/0007.jpg';
import ctaBg from '../images/0008.jpg';
import '../styles/ProjectDetailModal.css';
import '../styles/ProjectPage.css';

const faqData = [
  {
    q: "Comment puis-je suivre l'avancement d'un projet ?",
    a: "Chaque projet dispose d'une page détaillée accessible via le bouton 'Voir détail'. Vous y trouverez les dates clés, le taux d'avancement et les dernières mises à jour publiées par la mairie."
  },
  {
    q: "Comment signaler un problème lié à un chantier ?",
    a: "Rendez-vous sur la page Contact ou utilisez la section 'Commentaires' de chaque projet. Nos équipes traitent toutes les demandes dans un délai de 5 jours ouvrés."
  },
  {
    q: "Les budgets indiqués sont-ils définitifs ?",
    a: "Les montants affichés correspondent aux estimations validées en conseil municipal. Ils peuvent évoluer en cours de réalisation suite aux appels d'offres et à l'avancement des travaux."
  },
  {
    q: "Comment participer aux décisions sur les projets ?",
    a: "La commune organise régulièrement des réunions publiques et des consultations citoyennes. Inscrivez-vous à notre newsletter pour être informé en priorité des prochaines sessions."
  },
  {
    q: "Qui finance les projets de la commune ?",
    a: "Les projets sont financés conjointement par le budget communal, les subventions de l'État, le Département de Mayotte, la Région et les fonds européens (FEDER, FSE). Certains projets bénéficient également de partenariats privés."
  }
];

const GALLERY_IMAGES = [
  { src: gallery1, alt: 'Installation panneaux solaires – chantier communal' },
  { src: gallery2, alt: 'Travaux et aménagement urbain' },
  { src: gallery3, alt: 'Espaces verts et environnement' },
  { src: gallery4, alt: 'Infrastructures en cours' },
  { src: gallery5, alt: 'Réalisation sur le terrain' },
];

const Project = () => {
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  const [email, setEmail] = useState('');
  const [newsletterSent, setNewsletterSent] = useState(false);
  const gallerySliderRef = useRef(null);
  const [canGalleryPrev, setCanGalleryPrev] = useState(false);
  const [canGalleryNext, setCanGalleryNext] = useState(true);

  const updateGalleryNav = useCallback(() => {
    const slider = gallerySliderRef.current;
    if (!slider) return;
    const maxScroll = slider.scrollWidth - slider.clientWidth;
    setCanGalleryPrev(slider.scrollLeft > 8);
    setCanGalleryNext(slider.scrollLeft < maxScroll - 8);
  }, []);

  const scrollGallery = useCallback((direction) => {
    const slider = gallerySliderRef.current;
    if (!slider) return;
    const firstItem = slider.querySelector('.gallery-item-v3');
    const gap = parseFloat(getComputedStyle(slider).gap) || 32;
    const step = firstItem ? firstItem.offsetWidth + gap : slider.clientWidth * 0.85;
    slider.scrollBy({ left: direction * step, behavior: 'smooth' });
  }, []);

  const showAllGalleryPhotos = useCallback(() => {
    const slider = gallerySliderRef.current;
    if (!slider) return;
    slider.scrollTo({ left: slider.scrollWidth, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await api.get('/api/projects');
        setProjects(data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    const slider = gallerySliderRef.current;
    if (!slider) return;
    updateGalleryNav();
    slider.addEventListener('scroll', updateGalleryNav, { passive: true });
    window.addEventListener('resize', updateGalleryNav);
    return () => {
      slider.removeEventListener('scroll', updateGalleryNav);
      window.removeEventListener('resize', updateGalleryNav);
    };
  }, [updateGalleryNav]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
      return imagePath;
    }
    return `${API_URL}${imagePath}`;
  };

  const filteredProjects = projects.filter(project => {
    const matchesCategory = filterCategory === 'all' || project.category === filterCategory;

    // Normalize status for comparisons
    const statusMap = {
      'encours': 'en cours',
      'avenir': 'à venir',
      'termine': 'terminé'
    };
    const targetStatus = statusMap[filterStatus] || filterStatus;
    const matchesStatus = filterStatus === 'all' || project.status.toLowerCase() === targetStatus.toLowerCase();

    return matchesCategory && matchesStatus;
  });

  return (
    <div className="new-project-page">
      {/* Hero Section */}
      <section className="hero-v3" style={{ backgroundImage: `url(${heroImg})` }}>
        <div className="hero-v3-content">
          <span className="hero-v3-subtitle">PROJETS</span>
          <h1 className="hero-v3-title">Les projets de la commune de Dembéni</h1>
          <p className="hero-v3-desc">Découvrez les projets en cours et à venir pour le développement de notre commune.</p>
          <div className="hero-v3-actions">
            <button className="btn-primary-v3">Voir les projets</button>
            <button className="btn-secondary-v3">Projets en cours</button>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="filter-section-v3">
        <div className="filter-container-v3">
          <div className="filter-group">
            <span className="filter-label">Filtrer les projets</span>
            <div className="filter-controls">
              <div className="select-wrapper">
                <label>Catégorie</label>
                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                  <option value="all">Toutes les catégories</option>
                  <option value="infra">Infrastructures</option>
                  <option value="education">Éducation</option>
                  <option value="environnement">Environnement</option>
                  <option value="social">Social</option>
                </select>
              </div>
              <div className="filter-icons">
                <div className="filter-icon-item"><TrendingUp size={20} /> Infrastructures</div>
                <div className="filter-icon-item"><GraduationCap size={20} /> Éducation</div>
                <div className="filter-icon-item"><Palmtree size={20} /> Environnement</div>
                <div className="filter-icon-item"><Users size={20} /> Social</div>
              </div>
              <div className="select-wrapper">
                <label>Statut</label>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="all">Tous les statuts</option>
                  <option value="encours">En cours</option>
                  <option value="avenir">À venir</option>
                  <option value="termine">Terminé</option>
                </select>
              </div>
              <button className="btn-filter-submit"><Filter size={18} /> Filtrer</button>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="projects-grid-section-v3">
        <div className="section-header-v3">
          <h2>Tous les projets</h2>
          <span className="results-count">{filteredProjects.length} projets trouvés</span>
        </div>
        {loading ? (
          <div className="loading-spinner" style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
            Chargement des projets...
          </div>
        ) : (
          <div className="projects-grid-v3">
            {filteredProjects.length === 0 ? (
              <p style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                Aucun projet ne correspond à ces critères.
              </p>
            ) : (
              filteredProjects.map(project => (
                <div key={project.id} className="project-card-v3">
                  <div className="card-image-v3">
                    <img src={getImageUrl(project.image)} alt={project.title} />
                    <span className={`status-tag-v3 ${project.status.toLowerCase().replace(' ', '-')}`}>
                      {project.status}
                    </span>
                  </div>
                  <div className="card-content-v3">
                    <h3>{project.title}</h3>
                    <p>{project.description}</p>
                    <div className="card-meta-v3">
                      <div className="meta-item" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#9ca3af' }}>
                        <MapPin size={14} /> {project.location}
                      </div>
                      <div className="meta-item" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#9ca3af', marginTop: '4px' }}>
                        <Calendar size={14} /> {project.startDate} au {project.endDate}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn-card-detail"
                      onClick={() => setSelectedProject(project)}
                      aria-label={`Voir le détail du projet ${project.title}`}
                    >
                      <span className="btn-card-detail-label">Voir le détail</span>
                      <span className="btn-card-detail-arrow" aria-hidden="true">
                        <ArrowRight size={18} strokeWidth={2.5} />
                      </span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </section>

      {/* Spotlight Project */}
      <section className="spotlight-section-v3">
        <div className="spotlight-card-v3">
          <div className="spotlight-image-v3">
            <img src={spotlightImg} alt="Développement du centre-ville" />
          </div>
          <div className="spotlight-info-v3">
            <span className="spotlight-tag"><CheckCircle2 size={16} /> PROJET PHARE</span>
            <h2>Développement du centre-ville</h2>
            <p>Un projet ambitieux pour moderniser, embellir et dynamiser le cœur de Dembéni. Ce projet inclut des infrastructures modernes, des espaces verts, des zones commerciales et des équipements publics de qualité.</p>
            <div className="spotlight-progress">
              <div className="progress-header">
                <span>Avancement du projet</span>
                <span>75%</span>
              </div>
              <div className="progress-bar-v3">
                <div className="progress-fill-v3" style={{ width: '75%' }}></div>
              </div>
            </div>
            <button className="btn-spotlight-more">En savoir plus <ArrowRight size={16} /></button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section-v3">
        <div className="stats-grid-v3">
          <div className="stat-item-v3">
            <div className="stat-icon-v3"><TrendingUp size={32} /></div>
            <div className="stat-text-v3">
              <span className="stat-number">12</span>
              <span className="stat-label">Projets en cours</span>
            </div>
          </div>
          <div className="stat-item-v3">
            <div className="stat-icon-v3"><CheckCircle2 size={32} /></div>
            <div className="stat-text-v3">
              <span className="stat-number">25</span>
              <span className="stat-label">Projets réalisés</span>
            </div>
          </div>
          <div className="stat-item-v3">
            <div className="stat-icon-v3"><Calendar size={32} /></div>
            <div className="stat-text-v3">
              <span className="stat-number">8</span>
              <span className="stat-label">Projets à venir</span>
            </div>
          </div>
          <div className="stat-item-v3">
            <div className="stat-icon-v3"><Wallet size={32} /></div>
            <div className="stat-text-v3">
              <span className="stat-number">18,5 M€</span>
              <span className="stat-label">Budget total estimé</span>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="gallery-section-v3" aria-label="Galerie photos des chantiers">
        <div className="section-header-v3">
          <h2>Suivi en images</h2>
          <button
            type="button"
            className="btn-gallery-all"
            onClick={showAllGalleryPhotos}
            disabled={!canGalleryNext}
          >
            Voir toutes les photos <ArrowRight size={16} />
          </button>
        </div>
        <div className="gallery-slider-wrap">
          <button
            type="button"
            className="btn-slider-prev"
            onClick={() => scrollGallery(-1)}
            disabled={!canGalleryPrev}
            aria-label="Photos précédentes"
          >
            <ChevronLeft size={24} />
          </button>
          <div
            className="gallery-slider-v3"
            ref={gallerySliderRef}
            role="region"
            aria-roledescription="carrousel"
            aria-label="Photos des projets"
          >
            {GALLERY_IMAGES.map((img, index) => (
              <div key={index} className="gallery-item-v3">
                <img src={img.src} alt={img.alt} loading="lazy" />
              </div>
            ))}
          </div>
          <button
            type="button"
            className="btn-slider-next"
            onClick={() => scrollGallery(1)}
            disabled={!canGalleryNext}
            aria-label="Photos suivantes"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </section>

      {/* ===== IMPACT BANNER ===== */}
      <section className="impact-banner-section">
        <div className="impact-banner-inner">
          <div className="impact-banner-text">
            <span className="impact-eyebrow">Dembéni en chiffres</span>
            <h2>Une commune en pleine transformation</h2>
            <p>
              Avec près de <strong>25 000 habitants</strong>, Dembéni est l'une des communes les plus dynamiques de Mayotte.
              Chaque euro investi dans nos projets vise à améliorer concrètement le cadre de vie de ses résidents,
              à renforcer les services publics et à préparer l'avenir de nos jeunes générations.
            </p>
          </div>
          <div className="impact-kpi-grid">
            <div className="impact-kpi">
              <span className="kpi-number">25 000</span>
              <span className="kpi-label">Habitants bénéficiaires</span>
            </div>
            <div className="impact-kpi">
              <span className="kpi-number">45</span>
              <span className="kpi-label">Projets depuis 2020</span>
            </div>
            <div className="impact-kpi">
              <span className="kpi-number">18,5 M€</span>
              <span className="kpi-label">Budget total mobilisé</span>
            </div>
            <div className="impact-kpi">
              <span className="kpi-number">4</span>
              <span className="kpi-label">Secteurs d'intervention</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== THEMATIC CATEGORIES ===== */}
      <section className="themes-section">
        <div className="themes-inner">
          <div className="section-header-v3" style={{ marginBottom: '3rem' }}>
            <h2>Nos domaines d'intervention</h2>
            <span className="results-count">4 secteurs prioritaires</span>
          </div>
          <div className="themes-grid">
            <div className="theme-card" style={{ backgroundImage: `url(${gallery2})` }}>
              <div className="theme-card-overlay"></div>
              <div className="theme-card-content">
                <div className="theme-icon-wrap">
                  <Building2 size={24} />
                </div>
                <h3>Infrastructures</h3>
                <p>
                  Routes, ponts, réseaux d'eau potable, assainissement, électrification des quartiers —
                  nous modernisons les équipements structurants de la commune pour garantir un accès équitable
                  aux services essentiels.
                </p>
                <ul className="theme-examples">
                  <li><CheckCircle2 size={14} /> Réhabilitation des voies communales</li>
                  <li><CheckCircle2 size={14} /> Extension du réseau d'assainissement</li>
                  <li><CheckCircle2 size={14} /> Aménagement du centre-ville</li>
                </ul>
              </div>
            </div>
            <div className="theme-card" style={{ backgroundImage: `url(${gallery3})` }}>
              <div className="theme-card-overlay"></div>
              <div className="theme-card-content">
                <div className="theme-icon-wrap">
                  <GraduationCap size={24} />
                </div>
                <h3>Éducation</h3>
                <p>
                  Construction et rénovation d'écoles, équipements numériques, soutien aux activités
                  périscolaires — l'éducation est au cœur de notre vision pour l'avenir de Dembéni.
                </p>
                <ul className="theme-examples">
                  <li><CheckCircle2 size={14} /> Construction de nouvelles salles de classe</li>
                  <li><CheckCircle2 size={14} /> Équipement numérique des écoles</li>
                  <li><CheckCircle2 size={14} /> Cantines scolaires modernisées</li>
                </ul>
              </div>
            </div>
            <div className="theme-card" style={{ backgroundImage: `url(${gallery4})` }}>
              <div className="theme-card-overlay"></div>
              <div className="theme-card-content">
                <div className="theme-icon-wrap">
                  <Leaf size={24} />
                </div>
                <h3>Environnement</h3>
                <p>
                  Protection des espaces naturels, gestion des déchets, développement des espaces verts
                  et promotion des énergies renouvelables pour un cadre de vie durable.
                </p>
                <ul className="theme-examples">
                  <li><CheckCircle2 size={14} /> Création d'espaces verts publics</li>
                  <li><CheckCircle2 size={14} /> Programme de collecte des déchets</li>
                  <li><CheckCircle2 size={14} /> Reboisement des zones dégradées</li>
                </ul>
              </div>
            </div>
            <div className="theme-card" style={{ backgroundImage: `url(${gallery5})` }}>
              <div className="theme-card-overlay"></div>
              <div className="theme-card-content">
                <div className="theme-icon-wrap">
                  <Heart size={24} />
                </div>
                <h3>Social &amp; Cohésion</h3>
                <p>
                  Centres communautaires, équipements sportifs, soutien aux personnes vulnérables —
                  nous bâtissons une commune solidaire où chaque habitant trouve sa place.
                </p>
                <ul className="theme-examples">
                  <li><CheckCircle2 size={14} /> Maison de quartier polyvalente</li>
                  <li><CheckCircle2 size={14} /> Terrains de sport de proximité</li>
                  <li><CheckCircle2 size={14} /> Aide aux familles vulnérables</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TIMELINE DES RÉALISATIONS ===== */}
      <section className="achievements-section">
        <div className="achievements-inner">
          <div className="section-header-v3" style={{ marginBottom: '3rem' }}>
            <h2>Nos grandes réalisations</h2>
            <span className="results-count">Depuis 2020</span>
          </div>
          <div className="achievements-timeline">
            <div className="ach-item ach-done">
              <div className="ach-year">2020</div>
              <div className="ach-connector"><div className="ach-dot"></div></div>
              <div className="ach-content">
                <span className="ach-badge done"><CheckCircle2 size={12} /> Terminé</span>
                <h4>Réhabilitation de la route principale M'Tsapéré – Dembéni</h4>
                <p>Travaux de revêtement et création de trottoirs sécurisés sur 3,2 km. Budget : 1,8 M€. Bénéficiaires directs : 8 000 habitants.</p>
              </div>
            </div>
            <div className="ach-item ach-done">
              <div className="ach-year">2021</div>
              <div className="ach-connector"><div className="ach-dot"></div></div>
              <div className="ach-content">
                <span className="ach-badge done"><CheckCircle2 size={12} /> Terminé</span>
                <h4>Construction de l'école primaire de Kwalé</h4>
                <p>6 nouvelles salles de classe, 1 bibliothèque, sanitaires conformes aux normes. Budget : 2,4 M€. Capacité : 240 élèves.</p>
              </div>
            </div>
            <div className="ach-item ach-done">
              <div className="ach-year">2022</div>
              <div className="ach-connector"><div className="ach-dot"></div></div>
              <div className="ach-content">
                <span className="ach-badge done"><CheckCircle2 size={12} /> Terminé</span>
                <h4>Aménagement du parc municipal et jardins partagés</h4>
                <p>Création d'un espace vert de 1,5 ha avec aires de jeux, sentiers piétons et jardins communautaires. Budget : 650 000 €.</p>
              </div>
            </div>
            <div className="ach-item ach-progress">
              <div className="ach-year">2024</div>
              <div className="ach-connector"><div className="ach-dot"></div></div>
              <div className="ach-content">
                <span className="ach-badge progress"><TrendingUp size={12} /> En cours</span>
                <h4>Développement du centre-ville de Dembéni</h4>
                <p>Modernisation du centre-bourg : places publiques, commerces, éclairage LED, mobilier urbain, accessibilité PMR. Avancement : 75%. Budget : 3,2 M€.</p>
                <div className="ach-progress-bar">
                  <div className="ach-progress-fill" style={{ width: '75%' }}></div>
                </div>
              </div>
            </div>
            <div className="ach-item ach-future">
              <div className="ach-year">2025</div>
              <div className="ach-connector"><div className="ach-dot"></div></div>
              <div className="ach-content">
                <span className="ach-badge future"><Calendar size={12} /> À venir</span>
                <h4>Centre de santé communautaire</h4>
                <p>Nouvelle structure médicale avec consultations générales, maternité et urgences de proximité. Budget prévisionnel : 4,1 M€.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PARTICIPATION CITOYENNE ===== */}
      <section className="participation-section" style={{ backgroundImage: `url(${ctaBg})` }}>
        <div className="participation-inner">
          <div className="participation-header">
            <span className="participation-eyebrow"><Users size={16} /> Implication citoyenne</span>
            <h2>Participez à la vie de votre commune</h2>
            <p>Votre avis compte. La commune de Dembéni s'engage à associer ses citoyens à toutes les grandes décisions qui façonnent notre territoire commun.</p>
          </div>
          <div className="participation-cards">
            <div className="part-card">
              <div className="part-card-icon"><Lightbulb size={28} /></div>
              <h4>Proposez un projet</h4>
              <p>Vous avez une idée pour améliorer votre quartier ? Soumettez-la via notre formulaire en ligne ou lors des réunions publiques mensuelles.</p>
              <button className="btn-part">Soumettre une idée <ArrowRight size={14} /></button>
            </div>
            <div className="part-card">
              <div className="part-card-icon"><BookOpen size={28} /></div>
              <h4>Consultez les documents</h4>
              <p>Accédez librement aux rapports, budgets, comptes-rendus de conseil et études d'impact de chaque projet de la commune.</p>
              <button className="btn-part">Voir les documents <ArrowRight size={14} /></button>
            </div>
            <div className="part-card">
              <div className="part-card-icon"><Star size={28} /></div>
              <h4>Évaluez les réalisations</h4>
              <p>Donnez votre avis sur les projets terminés. Vos retours permettent d'améliorer la qualité de service et d'orienter les futurs investissements.</p>
              <button className="btn-part">Donner mon avis <ArrowRight size={14} /></button>
            </div>
            <div className="part-card">
              <div className="part-card-icon"><Award size={28} /></div>
              <h4>Budget participatif</h4>
              <p>Chaque année, une enveloppe est réservée aux projets proposés et votés directement par les habitants. Participez au prochain vote !</p>
              <button className="btn-part">En savoir plus <ArrowRight size={14} /></button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="faq-section">
        <div className="faq-inner">
          <div className="section-header-v3" style={{ marginBottom: '3rem' }}>
            <h2>Questions fréquentes</h2>
            <span className="results-count">Tout ce que vous devez savoir</span>
          </div>
          <div className="faq-list">
            {faqData.map((item, idx) => (
              <div key={idx} className={`faq-item${openFaq === idx ? ' faq-open' : ''}`}>
                <button className="faq-question" onClick={() => setOpenFaq(openFaq === idx ? null : idx)}>
                  <span>{item.q}</span>
                  <ChevronDown size={20} className="faq-chevron" />
                </button>
                {openFaq === idx && (
                  <div className="faq-answer"><p>{item.a}</p></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== NEWSLETTER CTA ===== */}
      <section className="newsletter-section" aria-labelledby="newsletter-projet-title">
        <div className="newsletter-inner">
          <div className="newsletter-card">
            <div className="newsletter-icon" aria-hidden="true">
              <Mail size={32} />
            </div>
            <h2 id="newsletter-projet-title">Restez informé des actualités projets</h2>
            <p className="newsletter-lead">
              Inscrivez-vous à la newsletter de la commune de Dembéni et recevez en avant-première
              les mises à jour, les consultations et les appels à participation.
            </p>
            {newsletterSent ? (
              <div className="newsletter-success" role="status">
                <CheckCircle2 size={24} aria-hidden="true" />
                Merci ! Votre inscription a bien été enregistrée.
              </div>
            ) : (
              <form
                className="newsletter-form"
                onSubmit={(e) => { e.preventDefault(); setNewsletterSent(true); }}
              >
                <label className="newsletter-field-label" htmlFor="newsletter-email-projet">
                  Adresse e-mail
                </label>
                <div className="newsletter-form-row">
                  <input
                    id="newsletter-email-projet"
                    type="email"
                    placeholder="exemple@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="newsletter-input"
                    autoComplete="email"
                  />
                  <button type="submit" className="newsletter-btn">
                    S&apos;inscrire
                    <ArrowRight size={18} aria-hidden="true" />
                  </button>
                </div>
              </form>
            )}
            <div className="newsletter-contact">
              <p className="newsletter-hint">
                <Phone size={16} aria-hidden="true" />
                <span>
                  Questions ? Contactez la mairie au{' '}
                  <a href="tel:+262269628000" className="newsletter-phone">0269 62 80 00</a>
                </span>
              </p>
              <p className="newsletter-hours">Du lundi au vendredi, 8h – 17h</p>
            </div>
          </div>
        </div>
      </section>

      {/* Detail Modal Overlay */}
      {selectedProject && (
        <div className="project-detail-modal-overlay" onClick={() => setSelectedProject(null)}>
          <div className="project-detail-modal" onClick={(e) => e.stopPropagation()}>
            <button className="btn-close-modal-detail" onClick={() => setSelectedProject(null)}>
              <X size={20} />
            </button>

            <div className="modal-header-image">
              <img src={getImageUrl(selectedProject.image)} alt={selectedProject.title} />
              <span className={`status-tag-v3 ${selectedProject.status.toLowerCase().replace(' ', '-')}`}>
                {selectedProject.status}
              </span>
            </div>

            <div className="modal-body-content">
              <span className="modal-category-tag">{selectedProject.category}</span>
              <h2>{selectedProject.title}</h2>

              <div className="modal-meta-grid">
                <div className="meta-card">
                  <span className="meta-label">📍 Localisation</span>
                  <span className="meta-value">{selectedProject.location}</span>
                </div>
                <div className="meta-card">
                  <span className="meta-label">📅 Durée</span>
                  <span className="meta-value">{selectedProject.startDate} au {selectedProject.endDate}</span>
                </div>
              </div>

              <div className="modal-description-section">
                <h3>Description du Projet</h3>
                <p>{selectedProject.description}</p>
              </div>

              {/* Dynamic Project Comments System */}
              <ProjectComments projectId={selectedProject.id} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Project;
