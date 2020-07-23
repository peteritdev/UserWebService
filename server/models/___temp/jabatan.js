'use strict';

module.exports = (sequelize, DataTypes) => {
    const Jabatan = sequelize.define( 'db_jabatan', {
        id:{
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
        },
        name:DataTypes.STRING,
        code: DataTypes.STRING,
        detail: DataTypes.STRING,
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
        tableName: 'db_jabatan'
    } );

    return Jabatan;
}