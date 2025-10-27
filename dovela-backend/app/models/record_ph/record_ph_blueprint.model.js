module.exports = (sequelize, Sequelize) => {
    const Record_Ph_Blueprint = sequelize.define("record_ph_blueprint", {
        id_public: {
            type: Sequelize.STRING,
        },
        floor: {
            type: Sequelize.STRING,
        },
        area: {
            type: Sequelize.STRING,
        },
        units: {
            type: Sequelize.STRING,
        },
        units_other: {
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

    return Record_Ph_Blueprint;
};