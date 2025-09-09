
"use client"

import { useState, useEffect, useRef } from "react"
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  ImageIcon,
  Italic,
  Link,
  List,
  ListOrdered,
  Maximize2,
  Underline,
  Upload,
  FileText,
  Music,
  Trash2,
} from "lucide-react"

const SupportMaterialForm = ({
  initialData = {},
  onSubmit,
  onCancel,
  isLoading = false,
  mode = "create",
  topics = [],
  successMessage,
  setSuccessMessage,
  setShowSuccessModal,
}) => {
  const [formData, setFormData] = useState({
    titulo: "",
    tema: "",
    fecha_creacion: new Date().toISOString().split("T")[0],
    estado: "Activo",
    contenido: "<div>Material de Apoyo...</div>",
  })
  const today = new Date();
  const year = today.getFullYear();

  const minDate = new Date(year - 2, 0, 1).toISOString().split("T")[0]; // 1 de enero hace 2 años
  const maxDate = new Date(year + 2, 11, 31).toISOString().split("T")[0]; // 31 de diciembre dentro de 2 años

  const [uploadingFile, setUploadingFile] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const editorRef = useRef(null)
  const imageInputRef = useRef(null)
  const documentInputRef = useRef(null)
  const audioInputRef = useRef(null)

  // Función para hacer elementos del editor eliminables
  const makeContentEditable = (editorRef) => {
  if (!editorRef.current) return;

  // Eliminar botones anteriores para evitar duplicados
  const oldButtons = editorRef.current.querySelectorAll(".delete-btn");
  oldButtons.forEach((btn) => btn.remove());

  // === IMÁGENES ===
  const imageContainers = editorRef.current.querySelectorAll("img");
  imageContainers.forEach((img) => {
    const parent = img.closest("div");

    if (parent && !parent.querySelector(".delete-btn")) {
      parent.style.position = "relative";

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-btn";
      deleteBtn.innerHTML = "✕";
      deleteBtn.style.cssText = `
        position: absolute;
        top: 5px;
        right: 5px;
        background: #ff4444;
        color: white;
        border: none;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        font-size: 12px;
        cursor: pointer;
        z-index: 10;
      `;

      deleteBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirm("¿Deseas eliminar esta imagen?")) {
          parent.remove();
        }
      });

      parent.appendChild(deleteBtn);
    }
  });

  // === DOCUMENTOS ===
  const documents = editorRef.current.querySelectorAll(".document-link");
  documents.forEach((doc) => {
  doc.style.position = "relative"
  doc.title = "Haz clic en la X para eliminar este documento"

  // Crear botón de eliminar
  const deleteBtn = document.createElement("button")
  deleteBtn.innerHTML = "✕"
  deleteBtn.className = "delete-btn"
  deleteBtn.style.cssText = `
    position: absolute;
    top: 5px;
    right: 5px;
    background: #ff4444;
    color: white;
    border: none;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    font-size: 12px;
    cursor: pointer;
    z-index: 10;
  `

  // Agregar botón solo si no existe ya
  if (!doc.querySelector(".delete-btn")) {
    doc.appendChild(deleteBtn)
  }

  // Mostrar el botón solo al pasar el mouse por el documento
  doc.addEventListener("mouseenter", () => {
    deleteBtn.style.display = "block"
  })

  doc.addEventListener("mouseleave", () => {
    deleteBtn.style.display = "none"
  })

  deleteBtn.addEventListener("click", (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (confirm("¿Deseas eliminar este documento?")) {
      doc.remove()
    }
  })
});

  // === AUDIOS ===
  const audios = editorRef.current.querySelectorAll(".audio-container");
  audios.forEach((audio) => {
    audio.style.position = "relative";

    if (!audio.querySelector(".delete-btn")) {
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-btn";
      deleteBtn.innerHTML = "✕";
      deleteBtn.style.cssText = `
        position: absolute;
        top: 5px;
        right: 5px;
        background: #ff4444;
        color: white;
        border: none;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        font-size: 12px;
        cursor: pointer;
        z-index: 10;
      `;

      deleteBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirm("¿Deseas eliminar este audio?")) {
          audio.remove();
        }
      });

      audio.appendChild(deleteBtn);
    }
  });
};


  // Función para limpiar todo el contenido
  const clearAllContent = (editorRef) => {
    if (!editorRef.current) return

    if (confirm("¿Deseas eliminar todo el contenido? Esta acción no se puede deshacer.")) {
      editorRef.current.innerHTML = "<div>Material de Apoyo...</div>"
    }
  }

  // Inicializar el formulario solo una vez
  useEffect(() => {
    if (!isInitialized) {
        console.log("mat",initialData)
      if (mode === "edit" && initialData && Object.keys(initialData).length > 0) {
        const newFormData = {
          titulo: initialData.titulo || initialData.nombre || "",
          tema: initialData.tema || "",
          fecha_creacion: initialData.fecha_creacion
          ? new Date(initialData.fecha_creacion).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],

          estado: initialData.estado || "Activo",
          contenido: initialData.contenido || "<div>Material de Apoyo...</div>",
        }
        setFormData(newFormData)

        // Establecer el contenido en el editor cuando se monte
        setTimeout(() => {
          if (editorRef.current) {
            editorRef.current.innerHTML = newFormData.contenido
            // Hacer elementos eliminables
            makeContentEditable(editorRef)
          }
        }, 100)
      } else if (mode === "create") {
        const newFormData = {
          titulo: "",
          tema: "",
          fecha_creacion: new Date().toISOString().split("T")[0],
          estado: "Activo",
          contenido: "<div>Material de Apoyo...</div>",
        }
        setFormData(newFormData)

        // Establecer el contenido en el editor cuando se monte
        setTimeout(() => {
          if (editorRef.current) {
            editorRef.current.innerHTML = newFormData.contenido
            // Hacer elementos eliminables
            makeContentEditable(editorRef)
          }
        }, 100)
      }
      setIsInitialized(true)
    }
  }, [mode, initialData, isInitialized])

  // Manejar cambios en los campos del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Manejo de fechas en rango real
  const handleInputChange1 = (e) => {
  const { name, value } = e.target;

  if (name === "fecha_creacion") {
    const selectedDate = new Date(value);
    const minDate = new Date("2020-01-01");
    const maxDate = new Date("2030-12-31");

    if (isNaN(selectedDate.getTime())) {
      alert("Por favor selecciona una fecha válida.");
      return;
    }

    if (selectedDate < minDate || selectedDate > maxDate) {
      alert("La fecha debe estar entre 01/01/2020 y 31/12/2030.");
      return;
    }
  }

  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));
};


  // Función para subir archivos
  const uploadFile = async (file) => {
    const formData = new FormData()
    formData.append("file", file)

    try {
      setUploadingFile(true)
      console.log("Subiendo archivo:", file.name, "Tamaño:", file.size)

      const response = await fetch("http://localhost:3000/api/upload/support-material", {
        method: "POST",
        body: formData,
      })

      console.log("Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error response:", errorText)
        throw new Error(`Error al subir el archivo: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log("Upload result:", result)

      // Verificar la estructura de la respuesta
      if (result.success && result.data && result.data.url) {
        return result.data.url
      } else {
        console.error("Estructura de respuesta inesperada:", result)
        throw new Error("Respuesta del servidor inválida")
      }
    } catch (error) {
      console.error("Error al subir archivo:", error)
      setSuccessMessage(`Error al subir el archivo: ${error.message}`)
      setShowSuccessModal(true)
      return null
    } finally {
      setUploadingFile(false)
    }
  }

  // Manejar subida de imágenes con tamaño fijo
  const handleImageUpload = async () => {
    const file = imageInputRef.current?.files[0]
    if (!file) return

    console.log("Archivo seleccionado:", file.name)

    const fileUrl = await uploadFile(file)
    if (fileUrl) {
      const fullUrl = fileUrl.startsWith("http") ? fileUrl : `http://localhost:3000${fileUrl}`
      console.log("URL completa del archivo:", fullUrl)

      // Verificar que la URL funciona
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        console.log("✅ Imagen cargada correctamente:", fullUrl)
        // Crear imagen con tamaño fijo y responsive
        const imageHtml = `
  <div class="image-container" style="position: relative; margin: 10px 0; text-align: center;">
    <img src="${fullUrl}" alt="${file.name}" style="max-width: 100%; height: auto; width: 400px; border-radius: 8px; border: 1px solid #ddd; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" />
    <button class="delete-btn" style="
      position: absolute;
      top: 5px;
      right: 5px;
      background: #ff4444;
      color: white;
      border: none;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      font-size: 12px;
      cursor: pointer;
      z-index: 10;
    ">✕</button>
  </div>`

        // Insertar en el editor
        if (editorRef.current) {
          editorRef.current.focus()

          // Obtener la selección actual
          const selection = window.getSelection()
          if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0)
            range.deleteContents()

            // Crear un elemento temporal para insertar el HTML
            const tempDiv = document.createElement("div")
            tempDiv.innerHTML = imageHtml

            // Insertar el contenido
            while (tempDiv.firstChild) {
              range.insertNode(tempDiv.firstChild)
            }

            // Mover el cursor después de la imagen
            range.collapse(false)
            selection.removeAllRanges()
            selection.addRange(range)
          } else {
            // Si no hay selección, agregar al final
            editorRef.current.innerHTML += imageHtml
          }

          // Aplicar funcionalidad de eliminación al nuevo contenido
          setTimeout(() => makeContentEditable(editorRef), 100)
        }
      }

      img.onerror = () => {
        console.error("❌ Error al cargar la imagen:", fullUrl)
        setSuccessMessage("Error: La imagen no se puede cargar. Verifica que el servidor esté funcionando.")
        setShowSuccessModal(true)
      }

      // Iniciar la carga de la imagen
      img.src = fullUrl
    }

    // Limpiar el input
    if (imageInputRef.current) {
      imageInputRef.current.value = ""
    }
  }

  // Manejar subida de documentos
  const handleDocumentUpload = async () => {
  const file = documentInputRef.current?.files[0];
  if (!file) return;

  const fileUrl = await uploadFile(file);
  if (fileUrl) {
    const fullUrl = fileUrl.startsWith("http") ? fileUrl : `http://localhost:3000${fileUrl}`;
    const docHtml = `
      <div class="document-link" style="margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 8px; background-color: #f8f9fa; position: relative;">
        <a href="${fullUrl}" target="_blank" download="${file.name}" style="color: #007bff; text-decoration: none; font-weight: 500;">
          📄 ${file.name}
        </a>
        <br>
        <small style="color: #6c757d;">Haz clic para descargar</small>
      </div>
    `;

    if (editorRef.current) {
      editorRef.current.focus();

      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();

        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = docHtml;

        while (tempDiv.firstChild) {
          range.insertNode(tempDiv.firstChild);
        }

        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        editorRef.current.innerHTML += docHtml;
      }

      // Aplicar botón de eliminar
      setTimeout(() => makeContentEditable(editorRef), 100);
    }
  }

  if (documentInputRef.current) {
    documentInputRef.current.value = "";
  }
};


  // Manejar subida de audio
  const handleAudioUpload = async () => {
    const file = audioInputRef.current?.files[0]
    if (!file) return

    const fileUrl = await uploadFile(file)
    if (fileUrl) {
      const fullUrl = fileUrl.startsWith("http") ? fileUrl : `http://localhost:3000${fileUrl}`
      console.log("URL completa del archivo:", fullUrl)
      const audioHtml = `<div class="audio-container" style="margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 8px; background-color: #f8f9fa;"><audio controls style="width: 100%; max-width: 400px;"><source src="${fullUrl}" type="${file.type}">Tu navegador no soporta el elemento de audio.</audio><br><small style="color: #6c757d;">🎵 ${file.name}</small></div>`
      editorRef.current.focus()
      document.execCommand("insertHTML", false, audioHtml)
      // Aplicar funcionalidad de eliminación al nuevo contenido
      setTimeout(() => makeContentEditable(editorRef), 100)
    }

    // Limpiar el input
    if (audioInputRef.current) {
      audioInputRef.current.value = ""
    }
  }

  // Funciones para el editor de texto
  const execCommand = (command, value = null) => {
    if (!editorRef.current) return

    // Asegurarse de que el editor tiene el foco
    editorRef.current.focus()

    // Ejecutar el comando
    document.execCommand(command, false, value)
  }

  const handleSubmit = async () => {
    try {
      // Validar campos requeridos
      if (!formData.titulo || formData.titulo.trim() === "") {
        setSuccessMessage("El título es obligatorio")
        setShowSuccessModal(true)
        return
      }

    //   if (!formData.tema || formData.tema.trim() === "") {
    //     setSuccessMessage("El tema es obligatorio")
    //     setShowSuccessModal(true)
    //     return
    //   }

      // Obtener el contenido del editor
      const contenido = editorRef.current ? editorRef.current.innerHTML : formData.contenido

      // Validar que el contenido no esté vacío
      if (!contenido || contenido.trim() === "" || contenido === "<div><br></div>") {
        setSuccessMessage("El contenido es obligatorio")
        setShowSuccessModal(true)
        return
      }

      // Crear datos del material
      const materialData = {
        titulo: formData.titulo.trim(),
        tema: formData.tema.trim(),
        fecha_creacion: formData.fecha_creacion,
        estado: formData.estado,
        contenido: contenido,
      }

      console.log("Datos finales a enviar:", materialData)

      if (mode === "edit" && initialData._id) {
        await onSubmit(initialData._id, materialData)
      } else {
        await onSubmit(materialData)
      }
    } catch (error) {
      console.error("Error al procesar el material:", error)
      setSuccessMessage(`Error al procesar el material: ${error.message}`)
      setShowSuccessModal(true)
    }
  }

  return (
    <>
      {/* Inputs ocultos para archivos */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleImageUpload}
      />
      <input
        ref={documentInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
        style={{ display: "none" }}
        onChange={handleDocumentUpload}
      />
      <input
        ref={audioInputRef}
        type="file"
        accept="audio/*"
        style={{ display: "none" }}
        onChange={handleAudioUpload}
      />

      {/* Contenido con scroll */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleInputChange}
              placeholder="Ingrese título"
              className="w-full px-3 py-2 border border-[#d9d9d9] rounded"
              required
            />
          </div>
          
          <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Fecha:
  </label>
  <input
    type="date"
    name="fecha_creacion"
    value={formData.fecha_creacion}
    onChange={(e) => {
      const { name, value } = e.target;
      const selectedDate = new Date(value);
      const min = new Date(minDate);
      const max = new Date(maxDate);

      if (isNaN(selectedDate.getTime())) {
        alert("Por favor selecciona una fecha válida.");
        return;
      }

      if (selectedDate < min || selectedDate > max) {
        alert(`La fecha debe estar entre ${min.toLocaleDateString()} y ${max.toLocaleDateString()}.`);
        return;
      }

      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }}
    min={minDate}
    max={maxDate}
    className="w-full px-3 py-2 border border-[#d9d9d9] rounded"
  />
</div>



        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contenido: <span className="text-red-500">*</span>
          </label>
          <div className="border border-[#d9d9d9] rounded">
            <div className="flex items-center gap-2 border-b border-[#d9d9d9] p-2 flex-wrap bg-gray-50">
              <button
                className="p-1 text-[#627b87] hover:bg-white rounded"
                onClick={() => execCommand("bold")}
                type="button"
              >
                <Bold className="h-4 w-4" />
              </button>
              <button
                className="p-1 text-[#627b87] hover:bg-white rounded"
                onClick={() => execCommand("italic")}
                type="button"
              >
                <Italic className="h-4 w-4" />
              </button>
              <button
                className="p-1 text-[#627b87] hover:bg-white rounded"
                onClick={() => execCommand("underline")}
                type="button"
              >
                <Underline className="h-4 w-4" />
              </button>
              <span className="mx-1 text-[#d9d9d9]">|</span>
              <button
                className="p-1 text-[#627b87] hover:bg-white rounded"
                onClick={() => execCommand("justifyLeft")}
                type="button"
              >
                <AlignLeft className="h-4 w-4" />
              </button>
              <button
                className="p-1 text-[#627b87] hover:bg-white rounded"
                onClick={() => execCommand("justifyCenter")}
                type="button"
              >
                <AlignCenter className="h-4 w-4" />
              </button>
              <button
                className="p-1 text-[#627b87] hover:bg-white rounded"
                onClick={() => execCommand("justifyRight")}
                type="button"
              >
                <AlignRight className="h-4 w-4" />
              </button>
              <button
                className="p-1 text-[#627b87] hover:bg-white rounded"
                onClick={() => execCommand("justifyFull")}
                type="button"
              >
                <AlignJustify className="h-4 w-4" />
              </button>
              <span className="mx-1 text-[#d9d9d9]">|</span>
              <button
                className="p-1 text-[#627b87] hover:bg-white rounded"
                onClick={() => execCommand("insertUnorderedList")}
                type="button"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                className="p-1 text-[#627b87] hover:bg-white rounded"
                onClick={() => execCommand("insertOrderedList")}
                type="button"
              >
                <ListOrdered className="h-4 w-4" />
              </button>
              <div className="ml-auto flex items-center gap-2">
                <button
                  className="p-1 text-[#627b87] hover:bg-white rounded"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={uploadingFile}
                  title="Subir imagen"
                  type="button"
                >
                  <ImageIcon className="h-4 w-4" />
                </button>
                <button
                  className="p-1 text-[#627b87] hover:bg-white rounded"
                  onClick={() => documentInputRef.current?.click()}
                  disabled={uploadingFile}
                  title="Subir documento"
                  type="button"
                >
                  <FileText className="h-4 w-4" />
                </button>
                <button
                  className="p-1 text-[#627b87] hover:bg-white rounded"
                  onClick={() => audioInputRef.current?.click()}
                  disabled={uploadingFile}
                  title="Subir audio"
                  type="button"
                >
                  <Music className="h-4 w-4" />
                </button>
                <button
                  className="p-1 text-[#627b87] hover:bg-white rounded"
                  onClick={() => {
                    const url = prompt("Ingrese la URL:")
                    const text = prompt("Ingrese el texto del enlace:")
                    if (url) {
                      editorRef.current.focus()
                      const linkHtml = `<a href="${url}" target="_blank">${text || url}</a>`
                      document.execCommand("insertHTML", false, linkHtml)
                    }
                  }}
                  type="button"
                >
                  <Link className="h-4 w-4" />
                </button>
                <button className="p-1 text-[#627b87] hover:bg-white rounded" type="button">
                  <Maximize2 className="h-4 w-4" />
                </button>
                <button
                  className="p-1 text-[#627b87] hover:bg-white rounded"
                  onClick={() => clearAllContent(editorRef)}
                  title="Limpiar todo el contenido"
                  type="button"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div
              ref={editorRef}
              className="p-4 min-h-[300px] max-h-[400px] overflow-y-auto border-none outline-none bg-white"
              contentEditable={true}
              suppressContentEditableWarning={true}
            />
          </div>
          {uploadingFile && (
            <div className="mt-2 text-sm text-blue-600">
              <Upload className="inline h-4 w-4 mr-1" />
              Subiendo archivo...
            </div>
          )}
        </div>
      </div>

      {/* Footer fijo */}
      <div className="p-6 border-t border-gray-200 flex justify-between flex-shrink-0">
        <button
          className="bg-[#f44144] text-white text-sm py-2 px-6 rounded-lg font-medium hover:bg-red-600 transition-colors"
          onClick={onCancel}
          type="button"
        >
          Cancelar
        </button>
        <button
          className="px-6 py-2 bg-[#46ae69] text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
          onClick={handleSubmit}
          disabled={uploadingFile || isLoading}
          type="button"
        >
          {mode === "create" ? "Añadir" : "Guardar"}
        </button>
      </div>
    </>
  )
}

export default SupportMaterialForm
