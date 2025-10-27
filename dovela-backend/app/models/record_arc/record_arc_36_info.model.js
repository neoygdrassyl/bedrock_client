module.exports = (sequelize, Sequelize) => {
    const Record_Arc_36_Info = sequelize.define("record_arc_36_info", {
      name: {
        type: Sequelize.STRING,
      },
      parent: {
        type: Sequelize.STRING,
      },
      norm: {
        type: Sequelize.STRING,
      },
      project: {
        type: Sequelize.STRING,
      },
      check: {
        type: Sequelize.STRING,
      },
      active: {
        type: Sequelize.BOOLEAN,
      },
      address: {
        type: Sequelize.STRING,
      },
      side: {
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
  
    return Record_Arc_36_Info;
  };