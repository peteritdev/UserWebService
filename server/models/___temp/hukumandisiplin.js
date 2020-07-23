'use strict';

module.exports = (sequelize, DataTypes) => {
    const HukumanDisiplin = sequelize.define( 'user_history_hukum_disiplin', {
        id:{
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
        },
        code: DataTypes.STRING,
        user_id: DataTypes.INTEGER,
        jenis_hukuman_id: DataTypes.INTEGER,
        no_sk_hd: DataTypes.STRING,
        tgl_sk_hd: DataTypes.DATE,
        file_sk: DataTypes.STRING,
        tmt_hd: DataTypes.DATE,
        masa_hukuman_tahun: DataTypes.INTEGER,
        masa_hukuman_bulan: DataTypes.INTEGER,
        akhir_hukuman: DataTypes.DATE,
        gol_ruang: DataTypes.INTEGER,
        no_pp: DataTypes.STRING,
        alasan_hukuman: DataTypes.STRING,
        keterangan: DataTypes.STRING,

        no_sk_pembatalan: DataTypes.STRING,
        tgl_sk_pembatalan: DataTypes.DATE,

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
        tableName: 'user_history_hukum_disiplin'
    });

    HukumanDisiplin.associate = function( models ){
        HukumanDisiplin.belongsTo( models.db_jenis_hukuman, {
            foreignKey: 'jenis_hukuman_id',
            onDelete: 'CASCADE',
            as: 'jenisHukuman'
        } );
    }

    return HukumanDisiplin;

};