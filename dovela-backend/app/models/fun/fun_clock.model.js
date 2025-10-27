module.exports = (sequelize, Sequelize) => {
    const FUN_CLOCK = sequelize.define("fun_clock", {
        name: {
            type: Sequelize.STRING
        },
        desc: {
            type: Sequelize.STRING
        },
      
        date_start: {
            type: Sequelize.STRING
        },
        state: {
            type: Sequelize.INTEGER
        },
        version: {
            type: Sequelize.INTEGER
        },

        resolver_id6: {
            type: Sequelize.INTEGER
        },
        resolver_sattus: {
            type: Sequelize.INTEGER
        },
        resolver_context: {
            type: Sequelize.STRING
        },

        id_related: {
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

    return FUN_CLOCK;
};