'use strict';

module.exports = (sequelize, DataTypes) => {
    const JabatanStruktural = sequelize.define( 'db_jabatan_struktural', {
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
        tableName: 'db_jabatan_struktural'
    } );

    return JabatanStruktural;
}