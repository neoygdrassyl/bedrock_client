# Documentación Técnica - Sistema Curaduría

## Tabla de Contenidos

1. [Propósito General y Resumen Técnico](#1-propósito-general-y-resumen-técnico)
2. [Arquitectura del Sistema](#2-arquitectura-del-sistema)
3. [Estructura de Carpetas y Archivos](#3-estructura-de-carpetas-y-archivos)
4. [Dependencias Principales](#4-dependencias-principales)
5. [Módulo Frontend (React)](#5-módulo-frontend-react)
6. [Módulo Backend (Node.js/Express)](#6-módulo-backend-nodejsexpress)
7. [Base de Datos](#7-base-de-datos)
8. [APIs y Endpoints](#8-apis-y-endpoints)
9. [Componentes Principales](#9-componentes-principales)
10. [Funciones y Utilidades](#10-funciones-y-utilidades)
11. [Despliegue](#11-despliegue)
12. [Testing](#12-testing)
13. [Carencias y Recomendaciones](#13-carencias-y-recomendaciones)

---

## 1. Propósito General y Resumen Técnico

### 1.1 Propósito General

Este sistema es una aplicación web completa diseñada para la gestión de la **Curaduría N°1 de Bucaramanga**. La aplicación facilita la administración de procesos relacionados con licencias de construcción, trámites urbanísticos, PQRS (Peticiones, Quejas, Reclamos y Sugerencias), citas, nomenclaturas, expedientes y otras funciones administrativas propias de una curaduría urbana.

### 1.2 Resumen Técnico

**Tipo de aplicación:** Aplicación web full-stack con arquitectura cliente-servidor

**Frontend:**
- Framework: React 16.9.0
- Ubicación: Raíz del proyecto
- Tecnologías: React Router, Axios, Bootstrap 5, i18next (internacionalización)
- Características: SPA (Single Page Application), tema claro/oscuro, accesibilidad

**Backend:**
- Framework: Express (Node.js)
- Ubicación: `./dovela-backend/`
- Base de datos: MySQL con Sequelize ORM
- Características: API RESTful, generación de PDFs, envío de correos, manejo de archivos

---

## 2. Arquitectura del Sistema

### 2.1 Diagrama de Arquitectura

```mermaid
graph TB
    subgraph "Cliente"
        A[Navegador Web] --> B[Aplicación React]
    end
    
    subgraph "Frontend - React"
        B --> C[Componentes UI]
        B --> D[Servicios HTTP]
        B --> E[Enrutamiento]
        B --> F[Estado Global]
    end
    
    subgraph "Backend - Express"
        D -->|HTTP/HTTPS| G[Servidor Express]
        G --> H[Rutas API]
        H --> I[Controladores]
        I --> J[Modelos Sequelize]
    end
    
    subgraph "Capa de Datos"
        J --> K[(Base de Datos MySQL)]
        I --> L[Sistema de Archivos]
        I --> M[Servicio de Email]
    end
    
    L --> N[/docs/pqrs/]
    L --> O[/docs/process/]
    L --> P[/docs/publish/]
    L --> Q[/docs/nomenclature/]
