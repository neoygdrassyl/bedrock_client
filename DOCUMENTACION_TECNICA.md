# Documentación Técnica - Bedrock Client

## Tabla de Contenidos

1. [Descripción General del Proyecto](#descripción-general-del-proyecto)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Tecnologías Utilizadas](#tecnologías-utilizadas)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Módulos Principales](#módulos-principales)
6. [Capa de Servicios](#capa-de-servicios)
7. [Sistema de Autenticación y Enrutamiento](#sistema-de-autenticación-y-enrutamiento)
8. [Sistema de Internacionalización](#sistema-de-internacionalización)
9. [Temas y Accesibilidad](#temas-y-accesibilidad)
10. [Componentes Reutilizables](#componentes-reutilizables)
11. [Configuración y Variables de Entorno](#configuración-y-variables-de-entorno)
12. [Guía de Desarrollo](#guía-de-desarrollo)

---

## Descripción General del Proyecto

**Bedrock Client** es una aplicación web desarrollada con React que proporciona una plataforma integral para la gestión de trámites de curadurías urbanas. El sistema permite gestionar solicitudes de licencias urbanísticas, citas, nomenclaturas, publicaciones, PQRS (Peticiones, Quejas, Reclamos y Sugerencias) y diversos procesos administrativos relacionados con las curadurías urbanas.

### Propósito

La aplicación está diseñada para:
- Digitalizar y automatizar los procesos de las curadurías urbanas
- Facilitar la comunicación entre usuarios y la curaduría
- Gestionar el ciclo completo de solicitudes y licencias urbanísticas
- Proporcionar herramientas de cálculo y consulta para profesionales
- Mantener registros organizados y trazables de todas las operaciones

### Alcance

El sistema cubre múltiples curadurías urbanas configurables a través de variables de entorno, actualmente soportando:
- Curaduría Urbana 1 de Bucaramanga (cb1)
- Curaduría Urbana 1 de Piedecuesta (cp1)
- Curaduría Urbana 2 de Floridablanca (fl2)
- Alcaldía de Lebrija (lbj)

---

## Arquitectura del Sistema

### Patrón Arquitectónico

El proyecto sigue una **arquitectura de componentes basada en React** con los siguientes principios:

1. **Separación de Responsabilidades**: División clara entre presentación (componentes), lógica de negocio (servicios) y estado (Context API)
2. **Componentes Funcionales**: Uso predominante de hooks de React para el manejo de estado y efectos
3. **Comunicación Cliente-Servidor**: Arquitectura REST mediante Axios para la comunicación con el backend
4. **Enrutamiento SPA**: Single Page Application con React Router para navegación sin recarga de página

### Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                     CAPA DE PRESENTACIÓN                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Páginas    │  │ Componentes  │  │   Estilos    │      │
│  │   (Pages)    │  │  (Components)│  │   (CSS/MDB)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    CAPA DE LÓGICA                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Context    │  │    Hooks     │  │  Utilidades  │      │
│  │    (Auth)    │  │   (Custom)   │  │   (Helpers)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    CAPA DE SERVICIOS                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Services   │  │  http-common │  │   API REST   │      │
│  │   (*.service)│  │    (Axios)   │  │   (Backend)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Flujo de Datos

1. **Usuario interactúa** → Componente React (UI)
2. **Componente** → Invoca servicio de la capa de servicios
3. **Servicio** → Realiza petición HTTP mediante Axios (http-common)
4. **Backend API** → Procesa la petición y retorna respuesta
5. **Servicio** → Recibe respuesta y la retorna al componente
6. **Componente** → Actualiza el estado y renderiza la UI

---

## Tecnologías Utilizadas

### Frontend Core
- **React 16.9.0**: Biblioteca JavaScript para construir interfaces de usuario
- **React DOM 16.9.0**: Renderizado de componentes React en el DOM
- **React Router DOM 5.2.0**: Enrutamiento y navegación

### UI/UX Libraries
- **Bootstrap 5.2.0**: Framework CSS para diseño responsivo
- **MDB React UI Kit 1.0.0-beta3**: Material Design Bootstrap para React
- **RSuite 5.15.0**: Conjunto de componentes React para UI empresarial
- **Styled Components 5.3.0**: Estilos CSS-in-JS

### Gestión de Estado y Formularios
- **React Context API**: Manejo de estado global (autenticación)
- **React Hooks**: useState, useEffect, useContext para manejo de estado local

### Comunicación HTTP
- **Axios 0.21.4**: Cliente HTTP basado en promesas
- **http-common**: Configuración centralizada de Axios

### Internacionalización
- **i18next 20.2.2**: Framework de internacionalización
- **react-i18next 11.8.13**: Integración de i18next con React
- **i18next-browser-languagedetector 6.1.0**: Detección automática del idioma del navegador

### Documentos y Exportación
- **jsPDF 2.5.1**: Generación de documentos PDF
- **pdf-lib 1.16.0**: Manipulación de archivos PDF
- **markdown-to-jsx 7.1.8**: Renderizado de Markdown en React

### Seguridad
- **js-sha256 0.9.0**: Hashing de contraseñas usando SHA-256
- **react-google-recaptcha 2.1.0**: Integración con Google reCAPTCHA

### Utilidades
- **moment 2.29.1**: Manipulación de fechas y horas
- **moment-business-days 1.2.0**: Cálculo de días hábiles
- **sweetalert2 10.16.7**: Alertas y modales personalizables
- **written-number 0.11.1**: Conversión de números a palabras

### Herramientas de Desarrollo
- **react-scripts 4.0.3**: Scripts de compilación y desarrollo de Create React App
- **env-cmd 10.1.0**: Gestión de variables de entorno

---

## Estructura del Proyecto

```
bedrock_client/
├── public/                          # Archivos públicos estáticos
│   ├── index.html                  # HTML principal
│   ├── manifest.json               # PWA manifest
│   └── robots.txt                  # SEO robots
│
├── src/                            # Código fuente
│   ├── index.js                    # Punto de entrada de la aplicación
│   ├── index.css                   # Estilos globales
│   ├── http-common.js              # Configuración de Axios
│   │
│   └── app/                        # Aplicación principal
│       ├── App.js                  # Componente raíz con routing
│       ├── App.css                 # Estilos del componente App
│       │
│       ├── components/             # Componentes reutilizables
│       │   ├── navbar.js          # Barra de navegación
│       │   ├── footer.js          # Pie de página
│       │   ├── title.js           # Componente de título
│       │   ├── btnStart.js        # Botón flotante de inicio
│       │   ├── btnChat.js         # Botón de chat
│       │   ├── btnAccesibility.js # Controles de accesibilidad
│       │   ├── theme.js           # Definición de temas
│       │   ├── global.js          # Estilos globales
│       │   ├── font.js            # Configuración de fuentes
│       │   ├── jsons/             # Datos estáticos JSON
│       │   │   ├── vars.js        # Variables globales por curaduría
│       │   │   └── *.json         # Archivos de configuración
│       │   └── dashBoardCards/    # Componentes de tarjetas
│       │
│       ├── pages/                 # Páginas/Vistas de la aplicación
│       │   ├── user/              # Páginas de usuario autenticado
│       │   │   ├── dashboard.js   # Panel de control
│       │   │   ├── publish.js     # Gestión de publicaciones
│       │   │   ├── seal.js        # Gestión de sellos
│       │   │   ├── appointments.js # Calendario de citas
│       │   │   ├── mail.js        # Buzón de mensajes
│       │   │   ├── fun.js         # Solicitudes y licencias
│       │   │   ├── funmanage.page.js # Gestión de licencias
│       │   │   ├── osha.js        # Documentos
│       │   │   ├── dictionary.page.js # Diccionario de consecutivos
│       │   │   ├── nomenclature/  # Gestión de nomenclaturas
│       │   │   ├── submit/        # Ventanilla única
│       │   │   ├── archive/       # Archivo documental
│       │   │   ├── pqrs/          # PQRS
│       │   │   ├── profesionals/  # Gestión de profesionales
│       │   │   ├── guide_user/    # Guía de usuario
│       │   │   ├── norms/         # Normas urbanísticas
│       │   │   └── certifications/ # Certificaciones
│       │   │
│       │   └── liquidator/        # Calculadora de expensas
│       │       └── liquidator.js
│       │
│       ├── services/              # Capa de servicios
│       │   ├── data.service.js    # Servicio de datos de usuario
│       │   ├── custom.service.js  # Servicios personalizados
│       │   ├── users.service.js   # Gestión de usuarios
│       │   ├── appointments.service.js # Citas
│       │   ├── publish.service.js # Publicaciones
│       │   ├── seal.service.js    # Sellos
│       │   ├── emails.service.js  # Correos
│       │   ├── fun.service.js     # Licencias
│       │   ├── nomeclature.service.js # Nomenclaturas
│       │   ├── archive.service.js # Archivo
│       │   ├── norm.service.js    # Normas
│       │   ├── certifications.service.js # Certificaciones
│       │   └── *.service.js       # Otros servicios
│       │
│       ├── translation/           # Sistema de internacionalización
│       │   ├── i18n.js           # Configuración i18n
│       │   ├── en/               # Traducciones en inglés
│       │   │   └── translations.js
│       │   └── es/               # Traducciones en español
│       │       └── translations.js
│       │
│       └── img/                  # Recursos de imágenes
│
├── package.json                  # Dependencias y scripts
├── package-lock.json            # Lock de dependencias
├── .gitignore                   # Archivos ignorados por Git
└── README.md                    # Documentación básica
```

---

## Módulos Principales

### 1. Dashboard (Panel de Control)

**Ubicación**: `src/app/pages/user/dashboard.js`

**Descripción**: Página principal del sistema que muestra todos los módulos disponibles para el usuario autenticado.

**Funcionalidades**:
- Visualización de tarjetas de acceso rápido a módulos
- Muestra logo de la curaduría (con soporte para tema claro/oscuro)
- Versión de la aplicación
- Acceso directo a:
  - Buzón de Mensajes
  - Calendario de Citas
  - Ventanilla Única
  - Publicaciones
  - Peticiones PQRS
  - Nomenclaturas
  - Archivo
  - Solicitudes y Licencias
  - Gestión de Licencias
  - Normas Urbanas (solo CB1)
  - Documentos
  - Calculadora de Expensas
  - Diccionario de Consecutivos

**Componentes utilizados**:
- `DashBoardCard`: Tarjetas con iconos y enlaces a módulos
- `MDBBreadcrumb`: Navegación breadcrumb

### 2. Appointments (Calendario de Citas)

**Ubicación**: `src/app/pages/user/appointments.js`

**Descripción**: Módulo para gestión de citas entre usuarios y la curaduría.

**Funcionalidades**:
- Visualización de calendario
- Creación de nuevas citas
- Edición de citas existentes
- Verificación de disponibilidad de fechas
- Notificaciones de citas próximas

**Servicio asociado**: `appointments.service.js`
- `getAll()`: Obtiene todas las citas
- `get(id)`: Obtiene una cita específica
- `create(data)`: Crea una nueva cita
- `checkforAvilAbleDate(data)`: Verifica disponibilidad
- `update(id, data)`: Actualiza una cita
- `delete(id)`: Elimina una cita

### 3. Publications (Publicaciones)

**Ubicación**: `src/app/pages/user/publish.js`

**Descripción**: Gestión de publicaciones y avisos de la curaduría.

**Funcionalidades**:
- Crear publicaciones
- Editar publicaciones existentes
- Eliminar publicaciones
- Visualizar histórico de publicaciones

**Servicio asociado**: `publish.service.js`
- `getAll()`: Lista todas las publicaciones
- `get(id)`: Obtiene una publicación específica
- `create(data)`: Crea una publicación
- `update(id, data)`: Actualiza una publicación
- `delete(id)`: Elimina una publicación

### 4. Mail (Buzón de Mensajes)

**Ubicación**: `src/app/pages/user/mail.js`

**Descripción**: Sistema de mensajería interno para comunicación entre usuarios y administradores.

**Funcionalidades**:
- Bandeja de entrada
- Envío de mensajes
- Respuesta a mensajes
- Marcado de leído/no leído

**Servicio asociado**: `emails.service.js`

### 5. FUN (Solicitudes y Licencias)

**Ubicación**: `src/app/pages/user/fun.js`

**Descripción**: Módulo para radicar y gestionar solicitudes de licencias urbanísticas.

**Funcionalidades**:
- Radicación de nuevas solicitudes
- Carga de documentos
- Seguimiento de estados
- Generación de formularios específicos
- Reportes y consultas

**Servicio asociado**: `fun.service.js`

### 6. FUN_MANAGE (Gestión de Licencias)

**Ubicación**: `src/app/pages/user/funmanage.page.js`

**Descripción**: Módulo administrativo para gestionar el ciclo de vida de las licencias.

**Funcionalidades**:
- Revisión de solicitudes
- Aprobación/Rechazo
- Generación de actos administrativos
- Gestión de estados
- Asignación de profesionales

### 7. Nomenclature (Nomenclaturas)

**Ubicación**: `src/app/pages/user/nomenclature/nomenclature.js`

**Descripción**: Sistema de gestión de nomenclaturas urbanas.

**Funcionalidades**:
- Asignación de nomenclaturas
- Búsqueda de nomenclaturas
- Generación de certificados
- Histórico de nomenclaturas

**Servicio asociado**: `nomeclature.service.js`

### 8. PQRS (Peticiones, Quejas, Reclamos y Sugerencias)

**Ubicación**: `src/app/pages/user/pqrs/pqrsadmin.js`

**Descripción**: Módulo de gestión de PQRS según normativa colombiana.

**Funcionalidades**:
- Recepción de PQRS
- Clasificación y asignación
- Seguimiento de respuestas
- Cumplimiento de términos legales
- Generación de reportes

### 9. Submit (Ventanilla Única)

**Ubicación**: `src/app/pages/user/submit/submit.js`

**Descripción**: Punto de entrada único para radicación de documentos.

**Funcionalidades**:
- Radicación de documentos
- Generación de consecutivos
- Registro de entrada
- Trazabilidad

### 10. Archive (Archivo)

**Ubicación**: `src/app/pages/user/archive/archive.page.js`

**Descripción**: Sistema de archivo documental y gestión de expedientes.

**Funcionalidades**:
- Organización de expedientes
- Búsqueda avanzada
- Control de préstamos
- Digitalización

**Servicio asociado**: `archive.service.js`

### 11. Liquidator (Calculadora de Expensas)

**Ubicación**: `src/app/pages/liquidator/liquidator.js`

**Descripción**: Herramienta de cálculo de expensas y tarifas.

**Funcionalidades**:
- Cálculo de expensas según normativa
- Variables configurables por zona
- Impuestos y tasas
- Generación de liquidaciones
- Exportación de documentos

**Características**:
- Soporte multi-curaduría con configuraciones específicas
- Cálculo basado en área, zona y tipo de eje vial
- Aplicación de porcentajes según POT vigente

### 12. Norms (Normas Urbanísticas)

**Ubicación**: `src/app/pages/user/norms/norms.page.js`

**Descripción**: Consulta de normativa urbanística vigente.

**Funcionalidades**:
- Visualización de normas
- Búsqueda por criterios
- Descarga de documentos
- Actualización de normativa

**Servicio asociado**: `norm.service.js`

### 13. Professionals (Profesionales)

**Ubicación**: `src/app/pages/user/profesionals/profesionals.page.js`

**Descripción**: Gestión de profesionales vinculados.

**Funcionalidades**:
- Registro de profesionales
- Validación de matrículas
- Asignación a proyectos
- Histórico de participación

### 14. Guide User (Guía de Usuario)

**Ubicación**: `src/app/pages/user/guide_user/guide_user.page.js`

**Descripción**: Sistema de ayuda y documentación para usuarios.

**Funcionalidades**:
- Documentación en formato Markdown
- Guías paso a paso
- Preguntas frecuentes
- Tutoriales

### 15. Certifications (Certificaciones)

**Ubicación**: `src/app/pages/user/certifications/certification.page.js`

**Descripción**: Emisión y validación de certificaciones laborales.

**Funcionalidades**:
- Generación de certificados
- Validación en línea
- Consulta pública
- Control de acceso

**Servicio asociado**: `certifications.service.js`

---

## Capa de Servicios

La capa de servicios implementa el patrón de diseño **Service Layer** para encapsular la lógica de comunicación con el backend.

### Estructura de un Servicio

Todos los servicios siguen una estructura consistente:

```javascript
import http from "../../http-common";

const route = "nombre_recurso"

class NombreService {
  getAll() {
    return http.get(`/${route}`);
  }

  get(id) {
    return http.get(`/${route}/${id}`);
  }

  create(data) {
    return http.post(`/${route}`, data);
  }

  update(id, data) {
    return http.put(`/${route}/${id}`, data);
  }

  delete(id) {
    return http.delete(`/${route}/${id}`);
  }
}

export default new NombreService();
```

### http-common.js

**Ubicación**: `src/http-common.js`

Configuración centralizada de Axios:

```javascript
import axios from "axios";

export default axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

**Características**:
- Base URL configurable mediante variables de entorno
- Headers configurados para multipart/form-data
- Instancia centralizada de Axios reutilizable

### Servicios Principales

#### 1. data.service.js

Gestión de datos de usuario en memoria (window object):

**Métodos**:
- `getFullName()`: Retorna nombre completo del usuario
- `getActive()`: Estado de activación del usuario
- `getRoleName()`: Nombre del rol
- `getRoleDesc()`: Descripción del rol
- `getUserData()`: Objeto completo de datos del usuario
- `setUser(userData)`: Establece datos del usuario en sesión
- `setUserNull()`: Limpia datos del usuario

#### 2. custom.service.js

Servicios personalizados y consultas especiales:

**Métodos**:
- `appLogin(data)`: Autenticación de usuario
- `searchDate(date)`: Búsqueda por fecha
- `generate(data)`: Generación de sellos
- `seal(name)`: Obtener sello
- `getRepositoryList()`: Lista de repositorios
- `checkStatus_*()`: Verificación de estados de diferentes tipos
- `loadDictionary_*()`: Carga de diccionarios

#### 3. users.service.js

Gestión de usuarios:

**Métodos**:
- `getAll()`: Lista todos los usuarios
- `getAllWorkers()`: Lista trabajadores
- `getCertificate(id, pass)`: Obtiene certificado con validación
- `getCertificateData(id)`: Datos del certificado
- `getCertificateDataPDF(id)`: Certificado en formato PDF
- `create(data)`: Crear usuario
- `update(id, data)`: Actualizar usuario
- `delete(id)`: Eliminar usuario

### Manejo de Errores

Los servicios no manejan errores directamente. Es responsabilidad de los componentes que los consumen implementar bloques try-catch o .catch():

```javascript
ServiceName.method(params)
  .then(response => {
    // Manejar respuesta exitosa
  })
  .catch(error => {
    // Manejar error
    console.log(error);
  });
```

---

## Sistema de Autenticación y Enrutamiento

### Autenticación

El sistema implementa autenticación mediante **Context API** de React.

#### ProvideAuth Context

**Ubicación**: `src/app/App.js`

**Implementación**:

```javascript
const authContext = createContext();

function ProvideAuth({ children }) {
  const auth = useProvideAuth();
  return (
    <authContext.Provider value={auth}>
      {children}
    </authContext.Provider>
  );
}

function useAuth() {
  return useContext(authContext);
}

function useProvideAuth() {
  const [user, setUser] = useState(null);

  const signin = cb => {
    return fakeAuth.signin(() => {
      setUser(DataSerive.getUserData());
      cb();
    });
  };

  const signout = cb => {
    return fakeAuth.signout(() => {
      setUser(null);
      DataSerive.setUserNull();
      cb();
    });
  };

  return { user, signin, signout };
}
```

**Características**:
- Estado global de autenticación
- Métodos `signin` y `signout`
- Persistencia de datos de usuario
- Simulación de autenticación asíncrona

#### Proceso de Login

1. Usuario ingresa credenciales en `LoginPage`
2. Se ejecuta reCAPTCHA para validación
3. Password se hashea con SHA-256
4. Se envía al backend mediante `CustomsDataService.appLogin()`
5. Backend valida y retorna datos del usuario
6. Se almacenan datos en `window.user` mediante `DataSerive.setUser()`
7. Se llama `auth.signin()` para actualizar el contexto
8. Se redirige al Dashboard

**Seguridad**:
- reCAPTCHA v2 invisible para prevenir bots
- Hashing SHA-256 de contraseñas antes de envío
- Validación de respuesta del servidor

### Enrutamiento

Implementado con **React Router DOM v5**.

#### Rutas Públicas

```javascript
<Route path='/home' component={LoginPage} />
<Route path='/login' component={LoginPage} />
<Route path='/norms' component={NORMS} />
<Route path='/certs' component={CERTIFICATE_WORKER} />
<Route exact path='/' component={LoginPage} />
```

#### Rutas Privadas (Protegidas)

```javascript
<PrivateRoute path='/dashboard'>
  <Dashboard />
</PrivateRoute>
<PrivateRoute path='/publish'>
  <Publish />
</PrivateRoute>
// ... más rutas protegidas
```

#### Componente PrivateRoute

```javascript
function PrivateRoute({ children, ...rest }) {
  let auth = useAuth();
  return (
    <Route
      {...rest}
      render={({ location }) =>
        auth.user ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: location }
            }}
          />
        )
      }
    />
  );
}
```

**Funcionamiento**:
1. Verifica si existe usuario en el contexto de autenticación
2. Si existe, renderiza el componente hijo
3. Si no existe, redirige a `/login`
4. Preserva la ubicación de origen para redirigir después del login

### AuthButton

Componente que muestra el estado de autenticación en la barra de navegación:

**Usuario No Autenticado**:
- Muestra botón "Login"

**Usuario Autenticado**:
- Muestra nombre del usuario
- Menú desplegable con:
  - Panel de Control
  - Buzón de mensajes
  - Calendario de citas
  - Ventanilla única
  - Publicaciones
  - Solicitudes y Licencias
  - Gestión de Licencias
  - Nomenclaturas
  - Peticiones PQRS
  - Logout

---

## Sistema de Internacionalización

El sistema soporta múltiples idiomas mediante **i18next**.

### Configuración i18n

**Ubicación**: `src/app/translation/i18n.js`

```javascript
import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import { TRANSLATIONS_EN } from "./en/translations";
import { TRANSLATIONS_ES } from "./es/translations";

const resources = {
  en: { translation: TRANSLATIONS_EN },
  es: { translation: TRANSLATIONS_ES },
};

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    debug: false,
    lng: "es",
    supportedLngs: ["en","es"],
    interpolation: {
      escapeValue: false,
    },
  });
```

**Características**:
- Detección automática del idioma del navegador
- Idioma predeterminado: Español (es)
- Idiomas soportados: Español e Inglés
- Sin escape de valores (React ya lo hace)

### Estructura de Traducciones

```
translation/
├── i18n.js                 # Configuración
├── en/                     # Inglés
│   ├── translations.js     # Archivo principal
│   ├── scheduling/         # Módulo de citas
│   ├── curatorship/        # Módulo de curaduría
│   ├── transparency/       # PQRS y transparencia
│   └── liquidator/         # Calculadora
└── es/                     # Español
    ├── translations.js     # Archivo principal
    ├── scheduling/
    ├── curatorship/
    ├── transparency/
    └── liquidator/
```

### Uso en Componentes

```javascript
import { useTranslation } from "react-i18next";
import "./translation/i18n";

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t("title.dashboard")}</h1>
      <p>{t("description", { name: userName })}</p>
    </div>
  );
}
```

**Métodos**:
- `t(key)`: Obtiene traducción por clave
- `t(key, { param: value })`: Traducción con interpolación
- `t(key, { returnObjects: true })`: Retorna objeto completo

### Ejemplo de Archivo de Traducción

```javascript
export const TRANSLATIONS_ES = {
  title: {
    dashboard: "Panel de Control",
    publish: "Publicaciones",
    // ...
  },
  login: {
    str_user: "Correo Electrónico",
    str_pass: "Contraseña",
    str_btn: "INICIAR SESIÓN",
  },
  // ...
};
```

---

## Temas y Accesibilidad

### Sistema de Temas

El sistema implementa **modo claro/oscuro** usando Styled Components.

#### Configuración de Temas

**Ubicación**: `src/app/components/theme.js`

```javascript
export const lightTheme = {
  body: '#FFF',
  text: '#363537',
  toggleBorder: '#FFF',
  background: '#363537',
}

