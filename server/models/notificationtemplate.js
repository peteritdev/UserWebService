'use strict'

const sequelize = require("sequelize")

module.exports = ( sequelize, DataTypes ) => {
    const NotificationTemplate = sequelize.define( 'ms_notificationtemplates', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true 
        },
        name: DataTypes.STRING,
        type: DataTypes.INTEGER,
        subject: DataTypes.STRING,
        body: DataTypes.STRING,
        category_id: DataTypes.INTEGER,
        code: DataTypes.STRING,
        status: DataTypes.INTEGER,
        is_delete: DataTypes.INTEGER,
        createdAt:{
            type: DataTypes.DATE,
            defaultValue: sequelize.literal('NOW()'),
            field: 'created_at'
        },
        created_by: DataTypes.INTEGER,
        updatedAt:{
            type: DataTypes.DATE,
            field: 'updated_at'
        },
        updated_by: DataTypes.INTEGER,
    } );

    return NotificationTemplate;
}