'use strict'
module.exports = (sequelize, DataTypes) => {
    const RiwayatPangkatPending = sequelize.define('user_history_pangkat_pending',{
        id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        user_id: DataTypes.INTEGER,
        stlud_id: DataTypes.INTEGER,
        no_stlud: DataTypes.STRING,
        tgl_stlud: DataTypes.DATE,
        pangkat_id: DataTypes.INTEGER,
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
        
        ref_id: DataTypes.INTEGER,
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
        tableName: 'user_history_pangkat_pending'
    });

    RiwayatPangkatPending.associate = function( models ){
        RiwayatPangkatPending.belongsTo( models.db_stlud, {
            foreignKey: 'stlud_id',
            onDelete: 'CASCADE',
            as: 'stlud'
        } );

        RiwayatPangkatPending.belongsTo( models.db_stlud, {
            foreignKey: 'pangkat_id',
            onDelete: 'CASCADE',
            as: 'pangkat'
        } );

        RiwayatPangkatPending.belongsTo( models.users, {
            foreignKey: 'pejabat_penetap_id',
            onDelete: 'CASCADE',
            as: 'pejabatPenetap'
        } );

        RiwayatPangkatPending.belongsTo( models.db_kenaikan_pangkat, {
            foreignKey: 'jenis_kp_id',
            onDelete: 'CASCADE',
            as: 'kenaikanPangkat'
        } );
    };

    return RiwayatPangkatPending;
}