module.exports = (sequelize, Sequelize) => {
    const PQRS_New_Petitioners = sequelize.define("new_pqrs_petitioners", {
      name: {
        type: Sequelize.STRING,
      },
      document_type: {
        type: Sequelize.STRING,
      },
      document_number: {
        type: Sequelize.STRING,
      },
      phone: {
        type: Sequelize.STRING,
      },
      email: {
        type: Sequelize.STRING,
      },
      address: {
        type: Sequelize.STRING,
      },
      legally_identified: {
        type: Sequelize.BOOLEAN,
      },
      anonymous : {
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
  
    return PQRS_New_Petitioners;
  };