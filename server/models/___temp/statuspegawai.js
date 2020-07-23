'use strict';

module.exports = (sequelize, DataTypes) => {
    const StatusPegawai = sequelize.define( 'db_status_pegawai', {
        id:{
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
        },
        name: DataTypes.STRING,
        code: DataTypes.STRING,
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
        tableName:'db_status_pegawai'
    } );

    return StatusPegawai;
}