export const darkTheme = {
  body: '#363537',
  text: '#FAFAFA',
  toggleBorder: '#6B8096',
  background: '#999',
}
```

#### ThemeProvider

Implementado en `App.js`:

```javascript
const [theme, setTheme] = useState('light');

const toggleTheme = () => {
  theme === 'light' ? setTheme('dark') : setTheme('light')
}

return (
  <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
    <GlobalStyles />
    {/* Contenido de la aplicación */}
  </ThemeProvider>
);
```

#### Estilos Globales

**Ubicación**: `src/app/components/global.js`

Estilos globales que responden al tema activo:

```javascript
export const GlobalStyles = createGlobalStyle`
  body {
    background: ${({ theme }) => theme.body};
    color: ${({ theme }) => theme.text};
    transition: all 0.50s linear;
  }
  // ... más estilos
`
```

### Sistema de Accesibilidad

#### Tamaño de Fuente Adaptable

**Configuración**: `src/app/components/font.js`

5 niveles de tamaño de fuente:

```javascript
export const fontZise1 = { fontSize: '12px' }
export const fontZise2 = { fontSize: '14px' }
export const fontZise3 = { fontSize: '16px' }  // Por defecto
export const fontZise4 = { fontSize: '18px' }
export const fontZise5 = { fontSize: '20px' }
```

#### Controles de Accesibilidad

**Componente**: `btnAccesibility.js`

**Funcionalidades**:
- Botón flotante de accesibilidad
- Toggle de tema (claro/oscuro)
- Aumentar tamaño de fuente (+)
- Disminuir tamaño de fuente (-)
- Límites: min=1, max=5

**Estado en App.js**:

```javascript
const [font, setFont] = useState(3);  // Tamaño medio por defecto

