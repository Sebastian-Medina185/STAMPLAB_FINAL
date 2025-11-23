module.exports = (sequelize, DataTypes) => {
    const Color = sequelize.define('Color', {
        ColorID: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        Nombre: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        tableName: 'colores',
        timestamps: false
    });

    return Color;
};
