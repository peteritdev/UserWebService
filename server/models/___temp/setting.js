'use strict'

module.exports = ( sequelize, DataTypes ) => {
    const Setting = sequelize.define('settings',{
        code: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        name: DataTypes.STRING,
        type: DataTypes.STRING,
        value: DataTypes.STRING,
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
        tableName: 'settings'
    });

    return Setting;
}