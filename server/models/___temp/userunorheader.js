module.exports = ( sequelize, DataTypes ) => {

    const UserUnorHeader = sequelize.define( 'user_unor_header', {
        id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
          },
          code: DataTypes.STRING,
          unor_header_name: DataTypes.STRING,
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
          tableName: 'user_unor_header'
    } );

    return UserUnorHeader;

}