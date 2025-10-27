module.exports = (sequelize, Sequelize) => {
    const Record_Arc_38 = sequelize.define("record_arc_38", {
        detail: {
            type: Sequelize.STRING(8192),
        },
        worker_id: {
            type: Sequelize.INTEGER,
        },
        worker_name: {
            type: Sequelize.STRING,
        },
        date: {
            type: Sequelize.DATEONLY,
        },
        notify_name: {
            type: Sequelize.STRING,
        },
        notify_id: {
            type: Sequelize.STRING,
        },
        notify_date: {
            type: Sequelize.STRING,
        },
        check: {
            type: Sequelize.INTEGER,
        },
        version: {
            type: Sequelize.INTEGER,
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

    return Record_Arc_38;
};