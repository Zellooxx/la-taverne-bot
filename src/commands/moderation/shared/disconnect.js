const { disconnectTarget } = require("@helpers/ModUtils");

module.exports = async ({ member }, target, reason) => {
  const response = await disconnectTarget(member, target, reason);
  if (typeof response === "boolean") {
    return `${target.user.username} est déconnecté du canal vocal`;
  }
  if (response === "MEMBER_PERM") {
    return `Vous n'avez pas la permission de déconnecter ${target.user.username}`;
  }
  if (response === "BOT_PERM") {
    return `Je n'ai pas la permission de déconnecter ${target.user.username}`;
  }
  if (response === "NO_VOICE") {
    return `${target.user.username} n'est dans aucun canal vocal`;
  }
  return `Échec de la déconnexion ${target.user.username}`;
};
