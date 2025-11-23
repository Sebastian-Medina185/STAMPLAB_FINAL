module.exports = (sequelize, DataTypes) => {
    const Talla = sequelize.define('Talla', {
        TallaID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        Nombre: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        Precio: {
            type: DataTypes.FLOAT,
            allowNull: true,
            defaultValue: null
        }
    }, {
        tableName: 'tallas',
        timestamps: false
    });

    Talla.associate = function(models) {
        Talla.belongsToMany(models.Producto, {
            through: 'ProductoTallas',
            as: 'productos',
            foreignKey: 'TallaRefId'
        });
    };

    return Talla;
};
