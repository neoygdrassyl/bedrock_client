module.exports = (sequelize, Sequelize) => {
    const FUN_52 = sequelize.define("fun_52", {
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
            type: Sequelize.STRING(1024),
        },
        email: {
            type: Sequelize.STRING,
        },
        number: {
            type: Sequelize.STRING,
        },
        registration: {
            type: Sequelize.STRING,
        },
        registration_date: {
            type: Sequelize.DATEONLY,
        },
        supervision: {
            type: Sequelize.STRING,
        },
        expirience: {
            type: Sequelize.INTEGER,
        },
        sanction: {
            type: Sequelize.BOOLEAN,
        },
        docs: {
            type: Sequelize.STRING,
        },
        check: {
            type: Sequelize.STRING,
        },
        active: {
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

    return FUN_52;
};