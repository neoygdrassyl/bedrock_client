module.exports = (sequelize, Sequelize) => {
  const FUN_C = sequelize.define("fun_c", {
    version: {
      type: Sequelize.INTEGER
    },
    date: {
      type: Sequelize.DATEONLY
    },
    condition: {
      type: Sequelize.BOOLEAN
    },
    worker: {
      type: Sequelize.STRING
    },
    reciever_name: {
      type: Sequelize.STRING
    },
    reciever_date: {
      type: Sequelize.DATEONLY
    },
    legal_date: {
      type: Sequelize.DATEONLY
    },
    reciever_id: {
      type: Sequelize.STRING
    },
    reciever_actor: {
      type: Sequelize.STRING
    },
    details: {
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

  return FUN_C;
};