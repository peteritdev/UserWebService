'use strict';

module.exports = (sequelize, DataTypes) => {
    const PMK = sequelize.define( 'user_history_peninjauan_masa_kerja', {
        id:{
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
        },
        code: DataTypes.STRING,
        jenis_pmk_id: DataTypes.INTEGER,
        user_id:DataTypes.INTEGER,
        is_pengurangan_masa_kerja: DataTypes.INTEGER,
        instansi_perusahaan: DataTypes.STRING,
        tgl_awal: DataTypes.DATE,
        tgl_akhir: DataTypes.DATE,
        no_surat_keputusan: DataTypes.STRING,
        tgl_sk: DataTypes.DATE,
        file_sk: DataTypes.STRING,
        masa_kerja_tahun: DataTypes.INTEGER,
        masa_kerja_bulan: DataTypes.INTEGER,
        no_bkn: DataTypes.STRING,
        tgl_bkn: DataTypes.DATE,
        createdAt:{
			type: DataTypes.DATE,
			defaultValue: sequelize.literal('NOW()'),
			field: 'created_at'
        },
        created_user:DataTypes.INTEGER,
        updatedAt:{
			type: DataTypes.DATE,
			field: 'updated_at'
        },
        updated_user:DataTypes.INTEGER
    },{
        tableName: 'user_history_peninjauan_masa_kerja'
    } );   
    
    PMK.associate = function( models ){
        PMK.belongsTo( models.db_jenis_pmk, {
            foreignKey: 'jenis_pmk_id',
            onDelete: 'CASCADE',
            as: 'jenisPMK'
        } );
    }

    return PMK;
}