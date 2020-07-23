'use strict'
module.exports = (sequelize, DataTypes) => {
    const RiwayatJabatan = sequelize.define('user_history_jabatan',{
        id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        code: DataTypes.STRING,
        user_id: DataTypes.INTEGER,
        jenis_jabatan_id: DataTypes.INTEGER,
        instansi_kerja_id: DataTypes.INTEGER,
        satuan_kerja_id: DataTypes.INTEGER,
        unor_id: DataTypes.INTEGER,
        unor_induk_id: DataTypes.INTEGER,
        eselon_id: DataTypes.INTEGER,
        jabatan_fungsional_id: DataTypes.INTEGER,
        jabatan_fungsional_umum_id: DataTypes.INTEGER,
        tmt_jabatan: DataTypes.DATE,
        no_sk: DataTypes.STRING,
        tanggal_sk: DataTypes.DATE,
        tmt_pelantikan: DataTypes.DATE,
        approved: DataTypes.INTEGER,
        approved_user_id: DataTypes.INTEGER,
        
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
        tableName: 'user_history_jabatan'
    });

    RiwayatJabatan.associate = function( models ){

        RiwayatJabatan.belongsTo( models.users,{
            foreignKey: 'user_id',
            onDelete: 'CASCADE',
            as: 'user'
        } );

        RiwayatJabatan.belongsTo( models.db_pangkat,{
            foreignKey: 'jenis_jabatan_id',
            onDelete: 'CASCADE',
            as: 'jenisJabatan'
        } );

        RiwayatJabatan.belongsTo( models.db_instansi_kerja,{
            foreignKey: 'instansi_kerja_id',
            onDelete: 'CASCADE',
            as: 'instansiKerja'
        } );

        RiwayatJabatan.belongsTo( models.db_satuan_kerja,{
            foreignKey: 'satuan_kerja_id',
            onDelete: 'CASCADE',
            as: 'satuanKerja'
        } );

        RiwayatJabatan.belongsTo( models.db_unor,{
            foreignKey: 'unor_id',
            onDelete: 'CASCADE',
            as: 'unor'
        } );

        RiwayatJabatan.belongsTo( models.db_unor_induk,{
            foreignKey: 'unor_induk_id',
            onDelete: 'CASCADE',
            as: 'unorInduk'
        } );

        RiwayatJabatan.belongsTo( models.db_eselon,{
            foreignKey: 'eselon_id',
            onDelete: 'CASCADE',
            as: 'eselon'
        } );

        RiwayatJabatan.belongsTo( models.db_jabatan_fungsional,{
            foreignKey: 'jabatan_fungsional_id',
            onDelete: 'CASCADE',
            as: 'jabatanFungsional'
        } );

        RiwayatJabatan.belongsTo( models.db_jabatan_fungsional_umum,{
            foreignKey: 'jabatan_fungsional_umum_id',
            onDelete: 'CASCADE',
            as: 'jabatanFungsionalUmum'
        } );
    }

    return RiwayatJabatan;

}