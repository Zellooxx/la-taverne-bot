const { musicValidations } = require("@helpers/BotUtils");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "pause",
  description: "mettre en pause la musique",
  category: "MUSIC",
  validations: musicValidations,
  command: {
    enabled: true,
  },
  slashCommand: {
    enabled: true,
  },

  async messageRun(message, args) {
    const response = pause(message);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const response = pause(interaction);
    await interaction.followUp(response);
  },
};

/**
 * @param {import("discord.js").CommandInteraction|import("discord.js").Message} arg0
 */
function pause({ client, guildId }) {
  const player = client.musicManager.getPlayer(guildId);
  if (player.paused) return "La musique est déjà en pause.";

  player.pause(true);
  return "⏸️ La musique est en pause.";
}
