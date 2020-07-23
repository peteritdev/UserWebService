'use strict'

module.exports = (sequelize, DataTypes ) => {
    const News = sequelize.define( 'news', {
        id:{
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
        },

        title: DataTypes.STRING,
        content: DataTypes.STRING,
        effective_date: DataTypes.DATE,
        expire_at: DataTypes.DATE,
        status: DataTypes.INTEGER,

        createdAt:{
			type: DataTypes.DATE,
			defaultValue: sequelize.literal('NOW()'),
			field: 'created_at'
        },
        created_by:DataTypes.INTEGER,
        updatedAt:{
			type: DataTypes.DATE,
			field: 'updated_at'
        },
        updated_by: DataTypes.INTEGER
    },{
        tableName: 'news'
    } );

    News.associate = function( models ){
        News.belongsTo( models.users, {
            foreignKey: 'created_by',
            onDelete: 'CASCADE',
            as: 'user'
        } );
    }

    return News;
}