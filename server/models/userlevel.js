'use strict';

module.exports = ( sequelize, DataTypes ) => {
    const UserLevel = sequelize.define( 'ms_userlevels', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: DataTypes.STRING,
        app: DataTypes.STRING,
        application_id: DataTypes.INTEGER,
        is_delete: DataTypes.INTEGER,
        deleted_at: DataTypes.DATE,
        deleted_by: DataTypes.INTEGER,
        deleted_by_name: DataTypes.STRING,

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
            field: 'updated_at'
        },
        updated_by: DataTypes.INTEGER,
        updated_by_name: DataTypes.STRING,

    } );

    UserLevel.associate = function(models){
        UserLevel.belongsTo( models.ms_applications, {
            foreignKey: 'application_id',
            as: 'application',
            onDelete: 'CASCADE',
        } );
        UserLevel.belongsToMany( models.ms_users,{
            through: 'ms_useruserlevels',
            as: 'user_userlevel',
            foreignKey: 'user_level_id',
        } );
    }

    return UserLevel;
}