'use strict'

module.exports = ( sequelize, DataTypes ) => {
    const Menu = sequelize.define('ms_menus', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: DataTypes.STRING,
        app: DataTypes.STRING,
        path: DataTypes.STRING,
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
            field: 'created_at'
        },
        updated_by: DataTypes.INTEGER,
        updated_by_name: DataTypes.STRING,
    });

    return Menu;
}