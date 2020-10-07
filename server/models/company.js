'use strict'

module.exports = ( sequelize, DataTypes ) => {
    const Company = sequelize.define( 'ms_companies', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true 
        },
        plant_id: DataTypes.INTEGER,
        name: DataTypes.STRING,
        status: DataTypes.INTEGER,
        is_delete: DataTypes.INTEGER,
        alias: DataTypes.STRING,

        createdAt:{
            type: DataTypes.DATE,
            defaultValue: sequelize.literal('NOW()'),
            field: 'created_at'
        },
        updatedAt:{
            type: DataTypes.DATE,
            field: 'updated_at'
        },
    } );

    return Company;
}