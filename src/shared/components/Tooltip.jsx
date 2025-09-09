import React from "react";

/**
 * Componente Tooltip compacto mejorado
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Elemento que activa el tooltip
 * @param {string} props.text - Texto del tooltip
 * @param {string} [props.position="bottom"] - Posición (top, bottom, left, right)
 * @returns {JSX.Element} Tooltip compacto con flecha
 */
const Tooltip = ({ children, text, position = "bottom" }) => {
  // Estilos base compactos
  const tooltipBaseClasses = `
    absolute
    z-50
    bg-gray-800
    text-white
    text-xs
    px-2
    py-1
    rounded
    opacity-0
    group-hover:opacity-100
    transition-opacity
    duration-150
    whitespace-nowrap
    max-w-xs
    break-words
    before:content-['']
    before:absolute
    before:border-4
    before:border-transparent
  `;

  // Posicionamiento compacto con flecha
  const positionClasses = {
    top: `
      bottom-full
      left-1/2
      transform
      -translate-x-1/2
      mb-1
      before:top-full
      before:left-1/2
      before:-translate-x-1/2
      before:border-t-gray-800
    `,
    bottom: `
      top-full
      left-1/2
      transform
      -translate-x-1/2
      mt-1
      before:bottom-full
      before:left-1/2
      before:-translate-x-1/2
      before:border-b-gray-800
    `,
    left: `
      right-full
      top-1/2
      transform
      -translate-y-1/2
      mr-1
      before:top-1/2
      before:left-full
      before:-translate-y-1/2
      before:border-l-gray-800
    `,
    right: `
      left-full
      top-1/2
      transform
      -translate-y-1/2
      ml-1
      before:top-1/2
      before:right-full
      before:-translate-y-1/2
      before:border-r-gray-800
    `,
  };

  return (
    <div className="relative inline-flex group">
      {children}
      <div className={`${tooltipBaseClasses} ${positionClasses[position]}`}>
        {text}
      </div>
    </div>
  );
};

export default Tooltip;