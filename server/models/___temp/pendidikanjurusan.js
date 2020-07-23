'use strict';

module.exports = (sequelize, DataTypes) => {
    const PendidikanJurusan = sequelize.define( 'db_pendidikan_jurusan', {
        id:{
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
        },
        code: DataTypes.STRING,
        name:DataTypes.STRING,
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
        tableName:'db_pendidikan_jurusan'
    } );

    return PendidikanJurusan;
}