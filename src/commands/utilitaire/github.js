const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { MESSAGES } = require("@root/config.js");
const { getJson } = require("@helpers/HttpUtils");
const { stripIndent } = require("common-tags");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "github",
  description: "montre les statistiques GitHub d'un utilisateur",
  cooldown: 10,
  category: "UTILITAIRE",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    aliases: ["git"],
    usage: "<nom d'utilisateur>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "username",
        description: "nom d'utilisateur github",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const username = args.join(" ");
    const response = await getGithubUser(username, message.author);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const username = interaction.options.getString("username");
    const response = await getGithubUser(username, interaction.user);
    await interaction.followUp(response);
  },
};

const websiteProvided = (text) => (text.startsWith("http://") ? true : text.startsWith("https://"));

async function getGithubUser(target, author) {
  const response = await getJson(`https://api.github.com/users/${target}`);
  if (response.status === 404) return "```Aucun utilisateur trouvé avec ce nom```";
  if (!response.success) return MESSAGES.API_ERROR;

  const json = response.data;
  const {
    login: username,
    name,
    id: githubId,
    avatar_url: avatarUrl,
    html_url: userPageLink,
    followers,
    following,
    bio,
    location,
    blog,
  } = json;

  let website = websiteProvided(blog) ? `[Cliquez sur moi](${blog})` : "Non fourni";
  if (website == null) website = "Non fourni";

  const embed = new EmbedBuilder()
    .setAuthor({
      name: `Utilisateur GitHub : ${username}`,
      url: userPageLink,
      iconURL: avatarUrl,
    })
    .addFields(
      {
        name: "informations utilisateur",
        value: stripIndent`
        **Vrai nom** : *${name || "Non fourni"}*
        **Emplacement** : *${location}*
        **ID GitHub** : *${githubId}*
        **Site web** : *${website}*\n`,
        inline: true,
      },
      {
        name: "Statistiques sociales",
        value: `**Followers** : *${followers}*\n**Following** : *${following}*`,
        inline: true,
      }
    )
    .setDescription(`**Bio** :\n${bio || "Non fourni"}`)
    .setImage(avatarUrl)
    .setColor(0x6e5494)
    .setFooter({ text: `Demandé par ${author.username}` });

  return { embeds: [embed] };
}
