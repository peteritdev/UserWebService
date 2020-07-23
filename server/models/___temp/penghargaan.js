'use strict';

module.exports = ( sequelize, DataTypes ) => {
    const Penghargaan = sequelize.define( 'user_history_penghargaan', {
        id:{
			type:DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
        },
        code: DataTypes.STRING,
        user_id: DataTypes.INTEGER,
        jenis_penghargaan_id: DataTypes.INTEGER,
        no_sk: DataTypes.STRING,
        tgl_sk: DataTypes.DATE,
        tahun: DataTypes.INTEGER, 
        createdAt:{
			type: DataTypes.DATE,
			defaultValue: sequelize.literal('NOW()'),
			field: 'created_at'
        },
        created_user: DataTypes.INTEGER,
        updatedAt:{
			type: DataTypes.DATE,
			field: 'updated_at'
        },
        updated_user:DataTypes.INTEGER

    },{ 
        tableName: 'user_history_penghargaan'
    } );

    Penghargaan.associate = function( models ){
        Penghargaan.belongsTo( models.db_jenis_penghargaan,{
            foreignKey: 'jenis_penghargaan_id',
            onDelete: 'CASCADE',
            as: 'jenisPenghargaan'
        } )
    }

    return Penghargaan;
}