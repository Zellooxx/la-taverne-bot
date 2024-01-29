const { deafenTarget } = require("@helpers/ModUtils");

module.exports = async ({ member }, target, reason) => {
  const response = await deafenTarget(member, target, reason);
  if (typeof response === "boolean") {
    return `${target.user.username} est mute dans ce serveur`;
  }
  if (response === "MEMBER_PERM") {
    return `Vous n'avez pas la permission de mute ${target.user.username}`;
  }
  if (response === "BOT_PERM") {
    return `Je n'ai pas la permission de mute ${target.user.username}`;
  }
  if (response === "NO_VOICE") {
    return `${target.user.username} n'est dans aucun canal vocal`;
  }
  if (response === "ALREADY_DEAFENED") {
    return `${target.user.username} est déjà mute`;
  }
  return `Échec du mute ${target.user.username}`;
};
