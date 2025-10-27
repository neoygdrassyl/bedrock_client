module.exports = (sequelize, Sequelize) => {
    const Record_Arc_37 = sequelize.define("record_arc_37", {
      name: {
        type: Sequelize.STRING,
      },
      main_group: {
        type: Sequelize.STRING,
      },
      sub_group: {
        type: Sequelize.STRING,
      },
      index: {
        type: Sequelize.STRING,
      },
      anet: {
        type: Sequelize.STRING,
      },
      real: {
        type: Sequelize.STRING,
      },
      check: {
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
  
    return Record_Arc_37;
  };