module.exports = (sequelize, Sequelize) => {
    const Templates = sequelize.define("templates", {
        template_name: {
          type: Sequelize.STRING
        },
        template_data: {
          type: Sequelize.TEXT
        },
        template_type: {
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
      
      return Templates;
    };