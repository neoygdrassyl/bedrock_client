module.exports = (sequelize, Sequelize) => {
    const FUN_4 = sequelize.define("fun_4", {
        coord: {
            type: Sequelize.STRING
        },
        longitud: {
            type: Sequelize.STRING,
        },
        colinda: {
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

    return FUN_4;
};