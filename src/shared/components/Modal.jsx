import React from "react";

/**
 * Componente Modal reutilizable
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isOpen - Indica si el modal está abierto
 * @param {React.ReactNode} props.children - Contenido del modal
 * @param {string} [props.title] - Título del modal (opcional)
 * @returns {JSX.Element} Componente Modal
 */
const Modal = ({ isOpen, children, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        {title && <h2 className="text-xl font-bold mb-4">{title}</h2>}
        {children}
      </div>
    </div>
  );
};

export default Modal;