module.exports = (sequelize, Sequelize) => {
    const PQRS_Solicitor = sequelize.define("pqrs_solocitor", {
        type: {
            type: Sequelize.STRING,
        },
        name: {
            type: Sequelize.STRING
        },
        type_id: {
            type: Sequelize.STRING,
        },
        id_number: {
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

    return PQRS_Solicitor;
};