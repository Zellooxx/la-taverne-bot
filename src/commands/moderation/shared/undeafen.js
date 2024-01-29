const { unDeafenTarget } = require("@helpers/ModUtils");

module.exports = async ({ member }, target, reason) => {
  const response = await unDeafenTarget(member, target, reason);
  if (typeof response === "boolean") {
    return `${target.user.username} est démute dans ce serveur`;
  }
  if (response === "MEMBER_PERM") {
    return `Vous n'avez pas la permission de démute ${target.user.username}`;
  }
  if (response === "BOT_PERM") {
    return `Je n'ai pas la permission de démute ${target.user.username}`;
  }
  if (response === "NO_VOICE") {
    return `${target.user.username} n'est dans aucun canal vocal`;
  }
  if (response === "NOT_DEAFENED") {
    return `${target.user.username} n'est pas démute`;
  }
  return `Échec de démute ${target.user.username}`;
};
