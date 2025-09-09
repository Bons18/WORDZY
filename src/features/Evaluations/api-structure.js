// Este archivo es solo para referencia de la estructura de API que necesitarás implementar

/*
ESTRUCTURA SUGERIDA PARA LA API - MONGODB + EXPRESS

1. Modelo de MongoDB (models/Evaluation.js):

const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  tipo: {
    type: String,
    enum: ['seleccion', 'verdaderoFalso', 'imagen', 'audio', 'completar'],
    required: true
  },
  texto: String,
  completarTexto: String,
  palabrasCompletar: [String],
  opcionesRelleno: [String],
  opciones: [String],
  respuestaCorrecta: Number,
  puntaje: {
    type: Number,
    required: true
  },
  imagen: String,
  audio: String
});

const evaluationSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true
  },
  tematica: {
    type: String,
    required: true
  },
  tipoEvaluacion: {
    type: String,
    enum: ['Examen', 'Actividad'],
    required: true
  },
  estado: {
    type: String,
    enum: ['Activo', 'Inactivo'],
    default: 'Activo'
  },
  descripcion: String,
  material: String,
  preguntas: [questionSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware para actualizar el timestamp updatedAt antes de cada actualización
evaluationSchema.pre('findOneAndUpdate', function() {
  this.set({ updatedAt: new Date() });
});

module.exports = mongoose.model('Evaluation', evaluationSchema);

2. Controladores (controllers/evaluationController.js):

const Evaluation = require('../models/Evaluation');
const fs = require('fs');
const path = require('path');

// Configuración para almacenamiento de archivos
const uploadsDir = path.join(__dirname, '../uploads');

// Asegurar que el directorio de uploads existe
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Obtener todas las evaluaciones
exports.getAllEvaluations = async (req, res) => {
  try {
    const evaluations = await Evaluation.find();
    res.status(200).json(evaluations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener una evaluación por ID
exports.getEvaluationById = async (req, res) => {
  try {
    const evaluation = await Evaluation.findById(req.params.id);
    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluación no encontrada' });
    }
    res.status(200).json(evaluation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Crear una nueva evaluación
exports.createEvaluation = async (req, res) => {
  try {
    // Manejar material si existe
    let materialPath = null;
    if (req.files && req.files.material) {
      const materialFile = req.files.material;
      const fileExt = path.extname(materialFile.name);
      const fileName = `material_${Date.now()}${fileExt}`;
      materialPath = path.join('uploads', fileName);
      
      await materialFile.mv(path.join(uploadsDir, fileName));
    }
    
    // Procesar preguntas y sus archivos
    let preguntas = [];
    if (req.body.preguntas) {
      preguntas = JSON.parse(req.body.preguntas);
      
      // Procesar archivos de preguntas
      for (const pregunta of preguntas) {
        // Manejar imágenes
        if (pregunta.tipo === 'imagen' && req.files[pregunta.imagen]) {
          const imagenFile = req.files[pregunta.imagen];
          const fileExt = path.extname(imagenFile.name);
          const fileName = `imagen_${Date.now()}_${Math.floor(Math.random() * 1000)}${fileExt}`;
          const imagenPath = path.join('uploads', fileName);
          
          await imagenFile.mv(path.join(uploadsDir, fileName));
          pregunta.imagen = imagenPath;
        }
        
        // Manejar audios
        if (pregunta.tipo === 'audio' && req.files[pregunta.audio]) {
          const audioFile = req.files[pregunta.audio];
          const fileExt = path.extname(audioFile.name);
          const fileName = `audio_${Date.now()}_${Math.floor(Math.random() * 1000)}${fileExt}`;
          const audioPath = path.join('uploads', fileName);
          
          await audioFile.mv(path.join(uploadsDir, fileName));
          pregunta.audio = audioPath;
        }
      }
    }
    
    // Crear la evaluación
    const newEvaluation = new Evaluation({
      nombre: req.body.nombre,
      tematica: req.body.tematica,
      tipoEvaluacion: req.body.tipoEvaluacion,
      estado: req.body.estado,
      descripcion: req.body.descripcion,
      material: materialPath,
      preguntas: preguntas
    });
    
    const savedEvaluation = await newEvaluation.save();
    res.status(201).json(savedEvaluation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Actualizar una evaluación
exports.updateEvaluation = async (req, res) => {
  try {
    // Código similar al createEvaluation pero actualizando
    // ...
    
    const updatedEvaluation = await Evaluation.findByIdAndUpdate(
      req.params.id,
      { ...evaluationData },
      { new: true }
    );
    
    if (!updatedEvaluation) {
      return res.status(404).json({ message: 'Evaluación no encontrada' });
    }
    
    res.status(200).json(updatedEvaluation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Eliminar una evaluación
exports.deleteEvaluation = async (req, res) => {
  try {
    const evaluation = await Evaluation.findById(req.params.id);
    
    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluación no encontrada' });
    }
    
    // Eliminar archivos asociados si existen
    // ...
    
    await Evaluation.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Evaluación eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

3. Rutas (routes/evaluationRoutes.js):

const express = require('express');
const router = express.Router();
const evaluationController = require('../controllers/evaluationController');

// Rutas de evaluaciones
router.get('/', evaluationController.getAllEvaluations);
router.get('/:id', evaluationController.getEvaluationById);
router.post('/', evaluationController.createEvaluation);
router.put('/:id', evaluationController.updateEvaluation);
router.delete('/:id', evaluationController.deleteEvaluation);

module.exports = router;

4. Configuración del servidor (server.js):

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wordzy', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Conectado a MongoDB'))
.catch(err => console.error('Error conectando a MongoDB:', err));

// Rutas
const evaluationRoutes = require('./routes/evaluationRoutes');
app.use('/api/evaluations', evaluationRoutes);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});

*/
