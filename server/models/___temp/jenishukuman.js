'use strict';

module.exports = (sequelize, DataTypes) => {
    const JenisHukuman = sequelize.define( 'db_jenis_hukuman', {
        id:{
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
        },
        name:DataTypes.STRING,
        code: DataTypes.STRING,
        category: DataTypes.INTEGER,
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
        tableName: 'db_jenis_hukuman'
    } );

    return JenisHukuman;
}