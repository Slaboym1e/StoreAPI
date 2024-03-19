const extraSetup = (sequelize) => {
  const {
    User,
    UserSession,
    Role,
    Rights,
    RoleRight,
    UserRoles,
    Events,
    Achievements,
  } = sequelize.models;

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
  User.hasMany(Achievements, { foreignKey: "AuthorId" });
  Achievements.belongsTo(User);
  //
  User.hasMany(Achievements, { foreignKey: "UserId" });
  Achievements.belongsTo(User);
  //
  Events.hasMany(Achievements, { foreignKey: "EventId" });
  Achievements.belongsTo(Events);
};
module.exports = { extraSetup };
