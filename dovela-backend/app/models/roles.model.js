module.exports = (sequelize, Sequelize) => {
    const Roles = sequelize.define("roles", {
      name: {
        type: Sequelize.STRING
      },
      desc: {
        type: Sequelize.STRING
      },
      short: {
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
  
    return Roles;
  };