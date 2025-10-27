module.exports = (sequelize, Sequelize) => {
    const Record_Law_11_Liberty = sequelize.define("record_law_11_liberty", {
      id_public: {
        type: Sequelize.STRING,
      },
      date: {
        type: Sequelize.DATEONLY,
      },
      predial: {
        type: Sequelize.STRING,
      },
      predial_2: {
        type: Sequelize.STRING,
      },
      address: {
        type: Sequelize.STRING(512),
      },
      boundary: {
        type: Sequelize.STRING,
      },
      lastnotify: {
        type: Sequelize.STRING,
      },
      specify: {
        type: Sequelize.STRING,
      },
      subject: {
        type: Sequelize.STRING,
      },
      subject_id: {
        type: Sequelize.STRING,
      },
      desc: {
        type: Sequelize.STRING,
      },
      active: {
        type: Sequelize.INTEGER,
      },
      id_6: {
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
  
    return Record_Law_11_Liberty;
  };