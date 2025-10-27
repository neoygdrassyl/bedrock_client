module.exports = (sequelize, Sequelize) => {
    const PQRS_Info = sequelize.define("pqrs_info", {
        radication_channel: {
            type: Sequelize.STRING,
        },
        reply: {
            type: Sequelize.TEXT,
        },
        history: {
            type: Sequelize.TEXT,
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

    return PQRS_Info;
};