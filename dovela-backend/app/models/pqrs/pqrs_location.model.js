module.exports = (sequelize, Sequelize) => {
    const PQRS_Location = sequelize.define("pqrs_location", {
        folder: {
            type: Sequelize.STRING,
        },
        pages: {
            type: Sequelize.STRING
        },
        box: {
            type: Sequelize.STRING,
        },
        row: {
            type: Sequelize.STRING,
        },
        concervation: {
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

    return PQRS_Location;
};