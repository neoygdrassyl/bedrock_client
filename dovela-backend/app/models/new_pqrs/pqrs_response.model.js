module.exports = (sequelize, Sequelize) => {
    const PQRS_New_Responses = sequelize.define("new_pqrs_responses", {
        response_curator: {
            type: Sequelize.STRING,
        },
        response_legal: {
            type: Sequelize.STRING,
        },
        response_arquitecture: {
            type: Sequelize.STRING,
        },
        response_structure: {
            type: Sequelize.STRING,
        },
        response_archive: {
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

    return PQRS_New_Responses;
};