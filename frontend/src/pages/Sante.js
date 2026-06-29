import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Activity, Stethoscope, Baby, Phone, MapPin, Pill, Syringe } from 'lucide-react';
import '../styles/PublicPages.css';

const Sante = () => {
  const centres = [
    {
      title: "Centre Communal d'Action Sociale (CCAS)",
      desc: "Le CCAS vous accueille, vous informe et vous oriente pour faire valoir vos droits sociaux (RSA, aide au logement, accompagnement des seniors, aide alimentaire).",
      icon: <Heart size={32} />,
      color: "red",
      infos: [
        { icon: <MapPin size={16} />, text: "Rez-de-chaussée de la Mairie" },
        { icon: <Phone size={16} />, text: "0262 62 15 30" }
      ]
    },
    {
      title: "Maison de Santé Pluridisciplinaire",
      desc: "Regroupe plusieurs médecins généralistes, infirmiers, un kinésithérapeute et une sage-femme. Consultations sur rendez-vous ou urgences mineures du quotidien.",
      icon: <Stethoscope size={32} />,
      color: "blue",
      infos: [
        { icon: <MapPin size={16} />, text: "12 Rue de l'Hôpital, Centre-Ville" },
        { icon: <Phone size={16} />, text: "0262 62 16 00" }
      ]
    },
    {
      title: "PMI (Protection Maternelle et Infantile)",
      desc: "Suivi médical préventif des femmes enceintes et des enfants de moins de 6 ans. Consultations pédiatriques gratuites, conseils en puériculture et ateliers parents-enfants.",
      icon: <Baby size={32} />,
      color: "purple",
      infos: [
        { icon: <MapPin size={16} />, text: "Quartier de la Maternité" },
        { icon: <Phone size={16} />, text: "0262 62 18 10" }
      ]
    },
    {
      title: "Défibrillateurs (DAE)",
      desc: "La commune est équipée de 5 défibrillateurs automatisés externes accessibles 24h/24 en cas d'arrêt cardiaque. Des formations aux premiers secours sont régulièrement proposées.",
      icon: <Activity size={32} />,
      color: "green",
      infos: [
        { icon: <MapPin size={16} />, text: "Mairie, Gymnase, Stade, Place centrale, Marché" }
      ]
    },
    {
      title: "Pharmacies de Garde",
      desc: "Deux pharmacies sont à votre disposition sur la commune. Un système de garde est organisé pour les week-ends, les nuits et les jours fériés.",
      icon: <Pill size={32} />,
      color: "orange",
      infos: [
        { icon: <MapPin size={16} />, text: "Pharmacie Centrale & Pharmacie du Sud" },
        { icon: <Phone size={16} />, text: "3237 (Pour connaître la garde)" }
      ]
    },
    {
      title: "Centre de Vaccination",
      desc: "Campagnes de vaccination saisonnières et obligatoires. Ouvert au public pour les mises à jour des carnets de santé en partenariat avec l'ARS.",
      icon: <Syringe size={32} />,
      color: "blue",
      infos: [
        { icon: <MapPin size={16} />, text: "Annexe Médicale, Route Nationale" },
        { icon: <Phone size={16} />, text: "0262 62 16 05" }
      ]
    }
  ];

  return (
    <div className="public-page">
      <section className="page-hero hero-sante">
        <motion.div 
          className="hero-content"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>Santé et Solidarité</h1>
          <p>La santé de nos concitoyens et la solidarité envers les plus fragiles sont au cœur de nos priorités municipales. Retrouvez ici toutes les structures dédiées à votre bien-être.</p>
        </motion.div>
      </section>

      <div className="page-container">
        <h2 className="section-title">Structures de Santé et d'Aide</h2>
        <div className="grid-2">
          {centres.map((item, idx) => (
            <motion.div 
              key={idx}
              className="premium-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
            >
              <div className={`card-icon ${item.color}`}>
                {item.icon}
              </div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
              <div className="info-block">
                {item.infos.map((info, i) => (
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

export default Sante;