const changeFontsizePlus = () => {
  if (font >= 1 && font < 5) {
    setFont(font + 1);
  }
}

const changeFontsizeMinus = () => {
  if (font > 1 && font <= 5) {
    setFont(font - 1);
  }
}
```

**Características**:
- Persistencia visual durante la sesión
- Transiciones suaves entre cambios
- No afecta la funcionalidad del sistema
- Cumplimiento con estándares WCAG

---

## Componentes Reutilizables

### 1. Navbar

**Ubicación**: `src/app/components/navbar.js`

**Descripción**: Barra de navegación principal usando RSuite.

**Características**:
- Responsive
- Enlaces de navegación
- Integración con sistema de autenticación
- Botón de login/perfil dinámico

### 2. Footer

**Ubicación**: `src/app/components/footer.js`

**Descripción**: Pie de página con información de la curaduría.

**Características**:
- Muestra nombre de la curaduría (configurable)
- Información del desarrollador
- Estilo consistente con el tema

### 3. Title

**Ubicación**: `src/app/components/title.js`

**Descripción**: Componente para títulos de página con manejo de breadcrumbs.

**Props**:
- `translation`: Objeto con traducciones
- `breadCrums`: Datos de navegación breadcrumb

### 4. DashBoardCard

**Ubicación**: `src/app/components/dashBoardCards/dashBoardCard.js`

**Descripción**: Tarjeta de acceso rápido a módulos.

**Props**:
- `title`: Título del módulo
- `image`: Clase de icono FontAwesome
- `link`: Ruta de navegación
- `imageColor`: Color del icono

**Uso**:
```javascript
<DashBoardCard 
  title="Buzón de Mensajes" 
  image="fas fa-envelope-open-text fa-3x" 
  link={"/mail"} 
  imageColor="Crimson" 
