module.exports = (sequelize, Sequelize) => {
    /**
     * Tabla CubXvr tabla sin relacion par relacionar cubs con vrs, teniendo en cuenta 
     */
    const CubXVr = sequelize.define('CubXVr', {
        cub: {
            type: Sequelize.STRING,
            allowNull: false,
            unique : true
        },
        vr: {
            type: Sequelize.STRING,//(Codigo de VR)
            allowNull: false
        },
        fun: {
            type: Sequelize.STRING,//(fund_0s.public_id, dejar null si es una pqrs)
            allowNull: true
        },
        pqrs: {
            type: Sequelize.STRING,// (pqrs_maters.id_global, dejar null si es una licencia)
            allowNull: true
        },
        process: {
            type: Sequelize.STRING,// (este valor cambia en base al formulario, ver punto 4)
            allowNull: true
        },
        desc: {
            type: Sequelize.STRING,// (este valor cambia en base al formulario, ver punto 4)
            allowNull: true
        },
        date: {
            type: Sequelize.STRING,// A que hace referencia ?  hora ya ? 
            allowNull: true
        }
    },);
  
    return CubXVr;
  };