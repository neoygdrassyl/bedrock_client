module.exports = (sequelize, Sequelize) => {
    const FUN_R = sequelize.define("fun_r", {
        version: {
            type: Sequelize.INTEGER
        },
        checked: {
            type: Sequelize.STRING(1024),
        },
        code: {
            type: Sequelize.STRING(1024),
        },
        review: {
            type: Sequelize.STRING(1024),
        },
        id6: {
            type: Sequelize.STRING(1024),
        },
        check_control: {
            type: Sequelize.STRING(1024),
        },
        check_control_pages: {
            type: Sequelize.STRING(1024),
        },
        check_control_inventory: {
            type: Sequelize.JSON,
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

    return FUN_R;
};