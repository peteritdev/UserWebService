'use strict'
module.exports = ( sequelize, DataTypes ) => {
    const MessageTemplate = sequelize.define( 'db_message_template', {
        id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        type: DataTypes.INTEGER,
        code: DataTypes.STRING,
        subject: DataTypes.STRING,
        body: DataTypes.STRING,
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
        updated_by: DataTypes.INTEGER
    },{
        tableName: 'db_message_template'
    } );

    return MessageTemplate;
}