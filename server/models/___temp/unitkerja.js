'use strict';

module.exports = (sequelize, DataTypes) => {
    const UnitKerja = sequelize.define( 'db_unit_kerja', {
        id:{
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
        },
        parent_id: DataTypes.INTEGER,
        name: DataTypes.STRING,
        code: DataTypes.STRING,
        eselon: DataTypes.STRING,
        kepala: DataTypes.INTEGER,
        detail: DataTypes.STRING,
        orders: DataTypes.STRING,
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
        tableName: 'db_unit_kerja'
    } );

    return UnitKerja;
}