'use strict'
module.exports = ( sequelize, DataTypes ) => {
    const MessageNotification = sequelize.define( 'qe_messagenotifications', {
        notificationId:{
            type: DataTypes.BIGINT,
            primaryKey:true,
            autoIncrement: true,
            field: 'notification_id'
        },
        type: DataTypes.INTEGER,
        destination: DataTypes.STRING,
        subject: DataTypes.STRING,
        body: DataTypes.STRING,
        status: DataTypes.INTEGER,
        createdAt:{
            type: DataTypes.DATE,
            defaultValue: sequelize.literal('NOW()'),
            field: 'created'
        },
        createdUser:{
            type: DataTypes.INTEGER,
            field: 'created_user'
        },
        updatedAt:{
            type: DataTypes.DATE,
            field: 'modified'
        },
        modifiedUser:{
            type: DataTypes.INTEGER,
            field: 'modified_user'
        },
    } );

    return MessageNotification;
}