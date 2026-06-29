import React, { createContext, useContext, useState, useEffect } from 'react';

const DemarchesContext = createContext();

const initialDemarches = [
  {
    id: 1,
    title: "Demander un Acte de Naissance",
    category: "État Civil",
    iconName: "Baby",
    shortDesc: "Procédure pour obtenir une copie intégrale ou un extrait d'acte de naissance.",
    fullContent: {
      presentation: "L'acte de naissance est un document juridique essentiel attestant de la naissance d'une personne. Il est souvent requis pour de nombreuses formalités (carte d'identité, passeport, mariage, PACS, etc.).",
      steps: [
        { title: "Vérifier votre éligibilité", desc: "La copie intégrale ne peut être délivrée qu'à l'intéressé(e) majeur(e), ses parents, grands-parents, enfants, conjoints ou représentants légaux." },
        { title: "Remplir la demande", desc: "Fournir les noms, prénoms et date de naissance de la personne concernée, ainsi que les noms et prénoms usuels de ses parents." },
        { title: "Transmettre au service", desc: "Envoi par courrier postal, au guichet de la Mairie, ou via le service en ligne (Service-Public.fr)." }
      ],
      documents: [
        "Pièce d'identité en cours de validité du demandeur",
        "Livret de famille (pour prouver la filiation si la demande est faite pour un tiers)"
      ],
      delays: "Immédiat au guichet, 3 à 5 jours ouvrés par courrier.",
      fees: "Gratuit (les frais d'envoi postal éventuels sont à la charge du demandeur)",
      onlineLink: "https://www.service-public.fr/particuliers/vosdroits/N359",
    },
    status: "À jour",
    lastUpdate: "2026-05-15",
    views: 3400
  },
  {
    id: 2,
    title: "Carte Nationale d'Identité (CNI) & Passeport",
    category: "Identité",
    iconName: "CreditCard",
    shortDesc: "Pré-demande en ligne, prise de rendez-vous et pièces justificatives.",
    fullContent: {
      presentation: "La Mairie de Dembéni est équipée d'une station biométrique pour la délivrance des cartes nationales d'identité et des passeports biométriques.",
      steps: [
        { title: "Faire une pré-demande en ligne", desc: "Sur le site de l'ANTS. Vous obtiendrez un numéro de pré-demande indispensable pour le rendez-vous." },
        { title: "Prendre rendez-vous", desc: "Contactez le service État Civil de la Mairie pour fixer un rendez-vous de recueil d'empreintes." },
        { title: "Se présenter au rendez-vous", desc: "La présence du demandeur (même mineur) est obligatoire pour la prise d'empreintes." },
        { title: "Retrait du titre", desc: "Vous recevrez un SMS lorsque votre titre sera prêt. Le retrait doit se faire dans les 3 mois." }
      ],
      documents: [
        "Numéro de pré-demande ANTS (ou QR code imprimé)",
        "Photo d'identité récente et conforme aux normes",
        "Justificatif de domicile de moins de 6 mois",
        "Ancien titre d'identité (en cas de renouvellement)"
      ],
      delays: "Délai de fabrication : 3 à 4 semaines en moyenne (variable selon la période de l'année).",
      fees: "CNI : Gratuit (sauf perte/vol : 25€). Passeport : 86€ (Majeur), 42€ (Mineur +15 ans), 17€ (Mineur -15 ans) réglable par timbre fiscal dématérialisé.",
      onlineLink: "https://passeport.ants.gouv.fr/demarches-en-ligne",
    },
    status: "À jour",
    lastUpdate: "2026-05-20",
    views: 5200
  },
  {
    id: 3,
    title: "Inscriptions Scolaires (Maternelle & Primaire)",
    category: "Vie Quotidienne",
    iconName: "GraduationCap",
    shortDesc: "Démarches pour inscrire votre enfant dans les écoles publiques de la commune.",
    fullContent: {
      presentation: "L'instruction est obligatoire dès l'âge de 3 ans. Les inscriptions scolaires pour la rentrée se font auprès du service Vie Scolaire de la Mairie, généralement entre mars et mai de chaque année.",
      steps: [
        { title: "Pré-inscription en Mairie", desc: "Constituer le dossier et le déposer au service Vie Scolaire." },
        { title: "Obtention du certificat d'inscription", desc: "La Mairie vous délivre un document précisant l'école d'affectation de l'enfant." },
        { title: "Admission à l'école", desc: "Prendre rendez-vous avec le directeur ou la directrice de l'école attribuée pour finaliser l'inscription pédagogique." }
      ],
      documents: [
        "Livret de famille ou extrait d'acte de naissance de l'enfant",
        "Pièce d'identité d'un des parents (ou tuteur légal)",
        "Justificatif de domicile récent (facture EDM, Eau, etc.)",
        "Carnet de santé attestant des vaccins obligatoires (DTP)"
      ],
      delays: "Le certificat d'inscription est généralement délivré sous 48h.",
      fees: "Gratuit.",
    },
    status: "À jour",
    lastUpdate: "2026-04-10",
    views: 1850
  },
  {
    id: 4,
    title: "Permis de Construire",
    category: "Urbanisme",
    iconName: "Construction",
    shortDesc: "Autorisation d'urbanisme obligatoire pour toute nouvelle construction ou modification importante.",
    fullContent: {
      presentation: "Le permis de construire est un acte administratif qui donne les moyens à l'administration de vérifier qu'un projet de construction respecte bien les règles d'urbanisme en vigueur (Plan Local d'Urbanisme).",
      steps: [
        { title: "Consulter le PLU", desc: "Vérifier la faisabilité du projet par rapport à la zone où se situe le terrain." },
        { title: "Constituer le dossier (Cerfa n°13406)", desc: "Remplir le formulaire officiel et rassembler toutes les pièces graphiques et écrites." },
        { title: "Dépôt en Mairie", desc: "Déposer le dossier en 4 exemplaires papier ou via le portail de dépôt en ligne des autorisations d'urbanisme." },
        { title: "Affichage sur le terrain", desc: "Dès l'obtention de l'arrêté, afficher le panneau réglementaire sur le terrain." }
      ],
      documents: [
        "Formulaire Cerfa n°13406*11 rempli et signé",
        "PCMI1 : Plan de situation du terrain",
        "PCMI2 : Plan de masse des constructions à édifier",
        "PCMI3 : Plan en coupe du terrain et de la construction",
        "PCMI4 : Notice décrivant le terrain et le projet",
        "PCMI5 & PCMI6 : Plan des façades et insertion 3D"
      ],
      delays: "Délai d'instruction légal : 2 mois pour une maison individuelle (peut être majoré si zone protégée).",
      fees: "La démarche est gratuite, mais des taxes d'aménagement seront dues après l'obtention du permis.",
    },
    status: "À jour",
    lastUpdate: "2026-05-01",
    views: 900
  },
  {
    id: 5,
    title: "Recensement Citoyen (JDC)",
    category: "Identité",
    iconName: "Users",
    shortDesc: "Démarche obligatoire pour tout jeune Français de 16 ans.",
    fullContent: {
      presentation: "Tout jeune de nationalité française doit se faire recenser entre le jour de ses 16 ans et le dernier jour du 3e mois qui suit celui de l'anniversaire. C'est indispensable pour s'inscrire aux examens (Bac, conduite) et participer à la Journée Défense et Citoyenneté (JDC).",
      steps: [
        { title: "Se présenter à la Mairie", desc: "Le jeune doit faire la démarche lui-même. S'il est mineur, un de ses parents peut le faire à sa place." },
        { title: "Remise de l'attestation", desc: "La Mairie remet une attestation de recensement. Attention : aucun duplicata n'est délivré, conservez l'original précieusement !" }
      ],
      documents: [
        "Carte nationale d'identité ou passeport valide",
        "Livret de famille à jour",
        "Justificatif de domicile"
      ],
      delays: "Délivrance immédiate de l'attestation en Mairie.",
      fees: "Gratuit.",
      onlineLink: "https://www.service-public.fr/particuliers/vosdroits/R2054",
    },
    status: "À jour",
    lastUpdate: "2026-02-15",
    views: 1100
  },
  {
    id: 6,
    title: "Demander un Livret de Famille",
    category: "État Civil",
    iconName: "FileText",
    shortDesc: "Étapes pour la délivrance d'un premier livret ou d'un duplicata.",
    fullContent: {
      presentation: "Le livret de famille est un document officiel remis lors de la naissance du premier enfant ou lors du mariage. Il regroupe les extraits d'actes d'état civil de la famille.",
      steps: [
        { title: "Premier livret", desc: "Il est délivré automatiquement par la Mairie lors de la célébration du mariage ou lors de la déclaration de naissance du premier enfant (pour les parents non mariés)." },
        { title: "Demande de duplicata", desc: "En cas de perte, vol, séparation ou divorce, une demande de second livret peut être effectuée à la mairie du domicile." }
      ],
      documents: [
        "Formulaire de demande de second livret (disponible en mairie)",
        "Justificatif de l'identité du demandeur",
        "Justificatif de domicile",
        "Si divorce/séparation : jugement de divorce ou convention de PACS"
      ],
      delays: "Variable, de 1 à 4 semaines selon le nombre de mairies qui doivent apposer leur signature sur le livret.",
      fees: "Gratuit pour le premier duplicata (les suivants peuvent être payants sur délibération du conseil municipal)."
    },
    status: "À jour",
    lastUpdate: "2026-05-10",
    views: 850
  }
];

