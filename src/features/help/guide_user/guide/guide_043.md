# **4. Modulo de las licencias**
<-[Indice](#indice)

Cada licencia generada en el sistema contiene various submodulos que compilan información de cada unos de los aspectos de la licencia; mas información en **[3.3.2 Menu de licencia](#332-menu-de-licencia)**

***

## **4.3 Submodulo Documentos**
<-[Indice](#indice)<-[Modulo de las licencias](#4-modulo-de-las-licencias)

Este es un submodlo de funcionalidad, que adminstra todo lo que tiene que ver con los documentos de cada licencia, desde los documentos entrates asta los documentos de salida. Permite la digitalizacion de los documentos para que DOVELA pueda relacionarlos en el resto de los submodulos y muestra información de los documentos de Ventanilla Unica y la Lista de Chequeo.

Este es principalemnte un modulo de consulta, sin embargo la digitalizacion de los documentos puede ser vista como una forma de guardado de datos.

![IMG](https://www.curaduria1bucaramanga.com//public_docs/OTHERS/manual/037_docs.png)

### **4.3.1 Gestion documental**
<-[Indice](#indice) <-[Modulo de las licencias](#4-modulo-de-las-licencias) <-[Submódulo Documentos](#43-submodulo-documentos)

Esta seccion del submodulo muestra todos los documentos entrantes a la solicitud en dos listas, los documentos digitalizados y los documentos de ventanilla única.

#### **4.3.1.1 Documentos digitalizados**
<-[Indice](#indice) <-[Modulo de las licencias](#4-modulo-de-las-licencias) <-[Submódulo Documentos](#43-submodulo-documentos) <-[Gestion documental](#431-gestion-documental)

DOVELA ofrece la posibilidad de guardar los documntos de la solicitud de forma digital para un uso y acceso conveniente de ellos.

Esta tabla ofrece un vistazo rapido a todos los documentos digitalizados de la solicitud.

![IMG](https://www.curaduria1bucaramanga.com//public_docs/OTHERS/manual/038_diglist.png)

Las columnas de la tabla se definen así:
* **Descripcipon:** El nombre del documento digitalizado.
* **Código:** El código identificador del documento, todos los posibles documento que pueden ser digitaliados tienen un código identificador único. DOVELA usará este código para calcular tiempos y documentos aportados y faltantes cuando lo requiera.
* **Folios:** Número de folios que componen el documento.
* **Fecha de radicación:** La fecha en la cual el documento fue entrago y procesado de forma fisica en la curaduria.
* **Acción:** Utilidades de la tabla para administrar el documento.
    * **Ver:** Permite ver el documento digitalizado.
    * **Historial:** Abre una ventana de historial donde es posible definir el historial fisico del documento.
    ![IMG](https://www.curaduria1bucaramanga.com//public_docs/OTHERS/manual/039_history.png)
    * **Modificar:** Permite actualizar la informcación del documento.
    * **Eliminar:** Elimina el documento digitalizado del sistema.

#### **4.3.1.2 Documentos de ventanilla unica**
<-[Indice](#indice) <-[Modulo de las licencias](#4-modulo-de-las-licencias) <-[Submódulo Documentos](#43-submodulo-documentos) <-[Gestion documental](#431-gestion-documental)

La **Ventailla Única de Radicación** es el modulo que gestiona la entrada de documentos a la curaduria, ordenandolos y asosiandolos de forma automatica a cada solicitud

Esta tabla muestra todos los documntos relacionado a la solicitud en cuestion.

![IMG](https://www.curaduria1bucaramanga.com//public_docs/OTHERS/manual/041_vrlist.png)

Las columnas de la tabla se definen así:
* **VR:** El codigo identificador del evento donde se entregaron los documentos a la curaduria, este VR es unico para cada evento y esa asociado a los multiples documentos que conforman el evento.
* **Fecha:** La marca temporal del evento.
* **Hora:** La marca temporal del evento.
* **Documento:** Nombre o descripción del documento.
* **Nomen.:** Nomenclatura del documento.
* **Código.:** El código identificador del documento, todos los posibles documento que pueden ser digitaliados tienen un código identificador único. DOVELA usará este código para calcular tiempos y documentos aportados y faltantes cuando lo requiera.
* **Folios:** Número de folios que componen el documento.

### **4.3.2 Anexar documentos**
<-[Indice](#indice) <-[Modulo de las licencias](#4-modulo-de-las-licencias) <-[Submódulo Documentos](#43-submodulo-documentos)

Esta seccion en una herramienta que permite subir los archivos al sistema para ser digitalizados y ser relacionarlos a la licencia de forma automatica.
Varias partes del sistema dan la posibilidad de asociar un documento digitaliado para facil acceso.

![IMG](https://www.curaduria1bucaramanga.com//public_docs/OTHERS/manual/042_adddoc.png)

Cada formulario es independiente y esta asociado a cada documento a digitalizar.

Los valores del formulario se definen asi:
* **Examinar:** La caja donde se subira el archivo directamente del comutador.
* **Descrición del documento:** Un valor alfa-númerico que describe el nombre del documento.
* **Código.:** El código identificador del documento, todos los posibles documento que pueden ser digitaliados tienen un código identificador único. DOVELA usará este código para calcular tiempos y documentos aportados y faltantes cuando lo requiera.
* **Folios:** Número de folios que componen el documento.
* **Fecha de radicación:** La fecha en la cual el documento fue entrago y procesado de forma fisica en la curaduria.
* **VER LISTA:** Este boton es una pequeña herramienta que permite consultar de forma rapida los nombres y códigos de todos los posibles que pueden ser entregados a la curaduria.
 ![IMG](https://www.curaduria1bucaramanga.com//public_docs/OTHERS/manual/043_searchdoc.png)
 Una vez encotnrado el documento, de click en el boton **"COPIAR INFORMACIÓN"** y el sistema copiara la descripción y el código en el formulario de forma automatica.

### **4.3.3 Lista general de chequeo de documentos**
<-[Indice](#indice) <-[Modulo de las licencias](#4-modulo-de-las-licencias) <-[Submódulo Documentos](#43-submodulo-documentos)

Todas las solicitudes requieren de una series de documentos que deben ser aportados por la persona que radica, estos están definidos en base a la modalidad y esta sección muestra cuales fueron aportados, cuales no y cuales no aplica. Importante aclarar que se definen los documentos aportados, mas no la forma o validez de estos.

 ![IMG](https://www.curaduria1bucaramanga.com//public_docs/OTHERS/manual/044_f6.png)

### **4.3.4 Generar documentos automaticos**
<-[Indice](#indice) <-[Modulo de las licencias](#4-modulo-de-las-licencias) <-[Submódulo Documentos](#43-submodulo-documentos)

Esta seccion compila todos los documentos de salida que genera cada solicitud, exceptuando los documentos clave (Informes, Actas y Resoluciones). En esta seccion NO SE PUEDE guardar of actualizar la informacion de estos documentos, solo se pueden consultar y generar los PDFs.

 ![IMG](https://www.curaduria1bucaramanga.com//public_docs/OTHERS/manual/045_docsprint.png)

#### **4.3.4.1 PDF Formulario unico nacional**
<-[Indice](#indice) <-[Modulo de las licencias](#4-modulo-de-las-licencias) <-[Submódulo Documentos](#43-submodulo-documentos) <-[Generar documentos automáticos](#434-generar-documentos-automaticos)

El documento de radicación inicial por los usuarios, una vez la información de esta radicación se halla completado en el sistema, DOVELA puede copiar y pegar esta información en un documento PDF del fomurlario único nacional y descargarlo al usuario.

 ![IMG](https://www.curaduria1bucaramanga.com//public_docs/OTHERS/manual/047_pdffun.png)

 Los valores del formulario se definen asi:
* **Oficina Responsable:** Entidad la cual general el documento.
* **No. de Radicación:** Código identificador de la solicitud, único e irrepetible.
* **Modelo:** El modelo del FUN, a partir del año 2022, el formulario fue atualizado, cambiando el tamaña y posicion de varios de las cajas de texto. DOVELA guarda en el sistema los dos modelos y llena las cajas de text debidamente en cada modelo.
* **Departamento:** Departamente de la curaduria.
* **Municipio:** Municipio de la curaduria.
* **Fecha (Pago de Expensas):** Fecha en la cual las expensas fijas fueron pagadas.

#### **4.3.4.2 PDF Lista de chequeo**
<-[Indice](#indice) <-[Modulo de las licencias](#4-modulo-de-las-licencias) <-[Submódulo Documentos](#43-submodulo-documentos) <-[Generar documentos automáticos](#434-generar-documentos-automaticos)

La Lista de Chequeo es el segundo documento generado en una radicación, indica un resumen sobre esta y denota los documentos aportados y faltantes de la radicación. Al igual que el punto anterior, DOVELA puede usar los datos guardados en el sistemas para copiar y pegar los valores en el PDF y generar una descarga automatica.

 ![IMG](https://www.curaduria1bucaramanga.com//public_docs/OTHERS/manual/048_pdffunc.png)

 Los valores del formulario se definen asi:
* **Autoridad Competente:** Entidad la cual general el documento.
* **Ciudad:** Ciudad de la curaduria.

#### **4.3.4.3 Documento de recordatorio incompleto**
<-[Indice](#indice) <-[Modulo de las licencias](#4-modulo-de-las-licencias) <-[Submódulo Documentos](#43-submodulo-documentos) <-[Generar documentos automáticos](#434-generar-documentos-automaticos)

Esta es una carta generada al responsable de la solicitud, informandole que el proyecto radicado NO se enuentra en Legal y debida forma.

Muchos de los datos del formulario son traidos del sistema y son reutilizados aqui, sin embargo estos valores pueden ser cambiados para acomodar el documento final.

 ![IMG](https://www.curaduria1bucaramanga.com//public_docs/OTHERS/manual/049_remind.png)

 Los valores del formulario se definen asi:
* **Fecha del documento:** Fecha que aparecerá plasmado en el documento.
* **Número de Radicación:** Código identificador de la solicitud, único e irrepetible. No se puede modificar.
* **IDENTIFICADOR Carta Incompleto:** Tambien conocido como **CODIGO DE SALIDA**, es un identificador que relacionara este documento a la solicitud. Único e irrepetible.
* **Ciudad:** Ciudad que aparecerá plasmado en el documento.
* **Fecha Radicación:** Fecha de pago de las expensas fijas.
* **Fecha Limite:** Fecha limite para subsanar la radicación, DOVELA calcula el valor de la siguiente forma: Fecha Radicacion + 30 dias habiles.
* **Responsable:** Responsable de la solicitud, basadado en el FUN.
* **Dirección:** Dirección de contacto del responsable, basadado en el FUN.
* **Email:** Correo electronico de contacto del responsable, basadado en el FUN.
* **Tipo de Solicitud:** El tipo y modalidad de la solicitud, basado en el FUN.
* **Documentos faltantes:** Los documento necesarios para subsanar la radicación, basado en la Lista de Chequeo.

#### **4.3.4.4 Documento de confirmacion legal y debida forma**
<-[Indice](#indice) <-[Modulo de las licencias](#4-modulo-de-las-licencias) <-[Submódulo Documentos](#43-submodulo-documentos) <-[Generar documentos automáticos](#434-generar-documentos-automaticos)

Este documento informa al reponsable de la solicitud que la radicación del proyecto se ha realizado de forma exitosa y que el proyecto se encuentra en Legal Y Debifa Forma, la siguiente etapa en el proyecto.

 ![IMG](https://www.curaduria1bucaramanga.com//public_docs/OTHERS/manual/050_ldf.png)

 Los valores del formulario se definen asi:
* **Fecha del documento:** Fecha que aparecerá plasmado en el documento.
* **Fecha LyDF:** Fecha en la cual el proyecto fue declrada en Legal y debida forma.
* **Número de Radicación:** Código identificador de la solicitud, único e irrepetible. No se puede modificar.
* **IDENTIFICADOR Carta LyDF:** Tambien conocido como **CODIGO DE SALIDA**, es un identificador que relacionara este documento a la solicitud. Único e irrepetible.
* **Solicitante:** El tipo de responsable que recibe la notificación, basado en la Lista de Chequeo.
* **Responsable:** El nombre del responsable que recibe la notificación, basado en la Lista de Chequeo.
* **Documento Responsable:** El número de documento identificador del responsable que recibe la notificación, basado en la Lista de Chequeo.
* **Dirección Responsable:** La dirección de contacto del responsable que recibe la notificación, basadado en el FUN.
* **Email Responsable:** La dirección de correo electronico del responsable que recibe la notificación, basadado en el FUN.
* **Dirección Predio:** La dirección del predio en la cual efectua el proyecto, basadado en el FUN.
* **Número Predial/Catastral:** El/los número de predial/catastral del predio en la cual efectua el proyecto, basadado en el FUN.
* **Ciudad Predio:** La ciudad donde se encuentra el predio en la cual efectua el proyecto.
* **Tipo de Solicitud:** El tipo y modalidad de la solicitud, basado en el FUN.
* **Tipo de Notificación:** Permite generar un documento extra en el PDF estipulado una notificación, ya sea presencial o electronica, esto como parte de las buenas practicas.

#### **4.3.4.5 Valla**
<-[Indice](#indice) <-[Modulo de las licencias](#4-modulo-de-las-licencias) <-[Submódulo Documentos](#43-submodulo-documentos) <-[Generar documentos automáticos](#434-generar-documentos-automaticos)

La Valla es un documento que el responsable deben colgar en la obra para informar al publico sobre la licencia y su modalidad. Esto basado en la norma (TODO REF).

DOVELA permite la creacion de este documento de forma automatica utilzando la información ya suministrada en el sistema. El sistema puede crear dos tipos diferentes de valla, la de radicación y la de resolucion, mostrando cada una información diferente.

 ![IMG](https://www.curaduria1bucaramanga.com//public_docs/OTHERS/manual/051_sign.png)

  Los valores del formulario se definen asi:
* **No. Radicación:** Código identificador de la solicitud, único e irrepetible. Usado en las dos vallas.
* **No. Resolución:** Código identificador de la resolución, único e irrepetible, Usado solo en la valla de resolución.
* **Tipo de Solicitud:** El tipo y modalidad de la solicitud, basado en el FUN.
* **Solicitante:** El nombre del responsable de la licecia, basado en la Lista de Chequeo.
* **Dirección:** La dirección del predio en la cual efectua el proyecto, basadado en el FUN. de click en el botón de **"DIRECCIÓN COMPLETA"** para utilizar una dirección mas extensa basada en la información del FUN.
* **Uso:** El uso al cual se le dará el proyecto, basado en el FUN.
* **Fecha de Radicación:** Fecha de pago de las expensas fijas.
* **Fecha de Licencia:** Fecha de la resolución. Usado en la Valla de resolución.
* **Vigencia:** Dos fechas que denotaran la vigencia de la licencia.
* **Altura:** Altura de la edificación. Este es un texto libre que permite especificar la altura como sea requerido, en pisos o metros u otra metrica.
* **Área:** Área a intervenir en el proyecto.
* **# Estacionamientos:** Cantidad de estacionamientos que seran .
* **# Unidades otro uso:** Código que identifica otros usos en la valla.
* **Tamaño:** Dimensiones de la valla.
* **Color de Fondo:** Fondo de la valla, siendo amarilla o blanco, para la valla de radicación  la valla de radicación respectivamente.
* **Tipo de valla:** El modelo de valla a generar, cada tipo muestra diferente información.
* **Usar fecha de instalación:** Usado en la valla de radicación, si se usa este checkbox, mostrara una fecha adicional, siendo esta: Fecha de radicación + 1 día hábil.
* **Texto de Valla:** Usado en la valla de radicación, este texto aparece al final de la valla indicando información importante al público.

#### **4.3.4.6 Sello**
<-[Indice](#indice) <-[Modulo de las licencias](#4-modulo-de-las-licencias) <-[Submódulo Documentos](#43-submodulo-documentos) <-[Generar documentos automáticos](#434-generar-documentos-automaticos)

Este es un documento especial para la Curaduria 1 de Bucaramanga, los sellos son usados para sellar los planos que serán aprobados en cada proyecto.

 ![IMG](https://www.curaduria1bucaramanga.com//public_docs/OTHERS/manual/052_seal.png)

Los valores del formulario se definen asi:
* **No. Radicación:** Código identificador de la solicitud, único e irrepetible.
* **Modalidad:** El tipo y modalidad de la solicitud, basado en el FUN.
* **Consecutivo Sello:** Código identificador del sello, único e irrepetible.
* **Área total:** Área total a intervenir.
* **Fecha:** Marca de tiempo que sera plasada en el sello.
* **Planos:** Número de planos aprobados.
* **Memorias:** Número de memorias aprobados.
* **Estudios:** Número de estudios aprobados.
* **Aprobación personalizada:** Si se usa esta valor, DOVELA ignorará los valores anteriores y usara el texto usado esta caja de texto en su lugar.
* **GUARDAR CAMBIOS:** Guarda los datos del sello en el sistema.
* **GENERAR ORIGINAL:** Genera el Sello con un texto indicando que es el original.
* **GENERAR TITULAR:** Genera el Sello con un texto indicando que es para el titular.

#### **4.3.4.7 Documento de citacion a vecinos**
<-[Indice](#indice) <-[Modulo de las licencias](#4-modulo-de-las-licencias) <-[Submódulo Documentos](#43-submodulo-documentos) <-[Generar documentos automáticos](#434-generar-documentos-automaticos)

En el proceso de la licencia, cuando se presenten vecinos colidante, es necesario que estos sean inforados sobre la licencia. Este formulario ayuda a generar los diferentes documentos requeridas por la curaduria respecto a este paso de la solicitud.

 ![IMG](https://www.curaduria1bucaramanga.com//public_docs/OTHERS/manual/053_neoghbours.png)

Los valores del formulario se definen asi:
* **Fecha de documento:** La fecha que será plasmada en el documento.
* **Fecha de Pago:** Fecha de pago de las expensas fijas.
* **No. Radicación:** Código identificador de la solicitud, único e irrepetible.
* **IDENTIFICADOR de salida:** Tambien conocido como **CODIGO DE SALIDA**, es un identificador que relacionara este documento a la solicitud. Único e irrepetible.
* **Consecutivo Radicado:** Código identificador de la solicitud, único e irrepetible. No se puede modificar.
* **Dirección:** La dirección del predio en la cual efectua el proyecto, basadado en el FUN. de click en el botón de **"DIRECCIÓN COMPLETA"** para utilizar una dirección mas extensa basada en la información del FUN.
* **Ciudad:** Ciudad que aparecerá plasmado en el documento.
* **Número Predial/Catastral:** El/los número de predial/catastral del predio en la cual efectua el proyecto, basadado en el FUN.
* **Número de Matricula:** El/los número de matricula del predio en la cual efectua el proyecto, basadado en el FUN.
* **Propietario Predio:** La persona dueña del predio, en la cual efectua el proyecto, basadado en el FUN.
* **Descripción del Proyecto:** Descripción corta generada por el profesional que radica la solicitud, basado en los metadatos de la solicitud.
* **Tipo de Solicitud:** El tipo y modalidad de la solicitud, basado en el FUN.
* **Vecino Colindante:** El vecino colindante en cuestion a ser informado, basado en el FUN.
* **Usar firma digital:** (Solo disponible para la Curaduria 1 de Bucaramanga) Pega la firma del Curador al final del documento de forma automatica, este checkbox es opcional.
* **GENERAR CARTA:** Genera el documento de notificación.
* **GENERAR CARTA Y LISTA:** Adicionalmente de la carta, genera una lista de control de notificación para todos los vecinos.
* **GENERAR PUBLICACIÓN:** En caso tal de que la notificación personal o por escrita no fuera posible, la Curaduria debe publicar un mensage publicamente sobre la licencia, este botón genera automaticamente el documento de esa publicación.

#### **4.3.4.8 Hoja de control documental**
<-[Indice](#indice) <-[Modulo de las licencias](#4-modulo-de-las-licencias) <-[Submódulo Documentos](#43-submodulo-documentos) <-[Generar documentos automáticos](#434-generar-documentos-automaticos)

Todo proyecto debe ser guardado de forma fisica, archivandose en uno o varios folders dentro de una o varias cajas.

Este seccion genera un documento para generar un listado total de los documento incluidos en el archivo del proyecto.

 ![IMG](https://www.curaduria1bucaramanga.com//public_docs/OTHERS/manual/054_controldoc.png)

Los valores del formulario se definen asi:
* **Series Documental:** Un código generado automaticamente basado en la modalidad de la solicitud. Este código esta definido y atado a una combincacion especifica de modalidades, y puede existir el caso de que haya una combincacion de modalidades sin un equivalente del código, para este caso el sistema no prodra continnuar, por lo tanto, es recomendado revisar la modalidad de la licencia y actualizarla asta que la combinación de modalidades genere un código valido.
* **Subseries Documental:** Un código generado automaticamente basado en la modalidad de la solicitud. Este código esta definido y atado a una combincacion especifica de modalidades, y puede existir el caso de que haya una combincacion de modalidades sin un equivalente del código, para este caso el sistema no prodra continnuar, por lo tanto, es recomendado revisar la modalidad de la licencia y actualizarla asta que la combinación de modalidades genere un código valido.
* **Listado de Documentos:** Esta es una tabla y formulario que debe ser modificado para poder generar el documento de forma correcta; las definiciones de la tabla son las siguientes:
    * **N° Order:** Orden del documento.
    * **Nombre Tipologia Documental:** Nombre o descripción del documento.
    * **Codigo Tipologia:** El código identificador del documento, todos los posibles documento que pueden ser digitaliados tienen un código identificador único. DOVELA usará este código para calcular tiempos y documentos aportados y faltantes cuando lo requiera.
     * **# (Folios / Cantidad):** Número de folios del documento. 
     * **Estado:** El estado del documento que definirá si el documento sera incluido en el documento final o no. 

#### **4.3.4.9 Notificacion licencia - Renuncia de terminos**
<-[Indice](#indice) <-[Modulo de las licencias](#4-modulo-de-las-licencias) <-[Submódulo Documentos](#43-submodulo-documentos) <-[Generar documentos automáticos](#434-generar-documentos-automaticos)

Este es un documento de notificación personal sobre la renuuncia de terminos de la licencia. Gran parte de su información se genera de forma automatica basada en la información presente en el sistema.

 ![IMG](https://www.curaduria1bucaramanga.com//public_docs/OTHERS/manual/055_renounce.png)

Los valores del formulario se definen asi:
* **Fecha:** Fecha en la cual el documento se genera, el cuadro del lado es la fecha escrita en letras.
* **Hora:** Hora en la cual el documento se genera, el cuadro del lado es la hora escrita en letras, este valor no se genera de forma automatica y debe ser escrito de forma manual.
* **Radicación:** Código identificador de la solicitud, único e irrepetible. No se puede modificar.
* **Resolución:** Código identificador de la resolución, único e irrepetible.
* **Resolución Fecha:** Fecha en la cual la resolución fue generada, el cuadro del lado es la fecha escrita en letras.
* **Titular:** El nombre del titular al cual va dirigido el documento.
* **Documento:** El documento identificador del titular al cual va dirigido el documento.
* **Calidad:** La calidad que actua el titular al cual va dirigido el documento.


### **4.3.5 Control de documentacion especial**
<-[Indice](#indice) <-[Modulo de las licencias](#4-modulo-de-las-licencias) <-[Submódulo Documentos](#43-submodulo-documentos)

Esta seccion compila documentos relacionados con la solicitud, pero que no hacen parte directa de este.

 ![IMG](https://www.curaduria1bucaramanga.com//public_docs/OTHERS/manual/046_docsprint2.png)

#### **4.3.5.1 Control de documento de reconocimiento**
<-[Indice](#indice) <-[Modulo de las licencias](#4-modulo-de-las-licencias) <-[Submódulo Documentos](#43-submodulo-documentos) <-[Control de docuemntacion especial](#435-control-de-documentacion-especial)

Para ciertos tipos de licencias, es necesario hacer seguimiento de un documento que es enviado a una entidad del estado. (Oficina de planeacion), este seccion ofrece una forma de controlar este proceso.

 ![IMG](https://www.curaduria1bucaramanga.com//public_docs/OTHERS/manual/056_recdoc.png)

Los valores del formulario se definen asi:
* **Curaduría notifico reconocimiento a la entidad interesada:** Estado de la curaduria referente a la notificacion del documento.
* **Identificación del oficio:** Tambien conocido como **CODIGO DE SALIDA**, es un identificador que relacionara este documento a la solicitud. Único e irrepetible.
* **Fecha de Radicación ante la entidad interesada:** La marca temporal del evento.
* **Respuesta entidad interesada radicación:** Guia de envio de la respuesta de la entidad interesada.
* **Fecha Limite:** La fecha limite que tiene la Curaduria para esperar la respuesta de la entidad, se calcula cmo la Fecha en la cual presento el documento + 10 días hábiles.
* **Oficio de la entidad interesada** Codigo identificador del documento de respuesta de la entidad interesada.
* **Documento** Asosiación del documento digitalizado. (Opcional)

#### **4.3.5.2 Certificaciones**
<-[Indice](#indice) <-[Modulo de las licencias](#4-modulo-de-las-licencias) <-[Submódulo Documentos](#43-submodulo-documentos) <-[Control de docuemntacion especial](#435-control-de-documentacion-especial)

Este es un documento de certificación de la Licencia, que puede generarse de forma automatica, cada certificación es única y contiene su propio código identificador. 

 ![IMG](https://www.curaduria1bucaramanga.com//public_docs/OTHERS/manual/057_certs.png)

 Las columnas de la tabla se definen así:
* **Consecutivo:** El codigo identificador de la certificación, este es único e irrepetible.
* **Fecha Exp:** Marca temporal de la certificación.
* **Accion:** Presione este botón para descargar una copia del PDF de la certificación.

 ![IMG](https://www.curaduria1bucaramanga.com//public_docs/OTHERS/manual/058_certs2.png)

Los valores del formulario se definen asi:
* **Fecha del documento:** Fecha de generación del documento.
* **Número de Radicación:** Código identificador de la solicitud, único e irrepetible. No se puede modificar.
* **Estado Proyecto:** Estado del proyecto al momento de generar la certificación.
* **Ciudad:** Ciudad que aparecerá plasmado en el documento.
* **Departamento:** Departamento que aparecerá plasmado en el documento.
* **Responsable:** Responsable de la solicitud, basado en el FUN.
* **Documento:** Documeto identificador del responsable de la solicitud, basado en el FUN.
* **Dirección Responsable:** Dirección de contacto del responsable de la solicitud, basado en el FUN.
* **En Calidad:** Calidad en la cual se presenta el responsable de la solicitud, basado en el FUN.
* **Modalidad:** El tipo y modalidad de la solicitud, basado en el FUN.
* **Dirección Predio:** Dirección del predio en la cual efectua el proyecto, basadado en el FUN.
* **Matricula:** El/los número de matricula del predio en la cual efectua el proyecto, basadado en el FUN.
* **Predial:** El/los número de predial/catastral del predio en la cual efectua el proyecto, basadado en el FUN.

***