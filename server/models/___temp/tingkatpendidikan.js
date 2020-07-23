'use strict';

module.exports = (sequelize, DataTypes) => {
    const TingkatPendidikan = sequelize.define( 'db_tingkat_pendidikan', {
        id:{
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
        },
        name:DataTypes.STRING,
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
        tableName:'db_tingkat_pendidikan'
    } );

    return TingkatPendidikan;
}