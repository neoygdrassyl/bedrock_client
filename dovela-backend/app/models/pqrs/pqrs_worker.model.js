module.exports = (sequelize, Sequelize) => {
    const PQRS_Worker = sequelize.define("pqrs_worker", {
        name: {
            type: Sequelize.STRING,
        },
        competence: {
            type: Sequelize.STRING
        },
        date_reply: {
            type: Sequelize.DATEONLY,
        },
        reply: {
            type: Sequelize.TEXT,
        },
        asign: {
            type: Sequelize.DATEONLY,
        },
        roleId: {
            type: Sequelize.INTEGER,
        },
        worker_id: {
            type: Sequelize.INTEGER,
        },
        sent_email_notify: {
            type: Sequelize.DATEONLY,
        },
        feedback: {
            type: Sequelize.INTEGER,
        },
        feedback_argument: {
            type: Sequelize.STRING(1024),
        },
        feedback_date: {
            type:  Sequelize.DATEONLY,
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

    return PQRS_Worker;
};