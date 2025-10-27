module.exports = (sequelize, Sequelize) => {
  const FUN_LAW = sequelize.define("fun_law", {
    sign: {
      type: Sequelize.STRING
    },
    new_type: {
      type: Sequelize.BOOLEAN
    },
    publish_neighbour: {
      type: Sequelize.INTEGER
    },
    id6payment: {
      type: Sequelize.INTEGER
    },
    planing_data: {
      type: Sequelize.STRING
    },
    report_data: {
      type: Sequelize.STRING
    },
    report_data_pdf: {
      type: Sequelize.JSON
    },
    report_cub: {
      type: Sequelize.STRING
    },
    cub_inc: {
      type: Sequelize.STRING
    },
    cub_ldf: {
      type: Sequelize.STRING
    },
    cub_act: {
      type: Sequelize.STRING
    },
    cub_act2: {
      type: Sequelize.STRING
    },
    cub_inc_json: {
      type: Sequelize.JSON
    },
    cub_ldf_json: {
      type: Sequelize.JSON
    },
    cub_act_json: {
      type: Sequelize.JSON
    },
    fun_c_control: {
      type: Sequelize.STRING
    },
    cub_act2_json: {
      type: Sequelize.JSON
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

  return FUN_LAW;
};