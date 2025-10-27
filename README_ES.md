# DOVELA - Sistema de Gestión para Curaduría 1 Bucaramanga

<div align="center">

![DOVELA](https://img.shields.io/badge/DOVELA-Curaduría_1_Bucaramanga-blue)
![React](https://img.shields.io/badge/React-16.9.0-61DAFB?logo=react)
![License](https://img.shields.io/badge/License-Privada-red)

**Sistema web para gestión integral de licencias urbanísticas y trámites administrativos**

[📖 Documentación Técnica](./DOCUMENTACION_TECNICA.md) • [🌐 Sitio Web](https://curaduria1bucaramanga.com.co/)

</div>

---

## 🎯 Descripción

DOVELA es una aplicación web desarrollada para la **Curaduría 1 de Bucaramanga** que permite gestionar de manera eficiente:

- ✅ Licencias urbanísticas y de construcción
- 📋 Expedientes y radicados
- 💬 PQRS (Peticiones, Quejas, Reclamos y Sugerencias)
- 📁 Archivo y documentación
- 📅 Sistema de citas
- 🏛️ Nomenclaturas urbanas
- 👥 Gestión de profesionales
- 💰 Liquidaciones

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js >= 14.x
- npm >= 6.x
- Git

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/neoygdrassyl/bedrock_client.git
cd bedrock_client

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# Iniciar en modo desarrollo
npm start
```

La aplicación estará disponible en `http://localhost:3000`

### Build de Producción

```bash
# Generar build optimizado
npm run build

# El resultado estará en la carpeta build/
```

## 📂 Estructura del Proyecto

```
bedrock_client/
├── public/                 # Archivos públicos y plantillas
├── src/
│   ├── app/
│   │   ├── components/     # Componentes reutilizables (34 componentes)
│   │   ├── pages/          # Páginas de la aplicación (251 archivos)
│   │   ├── services/       # Servicios de API (26 servicios)
│   │   ├── utils/          # Utilidades y motores (6 utilidades)
│   │   └── translation/    # Internacionalización (ES/EN)
│   ├── http-common.js      # Configuración de Axios
│   └── index.js            # Punto de entrada
├── dovela-backend/         # ⚠️ Backend (directorio vacío)
└── package.json            # Dependencias del proyecto
```

## 🛠️ Tecnologías Principales

| Categoría | Tecnologías |
|-----------|-------------|
| **Core** | React 16.9, React Router 5.2 |
| **UI** | Bootstrap 5.3, Material Design Bootstrap, RSuite |
| **HTTP** | Axios |
| **Documentos** | jsPDF, pdf-lib, Jodit Pro |
| **Fechas** | Moment.js, moment-business-days |
| **i18n** | i18next |
| **Mapas** | Google Maps API |
| **Estilos** | styled-components |

**Total de dependencias:** 66

Ver [Documentación Técnica](./DOCUMENTACION_TECNICA.md#4-dependencias-principales) para lista completa.

## 📖 Documentación

- **[📘 Documentación Técnica Completa](./DOCUMENTACION_TECNICA.md)** - Guía detallada de 2,200+ líneas que incluye:
  - Arquitectura del sistema con diagramas Mermaid
  - Estructura de carpetas y archivos
  - Guía de componentes con ejemplos de código
  - Documentación de servicios y APIs
  - Instrucciones de despliegue (Apache, Nginx, Docker, Cloud)
  - Guía de testing
  - Recomendaciones de seguridad y mejoras

## 🧪 Testing

```bash
# Ejecutar tests en modo watch
npm test

# Ejecutar tests una vez
npm test -- --watchAll=false

# Generar reporte de cobertura
npm test -- --coverage --watchAll=false
```

## 🌐 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm start` | Inicia servidor de desarrollo |
| `npm run build` | Genera build de producción |
| `npm test` | Ejecuta tests |
| `npm run eject` | Expone configuración (irreversible) |

## ⚙️ Variables de Entorno

Crear archivo `.env` en la raíz:

```env
REACT_APP_API_URL=https://api.curaduria1bucaramanga.com.co
```

Ver [sección de configuración](./DOCUMENTACION_TECNICA.md#10-configuración-y-variables-de-entorno) para más detalles.

## 🚀 Despliegue

### Opción 1: Apache

```bash
npm run build
scp -r build/* user@server:/var/www/html/curaduria/
```

### Opción 2: Docker

```bash
docker build -t dovela-frontend .
docker run -p 80:80 -d dovela-frontend
```

### Opción 3: Vercel/Netlify

```bash
npm install -g vercel
vercel --prod
```

Ver [guía completa de despliegue](./DOCUMENTACION_TECNICA.md#11-instrucciones-de-despliegue) para más opciones.

## ⚠️ Carencias Detectadas

### Críticas
- ❌ **Backend ausente**: El directorio `dovela-backend` existe pero está vacío
- ❌ **Sin .env.example**: Falta documentación de variables requeridas
- ❌ **API sin documentar**: Los endpoints externos no están documentados

### Recomendadas
- ⚡ Implementar tests E2E
- ⚡ Agregar documentación de API (OpenAPI/Swagger)
- ⚡ Documentar modelo de base de datos
- ⚡ Implementar monitoreo y logging
- ⚡ Crear guías de contribución

Ver [sección completa de carencias](./DOCUMENTACION_TECNICA.md#13-carencias-detectadas-y-recomendaciones) para detalles y recomendaciones.

## 📊 Estadísticas del Proyecto

- **Páginas:** 251 archivos JavaScript
- **Componentes:** 34 componentes reutilizables
- **Servicios:** 26 servicios de API
- **Utilidades:** 6 utilidades especializadas
- **Idiomas:** Español e Inglés
- **Líneas de documentación:** 2,203 líneas

## 👤 Contacto

**Desarrollador Principal:**  
Nestor Triana - [ing.natriana@gmail.com](mailto:ing.natriana@gmail.com)

**Entidad:**  
Curaduría 1 de Bucaramanga  
Santander, Colombia

## 📄 Licencia

⚠️ No se especifica licencia en el repositorio. Contactar al desarrollador para información sobre términos de uso.

---

<div align="center">

**[⬆ Volver arriba](#dovela---sistema-de-gestión-para-curaduría-1-bucaramanga)**

Desarrollado con ❤️ para Curaduría 1 de Bucaramanga

</div>
