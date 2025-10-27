module.exports = (sequelize, Sequelize) => {
    const Expeditions = sequelize.define("expeditions", {
      id_public: {
        type: Sequelize.STRING,
      },
      date: {
        type: Sequelize.DATEONLY,
      },
      date2: {
        type: Sequelize.DATEONLY,
      },
      tmp: {
        type: Sequelize.JSON,
      },
      taxes: {
        type: Sequelize.JSON,
      },
      duty: {
        type: Sequelize.JSON,
      },
      reso: {
        type: Sequelize.JSON,
      },
      cub1: {
        type: Sequelize.STRING,
      },
      cub2: {
        type: Sequelize.STRING,
      },
      control: {
        type: Sequelize.JSON,
      },
      cub3: {
        type: Sequelize.STRING,
      },
      cub3_json: {
        type: Sequelize.JSON,
      },
      model: {
        type: Sequelize.STRING,
      },
      model_des:{
        type: Sequelize.STRING,
      },
      model_exec:{
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
  
    return Expeditions;
  };