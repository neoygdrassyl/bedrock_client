module.exports = (sequelize, Sequelize) => {
    const Record_Arc_35_Parking = sequelize.define("record_arc_35_parking", {
      use: {
        type: Sequelize.STRING,
      },
      name: {
        type: Sequelize.STRING,
      },
      type: {
        type: Sequelize.STRING,
      },
      norm: {
        type: Sequelize.INTEGER,
      },
      project: {
        type: Sequelize.INTEGER,
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
  
    return Record_Arc_35_Parking;
  };