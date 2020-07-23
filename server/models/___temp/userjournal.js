'use strict'

module.exports = ( sequelize, DataTypes ) => {
    const UserJournal = sequelize.define( 'user_journals', {
        id:{
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
        },
        user_id: DataTypes.INTEGER,
        journal_date: DataTypes.DATE,
        subject: DataTypes.STRING,
        body: DataTypes.STRING,
        is_delete: DataTypes.INTEGER,
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
        tableName: 'user_journals'
    } );

    UserJournal.associate = function( models ){
        UserJournal.belongsTo( models.users, {
            foreignKey: 'user_id',
            ondelete: 'CASCADE',
            as: 'user'
        } );
    }

    return UserJournal;
}