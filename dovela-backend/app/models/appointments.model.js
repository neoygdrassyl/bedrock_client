module.exports = (sequelize, Sequelize) => {
    const Appointments = sequelize.define("appointments", {
      name: {
        type: Sequelize.STRING,
      },
      type_id: {
        type: Sequelize.STRING,
      },
      number_id: {
        type: Sequelize.STRING,
      },
      profesional: {
        type: Sequelize.STRING,
      },
      profesional_id: {
        type: Sequelize.STRING,
      },
      email: {
        type: Sequelize.STRING
      },
      number_mobile: {
        type: Sequelize.STRING
      },
      date: {
        type: Sequelize.DATEONLY,
      },
      time: {
        type: Sequelize.STRING,
      },
      motive: {
        type: Sequelize.STRING,
      },
      content: {
        type: Sequelize.STRING(1024),
      },
      details: {
        type: Sequelize.STRING,
      },
      appointment_type: {
        type: Sequelize.BOOLEAN,
      },
      accesibility: {
        type: Sequelize.BOOLEAN,
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
  
    return Appointments;
  };