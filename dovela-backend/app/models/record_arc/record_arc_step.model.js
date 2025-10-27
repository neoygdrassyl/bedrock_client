module.exports = (sequelize, Sequelize) => {
    const Record_Arc_Step = sequelize.define("record_arc_step", {
        id_public: {
            type: Sequelize.STRING,
        },
        version: {
            type: Sequelize.INTEGER,
        },
        check: {
            type: Sequelize.STRING,
        },
        value: {
            type: Sequelize.TEXT,
        },
        json: {
            type: Sequelize.JSON,
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

    return Record_Arc_Step;
};