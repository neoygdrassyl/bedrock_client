module.exports = (sequelize, Sequelize) => {
    const Sub_List = sequelize.define("sub_list", {
      list_name: {
        type: Sequelize.STRING(4096),
      },
      list_category: {
        type: Sequelize.STRING
      },
      list_code: {
        type: Sequelize.STRING,
      },
      list_pages: {
        type: Sequelize.STRING
      },
      list_review: {
        type: Sequelize.STRING,
      },
      list_title: {
        type: Sequelize.STRING(2048),
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
  
    return Sub_List;
  };