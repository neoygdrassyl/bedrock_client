module.exports = (sequelize, Sequelize) => {
  const Record_Law_Gen = sequelize.define("record_law_gen", {
    date: {
      type: Sequelize.STRING,
    },
    id_public: {
      type: Sequelize.STRING,
    },
    type: {
      type: Sequelize.STRING,
    },
    id_6: {
      type: Sequelize.INTEGER,
    },
    class: {
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

  return Record_Law_Gen;
};