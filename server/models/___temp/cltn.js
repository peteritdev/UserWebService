/* jshint indent: 2 */

module.exports = (sequelize, DataTypes) => {
  const Cltn = sequelize.define('user_history_cltn', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement:true
    },
    user_id: DataTypes.INTEGER,
    jenis_cltn: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    no_sk_cltn: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    tgl_skep: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    tgl_awal: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    tgl_akhir: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    tgl_aktif: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    no_bkn: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    tgl_bkn: {
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
    tableName: 'user_history_cltn'
  });

  Cltn.associate = function( models ){
    Cltn.belongsTo( models.db_jenis_cltn, {
      foreignKey: 'jenis_cltn',
      as: 'jenisCltn'
    } );
  }

  return Cltn;

};
