module.exports = (sequelize, Sequelize) => {
    const PROCESS_X_ARCHIVE = sequelize.define("process_x_archive", {
      folder: {
        type: Sequelize.INTEGER
      },
      pages: {
        type: Sequelize.INTEGER
      },  
      json: {
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
      
      return PROCESS_X_ARCHIVE;
    };