/>
```

### 5. BtnStart

**Ubicación**: `src/app/components/btnStart.js`

**Descripción**: Botón flotante para volver al inicio.

**Características**:
- Posición fija en la pantalla
- Scroll to top
- Diseño minimalista

### 6. BtnChat

**Ubicación**: `src/app/components/btnChat.js`

**Descripción**: Botón de chat flotante.

**Props**:
- `translation`: Textos del chat

**Características**:
- Widget de chat integrado
- Posición fija
- Fácil acceso

### 7. BtnAccesibility

**Ubicación**: `src/app/components/btnAccesibility.js`

**Descripción**: Panel de controles de accesibilidad.

**Props**:
- `theme`: Tema actual
- `font`: Tamaño de fuente actual
- `toggleTheme`: Función para cambiar tema
- `changeFontsizePlus`: Aumentar fuente
- `changeFontsizeMinus`: Disminuir fuente

**Características**:
- Panel desplegable
- Iconos intuitivos
- Controles táctiles/click

### 8. PdfViewer

**Ubicación**: `src/app/components/pdfViewer.component.js`

**Descripción**: Visor de documentos PDF integrado.

**Características**:
- Visualización en navegador
- Controles de zoom
- Descarga de documentos

### 9. Emails Component

**Ubicación**: `src/app/components/emails.component.js`

**Descripción**: Componente para gestión de correos.

**Características**:
- Lista de correos
- Preview de mensajes
- Acciones de correo

---

## Configuración y Variables de Entorno

### Variables de Entorno

El proyecto utiliza **env-cmd** para gestionar múltiples entornos.

**Archivo**: `.env` (no versionado)

**Variables Principales**:

```bash
# URL del Backend API
REACT_APP_API_URL=https://api.ejemplo.com

