module.exports = (sequelize, Sequelize) => {
    const Submit = sequelize.define("submit", {
      // id:{
      //   type: Sequelize.INTEGER,
      //   autoIncrement: true,
      //   primaryKey: true,
      //   allowNull: false,
      //   unique: true,
      // },
      id_public: {
        type: Sequelize.STRING,
      },
      id_related: {
        type: Sequelize.STRING,
      },
      type: {
        type: Sequelize.STRING,
      },
      date: {
        type: Sequelize.DATEONLY,
      },
      time: {
        type: Sequelize.STRING,
      },
      owner: {
        type: Sequelize.STRING,
      },
      worker_reciever: {
        type: Sequelize.STRING,
      },
      worker_id: {
        type: Sequelize.INTEGER,
      },
      name_retriever: {
        type: Sequelize.STRING
      },
      id_number_retriever: {
        type: Sequelize.STRING
      },
      details: {
        type: Sequelize.STRING(2048),
      },
      list_type: {
        type: Sequelize.INTEGER,
      },
      list_type_str: {
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
  
    return Submit;
  };