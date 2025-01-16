export const getManagementSteps = () => {
    return [
        {
            paso: '1.', actividades: [
                'Recepción diaria por lo canales autorizados. Verificación',
                'Creación de la PQRS en dovela y generación de VR',
                'Digitalización de documentos'
            ]
        },
        {
            paso: '2.', actividades: [
                'Direccionamiento',
                'Clasificación y asignación de términos',
                'Asignación de responsables CUB1 para apoyar respuesta',
                'a. Verificación en base de datos de CUB1',
                'b. Aspectos jurídicos',
                'c. Aspecto arquitectónico'
            ]
        },
        {
            paso: '3', actividades: [
                'Preparación de respuesta',
                'Inventario de anexos a entregar: Digital y Análogo.',
                'Envío respuesta por canal autorizado'
            ]
        },
        {
            paso: '4.', actividades: [
                'Digitalización de la respuesta',
                'Cierre de la solicitud',
                'Verificación en Comité de PQRS'
            ]
        }
    ]
}