# Identificador de Curaduría
REACT_APP_GLOBAL_ID=cb1

# Google reCAPTCHA
REACT_APP_GOOGLE_CAPTCHA_HTML=6LeXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### REACT_APP_GLOBAL_ID

Determina la configuración específica de cada curaduría:

- `cb1`: Curaduría Urbana 1 de Bucaramanga
- `cp1`: Curaduría Urbana 1 de Piedecuesta
- `fl2`: Curaduría Urbana 2 de Floridablanca
- `lbj`: Alcaldía de Lebrija

**Uso**:
```javascript
const _GLOBAL_ID = process.env.REACT_APP_GLOBAL_ID;
const infoCud = info[_GLOBAL_ID];
```

### Configuración por Curaduría

**Ubicación**: `src/app/components/jsons/vars.js`

Cada curaduría tiene configuración específica:

```javascript
const info = {
  'cb1': {
    name: 'CURADURIA URBANA 1',
    dir: 'LUIS CARLOS PARRA SALAZAR',
    city: 'Bucaramanga',
    nomen: '68001-1-',
    address: 'Calle 36 # 31-39...',
    email1: 'curaduriaurbana1@gmail.com',
    m: 0.76,  // Factor de cálculo
    axisVar: ["Eje Cra. 33", "Eje Cra. 27", ...],
    axisTable: [1000, 2500, 2000, ...],
    zonesVar: ["N/A", "Centro", "Norte"],
    zonesTable: [0.1, 0.05, 0.05],
    pot: '11/2014',
    // ... más configuraciones
  },
  // ... otras curadurías
}
```

