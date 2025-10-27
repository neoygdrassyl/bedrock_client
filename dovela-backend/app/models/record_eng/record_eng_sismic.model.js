module.exports = (sequelize, Sequelize) => {
    const Record_Eng_Sismic = sequelize.define("record_eng_sismic", {
        name: {
            type: Sequelize.STRING,
        },
        height: {
            type: Sequelize.STRING,
        },
        area: {
            type: Sequelize.STRING,
        },
        esca: {
            type: Sequelize.STRING,
        },
        pos: {
            type: Sequelize.INTEGER,
        },
        denplac: {
            type: Sequelize.STRING,
        },
        viga: {
            type: Sequelize.STRING,
        },
        column: {
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

    return Record_Eng_Sismic;
};