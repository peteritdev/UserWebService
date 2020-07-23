'use strict';

module.exports = (sequelize, DataTypes) => {
    const PWK = sequelize.define( 'user_history_pwk', {
        id:{
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
        },
        user_id: DataTypes.INTEGER,
        kppn_id: DataTypes.INTEGER,
        satuan_kerja_id: DataTypes.INTEGER,
        lokasi_id: DataTypes.INTEGER,
        unor_id: DataTypes.INTEGER,
        no_sk: DataTypes.STRING,
        tgl_sk: DataTypes.DATE,
        tmt_pemindahan: DataTypes.DATE,
        createdAt:{
			type: DataTypes.DATE,
			defaultValue: sequelize.literal('NOW()'),
			field: 'created_at'
		},
		createdUser:{
			type: DataTypes.INTEGER,
			field: 'created_by'
		},
		updatedAt:{
			type: DataTypes.DATE,
			field: 'updated_at'
		},
		updatedBy:{
			type: DataTypes.INTEGER,
			field: 'updated_by'
		}
    },{
        tableName: 'user_history_pwk'
    });

    PWK.associate = function( models ){
        PWK.belongsTo( models.db_kppn, {
            foreignKey: 'kppn_id',
            as: 'kppn'
        } );
        
        PWK.belongsTo( models.db_satuan_kerja, {
            foreignKey: 'satuan_kerja_id',
            as: 'satuanKerja'
        } );

        PWK.belongsTo( models.db_unor, {
            foreignKey: 'unor_id',
            as: 'unor'
        } );

        PWK.belongsTo( models.db_provinsi, {
            foreignKey: 'lokasi_id',
            as: 'province'
        } );
    }

    return PWK

}