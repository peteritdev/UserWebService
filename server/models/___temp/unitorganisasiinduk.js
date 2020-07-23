'use strict';

module.exports = (sequelize, DataTypes) => {
    const UnitOrganisasiInduk = sequelize.define( 'db_unor_induk', {
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
        tableName:'db_unor_induk'
    } );

    return UnitOrganisasiInduk;
}