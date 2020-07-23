'use strict';

module.exports = ( sequelize, DataTypes ) => {
    const RiwayatDosier = sequelize.define( 'user_history_dosier', {
        id:{
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
        },
        user_id: DataTypes.INTEGER,
        file_type_id: DataTypes.INTEGER,
        file_name: DataTypes.STRING,
        created_user: DataTypes.INTEGER,
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
        tableName: 'user_history_dosier'
    } );

    RiwayatDosier.associate = function( models ){
        RiwayatDosier.belongsTo( models.db_filetypes, {
            foreignKey: 'file_type_id',
            as: 'fileType'
        } );
    }

    return RiwayatDosier;
}