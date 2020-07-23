'use strict';

module.exports = (sequelize, DataTypes) => {
    const Kecamatan = sequelize.define( 'db_kecamatan', {
        id:{
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
        },
        kabupaten_id: DataTypes.INTEGER,
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
        tableName:'db_kecamatan'
    } );

    return Kecamatan;
}