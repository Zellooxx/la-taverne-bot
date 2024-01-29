const { addReactionRole, getReactionRoles } = require("@schemas/ReactionRoles");
const { parseEmoji, ApplicationCommandOptionType, ChannelType } = require("discord.js");
const { parsePermissions } = require("@helpers/Utils");

const channelPerms = ["EmbedLinks", "ReadMessageHistory", "AddReactions", "UseExternalEmojis", "ManageMessages"];

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "addrr",
  description: "Configuration du rôle de réaction pour le message spécifié",
  category: "ADMIN",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    usage: "<#Channel> <MessageId> <Mute> <Rôle>",
    minArgsCount: 4,
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "channel",
        description: "Channel où le message existe",
        type: ApplicationCommandOptionType.Channel,
        channelTypes: [ChannelType.GuildText],
        required: true,
      },
      {
        name: "message_id",
        description: "ID de message à quels rôles de réaction doivent être configurés",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
      {
        name: "emoji",
        description: "emoji à utiliser",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
      {
        name: "role",
        description: "Rôle à donner pour les emoji sélectionnés",
        type: ApplicationCommandOptionType.Role,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const targetChannel = message.guild.findMatchingChannels(args[0]);
    if (targetChannel.length === 0) return message.safeReply(`Aucune chaîne trouvée correspondant ${args[0]}`);

    const targetMessage = args[1];

    const role = message.guild.findMatchingRoles(args[3])[0];
    if (!role) return message.safeReply(`Aucun rôle trouvé correspondant ${args[3]}`);

    const reaction = args[2];

    const response = await addRR(message.guild, targetChannel[0], targetMessage, reaction, role);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const targetChannel = interaction.options.getChannel("channel");
    const messageId = interaction.options.getString("message_id");
    const reaction = interaction.options.getString("emoji");
    const role = interaction.options.getRole("role");

    const response = await addRR(interaction.guild, targetChannel, messageId, reaction, role);
    await interaction.followUp(response);
  },
};

async function addRR(guild, channel, messageId, reaction, role) {
  if (!channel.permissionsFor(guild.members.me).has(channelPerms)) {
    return `Vous avez besoin des autorisations suivantes dans ${channel.toString()}\n${parsePermissions(channelPerms)}`;
  }

  let targetMessage;
  try {
    targetMessage = await channel.messages.fetch({ message: messageId });
  } catch (ex) {
    return "Ne pouvait pas récupérer le message. Avez-vous fourni un message valide?";
  }

  if (role.managed) {
    return "Je ne peux pas attribuer des rôles de bot.";
  }

  if (guild.roles.everyone.id === role.id) {
    return "Vous ne pouvez pas affecter le rôle de tout le monde.";
  }

  if (guild.members.me.roles.highest.position < role.position) {
    return "Oups! Je ne peux pas ajouter / supprimer les membres à ce rôle. Ce rôle est-il plus élevé que le mien?";
  }

  const custom = parseEmoji(reaction);
  if (custom.id && !guild.emojis.cache.has(custom.id)) return "Cet emoji n'appartient pas à ce serveur";
  const emoji = custom.id ? custom.id : custom.name;

  try {
    await targetMessage.react(emoji);
  } catch (ex) {
    return `Oops!Échec de la réaction.Est-ce un emoji valide: ${reaction} ?`;
  }

  let reply = "";
  const previousRoles = getReactionRoles(guild.id, channel.id, targetMessage.id);
  if (previousRoles.length > 0) {
    const found = previousRoles.find((rr) => rr.emote === emoji);
    if (found) reply = "Un rôle est déjà configuré pour cet emoji. Écraser les données,\n";
  }

  await addReactionRole(guild.id, channel.id, targetMessage.id, emoji, role.id);
  return (reply += "Fait ! Configuration enregistrée");
}
