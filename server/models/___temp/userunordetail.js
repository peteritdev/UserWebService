module.exports = ( sequelize, DataTypes ) => {
    const UserUnorDetail = sequelize.define( 'user_unor_detail', {
        id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        unor_header_id: DataTypes.INTEGER,
        unor_id: DataTypes.INTEGER,
        unort_type: DataTypes.INTEGER,
        user_id: DataTypes.INTEGER,
        no_sk: DataTypes.STRING,
        tgl_sk: DataTypes.DATEONLY,
        file_sk: DataTypes.STRING,
        tgl_efektif: DataTypes.DATEONLY,
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
        tableName: 'user_unor_detail'
    } );

    return UserUnorDetail;
}