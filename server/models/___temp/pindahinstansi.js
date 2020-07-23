/* jshint indent: 2 */
'use strict';
module.exports = (sequelize, DataTypes) => {
  const PindahInstansi = sequelize.define('user_history_pindah_instansi', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    user_id:{
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    jenis_pegawai_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    jenis_pemindahan_id: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: '0'
    },
    pangkat_id_lama: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    pangkat_id_baru: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    insker_lama_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    insker_baru_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    satker_lama_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    satker_baru_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    unor_lama_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    unor_baru_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    jabfus_lama_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    jabfus_baru_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    insduk_lama_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    insduk_baru_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    satker_induk_lama_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    satker_induk_baru_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    lokker_lama_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    lokker_baru_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    kppn_baru_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    jabfusum_baru_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    no_surat_instansi_asal: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    tgl_surat_instansi_asal: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    no_surat_instansi_asal_prov: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    tgl_surat_instansi_asal_prov: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    no_surat_instansi_tujuan: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    tgl_surat_instansi_tujuan: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    no_surat_instansi_tujuan_prov: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    tgl_surat_instansi_tujuan_prov: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    no_sk: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    tgl_sk: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    tmt_pi: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
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
  }, {
    tableName: 'user_history_pindah_instansi'
  });

  PindahInstansi.associate = function( models ){
    PindahInstansi.belongsTo( models.db_pangkat,{
      foreignKey: 'pangkat_id_lama',
      as: 'pangkatLama'
    } );

    PindahInstansi.belongsTo( models.db_pangkat,{
      foreignKey: 'pangkat_id_baru',
      as: 'pangkatBaru'
    } );

    PindahInstansi.belongsTo( models.db_instansi_kerja,{
      foreignKey: 'insker_lama_id',
      as: 'inskerLama'
    } );

    PindahInstansi.belongsTo( models.db_instansi_kerja,{
      foreignKey: 'insker_baru_id',
      as: 'inskerBaru'
    } );

    PindahInstansi.belongsTo( models.db_satuan_kerja,{
      foreignKey: 'satker_lama_id',
      as: 'satkerLama'
    } );

    PindahInstansi.belongsTo( models.db_satuan_kerja,{
      foreignKey: 'satker_baru_id',
      as: 'satkerBaru'
    } );

    PindahInstansi.belongsTo( models.db_unor,{
      foreignKey: 'unor_lama_id',
      as: 'unorLama'
    } );

    PindahInstansi.belongsTo( models.db_unor,{
      foreignKey: 'unor_baru_id',
      as: 'unorBaru'
    } );

    PindahInstansi.belongsTo( models.db_jabatan_fungsional,{
      foreignKey: 'jabfus_lama_id',
      as: 'jabfusLama'
    } );

    PindahInstansi.belongsTo( models.db_jabatan_fungsional,{
      foreignKey: 'jabfus_baru_id',
      as: 'jabfusBaru'
    } );

    PindahInstansi.belongsTo( models.db_instansi_induk,{
      foreignKey: 'insduk_lama_id',
      as: 'insdukLama'
    } );

    PindahInstansi.belongsTo( models.db_instansi_induk,{
      foreignKey: 'insduk_baru_id',
      as: 'insdukBaru'
    } );

    PindahInstansi.belongsTo( models.db_satuan_kerja_induk,{
      foreignKey: 'satker_induk_lama_id',
      as: 'satkerIndukLama'
    } );

    PindahInstansi.belongsTo( models.db_satuan_kerja_induk,{
      foreignKey: 'satker_induk_baru_id',
      as: 'satkerIndukBaru'
    } );

    PindahInstansi.belongsTo( models.db_provinsi,{
      foreignKey: 'lokker_lama_id',
      as: 'lokkerLama'
    } );

    PindahInstansi.belongsTo( models.db_provinsi,{
      foreignKey: 'lokker_baru_id',
      as: 'lokkerBaru'
    } );
    
    PindahInstansi.belongsTo( models.db_kppn,{
      foreignKey: 'kppn_baru_id',
      as: 'kppn'
    } ); 

    PindahInstansi.belongsTo( models.db_jabatan_fungsional_umum,{
      foreignKey: 'jabfusum_baru_id',
      as: 'jabfusumBaru'
    } );
  }

  return PindahInstansi;

};
