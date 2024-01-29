const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { getMemberStats } = require("@schemas/MemberStats");
const { EMBED_COLORS } = require("@root/config");
const { stripIndents } = require("common-tags");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "stats",
  description: "Affiche les statistiques des membres de ce serveur",
  cooldown: 5,
  category: "STATS",
  command: {
    enabled: true,
    usage: "[@member|id]",
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "user",
        description: "cible utilisateur",
        type: ApplicationCommandOptionType.User,
        required: false,
      },
    ],
  },

  async messageRun(message, args, data) {
    const target = (await message.guild.resolveMember(args[0])) || message.member;
    const response = await stats(target, data.settings);
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const member = interaction.options.getMember("user") || interaction.member;
    const response = await stats(member, data.settings);
    await interaction.followUp(response);
  },
};

/**
 * @param {import('discord.js').GuildMember} member
 * @param {object} settings
 */
async function stats(member, settings) {
  if (!settings.stats.enabled) return "Le suivi des statistiques est désactivé sur ce serveur";
  const memberStats = await getMemberStats(member.guild.id, member.id);

  const embed = new EmbedBuilder()
    .setThumbnail(member.user.displayAvatarURL())
    .setColor(EMBED_COLORS.BOT_EMBED)
    .addFields(
      {
        name: "Username",
        value: member.user.username,
        inline: true,
      },
      {
        name: "ID",
        value: member.id,
        inline: true,
      },
      {
        name: "⌚ Membre depuis",
        value: member.joinedAt.toLocaleString(),
        inline: false,
      },
      {
        name: "💬 Messages envoyés",
        value: stripIndents`
      ❯ Messages envoyés : ${memberStats.messages}
      ❯ Commandes de préfixe : ${memberStats.commands.prefix}
      ❯ Commandes de slash : ${memberStats.commands.slash}
      ❯ XP gagné : ${memberStats.xp}
      ❯ Niveau actuel : ${memberStats.level}
    `,
        inline: false,
      },
      {
        name: "🎙️ Statistiques vocales",
        value: stripIndents`
      ❯ Connexions totales : ${memberStats.voice.connections}
      ❯ Temps passé : ${Math.floor(memberStats.voice.time / 60)} min
    `,
      }
    )
    .setFooter({ text: "Statistiques générées" })
    .setTimestamp();

  return { embeds: [embed] };
}
