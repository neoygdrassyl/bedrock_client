module.exports = (sequelize, Sequelize) => {
    const PQRS_Masters = sequelize.define("pqrs_masters", {
      id_publico: {
        type: Sequelize.STRING,
      },
      id_global: {
        type: Sequelize.STRING,
      },
      status: {
        type: Sequelize.INTEGER,
      },
      type: {
        type: Sequelize.STRING,
      },
      id_reply: {
        type: Sequelize.STRING,
      },
      id_confirm: {
        type: Sequelize.STRING,
      },
      id_correspondency: {
        type: Sequelize.STRING,
      },
      content: {
        type: Sequelize.STRING(2048),
      },
      category: {
        type: Sequelize.STRING,
      },
      worker_creator: {
        type: Sequelize.STRING,
      },
      keywords: {
        type: Sequelize.STRING,
      },
      action_review: {
        type: Sequelize.STRING(2048),
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
  
    return PQRS_Masters;
  };