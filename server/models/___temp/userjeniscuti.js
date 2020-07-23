'use strict'

module.exports = ( sequelize, DataTypes ) => {
    const UserJenisCuti = sequelize.define( 'user_jenis_cuti', {
        id:{
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
        },
        tahun: DataTypes.INTEGER,
        user_id: DataTypes.INTEGER,
        jenis_cuti_id: DataTypes.INTEGER,
        count: DataTypes.INTEGER,
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
        tableName: 'user_jenis_cuti'
    } );

    UserJenisCuti.associate = function ( models ){
        UserJenisCuti.belongsTo( models.db_jenis_cuti, {
            foreignKey: 'jenis_cuti_id',
            onDelete: 'CASCADE',
            as: 'jenisCuti'
        } );
    }

    return UserJenisCuti;
}