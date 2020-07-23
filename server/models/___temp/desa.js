'use strict';

module.exports = ( sequelize, DataTypes ) => {

	const Desa = sequelize.define( 'db_desa', {
		id:{
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
        kecamatan_id: DataTypes.INTEGER,
		name: DataTypes.STRING,
		zipcode: DataTypes.STRING,
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
		}
	},{
		tableName: 'db_desa'
	} );

	return Desa;

};