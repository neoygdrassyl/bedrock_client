module.exports = (sequelize, Sequelize) => {
    const Pqrs_Step = sequelize.define("pqrs_step", {
        id_public: {
            type: Sequelize.STRING,
        },
        name: {
            type: Sequelize.STRING,
        },
        desc: {
            type: Sequelize.STRING,
        },
        check: {
            type: Sequelize.STRING,
        },
        value: {
            type: Sequelize.TEXT,
        },
        json: {
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

    return Pqrs_Step;
};