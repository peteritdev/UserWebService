'use strict'

module.exports = ( sequelize, DataTypes ) => {
    const UserHistoryCuti = sequelize.define( 'user_history_cuti', {
        id:{
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
        },
        no_reference: DataTypes.STRING,
        no_reference_batal_dari: DataTypes.STRING,
        tujuan_jabatan_id: DataTypes.INTEGER,
        user_id: DataTypes.INTEGER,
        nama_pegawai: DataTypes.STRING,
        nip: DataTypes.STRING,
        jabatan: DataTypes.STRING,
        masa_kerja: DataTypes.STRING,
        unit_kerja: DataTypes.STRING,
        
        jenis_cuti_id: DataTypes.INTEGER,
        catatan_cuti: DataTypes.STRING,
        alasan_cuti: DataTypes.STRING,
        lama_cuti: DataTypes.INTEGER,
        tgl_mulai: DataTypes.DATEONLY,
        tgl_berakhir: DataTypes.DATEONLY,
        alamat_cuti: DataTypes.STRING,
        telp: DataTypes.STRING,

        status_admin_kepegawaian: DataTypes.INTEGER,
        admin_yang_menerima: DataTypes.INTEGER,
        tgl_admin_menerima: DataTypes.DATE,

        admin_yang_membatalkan: DataTypes.INTEGER,
        alasan_admin_batal: DataTypes.STRING,
        tgl_admin_batal: DataTypes.DATE,

        pertimbangan_atasan_langsung: DataTypes.INTEGER,
        keputusan_pejabat: DataTypes.INTEGER,
        createdAt:{
			type: 'TIMESTAMP',
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
            field: 'created_at'
        },
        updatedAt:{
			type: 'TIMESTAMP',
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
			field: 'updated_at'
        }
    },{
        tableName: 'user_history_cuti'
    } );

    UserHistoryCuti.associate = function ( models ){
        UserHistoryCuti.belongsTo( models.db_jenis_cuti, {
            foreignKey: 'jenis_cuti_id',
            onDelete: 'CASCADE',
            as: 'jenisCuti'
        } );

        UserHistoryCuti.belongsTo( models.db_tujuan_jabatan, {
            foreignKey: 'tujuan_jabatan_id',
            onDelete: 'CASCADE', 
            as: 'tujuanJabatan'
        } );
    }


    return UserHistoryCuti;
}