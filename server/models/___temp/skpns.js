'use strict';
module.exports = (sequelize, DataTypes) => {

    const Skpns = sequelize.define('user_sk_pns', {
        id:{
            type: DataTypes.INTEGER,
    	    primaryKey: true,
    	    autoIncrement: true
        },

        user_id: DataTypes.INTEGER,
        pejabat_penetapan_id: DataTypes.INTEGER,
        nama_pejabat_penetapan: DataTypes.STRING,
        nip_pejabat_penetapan: DataTypes.STRING,
        no_surat_keputusan: DataTypes.STRING,
        tgl_surat_keputusan: DataTypes.DATE,
        terhitung_mulai_tanggal: DataTypes.DATE,
        no_diklat_prajabatan: DataTypes.STRING,
        tgl_diklat_prajabatan: DataTypes.DATE,
        no_surat_uji_kesehatan: DataTypes.STRING,
        tgl_surat_uji_kesehatan: DataTypes.DATE,
        golongan_ruang_id: DataTypes.INTEGER,
        pengambilan_sumpah: DataTypes.INTEGER,
        sk_pns: DataTypes.STRING,
        approved: DataTypes.INTEGER,

        createdAt:{
            type: DataTypes.DATE,
            defaultValue: sequelize.literal('NOW()'),
            field: 'created_at'
        },

        updatedAt:{
            type: DataTypes.DATE,
            field: 'updated_at'
        },
        
    });

    Skpns.associate = function( models ){

        Skpns.belongsTo( models.db_golongan, {
            foreignKey: 'golongan_ruang_id',
            onDelete: 'CASCADE',
            as: 'golongan'
        } );

    };

    return Skpns;

};