module.exports = (sequelize, Sequelize) => {
    const Exp_Area = sequelize.define("exp_area", {
      area: {
        type: Sequelize.DOUBLE,
      },
      units: {
        type: Sequelize.INTEGER,
      },
      charge: {
        type: Sequelize.DOUBLE,
      },
      use: {
        type: Sequelize.STRING,
      },
      desc: {
        type: Sequelize.STRING,
      },
      payment: {
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
  
    return Exp_Area;
  };