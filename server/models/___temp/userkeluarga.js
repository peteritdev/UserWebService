'use strict'

module.exports = ( sequelize, DataTypes ) => {
    const UserKeluarga = sequelize.define( 'user_keluarga', {
        id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true 
        },

        user_id: DataTypes.INTEGER,
        user_family_id: DataTypes.INTEGER,
        parent_user_family_id: DataTypes.INTEGER,
        relasi_id: DataTypes.INTEGER,
        tgl_menikah: DataTypes.DATE,
        akte_menikah: DataTypes.STRING,
        tgl_cerai: DataTypes.DATE,
        akte_cerai: DataTypes.STRING,
        status_anak: DataTypes.INTEGER,
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
        }
    },{
        tableName: 'user_keluarga'
    } );

    UserKeluarga.associate = function(models) {

        UserKeluarga.belongsTo( models.users,{
            foreignKey: 'user_family_id',
            onDelete:'CASCADE',
            as: 'userKeluarga'
        } );

    };

    return UserKeluarga;
}