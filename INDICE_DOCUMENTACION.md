# 📚 Índice de Documentación - Sistema DOVELA

Bienvenido a la documentación del sistema DOVELA. Esta guía te ayudará a encontrar rápidamente la información que necesitas.

---

## 📖 Documentos Disponibles

### 1. 🚀 [README_ES.md](./README_ES.md) - Inicio Rápido
**Para:** Desarrolladores que necesitan empezar rápidamente  
**Contenido:**
- Descripción general del sistema
- Instalación en 3 pasos
- Comandos principales
- Tecnologías utilizadas
- Estadísticas del proyecto
- Contacto

**📌 Comienza aquí si es tu primera vez con el proyecto**

---

### 2. 📘 [DOCUMENTACION_TECNICA.md](./DOCUMENTACION_TECNICA.md) - Documentación Técnica Completa
**Para:** Desarrollo, arquitectura y mantenimiento  
**Tamaño:** 2,203 líneas | 61 KB  
**Contenido:**

#### Secciones Principales:

1. **Propósito General y Resumen Técnico** (Líneas 21-59)
   - Qué es DOVELA
   - Stack tecnológico
   - Resumen de funcionalidades

2. **Arquitectura del Sistema** (Líneas 59-125)
   - 📊 Diagrama de arquitectura Mermaid
   - 📊 Flujo de datos
   - Separación frontend/backend

3. **Estructura de Carpetas** (Líneas 125-246)
   - Árbol completo del proyecto
   - Descripción de cada directorio
   - Tabla de archivos clave

4. **Dependencias Principales** (Líneas 246-370)
   - 66 dependencias categorizadas
   - Versiones y propósitos
   - Scripts npm disponibles

5. **Componentes Frontend** (Líneas 370-503)
   - App.js y configuración
   - 34 componentes documentados
   - Ejemplos de código
   - 📊 Diagrama de autenticación

6. **Servicios y APIs** (Líneas 503-805)
   - 26 servicios documentados
   - Métodos y ejemplos
   - Configuración de Axios
   - 📊 Diagrama de arquitectura de servicios

7. **Utilidades y Motores** (Líneas 805-974)
   - TemplateEngine para documentos
   - BusinessDaysCol para días hábiles
   - Motores especializados
   - 📊 Diagramas de flujo

8. **Páginas y Rutas** (Líneas 974-1093)
   - 251 páginas organizadas
   - Rutas públicas y privadas
   - Protección de rutas
   - 📊 Diagrama de navegación

9. **Internacionalización** (Líneas 1093-1178)
   - Configuración i18next
   - Español e Inglés
   - Ejemplos de uso

10. **Variables de Entorno** (Líneas 1178-1242)
    - Configuración .env
    - Variables requeridas
    - Configuración package.json

11. **Instrucciones de Despliegue** (Líneas 1242-1462)
    - Instalación local
    - Build de producción
    - Apache, Nginx, Docker
    - Vercel, Netlify, AWS
    - CI/CD con GitHub Actions

12. **Testing** (Líneas 1462-1646)
    - Configuración Jest
    - Ejemplos de tests
    - Tests de integración
    - Coverage reports

13. **Carencias y Recomendaciones** (Líneas 1646-2117)
    - ⚠️ Backend ausente
    - Mejoras de seguridad
    - Optimizaciones de performance
    - Mejoras de accesibilidad
    - Documentación faltante

14. **Recursos Adicionales** (Líneas 2117-2148)
    - Enlaces útiles
    - Contacto
    - Licencia

15. **Glosario** (Líneas 2148-2165)
    - Términos técnicos
    - Definiciones del dominio

#### 📊 Diagramas Incluidos:
- Arquitectura del Sistema
- Flujo de Datos
- Flujo de Autenticación
- Arquitectura de Servicios
- Flujo de TemplateEngine
- Diagrama de Navegación
- Diagrama ER (sugerido)

---

### 3. ⚙️ [.env.example](./.env.example) - Configuración de Variables
**Para:** Configuración del entorno  
**Contenido:**
- Variables requeridas
- Ejemplos de configuración
- Notas de seguridad

**📌 Copiar a `.env` y configurar con valores reales**

---

## 🗺️ Guía de Navegación Rápida

### Por Tipo de Usuario

