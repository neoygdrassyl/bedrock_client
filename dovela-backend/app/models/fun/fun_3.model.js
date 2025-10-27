module.exports = (sequelize, Sequelize) => {
    const FUN_3 = sequelize.define("fun_3", {
        direccion_1: {
            type: Sequelize.STRING
        },
        direccion_2: {
            type: Sequelize.STRING,
        },
        active: {
            type: Sequelize.STRING,
        },
        extra: {
            type: Sequelize.BOOLEAN
        },
        alerted: {
            type: Sequelize.DATEONLY
        },
        id_alerted: {
            type: Sequelize.STRING
        },
        id_6: {
            type: Sequelize.INTEGER,
        },
        state: {
            type: Sequelize.INTEGER,
        },
        part: {
            type: Sequelize.STRING,
        },
        part_id: {
            type: Sequelize.STRING,
        },
        alters_info: {
            type: Sequelize.STRING
        },
        id_cub: {
            type: Sequelize.STRING,
        },
        id6_cub: {
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

    return FUN_3;
};