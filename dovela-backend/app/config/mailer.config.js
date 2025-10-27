module.exports = { 
    "transporter" :{
        "host": process.env.TRANSPORTER_HOST,
        "port":  process.env.TRANSPORTER_PORT,
        "secure": process.env.TRANSPORTER_SECURE,
        "auth": {
            "user": process.env.TRANSPORTER_USER,
            "pass": process.env.TRANSPORTER_PASSWORD,
        }
    },
    "mailOptions" : {
        "pqrs" :{
            "from": "'Curaduria Urbana N° 1 de Bucaramanga' <curaduria1bucaramanga@gmail.com>",
            "to": null,
            "subject": "Confirmacion PQRS",
            "html": null
        },
        "pqrs_extension" :{
            "from": "'Curaduria Urbana N° 1 de Bucaramanga' <curaduria1bucaramanga@gmail.com>",
            "to": null,
            "subject": "Extension de su solicitud"
        },
        "pqrs_reply" :{
            "from": "'Curaduria Urbana N° 1 de Bucaramanga' <curaduria1bucaramanga@gmail.com>",
            "to": null,
            "html": "<p>Gracias por comunicarse con nosotros, Este es un mensaje expedido automaticamente por el sistema de la Curduria Urana N° 1 de Bucaramanga. Con respecto a su Solicitud.</p>",
            "subject": "Respuesta a su Peticion",
            "attachments": [{
                "filename": "Respuesta_Peticion.pdf",
                "path": null
            }]
        },
        "scheduling" : {
            "from": "'Curaduria Urbana N° 1 de Bucaramanga' <curaduria1bucaramanga@gmail.com>",
            "to": null,
            "subject": "Confirmación de Cita",
            "html": null
        },
        "mailbox" : {
            "from": "'Curaduria Urbana N° 1 de Bucaramanga' <curaduria1bucaramanga@gmail.com>",
            "to": null,
            "subject": "Contacto con la Curaduria N°1 de Bucaramanga",
            "html": "<p>Gracias por contactar con nosotros, nuestros funcionarios se encargarán de atender sus dudas y necesidades en el horario laboral más próximo.</p>"
        },
        "mailbox_worker" : {
            "from": "'Curaduria Urbana N° 1 de Bucaramanga' <curaduria1bucaramanga@gmail.com>",
            "to": null,
            "subject": "Contacto con la Curaduria",
            "html": null
        },
        "generic" : {
            "from": "'Curaduria Urbana N° 1 de Bucaramanga' <curaduria1bucaramanga@gmail.com>",
            "to": null,
            "subject": null,
            "html": null
        }
    }
}