module.exports = (sequelize, Sequelize) => {
  const Users = sequelize.define("users", {
      name: {
        type: Sequelize.STRING
      },
      name_2: {
        type: Sequelize.STRING
      },
      surname: {
        type: Sequelize.STRING
      },
      surname_2: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      number: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING
      },
      active: {
        type: Sequelize.BOOLEAN
      },
      signature_name: {
        type: Sequelize.STRING
      },
      registration: {
        type: Sequelize.STRING
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
    
    return Users;
  };