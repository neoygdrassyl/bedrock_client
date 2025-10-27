module.exports = (sequelize, Sequelize) => {
    const Nome_Docs = sequelize.define("nome_docs", {
        date: {
            type: Sequelize.DATEONLY
        },
        description: {
            type: Sequelize.STRING(512),
        },
        active: {
            type: Sequelize.STRING,
        },
        pages: {
            type: Sequelize.INTEGER,
        },
        id_public: {
            type: Sequelize.STRING,
        },
        filename: {
            type: Sequelize.STRING
        },
        path: {
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

    return Nome_Docs;
};