module.exports = (sequelize, Sequelize) => {
    const Norms = sequelize.define("norms", {
        id_in: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
        },
        id_out: {
            type: Sequelize.STRING,
            allowNull: true,
            unique: true,
        },

        solicitor: {
            type: Sequelize.STRING
        },
        fun6id: {
            type: Sequelize.STRING
        },
        urban_duties: {
            type: Sequelize.BOOLEAN
        },
        public_utility: {
            type: Sequelize.STRING
        },

        ficha: {
            type: Sequelize.STRING
        },
        sector: {
            type: Sequelize.STRING
        },
        subsector: {
            type: Sequelize.STRING
        },
        front: {
            type: Sequelize.STRING
        },
        front_type: {
            type: Sequelize.STRING
        },
        front_n: {
            type: Sequelize.INTEGER
        },
        
        geo_n: {
            type: Sequelize.STRING
        },
        geo_e: {
            type: Sequelize.STRING
        },

        comuna: {
            type: Sequelize.STRING
        },
        barrio: {
            type: Sequelize.STRING
        },
        estrato: {
            type: Sequelize.INTEGER
        },
        cla_suelo: {
            type: Sequelize.STRING
        },
        area_act: {
            type: Sequelize.STRING
        },
        trat_urb: {
            type: Sequelize.STRING
        },
        zon_rest: {
            type: Sequelize.STRING
        },
        amenaza: {
            type: Sequelize.STRING
        },
        zon_norm: {
            type: Sequelize.STRING
        },

        eje: {
            type: Sequelize.STRING
        },
        usos: {
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

    return Norms;
};