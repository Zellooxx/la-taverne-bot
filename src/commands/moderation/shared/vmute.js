const { vMuteTarget } = require("@helpers/ModUtils");

module.exports = async ({ member }, target, reason) => {
  const response = await vMuteTarget(member, target, reason);
  if (typeof response === "boolean") {
    return `${target.user.username}'La voix est muette dans ce serveur`;
  }
  if (response === "MEMBER_PERM") {
    return `Vous n'avez pas la permission de vocation muette ${target.user.username}`;
  }
  if (response === "BOT_PERM") {
    return `Je n'ai pas la permission d'exprimer une muet ${target.user.username}`;
  }
  if (response === "NO_VOICE") {
    return `${target.user.username} n'est dans aucun canal vocal`;
  }
  if (response === "ALREADY_MUTED") {
    return `${target.user.username} est déjà en sourdine`;
  }
  return `Échec de la muet ${target.user.username}`;
};
