module.exports = (sequelize, Sequelize) => {
    const PQRS_New_Clasification = sequelize.define("new_pqrs_clasification", {
      petition_type: {
        type: Sequelize.STRING,
      },
      modality: {
        type: Sequelize.STRING,
      },
      aforegoing: {
        type: Sequelize.BOOLEAN,
      },
      id_related : {
        type: Sequelize.STRING,
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
  
    return PQRS_New_Clasification;
  };