# Wordzy - Plataforma de Aprendizaje de Inglés 📘

## 🔐 Usuarios de Prueba para Ingreso

### 🛠 Administrador
- **Tipo de Documento**: CC  
- **Número de Documento**: `1035973666`  
- **Contraseña**: `admin123`

### 📘 Instructor
- **Tipo de Documento**: CC  
- **Número de Documento**: `1035973663`  
- **Contraseña**: `1035973663`

### 👨‍🎓 Aprendiz
- **Tipo de Documento**: CC  
- **Número de Documento**: `1035973664`  
- **Contraseña**: `1035973664`

## 🚀 Comandos de Ejecución

### Frontend
```bash
cd FRONT
npm install
npm run dev
```

### Backend
```bash
cd BACK
npm install
node server.js
```

## 🏗️ Estructura del Proyecto

### Backend (BACK)
El backend está construido con Node.js y Express, organizando el código en:
- `src/controllers/` - Controladores de la API
- `src/models/` - Modelos de base de datos (Mongoose)
- `src/routes/` - Definición de rutas de la API
- `src/middlewares/` - Middlewares de autenticación y autorización
- `src/services/` - Lógica de negocio
- `src/config/` - Configuración de base de datos y variables

### Frontend (FRONT)
El frontend está desarrollado con React y Vite, estructurado en:
- `src/components/` - Componentes reutilizables
- `src/features/` - Funcionalidades específicas por módulo
- `src/services/` - Servicios de API y comunicación con backend
- `src/shared/` - Utilidades y componentes compartidos
- `src/assets/` - Recursos estáticos (imágenes, iconos, etc.)

