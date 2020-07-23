'use strict'

module.exports = ( sequelize, DataTypes ) => {
    const Notification = sequelize.define('notification',{
        id:{
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
        },
        type: DataTypes.INTEGER,
        to: DataTypes.STRING,
        cc: DataTypes.STRING,
        subject: DataTypes.STRING,
        body: DataTypes.STRING,
        status: DataTypes.INTEGER,
        start_send: DataTypes.DATE,
        end_send: DataTypes.DATE,
        createdAt:{
			type: DataTypes.DATE,
			defaultValue: sequelize.literal('NOW()'),
			field: 'created_at'
        },
        updatedAt:{
			type: DataTypes.DATE,
			field: 'updated_at'
        }  
    },{
        tableName: 'notification'
    });
    
    return Notification;
}