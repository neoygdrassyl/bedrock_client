module.exports = (sequelize, Sequelize) => {
    const NormNeighbors = sequelize.define("norm_neighbors", {
        card: {
            type: Sequelize.STRING
        },
        floors: {
            type: Sequelize.INTEGER
        },
        voladizo: {
            type: Sequelize.STRING
        },
        material: {
            type: Sequelize.STRING
        },
        fun6id: {
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

    return NormNeighbors;
};