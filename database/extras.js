const extraSetup = (sequelize) => {
  const { User, UserSession, Role, Rights, RoleRight, UserRoles, Events } =
    sequelize.models;

  User.hasMany(UserSession);
  UserSession.belongsTo(User);
  //
  User.hasMany(Events);
  Events.belongsTo(User);
  //
  UserRoles.removeAttribute("id");
  Role.hasMany(UserRoles);
  UserRoles.belongsTo(Role);
  User.hasMany(UserRoles);
  UserRoles.belongsTo(User);
  //
  RoleRight.removeAttribute("id");
  Role.hasMany(RoleRight);
  RoleRight.belongsTo(Role);
  Rights.hasMany(RoleRight);
  RoleRight.belongsTo(Rights);
  //
};
module.exports = { extraSetup };
