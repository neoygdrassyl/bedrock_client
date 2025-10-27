module.exports = (sequelize, Sequelize) => {
    const NormPerfilElements = sequelize.define("norm_perfil_elements", {
        element: {
            type: Sequelize.STRING
        },
        dimension_n: {
            type: Sequelize.DOUBLE
        },
        dimension_p: {
            type: Sequelize.DOUBLE
        },
        createdAt: {
            type: 'TIMESTAMP(0)',
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updatedAt: {
            type: 'TIMESTAMP(0)',
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
    });

    return NormPerfilElements;
};