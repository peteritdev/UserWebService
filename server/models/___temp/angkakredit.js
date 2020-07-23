/* jshint indent: 2 */

module.exports = (sequelize, DataTypes) => {
  const AngkaKredit = sequelize.define('user_history_angkakredit', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    code: DataTypes.STRING,
    user_id: {
      type: DataTypes.BIGINT,
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
    file_sk: DataTypes.STRING,
    bln_mulai: {
      type: DataTypes.INTEGER(6),
      allowNull: true
    },
    thn_mulai: {
      type: DataTypes.INTEGER(4),
      allowNull: true
    },
    bln_selesai: {
      type: DataTypes.INTEGER(6),
      allowNull: true
    },
    thn_selesai: {
      type: DataTypes.INTEGER(4),
      allowNull: true
    },
    kredit_utama_baru: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    kredit_penunjang_baru: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    nama_jabatan: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    is_angka_kredit_pertama: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: '0'
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
    modifiedUser:{
    	type: DataTypes.INTEGER,
    	field: 'updated_by'
    }
  }, {
    tableName: 'user_history_angkakredit'
  });

  return AngkaKredit;
};
