module.exports = (sequelize, Sequelize) => {
  const FUN_ARCHIVE = sequelize.define("fun_archive", {
    box: {
      type: Sequelize.INTEGER
    },
    row: {
      type: Sequelize.INTEGER
    },
    column: {
      type: Sequelize.INTEGER
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

  return FUN_ARCHIVE;
};