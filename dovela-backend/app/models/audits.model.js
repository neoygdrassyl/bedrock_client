module.exports = (sequelize, Sequelize) => {
    const Audits = sequelize.define("audits", {
        event: {
          type: Sequelize.STRING
        },
        auditInfo: {
          type: Sequelize.JSON
        },
        userInfo: {
          type: Sequelize.JSON
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
      
      return Audits;
    };