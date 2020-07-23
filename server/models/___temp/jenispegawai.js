'use strict';

module.exports = (sequelize, DataTypes) => {
    const JenisPegawai = sequelize.define( 'db_jenis_pegawai', {
        id:{
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
        },
        name:DataTypes.STRING,
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
        tableName:'db_jenis_pegawai'
    } );

    return JenisPegawai;
}