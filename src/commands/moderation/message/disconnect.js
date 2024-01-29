const disconnect = require("../shared/disconnect");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "disconnect",
  description: "Déconnecter un membre spécifié d'un vocal",
  category: "MODERATION",
  userPermissions: ["MuteMembers"],
  command: {
    enabled: true,
    usage: "<Id | @member> [Raison]",
    minArgsCount: 1,
  },

  async messageRun(message, args) {
    const target = await message.guild.resolveMember(args[0], true);
    if (!target) return message.safeReply(`Aucun utilisateur trouvé correspondant ${args[0]}`);
    const reason = message.content.split(args[0])[1].trim();
    const response = await disconnect(message, target, reason);
    await message.safeReply(response);
  },
};
