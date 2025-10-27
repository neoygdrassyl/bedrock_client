module.exports = (sequelize, Sequelize) => {
    const NormPredio = sequelize.define("norm_predios", {
        predial: {
            type: Sequelize.STRING
        },
        area: {
            type: Sequelize.DOUBLE
        },
        front: {
            type: Sequelize.DOUBLE
        },
        dir: {
            type: Sequelize.STRING
        },

        bic_pred: {
            type: Sequelize.STRING
        },
        bic_area: {
            type: Sequelize.STRING
        },
        art_192: {
            type: Sequelize.INTEGER
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

    return NormPredio;
};