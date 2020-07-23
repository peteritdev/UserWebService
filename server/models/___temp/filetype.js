'use strict'

module.exports = ( sequelize, DataTypes ) => {
    const FileType = sequelize.define( 'db_filetypes', {
        id:{
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
        },
        name:DataTypes.STRING,
        path_file: DataTypes.STRING,
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
        tableName: 'db_filetypes'
    } );

    return FileType;
}