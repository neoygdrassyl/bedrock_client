module.exports = (sequelize, Sequelize) => {
  const Record_Arc_34_K = sequelize.define("record_arc_34_k", {
    name: {
      type: Sequelize.STRING,
    },
    index: {
      type: Sequelize.STRING,
    },
    norm: {
      type: Sequelize.STRING,
    },
    proyect: {
      type: Sequelize.STRING,
    },
    type: {
      type: Sequelize.STRING,
    },
    check: {
      type: Sequelize.STRING
    },
    active: {
      type: Sequelize.BOOLEAN,
    },
    exception: {
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

  return Record_Arc_34_K;
};