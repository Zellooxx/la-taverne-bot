/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "leaveserver",
  description: "Laissez un serveur.",
  category: "OWNER",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    minArgsCount: 1,
    usage: "<serverId>",
  },
  slashCommand: {
    enabled: false,
  },

  async messageRun(message, args, data) {
    const input = args[0];
    const guild = message.client.guilds.cache.get(input);
    if (!guild) {
      return message.safeReply(
        `Aucun serveur trouvé. Veuillez fournir un ID de serveur valide.
        Vous pouvez utiliser ${data.prefix}findserver/${data.prefix}listservers Pour trouver l'ID de serveur`
      );
    }

    const name = guild.name;
    try {
      await guild.leave();
      return message.safeReply(`À gauche avec succès \`${name}\``);
    } catch (err) {
      message.client.logger.error("GuildLeave", err);
      return message.safeReply(`Échec du départ \`${name}\``);
    }
  },
};
