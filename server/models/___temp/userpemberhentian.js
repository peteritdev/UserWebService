/* jshint indent: 2 */

module.exports = (sequelize, DataTypes) => {
  const UserPemberhentian = sequelize.define('user_history_pemberhentian', {
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
    jenis_pemberhentian_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    kedudukan_id: {
      type: DataTypes.INTEGER(11),
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
    prosedur_asal: {
      type: DataTypes.STRING(100),
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
    modifiedUser:{
    	type: DataTypes.INTEGER,
    	field: 'updated_by'
    }
  }, {
    tableName: 'user_history_pemberhentian'
  });

  UserPemberhentian.associate = function( models ){
    UserPemberhentian.belongsTo( models.db_jenis_pemberhentian,{
      foreignKey: 'jenis_pemberhentian_id',
      as: 'jenisPemberhentian'
    } );
    UserPemberhentian.belongsTo( models.db_kedudukan,{
      foreignKey: 'kedudukan_id',
      as: 'kedudukan'
    } );
  };

  return UserPemberhentian;

};
