import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { useAuth } from "../../../auth/hooks/useAuth";
import ConfirmationModal from "../../../../shared/components/ConfirmationModal";
import ProgrammingDetails from "./programming-details";
import { useGetCourseProgrammingById } from "../../hooks/useGetCourseProgrammingById";
import EvaluationDetailModal from "../../../Evaluations/components/EvaluationDetailModal";
import SupportMaterialDetailModal from "../../../SupportMaterials/componentes/SupportMaterialDetailModal";
import { getRoleDisplayName, getUserRole } from "../../../../shared/utils/roleDisplay";

export default function CourseProgrammingDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const {programming, loading: isLoading } = useGetCourseProgrammingById(id);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const { logout, user } = useAuth();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogoutClick = () => {
    setIsDropdownOpen(false);
    setShowLogoutConfirm(true);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleShowEvaluationDetail = (evaluation) => {
    setSelectedDetail(evaluation);
    setShowDetailModal(true);
  };

  // Para mostrar el detalle
  const handleView = (material) => {
    setSelectedMaterial(material);
    setShowDetail(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!programming) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold text-red-500 mb-4">
          Programación no encontrada
        </h2>
        <button
          onClick={handleBackClick}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Volver al listado
        </button>
      </div>
    );
  }

  const adaptedProgramming = {
    nombre: programming.programId.name,
    estado: programming.status ? "Activo" : "Inactivo",
    fechaInicio: new Date(programming.startDate).toLocaleDateString(),
    fechaFin: programming.endDate
      ? new Date(programming.endDate).toLocaleDateString()
      : null,
    levels: (programming.levels || []).map((level) => ({
      ...level,
      id: level._id,
      themes: (level.topics || []).map((topic) => ({
        id: topic._id,
        selectedTheme: topic.topicId, // ya poblado
        progress: topic.value,
        activities: [
          ...(topic.activities || []).map((act) => ({
            id: act._id,
            value: act.value,
            type: "Actividades",
            evaluationId: act.evaluationId,
            onDetail: () => handleShowEvaluationDetail(act.evaluationId),
          })),
          ...(topic.exams || []).map((exam) => ({
            id: exam._id,
            value: exam.value,
            type: "Exámenes",
            evaluationId: exam.evaluationId,
            onDetail: () => handleShowEvaluationDetail(exam.evaluationId),
          })),
          ...(topic.materials || []).map((mat) => ({
            id: mat._id,
            value: "-",
            type: "Material",
            materialId: mat.materialId,
            onDetail: () => handleView(mat.materialId),
          })),
        ],
      })),
    })),
  };

  return (
    <div className="min-h-screen">
      <header className="bg-white py-4 px-6 border-b border-[#d6dade] mb-6">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#1f384c]">
            Detalle de Programación
          </h1>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 text-[#1f384c] font-medium px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              <span>{user?.name} {user?.lastName} - {getRoleDisplayName(getUserRole(user))}</span>
              <ChevronDown
                className={`w-5 h-5 transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-50">
                <button
                  onClick={handleLogoutClick}
                  className="w-full text-left px-4 py-2 text-[#f44144] hover:bg-gray-50 rounded-lg"
                >
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6">
        <ProgrammingDetails programming={adaptedProgramming} />

        <ConfirmationModal
          isOpen={showLogoutConfirm}
          onClose={() => setShowLogoutConfirm(false)}
          onConfirm={handleLogout}
          title="Cerrar Sesión"
          message="¿Está seguro de que desea cerrar la sesión actual?"
          confirmText="Cerrar Sesión"
          confirmColor="bg-[#f44144] hover:bg-red-600"
        />

        <EvaluationDetailModal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          evaluation={selectedDetail}
        />

        <SupportMaterialDetailModal
          isOpen={showDetail}
          onClose={() => setShowDetail(false)}
          material={selectedMaterial}
        />
      </div>
    </div>
  );
}
