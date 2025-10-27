module.exports = (sequelize, Sequelize) => {
  const Record_Arc_35_Location = sequelize.define("record_arc_35_location", {
    floor: {
      type: Sequelize.STRING,
    },
    diensions: {
      type: Sequelize.STRING,
    },
    check: {
      type: Sequelize.INTEGER,
    },
    active: {
      type: Sequelize.BOOLEAN,
    },
    pos: {
      type: Sequelize.INTEGER,
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

  return Record_Arc_35_Location;
};