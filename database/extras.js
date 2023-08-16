const extraSetup = (sequelize) => {
  const { User, UserSession, Role, Rights, RoleRight } = sequelize.models;

  User.hasMany(UserSession);
  UserSession.belongsTo(User);
  //
  Role.belongsToMany(User, { through: "UserRoles" });
  User.belongsToMany(Role, { through: "UserRoles" });
  //
  RoleRight.removeAttribute("id");
  Role.hasMany(RoleRight);
  RoleRight.belongsTo(Role);
  Rights.hasMany(RoleRight);
  RoleRight.belongsTo(Rights);
  //

    User.hasMany(UserSession);
module.exports = { extraSetup };
