import React, { useState, useEffect } from 'react';
import api, { API_URL } from '../apiConfig';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Calendar, ArrowRight, X, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

import bgImage from '../images/01.jpg';

const ALL_CATEGORIES = ["Toutes", "Municipalité", "Travaux", "Événement", "Culture", "Santé"];

const SkeletonCard = () => (
  <div className="bg-[#F8FAFC]/95 backdrop-blur-md rounded-2xl overflow-hidden shadow-xl animate-pulse">
    <div className="h-56 bg-gray-300"></div>
    <div className="p-6">
      <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
      <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-300 rounded w-5/6 mb-6"></div>
      <div className="h-4 bg-gray-300 rounded w-1/3"></div>
    </div>
  </div>
);

const Actualites = () => {
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState("Toutes");
  const [selectedArticle, setSelectedArticle] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const { data } = await api.get('/api/news');
        setNews(data);
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNews();
  }, []);

  const filteredNews = news.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Toutes" || item.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
  const currentNews = filteredNews.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  return (
    <div className="min-h-screen relative font-sans">
      {/* Full-screen Background Image */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
      </div>

      <div className="relative z-10 pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 font-heading tracking-tight drop-shadow-md">
            Actualités de la Commune
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto font-medium drop-shadow">
            Restez informé de tout ce qui se passe à Dembéni : événements majeurs, décisions municipales, avancées des travaux et annonces importantes pour votre quotidien.
          </p>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-12 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex-1 w-full relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-3 border-0 rounded-xl text-gray-900 bg-white/95 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-primary-light transition-all duration-300 outline-none"
              placeholder="Rechercher une actualité..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 justify-center w-full md:w-auto">
            <Filter className="h-5 w-5 text-white mr-2" />
            {ALL_CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 shadow-md ${selectedCategory === category
                    ? 'bg-primary text-white scale-105'
                    : 'bg-white/90 text-gray-700 hover:bg-white'
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Section Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white font-heading drop-shadow-md text-center md:text-left">
            Dernières publications
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {isLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : currentNews.length > 0 ? (
            <AnimatePresence mode="popLayout">
              {currentNews.map((item, idx) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="bg-[#F8FAFC]/95 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-300 transform hover:-translate-y-2 group flex flex-col h-full"
                >
                  <div className="relative h-56 md:h-64 overflow-hidden">
                    <img
                      src={item.image.startsWith('http') || item.image.startsWith('data:') || (item.image.startsWith('/') && !item.image.startsWith('/uploads')) ? item.image : `${API_URL}${item.image}`}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-[#8B1515] font-semibold text-xs py-1.5 px-3 rounded-full flex items-center shadow-lg">
                      <Calendar className="w-3.5 h-3.5 mr-1.5" />
                      {item.date}
                    </div>
                  </div>

                  <div className="p-6 md:p-8 flex-1 flex flex-col">
                    <div className="mb-4">
                      <span className="inline-block bg-blue-100/70 text-blue-700 text-xs font-bold px-3 py-1 rounded-md tracking-wider">
                        {item.category}
                      </span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 font-heading leading-tight group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 mb-6 flex-1 line-clamp-3">
                      {item.desc}
                    </p>
                    <button
                      onClick={() => setSelectedArticle(item)}
                      className="mt-auto inline-flex items-center text-[#8B1515] font-semibold hover:text-red-700 transition-colors w-max"
                    >
                      Lire l'article complet <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="col-span-full py-20 text-center bg-white/10 backdrop-blur-md rounded-2xl">
              <p className="text-2xl text-white font-medium">Aucune actualité trouvée pour cette catégorie.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="mt-16 flex justify-center items-center gap-4">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-full bg-white/90 text-gray-800 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <span className="text-white font-medium bg-black/40 px-4 py-1.5 rounded-full backdrop-blur-sm">
              Page {currentPage} sur {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-full bg-white/90 text-gray-800 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedArticle(null)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-y-auto flex flex-col z-10"
            >
              <button
                onClick={() => setSelectedArticle(null)}
                className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-md transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="relative h-64 sm:h-80 w-full shrink-0">
                <img
                  src={selectedArticle.image.startsWith('http') || selectedArticle.image.startsWith('data:') || (selectedArticle.image.startsWith('/') && !selectedArticle.image.startsWith('/uploads')) ? selectedArticle.image : `${API_URL}${selectedArticle.image}`}
                  alt={selectedArticle.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-6 right-6 flex justify-between items-end">
                  <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wider shadow-md">
                    {selectedArticle.category}
                  </span>
                  <div className="flex items-center text-white bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full text-sm font-medium">
                    <Calendar className="w-4 h-4 mr-2" />
                    {selectedArticle.date}
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-10 flex-1">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6 font-heading leading-tight">
                  {selectedArticle.title}
                </h2>
                <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed">
                  {selectedArticle.content.split('\n').map((paragraph, i) => (
                    <p key={i} className="mb-4">{paragraph}</p>
                  ))}
                </div>

                <div className="mt-10 pt-6 border-t border-gray-200 flex justify-end">
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2.5 px-6 rounded-xl transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Actualites;
