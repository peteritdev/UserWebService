'use strict'
module.exports = ( sequelize, DataTypes ) => {

    const Diklat = sequelize.define( 'users_pendidikan_diklat',{
        id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        code: DataTypes.STRING,
        user_id: DataTypes.INTEGER,
        nama_diklat_id: DataTypes.INTEGER,
        jenis_pendidikan_diklat: DataTypes.STRING,
        tempat: DataTypes.STRING,
        penyelenggara: DataTypes.STRING,
        angkatan: DataTypes.STRING,
        tahun: DataTypes.INTEGER,
        tanggal_mulai: DataTypes.DATE,
        tanggal_selesai: DataTypes.DATE,
        no_sttpp: DataTypes.STRING,
        jumlah_jam: DataTypes.INTEGER,
        prestasi_diklat_id: DataTypes.INTEGER,
        sertifikat: DataTypes.STRING,
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
        tableName: 'users_pendidikan_diklat'
    } );

    Diklat.associate = function( models ){
        Diklat.belongsTo( models.db_nama_diklat, {
            foreignKey: 'nama_diklat_id',
            onDelete: 'CASCADE',
            as: 'diklat'
        } );

        Diklat.belongsTo( models.db_prestasi_diklat, {
            foreignKey: 'prestasi_diklat_id',
            onDelete: 'CASCADE',
            as: 'prestasiDiklat'
        } );
    }

    return Diklat;

}