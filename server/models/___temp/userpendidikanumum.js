'use strict'
module.exports = ( sequelize, DataTypes ) => {

    const PendidikanUmum = sequelize.define( 'users_pendidikan_umum',{

        id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        code: DataTypes.STRING,
        user_id: DataTypes.INTEGER,
        tingkat_pendidikan_id: DataTypes.INTEGER,
        pendidikan_nama: DataTypes.STRING,
        jurusan_id: DataTypes.INTEGER,
        jurusan_nama: DataTypes.STRING,
        nama_sekolah: DataTypes.STRING,
        alamat_sekolah: DataTypes.STRING,
        kepala_sekolah: DataTypes.STRING,
        no_sttb: DataTypes.STRING,
        tgl_sttb: DataTypes.DATE,
        tahun_kelulusan: DataTypes.INTEGER,
        ijazah: DataTypes.STRING,
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
        tableName: 'users_pendidikan_umum'
    } );

    

    return PendidikanUmum;

}