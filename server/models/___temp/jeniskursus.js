'use strict';

module.exports = (sequelize, DataTypes) => {
    const JenisKursus = sequelize.define( 'db_jenis_kursus', {
        id:{
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
        },
        code: DataTypes.STRING,
        name: DataTypes.STRING,
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
        tableName: 'db_jenis_kursus'
    } );

    return JenisKursus;
}