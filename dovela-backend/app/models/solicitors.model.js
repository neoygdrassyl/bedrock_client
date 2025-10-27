module.exports = (sequelize, Sequelize) => {
  const Solicitors = sequelize.define("solicitors", {
    // id: {
    //   type: Sequelize.STRING,
    //   allowNull: false,
    //   unique: true,
    //   primaryKey: true,
    // },
    id_doc: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    document_type: {
      type: Sequelize.STRING
    },
    name: {
      type: Sequelize.STRING
    },
    person_type: {
      type: Sequelize.STRING
    },
    creationTime: {
      type: 'TIMESTAMP(0)',
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    role: {
      type: Sequelize.STRING
    },
    email: {
      type: Sequelize.STRING
    },
    phone: {
      type: Sequelize.STRING
    },
    department: {
      type: Sequelize.STRING
    },
    town: {
      type: Sequelize.STRING
    },
    neighborhood: {
      type: Sequelize.STRING
    },
    address: {
      type: Sequelize.STRING
    },
  });

  return Solicitors;
};