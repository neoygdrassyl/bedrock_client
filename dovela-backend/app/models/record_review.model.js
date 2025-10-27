module.exports = (sequelize, Sequelize) => {
    const Record_Review = sequelize.define("record_review", {
      id_public: {
        type: Sequelize.STRING,
      },
      check: {
        type: Sequelize.INTEGER,
      },
      date: {
        type: Sequelize.DATEONLY,
      },
      check_2: {
        type: Sequelize.INTEGER,
      },
      date_2: {
        type: Sequelize.DATEONLY,
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
  
    return Record_Review;
  };