module.exports = (sequelize, Sequelize) => {
    const CERTIFICATION = sequelize.define("certification", {
        id_public: {
          type: Sequelize.STRING
        },
        description: {
          type: Sequelize.STRING
        },
        content: {
          type: Sequelize.JSON
        },
        id_related: {
          type: Sequelize.STRING
        },
        related: {
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
      
      return CERTIFICATION;
    };