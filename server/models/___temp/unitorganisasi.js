'use strict';

module.exports = (sequelize, DataTypes) => {
    const UnitOrganisasi = sequelize.define( 'db_unor', {
        id:{
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
        },
        parent_id: DataTypes.INTEGER,
        name: DataTypes.STRING,
        code: DataTypes.STRING,
        createdAt:{
			type: DataTypes.DATE,
			defaultValue: sequelize.literal('NOW()'),
			field: 'created_at'
        },
        createdUser:{
            type: DataTypes.INTEGER,
            field: 'created_by'
        },
        updatedAt:{
			type: DataTypes.DATE,
			field: 'updated_at'
        },
        modifiedUser:{
            type: DataTypes.INTEGER,
            field: 'updated_by'
        },
    },{
        tableName:'db_unor'
    } );

    UnitOrganisasi.associate = function( models ){

        UnitOrganisasi.hasMany( models.user_history_jabatan,{
            as: 'riwayatJabatan',
            foreignKey:'unor_id'
        } );

    };

    return UnitOrganisasi;
}