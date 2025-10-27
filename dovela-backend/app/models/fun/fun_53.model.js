module.exports = (sequelize, Sequelize) => {
    const FUN_53 = sequelize.define("fun_53", {
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
        role: {
            type: Sequelize.STRING,
        },
        email: {
            type: Sequelize.STRING,
        },
        address: {
            type: Sequelize.STRING,
        },
        number: {
            type: Sequelize.STRING,
        },
        docs: {
            type: Sequelize.STRING,
        },
        check: {
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

    return FUN_53;
};