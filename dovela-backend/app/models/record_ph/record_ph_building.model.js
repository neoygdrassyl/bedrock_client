module.exports = (sequelize, Sequelize) => {
    const Record_Ph_Building = sequelize.define("record_ph_building", {
        number: {
            type: Sequelize.STRING,
        },
        predial: {
            type: Sequelize.STRING,
        },
        matricula: {
            type: Sequelize.STRING,
        },
        nomenclature: {
            type: Sequelize.STRING,
        },
        area: {
            type: Sequelize.STRING,
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

    return Record_Ph_Building;
};