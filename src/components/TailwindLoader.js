import React, { useEffect } from 'react';

const TailwindLoader = () => {
  useEffect(() => {
    // Crear enlace al CDN de Tailwind
    const tailwindCDN = document.createElement('script');
    tailwindCDN.src = 'https://cdn.tailwindcss.com';
    document.head.appendChild(tailwindCDN);

    return () => {
      // Limpieza al desmontar
      document.head.removeChild(tailwindCDN);
    };
  }, []);

  return null;
};

export default TailwindLoader;