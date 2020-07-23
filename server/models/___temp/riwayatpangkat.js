'use strict'
module.exports = (sequelize, DataTypes) => {
    const RiwayatPangkat = sequelize.define('user_history_pangkat',{
        id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        code: DataTypes.STRING,
        user_id: DataTypes.INTEGER,
        stlud_id: DataTypes.INTEGER,
        no_stlud: DataTypes.STRING,
        tgl_stlud: DataTypes.DATE,
        golongan_id: DataTypes.INTEGER,
        pangkat_id: DataTypes.INTEGER,
        tmt_golongan: DataTypes.DATE,
        tmt_pangkat: DataTypes.DATE,
        no_nota: DataTypes.STRING,
        tgl_nota: DataTypes.DATE,
        no_sk: DataTypes.STRING,
        tgl_sk: DataTypes.DATE,
        pejabat_penetap_id: DataTypes.INTEGER,
        jenis_kp_id: DataTypes.INTEGER,
        kredit: DataTypes.STRING,
        masa_kerja_thn: DataTypes.INTEGER,
        masa_kerja_bln: DataTypes.INTEGER,
        keterangan: DataTypes.STRING,
        riwayat_pangkat: DataTypes.STRING,
        approved: DataTypes.INTEGER,
        
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
        tableName: 'user_history_pangkat'
    });

    RiwayatPangkat.associate = function( models ){
        RiwayatPangkat.belongsTo( models.db_stlud, {
            foreignKey: 'stlud_id',
            onDelete: 'CASCADE',
            as: 'stlud'
        } );

        RiwayatPangkat.belongsTo( models.db_pangkat, {
            foreignKey: 'pangkat_id',
            onDelete: 'CASCADE',
            as: 'pangkat'
        } );

        RiwayatPangkat.belongsTo( models.users, {
            foreignKey: 'pejabat_penetap_id',
            onDelete: 'CASCADE',
            as: 'pejabatPenetap'
        } );

        RiwayatPangkat.belongsTo( models.db_kenaikan_pangkat, {
            foreignKey: 'jenis_kp_id',
            onDelete: 'CASCADE',
            as: 'kenaikanPangkat'
        } );

        RiwayatPangkat.belongsTo( models.db_golongan, {
            foreignKey: 'golongan_id',
            onDelete: 'CASCADE',
            as: 'golongan'
        } );
    };

    return RiwayatPangkat;
}