module.exports = (sequelize, Sequelize) => {
    const Record_Eng_Review = sequelize.define("record_eng_review", {
        check: {
            type: Sequelize.INTEGER,
        },
        check_2: {
            type: Sequelize.INTEGER,
        },
        check_3: {
            type: Sequelize.INTEGER,
        },
        date: {
            type: Sequelize.DATEONLY,
        },

        desc: {
            type: Sequelize.STRING(4096),
        },
        detail: {
            type: Sequelize.STRING(4096),
        },
        detail_2: {
            type: Sequelize.TEXT,
        },
        detail_3: {
            type: Sequelize.STRING(4096),
        },
        detail_4: {
            type: Sequelize.STRING(4096),
        },
        worker_id: {
            type: Sequelize.INTEGER,
        },
        worker_name: {
            type: Sequelize.STRING,
        },

        version: {
            type: Sequelize.INTEGER,
        },

        check_context: {
            type: Sequelize.STRING,
        },
        check_2_cotext: {
            type: Sequelize.STRING,
        },
        check_3_cotext: {
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

    return Record_Eng_Review;
};