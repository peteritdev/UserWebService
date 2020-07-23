/* jshint indent: 2 */

module.exports = (sequelize, DataTypes) => {
  const HistoryUnor = sequelize.define('user_history_unor', {
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
    unor_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    unor_induk_id: {
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
    tableName: 'user_history_unor'
  });

  HistoryUnor.associate = function( models ){
    HistoryUnor.belongsTo( models.db_unor, {
      foreignKey: 'unor_id',
      as: 'unor'
    } );
    HistoryUnor.belongsTo( models.db_unor_induk, {
      foreignKey: 'unor_induk_id',
      as: 'unorInduk'
    } );
  }

  return HistoryUnor;
};
