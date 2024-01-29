const vunmute = require("../shared/vunmute");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "vunmute",
  description: "Démute la voix du membre spécifié",
  category: "MODERATION",
  userPermissions: ["MuteMembers"],
  botPermissions: ["MuteMembers"],
  command: {
    enabled: true,
    usage: "<ID | @Member> [Raison]",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: false,
  },

  async messageRun(message, args) {
    const target = await message.guild.resolveMember(args[0], true);
    if (!target) return message.safeReply(`Aucun utilisateur trouvé correspondant ${args[0]}`);
    const reason = message.content.split(args[0])[1].trim();
    const response = await vunmute(message, target, reason);
    await message.safeReply(response);
  },
};
