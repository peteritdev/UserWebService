'use strict';
module.exports = (sequelize, DataTypes) => {
    const UserHistorySKP = sequelize.define('user_history_skp', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        code: DataTypes.STRING,
        user_id: DataTypes.INTEGER,
        tahun: DataTypes.INTEGER,
        nilai_skp: DataTypes.DOUBLE,
        orientasi_pelayanan: DataTypes.DOUBLE,
        integritas: DataTypes.DOUBLE,
        komitmen: DataTypes.DOUBLE,
        disiplin: DataTypes.DOUBLE,
        kerjasama: DataTypes.DOUBLE,
        nilai_perilaku_kerja: DataTypes.DOUBLE,
        nilai_prestasi_kerja: DataTypes.DOUBLE,
        kepemimpinan: DataTypes.DOUBLE,
        jumlah: DataTypes.DOUBLE,
        nilai_rata_rata: DataTypes.DOUBLE,
        penilai_nip: DataTypes.STRING,
        penilai_nama: DataTypes.STRING,
        atasan_penilai_nama: DataTypes.STRING,
        penilai_unor_nama: DataTypes.STRING,
        atasan_penilai_unor_nama: DataTypes.STRING,
        penilai_jabatan: DataTypes.STRING,
        atasan_penilai_jabatan: DataTypes.STRING,
        penilai_golongan: DataTypes.STRING,
        atasan_penilai_golongan: DataTypes.STRING,

        penilai_tmt_golongan: {
            type: DataTypes.DATE,
            defaultValue: null
        },
        atasan_penilai_tmt_golongan: {
            type:DataTypes.DATE,
            defaultValue: null   
        },
        
        status_penilai: DataTypes.STRING,
        atasan_status_penilai: DataTypes.STRING,
        pangkat_id: DataTypes.INTEGER,

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
        tableName: 'user_history_skp'
    });

    UserHistorySKP.associate = function( models ){
        UserHistorySKP.belongsTo( models.db_skp_jenisjabatan, {
            foreignKey: 'pangkat_id',
            onDelete: 'CASCADE',
            as: 'jenisJabatan'
        } ) ;       
    }

    return UserHistorySKP;

};