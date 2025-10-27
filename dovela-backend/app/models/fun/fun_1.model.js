module.exports = (sequelize, Sequelize) => {
    const FUN_1 = sequelize.define("fun_1", {
        version: {
            type: Sequelize.INTEGER
        },
        tipo: {
            type: Sequelize.STRING
        },
        tramite: {
            type: Sequelize.STRING
        },
        m_urb: {
            type: Sequelize.STRING
        },
        m_sub: {
            type: Sequelize.STRING
        },
        m_lic: {
            type: Sequelize.STRING
        },
        usos: {
            type: Sequelize.STRING
        },
        area: {
            type: Sequelize.STRING
        },
        vivienda: {
            type: Sequelize.STRING
        },
        cultural: {
            type: Sequelize.STRING
        },
        regla_1: {
            type: Sequelize.STRING
        },
        regla_2: {
            type: Sequelize.STRING
        },
        anex1: {
            type: Sequelize.STRING
        },
        anex2: {
            type: Sequelize.JSON
        },
        anex3: {
            type: Sequelize.STRING
        },
        description: {
            type: Sequelize.STRING(2048),
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

    return FUN_1;
};