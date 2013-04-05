module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Context', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
//      isAlphanumeric: true,
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      isInt: true,
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      isInt: true,
      defaultValue: true,
    }
  },
  {
    paranoid: true,
    classMethods: {

    },
    instanceMethods: {

    },
  });
};
