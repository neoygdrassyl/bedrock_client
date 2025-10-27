module.exports = (sequelize, Sequelize) => {
    const PQRS_New_Master = sequelize.define("new_pqrs_master", {
      id_public: {
        type: Sequelize.STRING,
      },
      status: {
        type: Sequelize.STRING,
      },
      desc: {
        type: Sequelize.TEXT,
      },
      petition: {
        type: Sequelize.TEXT,
      },
      worker_creator: {
        type: Sequelize.STRING,
      },
      creation_date : {
        type: Sequelize.DATEONLY,
      },
      canalIngreso : {
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
  
    return PQRS_New_Master;
  };