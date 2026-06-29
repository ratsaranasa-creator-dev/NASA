import React from 'react';

/**
 * Composant ResponsiveImage
 * Gère l'affichage d'images avec support du chargement différé,
 * accessibilité et structure <picture> pour formats modernes.
 */
const ResponsiveImage = ({ 
  src, 
  alt, 
  className = '', 
  sizes = '100vw',
  loading = 'lazy',
  style = {}
}) => {
  // On assume que src est le chemin vers l'image JPEG/PNG par défaut
  // Si on avait des versions WebP/AVIF, on les ajouterait ici
  
  return (
    <picture className={`responsive-picture ${className}`}>
      {/* 
        On pourrait ajouter des balises <source> ici pour WebP/AVIF 
        Exemple: <source srcSet={srcWebp} type="image/webp" />
      */}
      <img
        src={src}
        alt={alt}
        loading={loading}
        sizes={sizes}
        className={`fluid-img ${className}`}
        style={{
          maxWidth: '100%',
          height: 'auto',
          display: 'block',
          ...style
        }}
      />
    </picture>
  );
};

export default ResponsiveImage;
