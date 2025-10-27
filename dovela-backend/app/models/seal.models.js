module.exports = (sequelize, Sequelize) => {
    const Seals = sequelize.define("seals", {
      area: {
        type: Sequelize.DOUBLE
      },
      blueprints: {
        type: Sequelize.INTEGER
      },
      drives: {
        type: Sequelize.INTEGER
      },
      folders: {
        type: Sequelize.INTEGER
      },
      id_public: {
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
  
    return Seals;
  };