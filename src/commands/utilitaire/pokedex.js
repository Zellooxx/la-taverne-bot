const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { MESSAGES, EMBED_COLORS } = require("@root/config.js");
const { getJson } = require("@helpers/HttpUtils");
const { stripIndent } = require("common-tags");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "pokedex",
  description: "montre des informations pokemon",
  category: "UTILITAIRE",
  botPermissions: ["EmbedLinks"],
  cooldown: 5,
  command: {
    enabled: true,
    usage: "<pokemon>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "pokemon",
        description: "nom des pokemon pour obtenir des informations pour",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const pokemon = args.join(" ");
    const response = await pokedex(pokemon);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const pokemon = interaction.options.getString("pokemon");
    const response = await pokedex(pokemon);
    await interaction.followUp(response);
  },
};

async function pokedex(pokemon) {
  const response = await getJson(`https://pokeapi.glitch.me/v1/pokemon/${pokemon}`);
  if (response.status === 404) return "```Le pokemon donné n'est pas trouvé```";
  if (!response.success) return MESSAGES.API_ERROR;

  const json = response.data[0];

  const embed = new EmbedBuilder()
    .setTitle(`Pokédex - ${json.name}`)
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setThumbnail(json.sprite)
    .setDescription(
      stripIndent`
            ♢ **ID** : ${json.number}
            ♢ **Nom** : ${json.name}
            ♢ **Espèces** : ${json.species}
            ♢ **Type(s)** : ${json.types}
            ♢ **Capacités (normal)** : ${json.abilities.normal}
            ♢ **Capacités (cachées)** : ${json.abilities.hidden}
            ♢ **Groupe (s) d'oeufs (s)**: ${json.eggGroups}
            ♢ **Genre** : ${json.gender}
            ♢ **Hauteur** : ${json.height} pied de haut
            ♢ **Poids** : ${json.weight}
            ♢ **Étape d'évolution actuelle** : ${json.family.evolutionStage}
            ♢ **Ligne d'évolution** : ${json.family.evolutionLine}
            ♢ **Quel starter ?** : ${json.starter}
            ♢ **Est légendaire ?** : ${json.legendary}
            ♢ **Est mythique ?** : ${json.mythical}
            ♢ **Est la génération ?** : ${json.gen}
            `
    )
    .setFooter({ text: json.description });

  return { embeds: [embed] };
}
