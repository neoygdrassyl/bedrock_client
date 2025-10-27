module.exports = (sequelize, Sequelize) => {
    const Record_Law_Licence = sequelize.define("record_law_licence", {
      id_public: {
        type: Sequelize.STRING,
      },
      type: {
        type: Sequelize.STRING,
      },
      id_6: {
        type: Sequelize.INTEGER,
      },
      category: {
        type: Sequelize.STRING,
      },
      date_a: {
        type: Sequelize.DATEONLY,
      },
      date_b: {
        type: Sequelize.DATEONLY,
      },
      check: {
        type: Sequelize.INTEGER,
      },
      active: {
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
  
    return Record_Law_Licence;
  };