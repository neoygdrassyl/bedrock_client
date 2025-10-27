module.exports = (sequelize, Sequelize) => {
    const Publications = sequelize.define("publications", {
      id_publico: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      detail: {
        type: Sequelize.STRING(1024),
      },
      subdetail: {
        type: Sequelize.STRING,
      },
      pdf_path: {
        type: Sequelize.STRING
      },
      type: {
        type: Sequelize.STRING
      },
      subtype: {
        type: Sequelize.STRING
      },
      publish: {
        type: Sequelize.BOOLEAN
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
  
    return Publications;
  };