module.exports = (sequelize, Sequelize) => {
    const PQRS_Contact = sequelize.define("pqrs_contact", {
        state: {
            type: Sequelize.STRING
        },
        county: {
            type: Sequelize.STRING
        },
        address: {
            type: Sequelize.STRING
        },
        neighbour: {
            type: Sequelize.STRING
        },
        email: {
            type: Sequelize.STRING
        },
        phone: {
            type: Sequelize.STRING
        },
        notify: {
            type: Sequelize.INTEGER
        },
        notify_reply: {
            type: Sequelize.INTEGER
        },
        notify_date: {
            type: Sequelize.DATEONLY
        },
        notify_extension: {
            type: Sequelize.INTEGER
        },
        notify_extension_date: {
            type: Sequelize.DATEONLY
        },
        notify_confirm: {
            type: Sequelize.INTEGER
        },
        notify_confirm_date: {
            type: Sequelize.DATEONLY
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

    return PQRS_Contact;
};