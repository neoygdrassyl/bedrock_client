module.exports = (sequelize, Sequelize) => {
    const PQRS_Law = sequelize.define("pqrs_law", {
        extension: {
            type: Sequelize.BOOLEAN,
        },
        extension_reason: {
            type: Sequelize.STRING(2048),
        },
        extension_date: {
            type: Sequelize.DATEONLY,
        },
        restart_id: {
            type: Sequelize.STRING,
        },
        restart_reason: {
            type: Sequelize.STRING(2048),
        },
        translation: {
            type: Sequelize.STRING,
        },
        sent_email_confirmation: {
            type: Sequelize.BOOLEAN,
        },
        sent_email_reply: {
            type: Sequelize.BOOLEAN,
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

    return PQRS_Law;
};