**Parámetros Configurables**:
- Información de contacto
- Factores de cálculo de expensas
- Zonas y ejes viales
- POT vigente
- Seriales de documentos
- Entidades relacionadas
- Reglas de expedición

---

## Guía de Desarrollo

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/neoygdrassyl/bedrock_client.git

# Instalar dependencias
cd bedrock_client
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con las configuraciones apropiadas
```

### Scripts Disponibles

```bash
# Desarrollo (requiere configuración .env)
npm start

# Build de producción
npm run build

# Ejecutar tests
npm test

# Eject (no recomendado)
npm run eject
```

### Estructura de Desarrollo

#### Crear un Nuevo Servicio

1. Crear archivo en `src/app/services/`:

```javascript
// nuevo.service.js
import http from "../../http-common";

const route = "nuevo_recurso"

class NuevoService {
  getAll() {
    return http.get(`/${route}`);
  }
  
  // ... más métodos
}

export default new NuevoService();
```

2. Importar en el componente que lo necesite:

```javascript
import NuevoService from './services/nuevo.service';
```

#### Crear una Nueva Página

1. Crear componente en `src/app/pages/`:

```javascript
// nueva_pagina.js
import React, { Component } from 'react';

class NuevaPagina extends Component {
  render() {
    return (
      <div className="container">
        <h1>Nueva Página</h1>
        {/* Contenido */}
      </div>
    );
  }
}

