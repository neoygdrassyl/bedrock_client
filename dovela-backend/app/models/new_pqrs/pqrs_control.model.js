module.exports = (sequelize, Sequelize) => {
    const PQRS_New_Control= sequelize.define("new_pqrs_control", {
      activity: {
        type: Sequelize.STRING,
      },
      responsable: {
        type: Sequelize.STRING,
      },
      responsable_2: {
        type: Sequelize.STRING,
      },
      init_time: {
        type: Sequelize.DATEONLY,
      },
      time_1 : {
        type: Sequelize.DATEONLY,
      },
      final_time : {
        type: Sequelize.DATEONLY,
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
  
    return PQRS_New_Control;
  };