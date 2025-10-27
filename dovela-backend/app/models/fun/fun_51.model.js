module.exports = (sequelize, Sequelize) => {
    const FUN_51 = sequelize.define("fun_51", {
        version: {
            type: Sequelize.INTEGER
        },
        name: {
            type: Sequelize.STRING,
        },
        surname: {
            type: Sequelize.STRING,
        },
        id_number: {
            type: Sequelize.STRING,
        },
        nunber: {
            type: Sequelize.STRING,
        },
        email: {
            type: Sequelize.STRING,
        },
        active: {
            type: Sequelize.STRING,
        },
        docs: {
            type: Sequelize.STRING,
        },
        check: {
            type: Sequelize.STRING,
        },
        role: {
            type: Sequelize.STRING,
        },
        type: {
            type: Sequelize.STRING,
        },
        rep_name: {
            type: Sequelize.STRING,
        },
        rep_id_number: {
            type: Sequelize.STRING,
        },
        notificate: {
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

    return FUN_51;
};