#### 👨‍💻 Desarrollador Nuevo
1. Lee [README_ES.md](./README_ES.md)
2. Configura `.env` desde [.env.example](./.env.example)
3. Ejecuta `npm install && npm start`
4. Lee [Componentes Frontend](#5-componentes-frontend) en la documentación técnica
5. Revisa [Servicios y APIs](#6-servicios-y-apis)

#### 🏗️ Arquitecto de Software
1. Lee [Arquitectura del Sistema](#2-arquitectura-del-sistema)
2. Revisa [Estructura de Carpetas](#3-estructura-de-carpetas-y-archivos-principales)
3. Estudia [Servicios y APIs](#6-servicios-y-apis)
4. Analiza [Carencias Detectadas](#13-carencias-detectadas-y-recomendaciones)

#### 🚀 DevOps/Infraestructura
1. Lee [Instrucciones de Despliegue](#11-instrucciones-de-despliegue)
2. Revisa [Variables de Entorno](#10-configuración-y-variables-de-entorno)
3. Configura CI/CD según ejemplos
4. Implementa monitoreo (ver recomendaciones)

#### 🧪 QA/Testing
1. Lee [Testing](#12-testing)
2. Ejecuta `npm test -- --coverage`
3. Revisa ejemplos de tests
4. Implementa tests E2E según recomendaciones

#### 📋 Product Owner/Manager
1. Lee [Propósito General](#1-propósito-general-y-resumen-técnico)
2. Revisa [Páginas y Rutas](#8-páginas-y-rutas)
3. Analiza [Carencias Detectadas](#13-carencias-detectadas-y-recomendaciones)
4. Prioriza mejoras sugeridas

---

## 🔍 Búsqueda Rápida

### ¿Cómo hago X?

| Necesito... | Ve a... |
|-------------|---------|
| **Instalar el proyecto** | [README_ES.md > Instalación](./README_ES.md#instalación) |
| **Configurar variables** | [.env.example](./.env.example) |
| **Ver estructura** | [Doc Técnica > Sección 3](./DOCUMENTACION_TECNICA.md#3-estructura-de-carpetas-y-archivos-principales) |
| **Usar un servicio** | [Doc Técnica > Sección 6](./DOCUMENTACION_TECNICA.md#6-servicios-y-apis) |
| **Crear un componente** | [Doc Técnica > Sección 5](./DOCUMENTACION_TECNICA.md#5-componentes-frontend) |
| **Desplegar** | [Doc Técnica > Sección 11](./DOCUMENTACION_TECNICA.md#11-instrucciones-de-despliegue) |
| **Escribir tests** | [Doc Técnica > Sección 12](./DOCUMENTACION_TECNICA.md#12-testing) |
| **Ver dependencias** | [Doc Técnica > Sección 4](./DOCUMENTACION_TECNICA.md#4-dependencias-principales) |
| **Traducir texto** | [Doc Técnica > Sección 9](./DOCUMENTACION_TECNICA.md#9-internacionalización) |
| **Generar documento** | [Doc Técnica > Sección 7](./DOCUMENTACION_TECNICA.md#7-utilidades-y-motores-de-plantillas) |

---

## ⚠️ Advertencias Importantes

### Backend Inexistente
El directorio `dovela-backend/` existe pero está **completamente vacío**. No hay código de backend en este repositorio.

**Ver:** [Carencias Detectadas > Backend Inexistente](./DOCUMENTACION_TECNICA.md#131-️-carencias-críticas-detectadas)

### Documentación de API Externa Faltante
Los endpoints de la API externa no están documentados.

**Recomendación:** Crear documentación OpenAPI/Swagger  
**Ver:** [Carencias > Falta Documentación de APIs](./DOCUMENTACION_TECNICA.md#132-carencias-de-documentación)

### Tests Limitados
La cobertura de tests es limitada.

**Recomendación:** Aumentar cobertura a 80%  
**Ver:** [Carencias > Testing Faltante](./DOCUMENTACION_TECNICA.md#137-testing-faltante)

---

## 📊 Estadísticas de Documentación

- **Total de líneas:** 2,203 líneas
- **Tamaño:** 61 KB
- **Secciones:** 15 principales
- **Subsecciones:** 50+
- **Diagramas Mermaid:** 6
- **Tablas:** 15+
- **Ejemplos de código:** 20+
- **Archivos documentados:** 3
- **Servicios documentados:** 26
- **Componentes documentados:** 34
- **Páginas documentadas:** 251

---

## 🛠️ Mantenimiento de la Documentación

### Cuándo Actualizar

✅ Al agregar nuevas dependencias  
✅ Al crear nuevos componentes  
✅ Al agregar nuevas rutas  
✅ Al cambiar arquitectura  
✅ Al modificar proceso de despliegue  
✅ Al agregar nuevas funcionalidades  

### Cómo Actualizar

1. Editar la sección correspondiente en `DOCUMENTACION_TECNICA.md`
2. Actualizar diagramas Mermaid si es necesario
3. Agregar ejemplos de código
4. Actualizar `README_ES.md` si afecta al inicio rápido
5. Actualizar este índice si se agregan secciones nuevas

---

## 📞 Contacto

**Preguntas sobre la documentación:**  
Nestor Triana - [ing.natriana@gmail.com](mailto:ing.natriana@gmail.com)

**Entidad:**  
Curaduría 1 de Bucaramanga  
Santander, Colombia

---

## 📝 Licencia

⚠️ No se especifica licencia en el repositorio.

**Recomendación:** Agregar archivo `LICENSE` con los términos de uso.

---

<div align="center">

**Versión de la documentación:** 1.0.0  
**Última actualización:** Octubre 2024  

[⬆ Volver arriba](#-índice-de-documentación---sistema-dovela)

</div>
