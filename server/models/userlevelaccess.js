'use strict';

module.exports = ( sequelize, DataTypes ) => {
    const UserLevelAccess = sequelize.define( 'ms_userlevelaccess', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        menu_id: DataTypes.INTEGER,
        level_id: DataTypes.INTEGER,
        create_perm: DataTypes.INTEGER,
        read_perm: DataTypes.INTEGER,
        update_perm: DataTypes.INTEGER,
        delete_perm: DataTypes.INTEGER,

        createdAt:{
            type: DataTypes.DATE,
            defaultValue: sequelize.literal('NOW()'),
            field: 'created_at'
        },
        created_by: DataTypes.INTEGER,
        created_by_name: DataTypes.STRING,

        updatedAt:{
            type: DataTypes.DATE,
            defaultValue: sequelize.literal('NOW()'),
            field: 'created_at'
        },
        updated_by: DataTypes.INTEGER,
        updated_by_name: DataTypes.STRING,
    },{
        tableName: 'ms_userlevelaccess',
    } );

    UserLevelAccess.associate = function( models ){
        UserLevelAccess.belongsTo( models.ms_menus, {
            foreignKey: 'menu_id',
            onDelete: 'CASCADE',
            as: 'menu',
        } );
    }

    return UserLevelAccess;
}