export const DemarchesProvider = ({ children }) => {
  const [demarches, setDemarches] = useState(() => {
    const saved = localStorage.getItem('demarches_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return initialDemarches;
      }
    }
    return initialDemarches;
  });

  useEffect(() => {
    localStorage.setItem('demarches_data', JSON.stringify(demarches));
  }, [demarches]);

  const addDemarche = (demarche) => {
    const newDemarche = {
      ...demarche,
      id: Date.now(),
      views: 0,
      lastUpdate: new Date().toISOString().split('T')[0],
      iconName: demarche.iconName || 'FileText',
      fullContent: demarche.fullContent || { presentation: demarche.shortDesc }
    };
    setDemarches([newDemarche, ...demarches]);
  };

  const updateDemarche = (updatedDemarche) => {
    setDemarches(demarches.map(d => 
      d.id === updatedDemarche.id ? { ...updatedDemarche, lastUpdate: new Date().toISOString().split('T')[0] } : d
    ));
  };

  const deleteDemarche = (id) => {
    setDemarches(demarches.filter(d => d.id !== id));
  };

  return (
    <DemarchesContext.Provider value={{ demarches, addDemarche, updateDemarche, deleteDemarche }}>
      {children}
    </DemarchesContext.Provider>
  );
};

export const useDemarches = () => useContext(DemarchesContext);

