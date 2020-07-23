'use strict';

module.exports = (sequelize, DataTypes) => {
    const JenisKelamin = sequelize.define( 'db_jenis_kelamin', {
        id:{
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
        },
        name:DataTypes.STRING,
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
        tableName:'db_jenis_kelamin'
    } );

    return JenisKelamin;
}