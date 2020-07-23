'use strict'

module.exports = (sequelize, DataTypes) => {
    const TujuanJabatan = sequelize.define( 'db_tujuan_jabatan', {
        id:{
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
        },
        name: DataTypes.STRING,
        order: DataTypes.INTEGER,
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
        tableName: 'db_tujuan_jabatan'
    } );

    return TujuanJabatan;
}