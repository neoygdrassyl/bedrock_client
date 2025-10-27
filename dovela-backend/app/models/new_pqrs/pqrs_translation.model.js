module.exports = (sequelize, Sequelize) => {
    const PQRS_New_Translation = sequelize.define("new_pqrs_translation", {
      entity: {
        type: Sequelize.STRING,
      },
      officer: {
        type: Sequelize.STRING,
      },
      charge: {
        type: Sequelize.STRING,
      },
      email_transfer: {
        type: Sequelize.STRING,
      },
      reason : {
        type: Sequelize.TEXT,
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
  
    return PQRS_New_Translation;
  };