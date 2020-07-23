'use strict';

module.exports = (sequelize, DataTypes) => {
    const StatusKondisi = sequelize.define( 'db_status_kondisi', {
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
    } );

    return StatusKondisi;
}