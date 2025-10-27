module.exports = (sequelize, Sequelize) => {
    const Record_Ph = sequelize.define("record_ph", {
        id_public: {
            type: Sequelize.STRING,
        },
        version: {
            type: Sequelize.INTEGER,
        },
        check: {
            type: Sequelize.INTEGER,
        },
        check_law: {
            type: Sequelize.INTEGER,
        },

        detail: {
            type: Sequelize.STRING(4096),
        },
        detail_2: {
            type: Sequelize.STRING(5128),
        },
        detail_3: {
            type: Sequelize.STRING,
        },
        review_check: {
            type: Sequelize.STRING,
        },
        review_gen: {
            type: Sequelize.STRING(512),
        },

        worker_arc_id: {
            type: Sequelize.INTEGER,
        },
        worker_arc_name: {
            type: Sequelize.STRING,
        },
        worker_law_id: {
            type: Sequelize.INTEGER,
        },
        worker_law_name: {
            type: Sequelize.STRING,
        },
        date_law_review: {
            type: Sequelize.DATEONLY,
        },
        date_arc_review: {
            type: Sequelize.DATEONLY,
        },

        worker_asign_law_name: {
            type: Sequelize.STRING,
        },
        worker_asign_law_id: {
            type: Sequelize.INTEGER,
        },
        date_asign_law: {
            type: Sequelize.DATEONLY,
        },
        worker_asign_law_prev: {
            type: Sequelize.INTEGER,
        },
        worker_asign_arc_name: {
            type: Sequelize.STRING,
        },
        worker_asign_arc_id: {
            type: Sequelize.INTEGER,
        },
        date_asign_arc: {
            type: Sequelize.DATEONLY,
        },
        worker_asign_arc_prev: {
            type: Sequelize.INTEGER,
        },

        binnacle: {
            type: Sequelize.STRING(4096),
        },

        cub: {
            type: Sequelize.STRING,
        },
        cub_json: {
            type: Sequelize.JSON,
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

    return Record_Ph;
};