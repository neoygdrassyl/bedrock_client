module.exports = (sequelize, Sequelize) => {
    const Record_Law_11_Tax = sequelize.define("record_law_11_tax", {
      id_public: {
        type: Sequelize.STRING,
      },
      date: {
        type: Sequelize.DATEONLY,
      },
      address: {
        type: Sequelize.STRING(512),
      },
      predial: {
        type: Sequelize.STRING,
      },
      predial_2: {
        type: Sequelize.STRING,
      },
      strata: {
        type: Sequelize.STRING,
      },
      destiny: {
        type: Sequelize.STRING,
      },
      active: {
        type: Sequelize.INTEGER,
      },
      id_6: {
        type: Sequelize.INTEGER,
      },
      type: {
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
  
    return Record_Law_11_Tax;
  };