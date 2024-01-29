const undeafen = require("../shared/undeafen");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "undeafen",
  description: "Unadia Specified Member dans les canaux vocaux",
  category: "MODERATION",
  userPermissions: ["DeafenMembers"],
  botPermissions: ["DeafenMembers"],
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
    const response = await undeafen(message, target, reason);
    await message.safeReply(response);
  },
};