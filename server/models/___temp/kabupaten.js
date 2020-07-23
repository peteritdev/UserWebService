'use strict';

module.exports = (sequelize, DataTypes) => {
    const Kabupaten = sequelize.define( 'db_kabupaten', {
        id:{
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
        },
        provinsi_id: DataTypes.INTEGER,
        name: DataTypes.STRING,
        detail: DataTypes.STRING,
        orders: DataTypes.INTEGER,
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
        tableName:'db_kabupaten'
    } );

    return Kabupaten;
}