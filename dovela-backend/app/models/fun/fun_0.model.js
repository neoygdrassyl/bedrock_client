module.exports = (sequelize, Sequelize) => {
    const FUN_0 = sequelize.define("fun_0", {
        version: {
          type: Sequelize.INTEGER
        },
        state: {
          type: Sequelize.INTEGER
        },
        id_public: {
          type: Sequelize.STRING
        },
        id_pqrs: {
          type: Sequelize.INTEGER
        },
        date: {
          type: Sequelize.DATEONLY
        },
        id_payment: {
          type: Sequelize.STRING
        },
        type: {
          type: Sequelize.STRING
        },
        model: {
          type: Sequelize.STRING
        },
        tags: {
          type: Sequelize.STRING
        },
        rules: {
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
      
      return FUN_0;
    };