module.exports = (sequelize, Sequelize) => {
    const FUN_6 = sequelize.define("fun_6", {
        date: {
            type: Sequelize.DATEONLY
        },
        description: {
            type: Sequelize.STRING(512),
        },
        active: {
            type: Sequelize.STRING,
        },
        pages: {
            type: Sequelize.INTEGER,
        },
        id_public: {
            type: Sequelize.STRING,
        },
        id_replace: {
            type: Sequelize.STRING
        },
        filename: {
            type: Sequelize.STRING
        },
        path: {
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

    return FUN_6;
};