# **4. Modulo de las licencias**
<-[Indice](#indice)

Cada licencia generada en el sistema contiene various submodulos que compilan información de cada unos de los aspectos de la licencia; mas información en **[3.3.2 Menu de licencia](#332-menu-de-licencia)**

***

## **4.2 Submodulo de tiempos**
<-[Indice](#indice) <-[Modulo de las licencias](#4-modulo-de-las-licencias)

Cada licencia o solicitud tiene varios eventos que definen una acción efectuada en un tiempo definido. Estos eventos pueden ser el pago de las expensas, el Legal y Debida forma, una notificación de cambio de estado entre otras.

Estos eventos pueden ocurrir o no dependiendo del desarrollo de la solicitud.

![IMG](https://www.curaduria1bucaramanga.com//public_docs/OTHERS/manual/027_time.png)

### **4.2.1 Anuncios de profesionales**
<-[Indice](#indice) <-[Modulo de las licencias](#4-modulo-de-las-licencias) <-[Submodulo de tiempos](#42-submodulo-de-tiempos)

Esta es un lista de eventos adicionales de cada solicitud o notas, pensada para añadir eventos mas personalizados que no suelen estar contemplados en cada proceso, por ejemplo: Un mensaje de un profesional a otro profesional acerca del estado de un documento, o la visita de un profesional a la curaduria sobre una consulta de la solicitud.

![IMG](https://www.curaduria1bucaramanga.com//public_docs/OTHERS/manual/027_tlist.png)

La estructura de la lista es:
* **De:** La persona que genera la nota.
* **Para:** La persona final a la cual la nota va dirigida, puede ser otro profesional o entidad.
* **Fecha:** La marca temporal de la nota.
* **Mensaje:** El cuerpo o razón de la nota.
* **Nuevo:** Este boton abrira un pequeño formulario para crear una nueva nota.
* **Cuadro de Búsqueda:** En este cuadro de búsqueda se pude filtrar la lista para buscar un evento en especifico basados en los parámetros de búsqueda.

### **4.2.2 Control de tiempos y fechas de la solicitud**
<-[Indice](#indice) <-[Modulo de las licencias](#4-modulo-de-las-licencias) <-[Submodulo de tiempos](#42-submodulo-de-tiempos)

Esta es la lista principal de los eventos mas notables de la solicitud. Estos eventos son guardados por el sistema de forma natural, es decir, a medida que la solicitud progrese naturalmente en el sistema, las fechas se irán guardando automáticamente.

![IMG](https://www.curaduria1bucaramanga.com//public_docs/OTHERS/manual/029_tlist2.png)

Las columnas de la tabla se definen así:
* **Control Proceso:** El nombre del evento.
* **Fecha Limite términos y plazos:** La fecha máxima la cual el evento tiene antes de incumplir con los tiempos establecidos. No todos los eventos poseen una fecha limite, y para el caso de algunos eventos, requiere una feche en especial para que el sistema calcule la fecha limite.
* **Fecha ejecución proceso:** La marca temporal en la cual el evento ocurrió.
* **Observaciones:** Información adicional referente al evento.

#### **4.2.2.1 Eventos principales:** 
<-[Indice](#indice) <-[Modulo de las licencias](#4-modulo-de-las-licencias) <-[Submodulo de tiempos](#42-submodulo-de-tiempos) <-[Control de tiempos y fechas de la solicitud](#422-control-de-tiempos-y-fechas-de-la-solicitud)

Los eventos presentes en esta tabla pueden varias, algunos siempre estarán presentes, pero otros no aparecerán a no ser que ocurran en algún momento, la lista entera de los eventos es la siguiente:

* Radicación
* Pago expensas fijas
* Incompleto
* Legal y debida forma
* Acta Parte 1: Observaciones
* Citación (Observaciones)
* Notificación (Observaciones)
* Notificación por aviso (Observaciones)
* Prórroga correcciones
* Correcciones
* Acta Parte 2: Correcciones
* Acto de Tramite de Licencia (Viabilidad)
* Citación (Viabilidad)
* Notificación (Viabilidad)
* Notificación por aviso (Viabilidad)
* Radicaciones de pagos
* Acto Administrativo / Resolución
* Citación (Resolución)
* Notificación (Resolución)
* Notificación por aviso (Resolución)
* Licencia
* Archivo

Adicionalmente DOVELA también muestra los eventos de cada proceso de desistimiento de forma separada.

* Citación para notificación personal
* Creación de resolución
* Citación  para notificación personal
* Notificación
* Notificación por aviso
* Interponer recurso
* Resolución frente al recurso
* Citación para notificación personal (2° Vez)
* Notificación (2° Vez)
* Notificación por aviso (2° Vez)
* Finalización


#### **4.2.2.2 Eventos Secundarios:** 
<-[Indice](#indice)<-[Modulo de las licencias](#4-modulo-de-las-licencias) <-[Submodulo de tiempos](#42-submodulo-de-tiempos) <-[Control de tiempos y fechas de la solicitud](#422-control-de-tiempos-y-fechas-de-la-solicitud)

Estos son eventos o acciones que forman parte de un paso principal, su numero puede variar entre cada licencia.

* Radicación de Valla
* Vecino Notificado, XXXX
* Revision Jurídica, Revision #
* Revision Arquitectónica, Revision #
* Revision estructural, Revision #
* Citación (Acta de Observaciones)
* Notificación (Acta de Observaciones)
* Acto de Tramite de Licencia (Viabilidad)
* Pago de expensas variables
* Pagos d Impuestos/Estampilla

![IMG](https://www.curaduria1bucaramanga.com//public_docs/OTHERS/manual/030_tlist3.png)


#### **4.2.2.3 Grafica de eventos:** 
<-[Indice](#indice) <-[Modulo de las licencias](#4-modulo-de-las-licencias) <-[Submodulo de tiempos](#42-submodulo-de-tiempos) <-[Control de tiempos y fechas de la solicitud](#422-control-de-tiempos-y-fechas-de-la-solicitud)

Con las fechas de los eventos DOVELA es capas de construir un diagrama de Gantt para representar de forma gráfica el avance de la solicitud, mostrando los lapsos de tiempo que han tomado cada parte del proceso.

Para generar esta gráfica, DOVELA requerirá de un mínimo de fechas, primordialmente la fecha de pago de expensas fijas y la fecha de Legal y Debida Forma.

Los eventos totales de la gráfica serán calculados basados en las condiciones de la solicitud, mostrando ciertos eventos o no. Las barras de color verde indican el tiempo del usuario que esta solicitando la licencia, las barra de color azul indican el tiempo invertido por la curaduria, las barras de color rojo representan el tiempo de desistimiento, finalmente, las barras de color gris representan una proyección que DOVELA realizara para la licencia y calcular el tiempo estimado para completar la solicitud.

El eje X de la gráfica esta en días hábiles, tomando en cuenta internamente los días no laborales y festivos del calendario Colombiano.

![IMG](https://www.curaduria1bucaramanga.com//public_docs/OTHERS/manual/031_chart.png)

### **4.2.3 Control de procesos de desistimientos**
<-[Indice](#indice) <-[Modulo de las licencias](#4-modulo-de-las-licencias) <-[Submodulo de tiempos](#42-submodulo-de-tiempos)

DOVELA permite hacer seguimiento de los procesos de desistimiento de las licencias, de forma separada para cada unos de los diferentes motivos.

* Radicación Incompleta
* Fata de monte de valla informativa
* No cumple con el acta de correcciones
* No pago las expensas de la licencia
* Desistimiento voluntario

#### **4.2.3.1 Proceso de desistimiento**
<-[Indice](#indice) <-[Modulo de las licencias](#4-modulo-de-las-licencias) <-[Submodulo de tiempos](#42-submodulo-de-tiempos) <-[Control de procesos de desistimientos](#423-control-de-procesos-de-desistimientos)

El desistimiento implica una serie de eventos especiales para la licencia que puede hacer que la solicitud termine su proceso en totalidad en su estado actual.

Mientras la licencia se encuentre en desistimiento, algunas acciones no serán posibles, principalmente, los eventos que permiten avanzar la licencia al siguiente estado, ejemplo, de Incompleto a Legal y debida forma.

#### **4.2.3.2 Iniciar proceso de desistimiento**
<-[Indice](#indice) <-[Modulo de las licencias](#4-modulo-de-las-licencias) <-[Submodulo de tiempos](#42-submodulo-de-tiempos) <-[Control de procesos de desistimientos](#423-control-de-procesos-de-desistimientos)

Para iniciar el proceso de desistimiento selecciones el motivo por el cual la licencia entra en desistimiento y la fecha en la cual el evento ocurrió. Después haga click en el botón de **"ABRIR PROCESO"**

![IMG](https://www.curaduria1bucaramanga.com//public_docs/OTHERS/manual/032_neg1.png)

Inmediatamente el sistema abrirá una nueva tabla en la cual se podrá tener seguimiento y control del proceso de desistimiento.

El proceso de desistimiento esta formado por una serie de pasos ya definidos por DOVELA y argumentados de forma jurídica.

Son un total de 12 pasos que comienzan desde la fase inicial en el recordatorio a la persona hasta la finalización del proceso.

![IMG](https://www.curaduria1bucaramanga.com//public_docs/OTHERS/manual/033_neg2.png)

Las columnas de la tabla se definen así:
* **Evento:** El nombre del evento.
* **Observaciones:** Observaciones o detalles sobre el evento.
* **Fecha evento:** La marca de tiempo del evento.
* **Fecha limite:** Fecha limite antes de sobrepasar los tiempos limites, algunos eventos no tiene fecha limite.
* **Resultado:** El estado del evento, definido como sin información (gris), completado (verde), no se completo (rojo) y en proceso/espera (azul).
* **Soporte documento:** Documento digitalizado que soporta el evento (opcional).

Para iniciar con el control, haga click en la flecha al lado izquierdo de cada fila, este botón abrirá un pequeño formulario que permite definir el evento de la fila.

![IMG](https://www.curaduria1bucaramanga.com//public_docs/OTHERS/manual/034_negnew.png)

![IMG](https://www.curaduria1bucaramanga.com//public_docs/OTHERS/manual/035_negnew2.png)

Para definir cada paso del proceso, complete el formulario y haga click en **"GUARDAR CAMBIOS"**

Los valores del formulario se definen asi:
* **Evento:** El nombre del evento, no se puede cambiar, DOVELA lo define automáticamente.
* **Resultado Evento:** El resultado final de este evento, definidos como "SIN DEFINIR", "ESPERANDO RESULTADO", "SE CUMPLIO EXITOSAMENTE" Y "NO SE CUMPLIO".
* **Fecha Evento:** La marca de tiempo del evento.
* **Soporte: Relacionar Documento:** Select para relacionar un documento digitalizado.
* **Contexto u Observaciones al resultado de la acción:** Información adicional del evento, este texto esta pre-definido por DOVELA, sin embargo es posible añadir o cambiar el texto a la necesidad.

#### **4.2.3.3 Finalizar proceso de desistimiento**
<-[Indice](#indice) <-[Modulo de las licencias](#4-modulo-de-las-licencias) <-[Submodulo de tiempos](#42-submodulo-de-tiempos) <-[Control de procesos de desistimientos](#423-control-de-procesos-de-desistimientos)

Una vez iniciado el proceso de desistimiento, solo se podrá finalizar completando el paso final de la tabla.

El paso final de la tabla se denomina **"FINALIZACIÓN"**, y una vez la fecha de este evento sea guardada, el sistema abrirá dos nuevas opciones en este paso.

![IMG](https://www.curaduria1bucaramanga.com//public_docs/OTHERS/manual/036_negend.png)

* **SALVAR PROCESO:** Este botón finalizara el proceso de desistimiento y retornará la licencia al estado de Legal y Debida forma para continuar con su proceso normal.

* **CERRAR PROCESO:** Este botón finalizara el proceso de desistimiento y cerrará la licencia, enviándola al listado de archivo. En este estado la licencia todavía puede ser modificada, pero es recomendado ARCHIVAR la licencia una vez todo la información necesaria halla sido formulada, en el estado de ARCHIVADA la licencia no podrá ser modificada mas.

#### **4.2.3.4 Asistente de Correos**
<-[Indice](#indice) <-[Modulo de las licencias](#4-modulo-de-las-licencias) <-[Submodulo de tiempos](#42-submodulo-de-tiempos) <-[Control de procesos de desistimientos](#423-control-de-procesos-de-desistimientos)

Esta funcionalidad esta en rediseño y se recomienda no usarla.

***