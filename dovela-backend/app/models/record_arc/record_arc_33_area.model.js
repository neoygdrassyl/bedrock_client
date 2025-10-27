module.exports = (sequelize, Sequelize) => {
    const Record_Arc_33_Area = sequelize.define("record_arc_33_area", {
      id_public: {
        type: Sequelize.STRING,
      },
      floor: {
        type: Sequelize.STRING,
      },
      level: {
        type: Sequelize.STRING,
      },
      scale: {
        type: Sequelize.STRING,
      },
      type: {
        type: Sequelize.STRING,
      },
      build: {
        type: Sequelize.STRING,
      },
      destroy: {
        type: Sequelize.STRING,
      },
      use: {
        type: Sequelize.STRING,
      },
      category: {
        type: Sequelize.STRING,
      },
      active: {
        type: Sequelize.BOOLEAN,
      },
      id6_blueprint: {
        type: Sequelize.STRING,
      },
      historic: {
        type: Sequelize.STRING,
      },
      historic_areas: {
        type: Sequelize.STRING,
      },
      units: {
        type: Sequelize.STRING,
      },
      units_a: {
        type: Sequelize.STRING,
      },
      use_desc: {
        type: Sequelize.STRING,
      },
      pos: {
        type: Sequelize.INTEGER,
      },
      empate: {
        type: Sequelize.STRING,
      },
      empate_h: {
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
  
    return Record_Arc_33_Area;
  };