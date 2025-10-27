module.exports = (sequelize, Sequelize) => {
    const PQRS_Attach = sequelize.define("pqrs_attach", {
        name: {
            type: Sequelize.STRING
        },
        path: {
            type: Sequelize.STRING,
        },
        type: {
            type: Sequelize.STRING,
        },
        class: {
            type: Sequelize.STRING,
        },
        public_name: {
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

    return PQRS_Attach;
};