export default NuevaPagina;
```

2. Agregar ruta en `App.js`:

```javascript
import NuevaPagina from './pages/nueva_pagina';

// En el Switch:
<PrivateRoute path='/nueva'>
  <NuevaPagina />
</PrivateRoute>
```

#### Agregar Traducciones

1. Actualizar `src/app/translation/es/translations.js`:

```javascript
export const TRANSLATIONS_ES = {
  // ... existentes
  nueva_seccion: {
    titulo: "Título en Español",
    descripcion: "Descripción en Español",
  }
};
```

2. Actualizar `src/app/translation/en/translations.js`:

```javascript
export const TRANSLATIONS_EN = {
  // ... existentes
  nueva_seccion: {
    titulo: "Title in English",
    descripcion: "Description in English",
  }
};
```

3. Usar en componente:

```javascript
const { t } = useTranslation();

<h1>{t("nueva_seccion.titulo")}</h1>
```

### Buenas Prácticas

#### 1. Nomenclatura de Archivos

- Componentes: PascalCase o camelCase con extensión `.js`
- Servicios: camelCase terminando en `.service.js`
- Páginas: camelCase con extensión `.js` o `.page.js`

#### 2. Manejo de Estado

- Estado local: `useState` para componentes
- Estado global: Context API para autenticación
- No usar Redux (no está configurado)

#### 3. Manejo de Errores

Siempre incluir manejo de errores en llamadas a servicios:

```javascript
NombreService.metodo(params)
  .then(response => {
    // Éxito
  })
  .catch(error => {
    console.log(error);
    // Mostrar mensaje al usuario
    MySwal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Mensaje descriptivo',
    });
  });
