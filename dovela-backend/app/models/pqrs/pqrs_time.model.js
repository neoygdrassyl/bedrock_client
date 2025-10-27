module.exports = (sequelize, Sequelize) => {
    const PQRS_Time = sequelize.define("pqrs_time", {
        time: {
            type: Sequelize.INTEGER,
        },
        creation: {
            type: Sequelize.STRING
        },
        legal: {
            type: Sequelize.DATEONLY,
        },
        reply_formal: {
            type: Sequelize.DATEONLY,
        },
        correspondency_date: {
            type: Sequelize.DATEONLY,
        },
        archive_date: {
            type: Sequelize.DATEONLY,
        },
        reply_doc_date: {
            type: Sequelize.DATEONLY,
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

    return PQRS_Time;
};