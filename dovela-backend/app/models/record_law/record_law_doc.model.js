module.exports = (sequelize, Sequelize) => {
    const Record_Law_Docs = sequelize.define("record_law_doc", {
      docs: {
        type: Sequelize.STRING,
      },
      docs_id6: {
        type: Sequelize.STRING,
      },
      docs_14: {
        type: Sequelize.STRING,
      },
      docs_14_id6: {
        type: Sequelize.STRING,
      },
      docs_14_desc: {
        type: Sequelize.STRING,
      },
      docs_16: {
        type: Sequelize.STRING,
      },
      docs_16_id6: {
        type: Sequelize.STRING,
      },
      docs_16_desc: {
        type: Sequelize.STRING,
      },
      docs_23: {
        type: Sequelize.STRING,
      },
      docs_sign: {
        type: Sequelize.STRING,
      },
      corrections: {
        type: Sequelize.STRING(2048),
      },
      doc_fun: {
        type: Sequelize.STRING,
      },
      version: {
        type: Sequelize.INTEGER,
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
  
    return Record_Law_Docs;
  };