const User = require('../models/User');
const Project = require('../models/Project');

const seedAdmin = async () => {
  try {
    // Seed Admin
    const adminExists = await User.findOne({ email: 'ratsaranasa@gmail.com' });

    if (!adminExists) {
      await User.create({
        firstName: 'bermando',
        lastName: 'nasandratra',
        email: 'ratsaranasa@gmail.com',
        password: 'bermando1234',
        role: 'ADMIN',
        status: 'APPROVED'
      });
      console.log('Admin user seeded successfully');
    } else {
      console.log('Admin user already exists');
    }

    // Seed Projects
    const projectCount = await Project.countDocuments();
    if (projectCount === 0) {
      await Project.insertMany([
        {
          title: "Construction d'un centre culturel",
          description: "Projet visant à renforcer les activités culturelles et artistiques de la commune.",
          location: "Dembéni Centre",
          startDate: "2024-01-15",
          endDate: "2025-06-30",
          image: "/uploads/00.jpg",
          category: "culture",
          status: "En cours"
        },
        {
          title: "Extension du groupe scolaire M'tsapéré",
          description: "Extension et modernisation de l'établissement pour accueillir plus d'élèves.",
          location: "M'tsapéré",
          startDate: "2024-03-15",
          endDate: "2025-09-30",
          image: "/uploads/0000.jpg",
          category: "education",
          status: "En cours"
        },
        {
          title: "Aménagement de la route de Iloni",
          description: "Amélioration de la voirie et sécurisation des déplacements.",
          location: "Iloni",
          startDate: "2025-07-01",
          endDate: "2026-12-31",
          image: "/uploads/00000.jpg",
          category: "infra",
          status: "À venir"
        },
        {
          title: "Réhabilitation du centre-ville",
          description: "Réaménagement des espaces publics et modernisation des infrastructures.",
          location: "Dembéni Centre",
          startDate: "2024-02-01",
          endDate: "2025-12-31",
          image: "/uploads/0001.jpg",
          category: "infra",
          status: "En cours"
        },
        {
          title: "Protection des ressources en eau",
          description: "Programme de préservation des sources d'eau et de sensibilisation.",
          location: "Oualid",
          startDate: "2024-04-01",
          endDate: "2025-04-30",
          image: "/uploads/0004.jpg",
          category: "environnement",
          status: "En cours"
        },
        {
          title: "Maison des jeunes de Dembéni",
          description: "Espace d'accompagnement et d'activités pour la jeunesse.",
          location: "Dembéni",
          startDate: "2023-12-01",
          endDate: "2024-08-31",
          image: "/uploads/0005.jpg",
          category: "social",
          status: "Terminé"
        }
      ]);
      console.log('Initial projects seeded successfully');
    } else {
      console.log('Projects already exist in the database');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

module.exports = seedAdmin;
