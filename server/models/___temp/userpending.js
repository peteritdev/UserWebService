'use strict'
module.exports = ( sequelize, DataTypes ) => {
    const UserPending = sequelize.define( 'users_pending',{
        id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: DataTypes.INTEGER,
        request_update_time: DataTypes.DATE,
        telepon: DataTypes.STRING,
        email: DataTypes.STRING,
        alamat_tinggal: DataTypes.STRING,
        alamat_ktp: DataTypes.STRING,
        status: DataTypes.INTEGER,
        confirm_time: DataTypes.DATE,
        user_confirm: DataTypes.INTEGER,
        createdAt:{
            type: DataTypes.DATE,
            defaultValue: sequelize.literal('NOW()'),
            field: 'created_at'
        },
        updatedAt:{
            type: DataTypes.DATE,
            field: 'updated_at'
        }
        
    },{
        tableName: 'users_pending'
    } );

    UserPending.associate = function( models ){
        UserPending.belongsTo( models.users,{
            foreignKey: 'user_id',
            as: 'oldUserData'
        } );
    };

    return UserPending;
}