const { approveSuggestion, rejectSuggestion } = require("@handlers/suggestion");
const { parsePermissions } = require("@helpers/Utils");
const { ApplicationCommandOptionType, ChannelType } = require("discord.js");

const CHANNEL_PERMS = ["ViewChannel", "SendMessages", "EmbedLinks", "ManageMessages", "ReadMessageHistory"];

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "suggestion",
  description: "Configurer le système de suggestions",
  category: "SUGGESTION",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    minArgsCount: 2,
    subcommands: [
      {
        trigger: "status <on|off>",
        description: "Activer / désactiver le système de suggestions",
      },
      {
        trigger: "channel <#channel|off>",
        description: "Configurer le canal de suggestions ou le désactiver",
      },
      {
        trigger: "appch <#channel>",
        description: "Configurer les suggestions approuvées canaliser ou le désactiver",
      },
      {
        trigger: "rejch <#channel>",
        description: "configurer les suggestions rejetées canaliser ou le désactiver",
      },
      {
        trigger: "approuve <channel> <messageId> [raison]",
        description: "approuver une suggestion",
      },
      {
        trigger: "rejet <channel> <messageId> [raison]",
        description: "rejeter une suggestion",
      },
      {
        trigger: "staffadd <roleId>",
        description: "Ajouter un rôle de personnel",
      },
      {
        trigger: "staffremove <roleId>",
        description: "Supprimer un rôle de personnel",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "status",
        description: "Activer ou désactiver le statut de suggestion",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "status",
            description: "activé ou désactivé",
            required: true,
            type: ApplicationCommandOptionType.String,
            choices: [
              {
                name: "ON",
                value: "ON",
              },
              {
                name: "OFF",
                value: "OFF",
              },
            ],
          },
        ],
      },
      {
        name: "channel",
        description: "Configurer le canal de suggestions ou le désactiver",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel_name",
            description: "le canal où les suggestions seront envoyées",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: false,
          },
        ],
      },
      {
        name: "appch",
        description: "Configurer les suggestions approuvées canaliser ou le désactiver",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel_name",
            description: "Le canal où les suggestions approuvées seront envoyées",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: false,
          },
        ],
      },
      {
        name: "rejch",
        description: "configurer les suggestions rejetées canaliser ou le désactiver",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel_name",
            description: "Le canal où les suggestions rejetées seront envoyées",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: false,
          },
        ],
      },
      {
        name: "approuve",
        description: "approuver une suggestion",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel_name",
            description: "le canal où le message existe",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
          {
            name: "message_id",
            description: "L'identification du message de la suggestion",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
          {
            name: "raison",
            description: "la raison de l'approbation",
            type: ApplicationCommandOptionType.String,
            required: false,
          },
        ],
      },
      {
        name: "rejet",
        description: "rejeter une suggestion",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel_name",
            description: "le canal où le message existe",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
          {
            name: "message_id",
            description: "L'identification du message de la suggestion",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
          {
            name: "raison",
            description: "La raison du rejet",
            type: ApplicationCommandOptionType.String,
            required: false,
          },
        ],
      },
      {
        name: "staffadd",
        description: "Ajouter un rôle de personnel",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "role",
            description: "Le rôle à ajouter en tant que personnel",
            type: ApplicationCommandOptionType.Role,
            required: true,
          },
        ],
      },
      {
        name: "staffremove",
        description: "Supprimer un rôle de personnel",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "role",
            description: "Le rôle de StaffRemove d'un personnel",
            type: ApplicationCommandOptionType.Role,
            required: true,
          },
        ],
      },
    ],
  },

  async messageRun(message, args, data) {
    const sub = args[0];
    let response;

    // status
    if (sub == "status") {
      const status = args[1]?.toUpperCase();
      if (!status || !["ON", "OFF"].includes(status))
        return message.safeReply("Statut non valide.La valeur doit être `` ON / OFF '");
      response = await setStatus(data.settings, status);
    }

    // channel
    else if (sub == "channel") {
      const input = args[1];
      let matched = message.guild.findMatchingChannels(input);
      if (matched.length == 0) response = `Aucun canal correspondant trouvé pour ${input}`;
      else if (matched.length > 1) response = `Plusieurs canaux trouvés pour ${input}. Veuillez être plus précis.`;
      else response = await setChannel(data.settings, matched[0]);
    }

    // appch
    else if (sub == "appch") {
      const input = args[1];
      let matched = message.guild.findMatchingChannels(input);
      if (matched.length == 0) response = `Aucun canal correspondant trouvé pour ${input}`;
      else if (matched.length > 1) response = `Plusieurs canaux trouvés pour ${input}. Veuillez être plus précis.`;
      else response = await setApprovedChannel(data.settings, matched[0]);
    }

    // appch
    else if (sub == "rejch") {
      const input = args[1];
      let matched = message.guild.findMatchingChannels(input);
      if (matched.length == 0) response = `Aucun canal correspondant trouvé pour ${input}`;
      else if (matched.length > 1) response = `Plusieurs canaux trouvés pour ${input}. Veuillez être plus précis.`;
      else response = await setRejectedChannel(data.settings, matched[0]);
    }

    // approve
    else if (sub == "approve") {
      const input = args[1];
      let matched = message.guild.findMatchingChannels(input);
      if (matched.length == 0) response = `Aucun canal correspondant trouvé pour ${input}`;
      else if (matched.length > 1) response = `Plusieurs canaux trouvés pour ${input}. Veuillez être plus précis.`;
      else {
        const messageId = args[2];
        const reason = args.slice(3).join(" ");
        response = await approveSuggestion(message.member, matched[0], messageId, reason);
      }
    }

    // reject
    else if (sub == "reject") {
      const input = args[1];
      let matched = message.guild.findMatchingChannels(input);
      if (matched.length == 0) response = `Aucun canal correspondant trouvé pour ${input}`;
      else if (matched.length > 1) response = `Plusieurs canaux trouvés pour ${input}. Veuillez être plus précis.`;
      else {
        const messageId = args[2];
        const reason = args.slice(3).join(" ");
        response = await rejectSuggestion(message.member, matched[0], messageId, reason);
      }
    }

    // staffadd
    else if (sub == "staffadd") {
      const input = args[1];
      let matched = message.guild.findMatchingRoles(input);
      if (matched.length == 0) response = `Aucun rôle correspondant trouvé pour ${input}`;
      else if (matched.length > 1) response = `Plusieurs rôles trouvés pour ${input}. Veuillez être plus précis.`;
      else response = await addStaffRole(data.settings, matched[0]);
    }

    // staffremove
    else if (sub == "staffremove") {
      const input = args[1];
      let matched = message.guild.findMatchingRoles(input);
      if (matched.length == 0) response = `Aucun rôle correspondant trouvé pour ${input}`;
      else if (matched.length > 1) response = `Plusieurs rôles trouvés pour ${input}. Veuillez être plus précis.`;
      else response = await removeStaffRole(data.settings, matched[0]);
    }

    // else
    else response = "Pas une sous-commande valide";
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand();
    let response;

    // status
    if (sub == "status") {
      const status = interaction.options.getString("status");
      response = await setStatus(data.settings, status);
    }

    // channel
    else if (sub == "channel") {
      const channel = interaction.options.getChannel("channel_name");
      response = await setChannel(data.settings, channel);
    }

    // app_channel
    else if (sub == "appch") {
      const channel = interaction.options.getChannel("channel_name");
      response = await setApprovedChannel(data.settings, channel);
    }

    // rej_channel
    else if (sub == "rejch") {
      const channel = interaction.options.getChannel("channel_name");
      response = await setRejectedChannel(data.settings, channel);
    }

    // approve
    else if (sub == "approuve") {
      const channel = interaction.options.getChannel("channel_name");
      const messageId = interaction.options.getString("message_id");
      response = await approveSuggestion(interaction.member, channel, messageId);
    }

    // reject
    else if (sub == "rejet") {
      const channel = interaction.options.getChannel("channel_name");
      const messageId = interaction.options.getString("message_id");
      response = await rejectSuggestion(interaction.member, channel, messageId);
    }

    // staffadd
    else if (sub == "staffadd") {
      const role = interaction.options.getRole("role");
      response = await addStaffRole(data.settings, role);
    }

    // staffremove
    else if (sub == "staffremove") {
      const role = interaction.options.getRole("role");
      response = await removeStaffRole(data.settings, role);
    }

    // else
    else response = "Pas une sous-commande valide";
    await interaction.followUp(response);
  },
};

