module.exports = (sequelize, Sequelize) => {
    const PQRS_New_Evaluation= sequelize.define("new_pqrs_evaluation", {
      formal0: {
        type: Sequelize.BOOLEAN,
      },
      formal1: {
        type: Sequelize.BOOLEAN,
      },
      formal2: {
        type: Sequelize.BOOLEAN,
      },
      formal3: {
        type: Sequelize.BOOLEAN,
      },
      formal4: {
        type: Sequelize.BOOLEAN,
      },
      formal5: {
        type: Sequelize.BOOLEAN,
      },
      competence0: {
        type: Sequelize.BOOLEAN,
      },
      competence1: {
        type: Sequelize.BOOLEAN,
      },
      competence2: {
        type: Sequelize.BOOLEAN,
      },
      otherEntities: {
        type: Sequelize.BOOLEAN,
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
  
    return PQRS_New_Evaluation;
  };