module.exports = (sequelize, Sequelize) => {
    const Nomenclatures = sequelize.define("nomenclature", {
      id_public: {
        type: Sequelize.STRING,
      },
      name: {
        type: Sequelize.STRING,
      },
      surname: {
        type: Sequelize.STRING,
      },
      number_id: {
        type: Sequelize.STRING,
      },
      predial: {
        type: Sequelize.STRING,
      },
      matricula: {
        type: Sequelize.STRING,
      },
      address: {
        type: Sequelize.STRING
      },
      type: {
        type: Sequelize.STRING
      },
      date_start: {
        type: Sequelize.DATEONLY,
      },
      date_end: {
        type: Sequelize.DATEONLY,
      },
      details: {
        type: Sequelize.STRING(2048),
      },
      number: {
        type: Sequelize.STRING
      },
      recipe_office_id: {
        type: Sequelize.STRING
      },
      recipe_office_date: {
        type: Sequelize.DATEONLY,
      },
      recipe_county_id: {
        type: Sequelize.STRING
      },
      recipe_county_date: {
        type: Sequelize.DATEONLY,
      },
      neighbour: {
        type: Sequelize.STRING
      },
      note: {
        type: Sequelize.STRING(1064),
      },
      use: {
        type: Sequelize.STRING
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
  
    return Nomenclatures;
  };