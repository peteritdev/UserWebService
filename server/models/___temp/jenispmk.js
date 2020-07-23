'use strict';

module.exports = ( sequelize, DataTypes ) => {
    const JenisPMK = sequelize.define( 'db_jenis_pmk', {
        id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: DataTypes.STRING,
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
        tableName: 'db_jenis_pmk'
    } );

    return JenisPMK;
}