module.exports = (sequelize, Sequelize) => {
    const Reason = sequelize.define("reason", {
        starterQuality:{
            type: Sequelize.STRING,
        },
        actionType:{
            type: Sequelize.STRING,
        },
        sub_ActionType:{
            type: Sequelize.STRING,
        },
        comments: {
            type: Sequelize.STRING,
        },
    });
    return Reason;
};