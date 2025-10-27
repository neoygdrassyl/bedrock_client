module.exports = (sequelize, Sequelize) => {
    const Mailbox = sequelize.define("mailbox", {
        name: {
          type: Sequelize.STRING
        },
        email: {
          type: Sequelize.STRING
        },
        number: {
          type: Sequelize.STRING
        },
        subject: {
          type: Sequelize.STRING
        },
        message: {
          type: Sequelize.STRING
        },
        worker: {
          type: Sequelize.STRING
        },
        sate: {
          type: Sequelize.BOOLEAN
        },
        date_resolve: {
          type: Sequelize.DATEONLY
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
      
      return Mailbox;
    };