'use strict';

module.exports = (sequelize, DataTypes) => {
    const JabatanFungsionalUmum = sequelize.define( 'db_jabatan_fungsional_umum', {
        id:{
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
        },
        unor_id: DataTypes.INTEGER,
        name: DataTypes.STRING,
        code: DataTypes.STRING,
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
        tableName:'db_jabatan_fungsional_umum'
    } );

    return JabatanFungsionalUmum;
}