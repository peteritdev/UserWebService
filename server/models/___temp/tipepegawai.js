'use strict';

module.exports = (sequelize, DataTypes) => {
    const TipePegawai = sequelize.define( 'db_tipe_pegawai', {
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
        tableName: 'db_tipe_pegawai'
    } );

    return TipePegawai;
}