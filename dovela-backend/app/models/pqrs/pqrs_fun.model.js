module.exports = (sequelize, Sequelize) => {
    const PQRS_Fun = sequelize.define("pqrs_fun", {
        id_public: {
            type: Sequelize.STRING,
        },
        person: {
            type: Sequelize.STRING
        },
        catastral: {
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

    return PQRS_Fun;
};