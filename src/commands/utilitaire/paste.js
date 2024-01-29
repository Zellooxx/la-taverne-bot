const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { postToBin } = require("@helpers/HttpUtils");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "paste",
  description: "Coller quelque chose dans sourceb.in",
  cooldown: 5,
  category: "UTILITAIRE",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    minArgsCount: 2,
    usage: "<titre> <contenu>",
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "title",
        description: "Titre de votre contenu",
        required: true,
        type: ApplicationCommandOptionType.String,
      },
      {
        name: "content",
        description: "Contenu à publier dans Bin",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const title = args.shift();
    const content = args.join(" ");
    const response = await paste(content, title);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const title = interaction.options.getString("title");
    const content = interaction.options.getString("content");
    const response = await paste(content, title);
    await interaction.followUp(response);
  },
};

async function paste(content, title) {
  const response = await postToBin(content, title);
  if (!response) return "❌ Quelque chose s'est mal passé";

  const embed = new EmbedBuilder()
    .setAuthor({ name: "Liens de pâte" })
    .setDescription(`🔸 Normale : ${response.url}\n🔹 Brute : ${response.raw}`);

  return { embeds: [embed] };
}
