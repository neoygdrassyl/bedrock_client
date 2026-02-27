---
applyTo: '**'
---

## Context7 — Documentación actualizada obligatoria

Antes de implementar o modificar código que use librerías externas, consulta SIEMPRE la documentación actualizada vía Context7 MCP para evitar generar API obsoleta.

### Consulta obligatoria

| Librería | Library ID | NO generar (versiones anteriores) |
|----------|------------|-----------------------------------|
| React 19 | `/reactjs/react.dev` | `forwardRef`, `defaultProps`, `createRef` en funcionales, `ReactDOM.render` |
| react-router v6 | `/remix-run/react-router` | `Switch`, `useHistory`, `Redirect`, `component={}`, `render={}` |
| Vite 6 | `/vitejs/vite` | `process.env`, configuración de webpack/CRA |
| Vitest | `/vitest-dev/vitest` | `jest.fn()`, `jest.mock()`, `jest.spyOn()` |
| styled-components 6 | `/styled-components/styled-components` | API de `.attrs()` de v5 |

### Consulta según módulo

| Librería | Library ID | Consultar cuando... |
|----------|------------|---------------------|
| Bootstrap 5 | `/twbs/bootstrap` | Se modifiquen wrappers UI o se usen clases CSS de BS5 |
| RSuite 5 | `/rsuite/rsuite` | Se usen SelectPicker, DatePicker, TagPicker |
| @testing-library/react | `/testing-library/testing-library-docs` | Se escriban o modifiquen tests |
| react-i18next | `/i18next/react-i18next` | Se configure i18n o se usen hooks de traducción |
| react-pdf 9 | `/wojtekmaj/react-pdf` | Se toque el visor de PDFs |
| sweetalert2 | `/sweetalert2/sweetalert2` | Se creen alertas complejas |
