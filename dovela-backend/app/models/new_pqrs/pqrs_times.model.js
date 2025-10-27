module.exports = (sequelize, Sequelize) => {
    const PQRS_New_Times = sequelize.define("new_pqrs_times", {
        action: {
            type: Sequelize.STRING,
        },
        repeat: {
            type: Sequelize.STRING,
        },
        directedTo: {
            type: Sequelize.STRING,
        },
        day_available: {
            type: Sequelize.STRING,
        },
        date_set: {
            type: Sequelize.DATEONLY,
        },
        useAction: {
            type: Sequelize.STRING,
        },
        cub: {
            type: Sequelize.STRING,
        },
        date_end: {
            type: Sequelize.DATEONLY,
        },
        day_end: {
            type : Sequelize.STRING,
        },
        isSentVerified: {
            type : Sequelize.BOOLEAN,
        },
        processIndicator: {
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

    return PQRS_New_Times;
};