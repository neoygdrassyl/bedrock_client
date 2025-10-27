module.exports = (sequelize, Sequelize) => {
    const FUN_6_H = sequelize.define("fun_6_h", {
        date: {
            type: Sequelize.DATEONLY
        },
        state: {
            type: Sequelize.INTEGER
        },
        detail: {
            type: Sequelize.STRING
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

    return FUN_6_H;
};