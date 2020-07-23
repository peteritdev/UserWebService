'use strict';

module.exports = (sequelize, DataTypes) => {
    const JabatanFungsional = sequelize.define( 'db_jabatan_fungsional', {
        id:{
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
        },
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
        tableName:'db_jabatan_fungsional'
    } );

    return JabatanFungsional;
}