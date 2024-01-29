const { getUser } = require("@schemas/User");
const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { diffHours, getRemainingTime } = require("@helpers/Utils");
const { EMBED_COLORS } = require("@root/config");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "rep",
  description: "donner la réputation à un utilisateur",
  category: "SOCIAL",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    minArgsCount: 1,
    aliases: ["reputation"],
    subcommands: [
      {
        trigger: "view [user]",
        description: "Afficher la réputation d'un utilisateur",
      },
      {
        trigger: "give [user]",
        description: "donner la réputation à un utilisateur",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "view",
        description: "Afficher la réputation d'un utilisateur",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "user",
            description: "l'utilisateur pour vérifier la réputation",
            type: ApplicationCommandOptionType.User,
            required: false,
          },
        ],
      },
      {
        name: "give",
        description: "donner la réputation à un utilisateur",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "user",
            description: "l'utilisateur pour vérifier la réputation",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
        ],
      },
    ],
  },

  async messageRun(message, args) {
    const sub = args[0];
    let response;

    // status
    if (sub === "view") {
      let target = message.author;
      if (args.length > 1) {
        const resolved = (await message.guild.resolveMember(args[1])) || message.member;
        if (resolved) target = resolved.user;
      }
      response = await viewReputation(target);
    }

    // give
    else if (sub === "give") {
      const target = await message.guild.resolveMember(args[1]);
      if (!target) return message.safeReply("Veuillez fournir un utilisateur valide pour donner la réputation à");
      response = await giveReputation(message.author, target.user);
    }

    //
    else {
      response = "Utilisation incorrecte de commandement";
    }

    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const sub = interaction.options.getSubcommand();
    let response;

    // status
    if (sub === "view") {
      const target = interaction.options.getUser("user") || interaction.user;
      response = await viewReputation(target);
    }

    // give
    if (sub === "give") {
      const target = interaction.options.getUser("user");
      response = await giveReputation(interaction.user, target);
    }

    await interaction.followUp(response);
  },
};

async function viewReputation(target) {
  const userData = await getUser(target);
  if (!userData) return `${target.username} n'a pas encore de réputation`;

  const embed = new EmbedBuilder()
    .setAuthor({ name: `Réputation de ${target.username}` })
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setThumbnail(target.displayAvatarURL())
    .addFields(
      {
        name: "Donnée",
        value: userData.reputation?.given.toString(),
        inline: true,
      },
      {
        name: "Reçue",
        value: userData.reputation?.received.toString(),
        inline: true,
      }
    );

  return { embeds: [embed] };
}

async function giveReputation(user, target) {
  if (target.bot) return "Vous ne pouvez pas donner la réputation aux bots";
  if (target.id === user.id) return "Vous ne pouvez pas vous donner la réputation";

  const userData = await getUser(user);
  if (userData && userData.reputation.timestamp) {
    const lastRep = new Date(userData.reputation.timestamp);
    const diff = diffHours(new Date(), lastRep);
    if (diff < 24) {
      const nextUsage = lastRep.setHours(lastRep.getHours() + 24);
      return `Vous pouvez à nouveau exécuter cette commande dans \`${getRemainingTime(nextUsage)}\``;
    }
  }

  const targetData = await getUser(target);

  userData.reputation.given += 1;
  userData.reputation.timestamp = new Date();
  targetData.reputation.received += 1;

  await userData.save();
  await targetData.save();

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setDescription(`${target.toString()} +1 Rep !`)
    .setFooter({ text: `Par ${user.username}` })
    .setTimestamp(Date.now());

  return { embeds: [embed] };
}
