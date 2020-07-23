/* jshint indent: 2 */

module.exports = (sequelize, DataTypes) => {
  const JenisProfesi = sequelize.define('db_profesi', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true
    },
    code: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    createdAt:{
			type: DataTypes.DATE,
			defaultValue: sequelize.literal('NOW()'),
			field: 'created_at'
		},
    updatedAt:{
			type: DataTypes.DATE,
			field: 'updated_at'
		}
  }, {
    tableName: 'db_profesi'
  });

  return JenisProfesi;
};
