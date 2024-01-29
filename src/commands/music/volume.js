const { musicValidations } = require("@helpers/BotUtils");
const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "volume",
  description: "Définir le volume du lecteur de musique",
  category: "MUSIC",
  validations: musicValidations,
  command: {
    enabled: true,
    usage: "<1-100>",
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "amount",
        description: "Entrez une valeur pour définir [0 à 100]",
        type: ApplicationCommandOptionType.Integer,
        required: false,
      },
    ],
  },

  async messageRun(message, args) {
    const amount = args[0];
    const response = await volume(message, amount);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const amount = interaction.options.getInteger("amount");
    const response = await volume(interaction, amount);
    await interaction.followUp(response);
  },
};

/**
 * @param {import("discord.js").CommandInteraction|import("discord.js").Message} arg0
 */
async function volume({ client, guildId }, volume) {
  const player = client.musicManager.getPlayer(guildId);

  if (!volume) return `> Le volume des joueurs est \`${player.volume}\`.`;
  if (volume < 1 || volume > 100) return "tu dois me donner un volume entre 1 et 100.";

  await player.setVolume(volume);
  return `🎶 Le volume du lecteur de musique est défini sur \`${volume}\`.`;
}
