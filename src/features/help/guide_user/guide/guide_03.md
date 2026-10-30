# **3. Radicacion**
<- [Indice](#indice) 

![IMG](https://www.curaduria1bucaramanga.com//public_docs/OTHERS/manual/007_rad_3.png)

El proceso de radicación de una licencia en Dovela, significa la creación y formulación de un proceso de licenciamiento, entendiéndose como un proyecto de licenciamiento donde se contemplan todas sus partes, desde el formulario único nacional, asta los informes jurídicos, arquitectónicos y estructural, documentos aportados y proceso de expedición, también incluye metadatos del proceso como su tipo, las fechas de cada evento principal y cualquier propiedad o dato que pertenezca al proyecto.
Todas esta propiedades se encuentran agrupadas en los submodulos de la radicación, cada submodulo gestiona una parte del proceso. (Por ejemplo el modulo de ACTUALIZAR gestiona todo lo relacionado al Formulario único nacional)
La pagina de radicación agrupa todos estos proyecto en varias listas y da un acceso rápido a cualquiera de sus submodulos. También permite la creación de nuevos proyectos y la búsqueda de estos.

*** 
## **3.1 Nueva Licencia**
<- [Indice](#indice)  <- [Radicacion](#3-radicacion) 

Para generar una nueva radicación, identifique la caja de creación de nueva radicación.

![IMG](https://www.curaduria1bucaramanga.com//public_docs/OTHERS/manual/003_rad_1.png)

En esta caja se encuentran un formulario necesario para la creación de todo nuevo proyecto.
1. **Fecha de Creación:** Esta es la fecha de creación interna del proyecto, debe coincidir con la fecha de radicación el proyecto, entendiese la radicación como la fecha en la cual se pagaron las expensas fijas del proyecto.
2. **Numero de Radicación:** Este es el numero consecutivo identificador del proyecto. Aparecerá parcialmente lleno basado en la nomenclatura de la organización, sin embargo, este campo puede ser borrado completamente para añadir un código diferente. (Por ejemplo PH22-0001 para identificar un reconocimiento de propiedad horizontal).
Este consecutivo debe ser único para todo proyecto, si se coloca un consecutivo que ya existe para otro proyecto, Dovela no creará el proyecto e informara mediante un mensaje de error.
Al lado de esta caja de texto, se encuentra el botón de **“GENERAR LIC”**, este botón traerá a la caja el siguiente consecutivo de radicación de forma automática, ejemplo, si el ultimo consecutivo es 68001-1-22-0054, el numero que aparecerá en la caja será  68001-1-22-0055.
3. **Crear:** Este botón creará el proyecto, para poder crear un proyecto los dos campos anteriores deben de estar definidos, basados en sus tipos (Fecha para el capo uno, y un valor alfa numérico para el campo dos.
Una vez creado el proyecto, esta aparecerá en la lista de Radicación. Este proyecto estará vacío, no tendrá ninguna información llena, aparte de su número de radicación que lo identificará.

***

## **3.2 Buscar Licencia**
<- [Indice](#indice)  <- [Radicacion](#3-radicacion) 

![IMG](https://www.curaduria1bucaramanga.com//public_docs/OTHERS/manual/004_rad_2.png)

El cuadro de búsqueda permite buscar uno o varios proyectos de licenciamiento dada una criterio de búsqueda sencilla.
En esta caja se encuentra un formulario que debe de llenarse para poder iniciar una búsqueda, los elementos de esta caja son:
1. **Propiedad de búsqueda:** Dovela podrá buscar por varios paramentos o propiedades del proyecto, entre estos están: numero de radicado, numero de matricula inmobiliario, numero de identificador predial o catastral, cedula o numero identificador del documento y nombre.
Para los dos últimos casos, en cada proyecto pueden haber relacionados varias personas, desde los titules, profesionales y responsable, el proyecto puede llegar a almacenar varios nombres, cedulas y documentos identificadores diferentes.
Para el caso de la búsqueda, Dovela comparará el texto de búsqueda con cada uno de forma separada.
2. **Texto de búsqueda:** El valor a buscar, este es un texto alfa numérico que esta basado en la propiedad de búsqueda, Dovela comparará este texto para encontrar proyectos que coincidan en su proceso de búsqueda.
3. **Botón de Consultar:** Una vez seleccionada una propiedad de búsqueda y un texto de búsqueda, el botón realizará la acción de búsqueda, y retornará una lista de resultados, ofreciendo todos los proyecto con un valor coincidente.

***

## **3.3 Listado de Licencias**
<- [Indice](#indice)  <- [Radicacion](#3-radicacion) 

![IMG](https://www.curaduria1bucaramanga.com//public_docs/OTHERS/manual/008_list.png)

Debajo de las cajas de acciones (GENERAR NUEVA RADICACIÓN y CONSULTAR SOLICITUD) se encuentran las listas de todos los proyectos de la organización. Estos se encuentran separados en 6 listas diferentes: Radicación, Evaluación, Expedición, Otras Actuaciones, Desistimientos y Archivadas.
* **Radicación:** Esta lista contiene todas las solicitudes que están en su proceso inicial de radicación,  esta lista muestra información importante del proyecto como la fecha limite para ser declarado en Legal y Debida Forma y un tiempo restante para el cumplimiento de esta fecha. Este tiempo es una cuenta regresiva comenzando a partir de los 30 días, si un proyecto permanece en este estado por mas tiempo, esta tiempo restante continuara contando, incrementando en forma negativa, indicando este valor como los días de mas de los que tenia asignado inicialmente.
* **Evaluación:** Cuando un proyecto es declarado en Legal y Debida Forma, este será puesto en esta lista de forma automática. En esta lista se presentan los proyectos que están en la evaluación académicas, Jurídicas, Arquitectónica y Estructural. Esta lista incluye los proyectos que no tengan Acta de Observaciones, que  y que tienen Acta de Observaciones y Correcciones, también incluye los proyecto que no han sido declarados como viables.
* **Expedición:** Cuando un proyecto es declarado como Viable, este será ubicado en esta lista. En este parte se contemplan los proyectos que son viables, que están siendo liquidados, y los que su resolución esta siendo expedida.
* **Otras Actuaciones:** Hay un grupo especifico de proyecto los cuales tienen una brevedad de estudios y expedición, entre estos esta las Prorrogas, revalidaciónes y las Propiedades Horizontales, en conjunto todos estos tipos de proyectos son conocidos como Otras Actuaciones y están se encuentra agrupadas en esta lista. En esta parte se contemplan todo el transcurso del proceso, por lo que no hay otras listas para su evaluación o expedición.
* **Desistimientos:** En esta parte están todos los proyectos que han sido desistidos en algún momento de su desarrollo. Cada proyecto puede tener uno de cinco motivos para ser desistido: No presento los requisitos necesarios para estar en Legal y Debida Forma, No presento la valla informativo e los 5 días hábiles siguientes al Legal y Debida Forma, necesita correcciones del Acta de Observaciones y no las subsano, no hizo los pagos de las expensas y de forma voluntaria.
* **Archivadas:** Esta lista contiene todas los proyectos que han sido archivados. Para todos los tipos de proyectos, una vez estos han finalizado su proceso, ya sea por la aprobación de la resolución, o negación de esta, deben ser cerrados en el sistema, indicando esta acción como la finalización de este proceso. 

### **3.3.1 Iconos de progresion**
<- [Indice](#indice)  <- [Radicacion](#3-radicacion)  <- [3.3 Listado de Licencias](#33-listado-de-licencias) 

En la lista de las licencias, se encuentra los Iconos de Progresión, estos iconos muestran el estado general de la radicación y el progreso de las diferentes etapas de este.
Los iconos obedecen un código de semáforo, donde el verde indica que la etapa cumple con todo lo requerido, amarillo cuando cumple con observaciones y rojo cuando no cumple con los requisitos. Para el color negro, se entiende que el semáforo esta apagado y por ende no hay información al respecto de la etapa.

Estos iconos de actualiza de forma natural, con forme el proyecto

Todos los proyecto contemplan varios de estos iconos, pero dependiendo de sus modalidad, pueden tener mas o menos iconos totales.

![IMG](https://www.curaduria1bucaramanga.com//public_docs/OTHERS/manual/011_icons.png)

Simbología de los Iconos:
* **Signo de dólar:** Pago de las expensas fijas
* **Signo de chequeo:** Estado Incompleto o Legal y Debida forma
* **Signo de persona:** Vecinos colindante notificados
* **Signo de Valla:** Valla Publicitaria
* **Signo de tablero uno:** Estado de la notificación a la Subsecretaria de Planeación con respecto a los reconocimientos
* **Signo de table dos:** Sello de los planos
* **Signo de balanza:** Evaluación Jurídica
* **Signo de edificio:** Evaluación Arquitectónica
* **Signo de piñones:** Evaluación estructural
* **Signo de documento uno:** Acta de Observaciones y Correcciones
* **Signo de documentos dos:** Viabilidad, pagos de expensas variables y resolución

Los proyectos de Propiedad Horizontal tienen sus propios iconos.

![IMG](https://www.curaduria1bucaramanga.com//public_docs/OTHERS/manual/012_icons2.png)

* **Signo de dólar:** Pagos de expensas fijas
* **Signo de chequeo:** Estado incompleto o Legal y debida forma
* **Signo de documento:** Sello de los planos
* **Signo de lápiz y regla:** Evaluación de la propiedad horizontal, combinan la evaluación jurídica y arquitectónica.

### **3.3.2 Menu de licencia**
<- [Indice](#indice)  <- [Radicacion](#3-radicacion)  <- [3.3 Listado de Licencias](#33-listado-de-licencias) 

Este botón permite acceder a cada uno de las etapas del proyecto, estas etapas son denominadas como submódulos para Dovela.

![IMG](https://www.curaduria1bucaramanga.com//public_docs/OTHERS/manual/009_menu.png)

Cada uno de estos submódulos gestionan todas las características de un proyecto.

Al momento de dar click en el botón, aparecerá un menú con todos estos submódulos.

Dependiendo de la modalidad y las reglas del proyecto, algunos de estos submódulos no estarán presentes en el menú.

* **Detalles:** Submódulo de información general, muestra información sobre todos los demás submódulos y características del proyecto.
* **Tiempo:** Muestra información de todos los eventos temporales del proyecto. 
* **Documentos:** Modulo que contiene todos los documentos digitalizados del proyecto. Muestras los documentos de Ventanilla Única relacionados, y permite generar documentos de salida de forma automático 
* **Actualizar:** Contiene la información del Formulario Único Nacional.
* **Chequeo:** Permite revisar los documentos aportados al proyectos y declarar el proyecto como Incompleto o Legal y Debida forma. Para la progresión del proyecto, es necesario estar declarado como Legal y Debida forma.
* **Publicidad:** Gestiona la valla publicitaria y la notificación a los vecinos colindantes.
* **Informe Jurídico:** Evaluación del informe jurídico del proyecto.
* **Informe Arquitectónico:** Evacuación del informe arquitectónico del proyecto.
* **Informe Estructural:** Evaluación del informe estructural del proyecto.
* **Acta:** Conglomera los previos informes para generar el Acta de Observaciones y Correcciones, gestiona las fechas de notificación de Acta.
* **Expedición:** Este submódulo gestiona la parte final de expedición de la licencia, comenzando por su viabilidad, las liquidaciones de las expensas variables, y las generación de la resolución. También ofrece un control de fechas para todos estos eventos.

Las Propiedades Horizontales tienen un menú mas reducido basado en los requerimientos de este tipo de procesos.

![IMG](https://www.curaduria1bucaramanga.com//public_docs/OTHERS/manual/010_menu2.png)

* **Informe de P.H. :** Evaluación conjunta de jurídico y arquitectónico para los procesos de Propiedad Horizontal. Este submódulo contiene todos los pasos de expedición del proceso.

***