async function setStatus(settings, status) {
  const enabled = status.toUpperCase() === "ON" ? true : false;
  settings.suggestions.enabled = enabled;
  await settings.save();
  return `Le système de suggestions est maintenant ${enabled ? "activé" : "désactivé"}`;
}

async function setChannel(settings, channel) {
  if (!channel) {
    settings.suggestions.channel_id = null;
    await settings.save();
    return "Le système de suggestions est désormais désactivé";
  }

  if (!channel.permissionsFor(channel.guild.members.me).has(CHANNEL_PERMS)) {
    return `J'ai besoin des autorisations suivantes dans ${channel}\n${parsePermissions(CHANNEL_PERMS)}`;
  }

  settings.suggestions.channel_id = channel.id;
  await settings.save();
  return `Des suggestions seront maintenant envoyées à ${channel}`;
}

async function setApprovedChannel(settings, channel) {
  if (!channel) {
    settings.suggestions.approved_channel = null;
    await settings.save();
    return "Le canal approuvé par la suggestion est désormais désactivé";
  }

  if (!channel.permissionsFor(channel.guild.members.me).has(CHANNEL_PERMS)) {
    return `J'ai besoin des autorisations suivantes dans ${channel}\n${parsePermissions(CHANNEL_PERMS)}`;
  }

  settings.suggestions.approved_channel = channel.id;
  await settings.save();
  return `Des suggestions approuvées seront désormais envoyées à ${channel}`;
}

async function setRejectedChannel(settings, channel) {
  if (!channel) {
    settings.suggestions.rejected_channel = null;
    await settings.save();
    return "Le canal rejeté de suggestion est désormais désactivé";
  }

  if (!channel.permissionsFor(channel.guild.members.me).has(CHANNEL_PERMS)) {
    return `J'ai besoin des autorisations suivantes dans ${channel}\n${parsePermissions(CHANNEL_PERMS)}`;
  }

  settings.suggestions.rejected_channel = channel.id;
  await settings.save();
  return `Des suggestions rejetées seront désormais envoyées à ${channel}`;
}

async function addStaffRole(settings, role) {
  if (settings.suggestions.staff_roles.includes(role.id)) {
    return `\`${role.name}\` est déjà un rôle de personnel`;
  }
  settings.suggestions.staff_roles.push(role.id);
  await settings.save();
  return `\`${role.name}\` est maintenant un rôle de personnel`;
}

async function removeStaffRole(settings, role) {
  if (!settings.suggestions.staff_roles.includes(role.id)) {
    return `${role} is not a staff role`;
  }
  settings.suggestions.staff_roles.splice(settings.suggestions.staff_roles.indexOf(role.id), 1);
  await settings.save();
  return `\`${role.name}\` is no longer a staff role`;
}
