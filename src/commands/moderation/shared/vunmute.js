const { vUnmuteTarget } = require("@helpers/ModUtils");

module.exports = async ({ member }, target, reason) => {
  const response = await vUnmuteTarget(member, target, reason);
  if (typeof response === "boolean") {
    return `${target.user.username}'La voix est inhabituelle dans ce serveur`;
  }
  if (response === "MEMBER_PERM") {
    return `Vous n'avez pas la permission d'exprimer une réactivation ${target.user.username}`;
  }
  if (response === "BOT_PERM") {
    return `Je n'ai pas la permission d'exprimer une réactivation ${target.user.username}`;
  }
  if (response === "NO_VOICE") {
    return `${target.user.username} n'est dans aucun canal vocal`;
  }
  if (response === "NOT_MUTED") {
    return `${target.user.username} n'est pas la voix muette`;
  }
  return `Échec de la réactivation ${target.user.username}`;
};
