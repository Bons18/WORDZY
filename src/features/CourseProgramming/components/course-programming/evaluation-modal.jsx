"use client";

import { useEffect, useRef } from "react";
import EvaluationForm from "../../../Evaluations/components/EvaluationForm";

const EvaluationModal = ({
  isOpen,
  onClose,
  onSubmit,
  evaluation = null,
  evaluationType = null,
}) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, onClose]);

  const handleSubmitWithType = (formData) => {
    if (evaluationType) {
      formData.set("tipoEvaluacion", evaluationType);
    }
    onSubmit(formData);
  };

  if (!isOpen) return null;

  const evaluationWithType = evaluation || {
    tipoEvaluacion: evaluationType || "Examen",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 overflow-y-auto">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-auto" // ✅ Cambio: max-w-7xl → max-w-3xl
        onClick={(e) => e.stopPropagation()}
      >
        {/* ✅ CSS para ocultar el campo de tipo cuando viene predefinido */}
        {evaluationType && (
          <style jsx>{`
            select[name="tipoEvaluacion"] {
              display: none !important;
            }
            select[name="tipoEvaluacion"] + label,
            label:has(+ select[name="tipoEvaluacion"]) {
              display: none !important;
            }
            /* Ocultar el div contenedor del campo tipo */
            div:has(> label + select[name="tipoEvaluacion"]) {
              display: none !important;
            }
          `}</style>
        )}

        {/* ✅ CSS para cambiar el título del modal y ajustar el campo de material */}
        {evaluationType && (
          <style jsx global>{`
            .evaluation-form h2 {
              display: none !important;
            }
            .evaluation-form::before {
              content: "${evaluationType === "Actividad"
                ? "CREAR ACTIVIDAD"
                : "CREAR EXAMEN"}";
              display: block;
              text-align: center;
              font-size: 18px;
              font-weight: bold;
              color: #1f384c;
              margin-bottom: 1rem;
              margin-top: 1.5rem; /* ✅ Agregado margin-top */
            }

            /* ✅ Hacer que el campo Material tenga el mismo ancho que Temática */
            .evaluation-form .grid.grid-cols-1.lg\\:grid-cols-2:nth-of-type(2) {
              grid-template-columns: 1fr 1fr !important;
            }

            /* ✅ Asegurar que el campo Material no ocupe todo el ancho */
            .evaluation-form
              .grid.grid-cols-1.lg\\:grid-cols-2:nth-of-type(2)
              > div:nth-child(2) {
              grid-column: span 1 !important;
            }
          `}</style>
        )}

        {/* ✅ CSS adicional para ajustar el campo de material sin evaluationType */}
        <style jsx global>{`
          .evaluation-form .grid.grid-cols-1.lg\\:grid-cols-2:nth-of-type(2) {
            grid-template-columns: 1fr !important;
          }
        `}</style>

        <div className="evaluation-form">
          <EvaluationForm
            evaluation={evaluationWithType}
            onSubmit={handleSubmitWithType}
            onCancel={onClose}
            isCreating={true}
          />
        </div>
      </div>
    </div>
  );
};

export default EvaluationModal;
