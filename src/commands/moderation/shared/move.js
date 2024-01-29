const { moveTarget } = require("@helpers/ModUtils");

module.exports = async ({ member }, target, reason, channel) => {
  const response = await moveTarget(member, target, reason, channel);
  if (typeof response === "boolean") {
    return `${target.user.username} a été déplacé avec succès vers : ${channel}`;
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
  if (response === "TARGET_PERM") {
    return `${target.user.username} n'a pas la permission de rejoindre ${channel}`;
  }
  if (response === "ALREADY_IN_CHANNEL") {
    return `${target.user.username} est déjà connecté à ${channel}`;
  }
  return `Échec du déplacement ${target.user.username} à ${channel}`;
};
