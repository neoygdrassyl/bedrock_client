module.exports = (sequelize, Sequelize) => {
    const NormPerfils = sequelize.define("norm_perfils", {
        code: {
            type: Sequelize.STRING
        },
        perfil: {
            type: Sequelize.STRING
        },
        card: {
            type: Sequelize.STRING
        },
        antejardin_n: {
            type: Sequelize.DOUBLE
        },
        antejardin_p: {
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

    return NormPerfils;
};