```

#### 4. Componentes Funcionales

Preferir componentes funcionales con hooks sobre componentes de clase:

```javascript
// ✅ Recomendado
function MiComponente({ props }) {
  const [estado, setEstado] = useState(null);
  
  useEffect(() => {
    // Efectos secundarios
  }, []);
  
  return <div>{/* JSX */}</div>;
}

// ❌ Evitar (solo si es necesario)
class MiComponente extends Component {
  // ...
}
```

#### 5. Validación de Props

Aunque no está configurado PropTypes, documentar los props esperados:

```javascript
/**
 * Componente de tarjeta
 * @param {string} title - Título de la tarjeta
 * @param {string} image - Clase de icono
 * @param {string} link - Ruta de navegación
 */
function Card({ title, image, link }) {
  // ...
}
```

### Testing

El proyecto incluye testing configurado con Jest y React Testing Library:

```bash
npm test
```

**Ubicación de tests**: Junto a los componentes con extensión `.test.js`

### Build y Deployment

```bash
# Build de producción
npm run build

# Resultado en carpeta /build
# Archivos optimizados y minificados
# Listos para deployment en servidor web
```

**Notas**:
- Configure las variables de entorno apropiadas antes del build
- El build genera archivos estáticos que pueden servirse desde cualquier servidor web
- Asegúrese de que el servidor esté configurado para SPA (redirigir a index.html)

### Versionado

El proyecto sigue **Semantic Versioning** (SemVer):

- MAJOR: Cambios incompatibles en la API
- MINOR: Nueva funcionalidad compatible
- PATCH: Correcciones de bugs

**Versión actual**: Ver `package.json` → `version`

### Contribución

Para contribuir al proyecto:

1. Fork del repositorio
2. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit de cambios: `git commit -am 'Agregar nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

### Debugging

#### Herramientas Recomendadas

- **React Developer Tools**: Extensión de navegador
- **Redux DevTools**: Si se implementa Redux en el futuro
- **Console**: `console.log()`, `console.error()`

#### Debugging de Servicios

```javascript
NombreService.metodo(params)
  .then(response => {
    console.log('Response:', response.data);
  })
  .catch(error => {
    console.error('Error:', error);
    console.error('Error Response:', error.response);
  });
```

#### Debugging de Estado

```javascript
useEffect(() => {
  console.log('Estado actual:', miEstado);
}, [miEstado]);
```

---

## Conclusión

Esta documentación técnica proporciona una visión completa de la arquitectura, módulos y funcionamiento del sistema Bedrock Client. El proyecto está diseñado para ser escalable, mantenible y adaptable a las necesidades específicas de diferentes curadurías urbanas.

### Contacto y Soporte

- **Desarrollador**: Nestor Triana
- **Web**: [devnatriana.com](https://devnatriana.com)
- **Repositorio**: [github.com/neoygdrassyl/bedrock_client](https://github.com/neoygdrassyl/bedrock_client)

### Licencia

Este proyecto es de uso privado. Todos los derechos reservados.

---

**Última actualización**: Octubre 2025
**Versión del Sistema**: 1.20.95
