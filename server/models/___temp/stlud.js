'use strict';

module.exports = (sequelize, DataTypes) => {
    const Stlud = sequelize.define( 'db_stlud', {
        id:{
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
        },
        name: DataTypes.STRING,
        detail: DataTypes.STRING,
        orders: DataTypes.STRING,
        createdAt:{
			type: DataTypes.DATE,
			defaultValue: sequelize.literal('NOW()'),
			field: 'created_at'
        },
        updatedAt:{
			type: DataTypes.DATE,
			field: 'updated_at'
		},
    },{
        tableName: 'db_stlud'
    } );

    return Stlud;
}