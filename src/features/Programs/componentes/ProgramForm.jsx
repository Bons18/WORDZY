"use client"

import { useState, useEffect } from "react"
import Modal from "../../../shared/components/Modal"
import InputField from "../../../shared/components/InputField"
import Button from "../../../shared/components/Button"
import ErrorMessage from "../../../shared/components/ErrorMessage"

const ProgramForm = ({ isOpen, onClose, onSubmit, program = null, loading = false }) => {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    fk_level: "TECNICO",
    fk_modality: "PRESENCIAL",
    description: "",
    duration: "",
    abbreviation: "",
    version: "",
    status: true,
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (program) {
      setFormData({
        name: program.name || "",
        code: program.code || "",
        fk_level: program.fk_level || "TECNICO",
        fk_modality: program.fk_modality || "PRESENCIAL",
        description: program.description || "",
        duration: program.duration || "",
        abbreviation: program.abbreviation || "",
        version: program.version || "",
        status: program.status !== false,
      })
    } else {
      setFormData({
        name: "",
        code: "",
        fk_level: "TECNICO",
        fk_modality: "PRESENCIAL",
        description: "",
        duration: "",
        abbreviation: "",
        version: "",
        status: true,
      })
    }
    setErrors({})
  }, [program, isOpen])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido"
    }

    if (!formData.code.trim()) {
      newErrors.code = "El código es requerido"
    }

    if (!formData.fk_level) {
      newErrors.fk_level = "El nivel es requerido"
    }

    if (!formData.fk_modality) {
      newErrors.fk_modality = "La modalidad es requerida"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={program ? "Editar Programa" : "Crear Programa"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <InputField
              label="Nombre del Programa"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ej: Desarrollo de Software"
              required
            />
            {errors.name && <ErrorMessage message={errors.name} />}
          </div>

          <div>
            <InputField
              label="Código"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="Ej: 332"
              required
            />
            {errors.code && <ErrorMessage message={errors.code} />}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nivel *</label>
            <select
              name="fk_level"
              value={formData.fk_level}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1f384c] focus:border-transparent"
              required
            >
              <option value="TECNICO">Técnico</option>
              <option value="TECNÓLOGO">Tecnólogo</option>
              <option value="ESPECIALIZACION">Especialización</option>
              <option value="AUXILIAR">Auxiliar</option>
              <option value="OPERARIO">Operario</option>
            </select>
            {errors.fk_level && <ErrorMessage message={errors.fk_level} />}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Modalidad *</label>
            <select
              name="fk_modality"
              value={formData.fk_modality}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1f384c] focus:border-transparent"
              required
            >
              <option value="PRESENCIAL">Presencial</option>
              <option value="A DISTANCIA">A Distancia</option>
              <option value="VIRTUAL">Virtual</option>
              <option value="COMBINADO">Combinado</option>
            </select>
            {errors.fk_modality && <ErrorMessage message={errors.fk_modality} />}
          </div>
        </div>

        <div>
          <InputField
            label="Descripción"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Descripción del programa"
            multiline
            rows={3}
          />
        </div>

        <div>
          <InputField
            label="Duración"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            placeholder="Ej: 24 meses, 2880 horas"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <InputField
              label="Abreviación"
              name="abbreviation"
              value={formData.abbreviation}
              onChange={handleChange}
              placeholder="Abreviación del programa"
            />
          </div>

          <div>
            <InputField
              label="Versión"
              name="version"
              value={formData.version}
              onChange={handleChange}
              placeholder="Ej: 1, 102, 2"
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="status"
            name="status"
            checked={formData.status}
            onChange={handleChange}
            className="h-4 w-4 text-[#1f384c] focus:ring-[#1f384c] border-gray-300 rounded"
          />
          <label htmlFor="status" className="ml-2 block text-sm text-gray-700">
            Programa activo
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" onClick={onClose} variant="secondary" disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading} disabled={loading}>
            {program ? "Actualizar" : "Crear"} Programa
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default ProgramForm
