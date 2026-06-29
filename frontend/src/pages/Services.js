import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Building, Wrench, FileText, Phone, Mail, Clock, MapPin, Trash2, Bus, TreePine } from 'lucide-react';
import '../styles/PublicPages.css';

const Services = () => {
  const services = [
    {
      title: "Police Municipale",
      desc: "Assure le bon ordre, la sûreté, la sécurité et la salubrité publiques. La police municipale veille à votre tranquillité au quotidien (patrouilles, objets trouvés, sécurité école).",
      icon: <Shield size={32} />,
      color: "blue",
      infos: [
        { icon: <Phone size={16} />, text: "0262 62 15 17" },
        { icon: <Clock size={16} />, text: "7j/7 - 24h/24 (Astreinte)" },
        { icon: <MapPin size={16} />, text: "Poste de Police, Centre-Ville" }
      ]
    },
    {
      title: "Urbanisme et Foncier",
      desc: "Gestion des permis de construire, des déclarations préalables de travaux et du plan local d'urbanisme (PLU). Conseil architectural et cadastral.",
      icon: <Building size={32} />,
      color: "green",
      infos: [
        { icon: <MapPin size={16} />, text: "Mairie Principale, 1er étage" },
        { icon: <Clock size={16} />, text: "Mardi et Jeudi : 8h-12h" },
        { icon: <Mail size={16} />, text: "urbanisme@dembeni.yt" }
      ]
    },
    {
      title: "Services Techniques",
      desc: "Entretien de la voirie, gestion de l'éclairage public, intervention sur les bâtiments communaux et sécurité des infrastructures.",
      icon: <Wrench size={32} />,
      color: "orange",
      infos: [
        { icon: <Phone size={16} />, text: "0262 62 15 25" },
        { icon: <Clock size={16} />, text: "Lundi au Vendredi : 7h-14h" }
      ]
    },
    {
      title: "Environnement et Propreté",
      desc: "Gestion de la collecte des déchets, entretien des parcs et jardins, lutte contre les dépôts sauvages et sensibilisation écologique.",
      icon: <TreePine size={32} />,
      color: "green",
      infos: [
        { icon: <Trash2 size={16} />, text: "Collecte Encombrants : 1er Lundi du mois" },
        { icon: <Phone size={16} />, text: "0262 62 15 26 (Allô Propreté)" }
      ]
    },
    {
      title: "État Civil et Élections",
      desc: "Délivrance des actes de naissance, mariage, décès. Inscription sur les listes électorales, recensement militaire et légalisation de signature.",
      icon: <FileText size={32} />,
      color: "purple",
      infos: [
        { icon: <Phone size={16} />, text: "0262 62 15 20" },
        { icon: <Clock size={16} />, text: "Lundi au Vendredi : 8h-16h" }
      ]
    },
    {
      title: "Transport Scolaire et Mobilité",
      desc: "Gestion des cartes de transport scolaire, des abris bus et du plan de déplacement urbain pour faciliter la mobilité de tous.",
      icon: <Bus size={32} />,
      color: "blue",
      infos: [
        { icon: <MapPin size={16} />, text: "Guichet Mobilité, Annexe Mairie" },
        { icon: <Clock size={16} />, text: "Mercredi et Vendredi : 8h-12h" }
      ]
    }
  ];

  return (
    <div className="public-page">
      <section className="page-hero hero-services">
        <motion.div 
          className="hero-content"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>Services Publics Municipaux</h1>
          <p>La Mairie de Dembéni met à votre disposition des services de proximité performants, réactifs et à l'écoute pour vous accompagner dans toutes vos démarches quotidiennes.</p>
        </motion.div>
      </section>

      <div className="page-container">
        <h2 className="section-title">Nos principaux services</h2>
        <div className="grid-2">
          {services.map((service, idx) => (
            <motion.div 
              key={idx}
              className="premium-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
            >
              <div className={`card-icon ${service.color}`}>
                {service.icon}
              </div>
              <h3>{service.title}</h3>
              <p>{service.desc}</p>
              <div className="info-block">
                {service.infos.map((info, i) => (
                  <div key={i} className="info-item">
                    {info.icon} <span>{info.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;
