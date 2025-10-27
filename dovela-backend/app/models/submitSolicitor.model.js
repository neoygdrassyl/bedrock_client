const db = require("../models");
// const Submit = db.submit;
// const Solicitors = db.solicitors;
module.exports = (sequelize, Sequelize) => {
  const SubmitSolicitor = sequelize.define("submitSolicitors", {
    // id: {
    //   type: Sequelize.STRING,
    //   allowNull: false,
    //   unique: true,
    //   primaryKey: true,
    // },
    // solicitor_id: {
    //   type: Sequelize.STRING,
    //   references: {
    //     model: Solicitors,
    //     key: "id"
    //   }
    // },
    // submit_id: {
    //   type: Sequelize.INTEGER,
    //   references: {
    //     model: Submit,
    //     key: "id"
    //   }
    // }
  });

  return SubmitSolicitor;
};


