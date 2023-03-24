# **4. Modulo de las licencias**
<-[Indice](#indice)

Cada licencia generada en el sistema contiene various submodulos que compilan información de cada unos de los aspectos de la licencia; mas información en **[3.3.2 Menu de licencia](#332-menu-de-licencia)**

***

## 4.4 Submodulo Actualizar
<- [Indice](#indice)  <-[Modulo de las licencias](#4-submodulos-de-las-licencias)

Esta seccion contiene toda la información referente al Formulario Único Nacional (FUN). Este documento contiene toda la información principal del proyecto a licenciar.

DOVELA utiliza esta sección para guardar los datos de la licencia. Posteriormente usa muchos de estos datos para gestionar varios de sus procesos posteriores, por tanto es importante llenar esta seccion de la forma mas completa posible para garantizar el funcionamiento y gestion del proceso mas adecuado.

 ![IMG](https://www.curaduria1bucaramanga.com//public_docs/OTHERS/manual/059_update.png)

### 4.4.1 Metadatos de la solicitud
<- [Indice](#indice) <-[Modulo de las licencias](#4-modulo-de-las-licencias) <-[Submodulo Actualizar](#44-submodulo-actualizar) 

Esta sección inicial contiene información que permite clasificar la licenia de forma interna y establecer variables iniciales escenciales que DOVELA necesitará mas adelante para poder procesar de forma correcta la licencia.

![IMG](https://www.curaduria1bucaramanga.com//public_docs/OTHERS/manual/069_fm.png)

Los valores del formulario se definen asi:
* **Relacionar Documento:** Relación del documento de pagos de expensas fijas.
* **Concecutivo de Recibo:** El identificador del pago de las expensas fijas.
* **Fecha de Recibo:** La fecha de pago de las expensas fijas. **DATO MUY IMPORTANTE**. Este dato debe ser definido para que pueda ser procesaso por el sistema de forma correcta.
* **Categorización de la Solicitud :** La categoría de la Licencia, (los valores posibles son I, II, III, IV y OA ), esta es una categorización basada en la normativa (TODO fuente), esta categorización es una buena practica para la gestión de las licencias que internamente define los días disponibles para evaluar la licencia cuando esta sea declara en Legal y Debida forma. A partir del 2022 esta practica ha sido declarada obsoleta y se recomienda usar la categoría III por defecto para todas las licencias, sin embargo Dovela puede seguir usando todas las categorías para cualquier licencia.
* **Modelo de Solicitud:** Modelo del FUN, esto definirá cual PDF será usado por DEVOLA para generar la radicación.
* **Descripcion del Proyecto:** Descripción breve e informativa sobre el objetivo del proyecto.
* **Etiquetas de la solicitud:** Permite definir varias TAGS para poder clasificar el proyecto de forma mas personalizada.
* **Reglas adicionales:** Dependiendo de las modalidades de algunas licencias, no se requerira de ciertos estudios o fases especificas. En este parte se definen esas reglas especiales para que DOVELA ignore estas fases.
    * **No usar Publicidad:** Al chequear esta casilla, el sistema NO usará la Publicidad del proyecto.
    * **No usar informe Estructural:** Al chequear esta casilla, el sistema NO usará el informe estructural del proyecto.
* **Archivo:** Esta es una consulta al **MODLO DE ARCHIVO** que muestra la posicion fisica del proyecto en el archivo de la curaduria.

### 4.4.2 Identificacion de la solicitud
<- [Indice](#indice) <-[Modulo de las licencias](#4-modulo-de-las-licencias) <-[Submodulo Actualizar](#44-submodulo-actualizar)

Esa seccion contiene el punto número 1 del FUN (Identificación de la solicitud), como buena practica, este formulario debe llenarse tal cual fue presentado por la persona que radicó la licencia.
Sin embargo, cambios a esta sección pueden presentarse en el futuro.

Esta sección contiene todos lo relacionado a las caracteristicas del proyecto como tal, que objetivos tiene y que caracteristicas estan asociadoas a este.

 ![IMG](https://www.curaduria1bucaramanga.com//public_docs/OTHERS/manual/060_type.png)

Los valores del formulario se definen asi:
* **Tipo de Solicitud:** Identificación del tipo de licencia, pueden ser 1 o varios tipos, sin embargo hay pocas combinaciones de varios valores que sean validas.
* **Objeto del Tramite:** Solo puede ser 1 valor, ya sea cerrado con las primeras opciones, o un valor abierto con el cuadro de texto.
* **Modalidad Licencia de Urbanización:** Solo puede ser 1 valor, solo esta accesible si el **Tipo de Solicitud** contiene el valor **Licencia de Urbanizacion** seleccionado.
* **ModalidModalidad Licencia de Subdivisión:** Solo puede ser 1 valor, solo esta accesible si el **Tipo de Solicitud** contiene el valor **Licencia de Subdivisión** seleccionado.
* **Modalidad Licencia de Construcción:** Puede tener varios valores seleccionados, sin embargo la combinación de valores seleccionados debe ser una valida, (mas informacion en **Series y Subseries Documentales**), solo esta accesible si el **Tipo de Solicitud** contiene el valor **Licencia de Construcción** seleccionado.
* **Usos:** Puede tener varios valores seleccionados y tener un valor abierto tambien.
* **Área Construida:** Solo puede ser 1 valor.
* **Tipo de Vivienda:** Solo puede ser 1 valor.
* **Bien de Interés Cultural:** Solo puede ser 1 valor.
* **Declaración sobre medidas de construcción sostenible:** Solo puede ser 1 valor. Esta opcion solo esta disponible para Licencias con Modelos de 2021.
* **Zónificacion Climáticaible:** Solo puede ser 1 valor, este valor puede ser abierto. Esta opcion solo esta disponible para Licencias con Modelos de 2021.

### 4.4.3 Informacion del predio
<- [Indice](#indice) <-[Modulo de las licencias](#4-modulo-de-las-licencias) <-[Submodulo Actualizar](#44-submodulo-actualizar) 

Esa seccion contiene el punto número 2 del FUN (Identificación de la solicitud), como buena practica, este formulario debe llenarse tal cual fue presentado por la persona que radicó la licencia. Sin embargo, cambios a esta sección pueden presentarse en el futuro.

Esta sección se centra en la definición del predio o predios sobre el cual el proyecto sera efectuado.

 ![IMG](https://www.curaduria1bucaramanga.com//public_docs/OTHERS/manual/061_f2.png)

Los valores del formulario se definen asi:
* **Dirección o Nomenclatura actual:** Localzación del predio.
* **Dirección(es) Anterior(es):** Otras formas de localizar el predip.
* **No. Matrícula Inmobiliaria**
* **Identificación Catastral (Viejo):** Tambien conocido como número predial. Este es el valor antiguo de 15 a 20 digitos.
* **Identificación Catastral (Nuevo):** Tambien conocido como número predial. Este es el valor nuevo de 30 digitos.
* **Clasificación del Suelo**
* **Planimetría del Lote**
* **Información General:** Información de la ubicación zonal del predio. **IMPORTANTE** El estrato es un valor requerido en varias partes de la gestion, por lo tanto es nesesario definir este valor de forma temprana.

### 4.4.4 Informacion de vecinos colindantes
<- [Indice](#indice) <-[Modulo de las licencias](#4-modulo-de-las-licencias) <-[Submodulo Actualizar](#44-submodulo-actualizar) 


**Para mas detalles consultar: 4.1.4 [Información de vecinos colindantes](#414-informacion-de-vecinos-colindantes)**

Esta seccion administra y lista los vecinos colidantes del predio.

Para añadir un nuevo vecino colidante, de click en el cuadro de **"Añadir Vecino Colindante"**.

 ![IMG](https://www.curaduria1bucaramanga.com//public_docs/OTHERS/manual/063_f3.png)

Los valores del formulario se definen asi:
* **Dirección del Prediol:** Localzación del predio del vecino colindante.
* **Dirección de correspondencia:** Direccion de contacto del vecino colidante, como buena practica, aun si es la mimsa dirección, se recomienda llenar este campo.
* **¿Se declaró parte? Nombre:** Nombre del vecino cuando este se halla declarado parte (TODO REF).
* **¿Se declaró parte? No. de IDENTIFICACÓN:** **CODIGO DE SALIDA** cuando este se halla declarado parte (TODO REF).

### 4.4.5 Linderos, dimnesiones y areas
<- [Indice](#indice) <-[Modulo de las licencias](#4-modulo-de-las-licencias) <-[Submodulo Actualizar](#44-submodulo-actualizar) 

**Para mas detalles consultar: 4.1.5 [Linderos, Dimensiones y Áreas](#415-linderos-dimensiones-y-areas)**

Para añadir un nuevo lindero, llene el formulario y de click en el botón **"AÑADIR ITEM"**.

 ![IMG](https://www.curaduria1bucaramanga.com//public_docs/OTHERS/manual/064_f4.png)

Los valores del formulario se definen asi:
* **Linderos:** Dirección cardinal del lindero.
* **Longitud (en m):** Distancia del lindero.
* **Colinda con :** Dirección o nomenclatura del otro predio con el cual colinda.

### 4.4.6 Titulares y profesionales responsables
<- [Indice](#indice) <-[Modulo de las licencias](#4-modulo-de-las-licencias) <-[Submodulo Actualizar](#44-submodulo-actualizar) 

La sección numero cinco del FUN esta dividida en tres partes, los titulares de la solicitud, los profesionales que actúan en la solicitud y el responsable de la solicitud, estos son personas que están relacionado a la solicitud, DOVELA solicitara los valores requeridos en el documento y extenderá sus funcionalidades para dar soporte de varios documentos requeridos por profesional.

#### 4.4.6.1 Titulares de la licencia
<- [Indice](#indice) <-[Modulo de las licencias](#4-modulo-de-las-licencias) <-[Submodulo Actualizar](#44-submodulo-actualizar) <-[Titulares y profesionales responsables](#446-titulares-y-profesionales-responsables) 

**Para mas detalles consultar: 4.1.6.1 [Titulares de la Licencia](#4161-titulares-de-la-licencia)**

Para añadir un nuevo lindero, de click en la caja de chequeo de **"Añadir Titular"**.

![IMG](https://www.curaduria1bucaramanga.com//public_docs/OTHERS/manual/065_f51.png)

Los valores del formulario se definen asi:
* **Tipo de Persona:** Identifica al titular como persona natural o persona juridica.
* **Nombre y Apellidos (Representante Legal):** Nombre del titular, SI es persona juridica.
* **Cédula (Representante Legal):** Documento identificador del titular, SI es persona juridica.
* **Nombre:** Nombre del titular.
* **Apellido(s):** Apellido del titular.
* **CC o NIT:** Documento identificador del titular.
* **Correo Electrónico:** Correo electrónico de contacto del titular.
* **Teléfono de Contacto:** Telefono o celular de contacto del titular.
* **Tipo de Titular:** Tipo del titular, frente a la solicitud.
* **Relacionar Documento: Documento de Identidad:** Relaciona el documento identificador con los documento digitalizados.
* **Relacionar Documento: Certificado de Existencia y Representación Legal :** Relaciona el documento con los documento digitalizados. Solo esta disponible cuando se trate de una persona juridica.

#### 4.4.6.2 Profesionales responsables
<- [Indice](#indice) <-[Modulo de las licencias](#4-modulo-de-las-licencias) <-[Submodulo Actualizar](#44-submodulo-actualizar) <-[Titulares y profesionales responsables](#446-titulares-y-profesionales-responsables) 

**Para mas detalles consultar: 4.1.6.2 [Profesionales responsables](#4162-profesionales-responsables)**

Para añadir un nuevo lindero, de click en la caja de chequeo de **"Añadir nuevo Profesional"**.

![IMG](https://www.curaduria1bucaramanga.com//public_docs/OTHERS/manual/066_52.png)

Los valores del formulario se definen asi:
* **Busqueda de Profesional:** Una caja de consulta para buscar el nombre de un profesional y traer la información de este desde la base de datos de profesionales.
* **Nombre:** Nombre del profesional.
* **Apellido(s):** Apellido del profesional.
* **Cédula:** Documento identificador del profesional.
* **Correo Electrónico:** Correo electrónico de contacto del profesional.
* **Rol que Desempeña:** Rol del profesional frente a la licencia.
* **Teléfono de Contacto:** Teléfono o celular de contacto del profesional.
* **No. Matrícula Profesional:** Número identificador del documento academico del profesional.
* **Fecha expedición Matrícula:** Fecha de expedición del documento academico del profesional.
* **¿Sancionado?:** Si o no, el profesional posee sanciones.
* **Tiempo de Experiencia (Años y meses):** Tiempo en años y meses de experiencia del titular al momento de realizarse la radicación. Este valor es usado por DOVELA mas adelante en los informes Aquitectonicos y Estructurales.
* **Supervisión técnica:** Si, No o NA, el profesional requiere supervisión tecnica.
* **Relacionar Documento: Hoja de Vida y Certificados:** Relaciona el documento digitalizado desde la lista de documentos.
* **Relacionar Documento: Documento de Identidad:** Relaciona el documento digitalizado desde la lista de documentos.
* **Relacionar Documento: Matricula:** Relaciona el documento digitalizado desde la lista de documentos.
* **Relacionar Documento: Vigencia Matricular:** Relaciona el documento digitalizado desde la lista de documentos.
* **Relacionar Documento: Estudios de postgrado:** Relaciona el documento digitalizado desde la lista de documentos.

#### 4.4.6.3 Responsable de la solicitud
<- [Indice](#indice) <-[Modulo de las licencias](#4-modulo-de-las-licencias) <-[Submodulo Actualizar](#44-submodulo-actualizar) <-[Titulares y profesionales responsables](#446-titulares-y-profesionales-responsables) 

Este sección define el responsable de la solicitud, esta es una única persona y puede ser algunos de los titulares o profesionales.

![IMG](https://www.curaduria1bucaramanga.com//public_docs/OTHERS/manual/067_f53.png)

Los valores del formulario se definen asi:
* **Copiar Titular o Profesional:** copia la información de algunos de los titulares o profesionales en el resto del formulario.
* **Nombre:** Nombre del responsable.
* **Apellido(s):** Apellido del responsable.
* **Número de Identificación (C.C.):** Número del documento identificador del responsable.
* **En calidad de:** El rol del responsable frente a la licencia.
* **Teléfono de Contacto:** Teléfono o celular de Contacto del responsable.
* **Correo Electrónico:** Correo Electrónico de Contacto del responsable.
* **Dirección para correspondencia:** Direccion de correspondencia del responsable.
* **Relacionar Documento: Doc. de Identidad:** Relaciona el documento digitalizado desde la lista de documentos.
* **Poder, mandato o autorización debidamente otorgado:** Relaciona el documento digitalizado desde la lista de documentos.

### 4.4.7 Anexo de construccion sostenble
<- [Indice](#indice) <-[Modulo de las licencias](#4-modulo-de-las-licencias) <-[Submodulo Actualizar](#44-submodulo-actualizar) 

Esta seccion aparecerá unicamente para las licencias con modelo de 2022 en adelante.

Esta seccion refleja el documento de Construccion Sostenible del FUN.

![IMG](https://www.curaduria1bucaramanga.com//public_docs/OTHERS/manual/068_fa.png)

Los valores del formulario se definen asi:
* **Tipo de uso:** Puede incluir varios valores mas un valor abierto adicional.
* **Reglamentación de construcción sostenible:**
    * **Medidas Pasivas:** Puede incluir varios valores mas un valor abierto adicional.
    * **Medidas Activa:** Puede incluir varios valores mas un valor abierto adicional.
    * **Materialidad muro externos:** Puede incluir varios valores mas un valor abierto adicional.
    * **Materialidad muro interno:** Puede incluir varios valores mas un valor abierto adicional.
    * **Materialidad de cubierta:** Puede incluir varios valores mas un valor abierto adicional.
    * **Relación muro ventana y altura piso a techo:** Pequeño formlario con valores variables de 0 a 100.
    * **Declaración sobre medidas de ahorro en agua:** Puede incluir varios valores mas un valor abierto adicional.
    * **Zonificación Climática:** Puede incluir varios valores mas un valor abierto adicional.
    * **Ahorro de esperado de agua:** Valor único abierto.
    * **Ahorro esperado en energía:** Valor único abierto.
* **Área del proyecto:** pequeño formuario con tres valores numericos.

### 4.4.8 Descargar PDF
<- [Indice](#indice) <-[Modulo de las licencias](#4-modulo-de-las-licencias) <-[Submodulo Actualizar](#44-modulo-actualizar) 

**Para mas detalles consultar: 4.3.4.1 [PDF Formulario unico nacional](#4341-pdf-formulario-unico-nacional)**

***