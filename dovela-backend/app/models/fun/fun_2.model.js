module.exports = (sequelize, Sequelize) => {
    const FUN_2 = sequelize.define("fun_2", {
        direccion: {
            type: Sequelize.STRING(512),
        },
        direccion_ant: {
            type: Sequelize.STRING(512),
        },
        matricula: {
            type: Sequelize.STRING
        },
        catastral: {
            type: Sequelize.STRING
        },
        catastral_2: {
            type: Sequelize.STRING
        },
        suelo: {
            type: Sequelize.STRING
        },
        lote_pla: {
            type: Sequelize.STRING
        },
        barrio: {
            type: Sequelize.STRING
        },
        vereda: {
            type: Sequelize.STRING
        },
        comuna: {
            type: Sequelize.STRING
        },
        sector: {
            type: Sequelize.STRING
        },
        estrato: {
            type: Sequelize.STRING
        },
        corregimiento: {
            type: Sequelize.STRING
        },
        manzana: {
            type: Sequelize.STRING
        },
        lote: {
            type: Sequelize.STRING
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

    return FUN_2;
};