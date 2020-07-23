/* jshint indent: 2 */

module.exports = (sequelize, DataTypes) => {
  const Profesi = sequelize.define('user_history_profesi', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    profesi_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    penyelenggara: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    tahun_lulus: {
      type: DataTypes.INTEGER(4),
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
    tableName: 'user_history_profesi'
  });

  Profesi.associate = function(models){
    Profesi.belongsTo( models.db_profesi, {
      foreignKey: 'profesi_id',
      as: 'jenisProfesi'
    } );
  }

  return Profesi;

};
