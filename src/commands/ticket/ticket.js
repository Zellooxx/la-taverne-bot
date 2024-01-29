const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ModalBuilder,
  TextInputBuilder,
  ApplicationCommandOptionType,
  ChannelType,
  ButtonStyle,
  TextInputStyle,
  ComponentType,
} = require("discord.js");
const { EMBED_COLORS } = require("@root/config.js");
const { isTicketChannel, closeTicket, closeAllTickets } = require("@handlers/ticket");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "ticket",
  description: "diverses commandes de billetterie",
  category: "TICKET",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    minArgsCount: 1,
    subcommands: [
      {
        trigger: "setup <#channel>",
        description: "Démarre le setup du ticket",
      },
      {
        trigger: "log <#channel>",
        description: "Configurer le channel des logs pour les tickets",
      },
      {
        trigger: "limit <number>",
        description: "Définir le nombre maximum de tickets ouverts simultanés",
      },
      {
        trigger: "close",
        description: "Fermer le ticket",
      },
      {
        trigger: "closeall",
        description: "Ferme tous les tickets",
      },
      {
        trigger: "add <userId|roleId>",
        description: "Ajouter un utilisateur/rôle au ticket",
      },
      {
        trigger: "remove <userId|roleId>",
        description: "Supprimer l'utilisateur/le rôle du ticket",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "setup",
        description: "Configurer un nouveau message de ticket",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            description: "Le channel où le message de création de ticket doit être envoyé",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
        ],
      },
      {
        name: "log",
        description: "Configurer le channel de logs pour les tickets",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            description: "Channel où les logs des tickets doivent être envoyés",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
        ],
      },
      {
        name: "limit",
        description: "Définir le nombre maximum d'ouverture simultanée de tickets",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "amount",
            description: "Nombre maximal de tickets",
            type: ApplicationCommandOptionType.Integer,
            required: true,
          },
        ],
      },
      {
        name: "close",
        description: "ferme le ticket [Utilisé dans le channel de ticket uniquement]",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "closeall",
        description: "Ferme tous les tickets ouverts",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "add",
        description: "Ajouter un utilisateur au channel de ticket actuel [utilisé dans le channel de ticket uniquement]",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "user_id",
            description: "L'ID de l'utilisateur à ajouter",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "remove",
        description: "Supprimer l'utilisateur du channel de ticket [utilisé dans le channel de ticket uniquement]",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "user",
            description: "the user to remove",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
        ],
      },
    ],
  },

  async messageRun(message, args, data) {
    const input = args[0].toLowerCase();
    let response;

    // Setup
    if (input === "setup") {
      if (!message.guild.members.me.permissions.has("ManageChannels")) {
        return message.safeReply("Il me manque des « Channels » pour créer des channels de tickets");
      }
      const targetChannel = message.guild.findMatchingChannels(args[1])[0];
      if (!targetChannel) {
        return message.safeReply("Je n'ai pas pu trouver le channel avec ce nom");
      }
      return ticketModalSetup(message, targetChannel, data.settings);
    }

    // log ticket
    else if (input === "log") {
      if (args.length < 2) return message.safeReply("Veuillez fournir un channel où les logs des tickets doivent être envoyés");
      const target = message.guild.findMatchingChannels(args[1]);
      if (target.length === 0) return message.safeReply("Impossible de trouver aucun channel correspondant");
      response = await setupLogChannel(target[0], data.settings);
    }

    // Set limit
    else if (input === "limit") {
      if (args.length < 2) return message.safeReply("Veuillez fournir un numéro");
      const limit = args[1];
      if (isNaN(limit)) return message.safeReply("Veuillez fournir une entrée numérique");
      response = await setupLimit(limit, data.settings);
    }

    // Close ticket
    else if (input === "close") {
      response = await close(message, message.author);
      if (!response) return;
    }

    // Close all tickets
    else if (input === "closeall") {
      let sent = await message.safeReply("Tous les tickets fermes ...");
      response = await closeAll(message, message.author);
      return sent.editable ? sent.edit(response) : message.channel.send(response);
    }

    // Add user to ticket
    else if (input === "add") {
      if (args.length < 2) return message.safeReply("Veuillez fournir un utilisateur ou un rôle à ajouter au ticket");
      let inputId;
      if (message.mentions.users.size > 0) inputId = message.mentions.users.first().id;
      else if (message.mentions.roles.size > 0) inputId = message.mentions.roles.first().id;
      else inputId = args[1];
      response = await addToTicket(message, inputId);
    }

    // Remove user from ticket
    else if (input === "remove") {
      if (args.length < 2) return message.safeReply("Veuillez fournir un utilisateur ou un rôle à supprimer");
      let inputId;
      if (message.mentions.users.size > 0) inputId = message.mentions.users.first().id;
      else if (message.mentions.roles.size > 0) inputId = message.mentions.roles.first().id;
      else inputId = args[1];
      response = await removeFromTicket(message, inputId);
    }

    // Invalid input
    else {
      return message.safeReply("Utilisation incorrecte de commandement");
    }

    if (response) await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand();
    let response;

    // setup
    if (sub === "setup") {
      const channel = interaction.options.getChannel("channel");

      if (!interaction.guild.members.me.permissions.has("ManageChannels")) {
        return interaction.followUp("Il me manque des « Channels » pour créer des channels de tickets");
      }

      await interaction.deleteReply();
      return ticketModalSetup(interaction, channel, data.settings);
    }

    // Log channel
    else if (sub === "log") {
      const channel = interaction.options.getChannel("channel");
      response = await setupLogChannel(channel, data.settings);
    }

    // Limit
    else if (sub === "limit") {
      const limit = interaction.options.getInteger("amount");
      response = await setupLimit(limit, data.settings);
    }

    // Close
    else if (sub === "close") {
      response = await close(interaction, interaction.user);
    }

    // Close all
    else if (sub === "closeall") {
      response = await closeAll(interaction, interaction.user);
    }

    // Add to ticket
    else if (sub === "add") {
      const inputId = interaction.options.getString("user_id");
      response = await addToTicket(interaction, inputId);
    }

    // Remove from ticket
    else if (sub === "remove") {
      const user = interaction.options.getUser("user");
      response = await removeFromTicket(interaction, user.id);
    }

    if (response) await interaction.followUp(response);
  },
};

/**
 * @param {import('discord.js').Message} param0
 * @param {import('discord.js').GuildTextBasedChannel} targetChannel
 * @param {object} settings
 */
async function ticketModalSetup({ guild, channel, member }, targetChannel, settings) {
  const buttonRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("ticket_btnSetup").setLabel("Setup Message").setStyle(ButtonStyle.Primary)
  );

  const sentMsg = await channel.safeSend({
    content: "Veuillez cliquer sur le bouton ci-dessous pour configurer le message du ticket",
    components: [buttonRow],
  });

  if (!sentMsg) return;

  const btnInteraction = await channel
    .awaitMessageComponent({
      componentType: ComponentType.Button,
      filter: (i) => i.customId === "ticket_btnSetup" && i.member.id === member.id && i.message.id === sentMsg.id,
      time: 20000,
    })
    .catch((ex) => { });

  if (!btnInteraction) return sentMsg.edit({ content: "Aucune réponse reçue, annulation de la configuration", components: [] });

  // display modal
  await btnInteraction.showModal(
    new ModalBuilder({
      customId: "ticket-modalSetup",
      title: "Configuration",
      components: [
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("title")
            .setLabel("Embed Title")
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("description")
            .setLabel("Embed Description")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("footer")
            .setLabel("Embed Footer")
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
        ),
      ],
    })
  );

  // receive modal input
  const modal = await btnInteraction
    .awaitModalSubmit({
      time: 1 * 60 * 1000,
      filter: (m) => m.customId === "ticket-modalSetup" && m.member.id === member.id && m.message.id === sentMsg.id,
    })
    .catch((ex) => { });

  if (!modal) return sentMsg.edit({ content: "Aucune réponse reçue, annulation de la configuration", components: [] });

  await modal.reply("Configuration du message de ticket ...");
  const title = modal.fields.getTextInputValue("title");
  const description = modal.fields.getTextInputValue("description");
  const footer = modal.fields.getTextInputValue("footer");

  // send ticket message
  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setAuthor({ name: title || "Support Ticket" })
    .setDescription(description || "Veuillez utiliser le bouton ci-dessous pour créer un ticket")
    .setFooter({ text: footer || "Vous ne pouvez avoir qu'un seul ticket ouvert à la fois !" });

  const tktBtnRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setLabel("Ouvrir un ticket").setCustomId("TICKET_CREATE").setStyle(ButtonStyle.Success)
  );

  await targetChannel.send({ embeds: [embed], components: [tktBtnRow] });
  await modal.deleteReply();
  await sentMsg.edit({ content: "Fait ! Message de ticket créé", components: [] });
}

async function setupLogChannel(target, settings) {
  if (!target.canSendEmbeds()) return `Oops ! J'ai la permission d'envoyer une intégration à ${target}`;

  settings.ticket.log_channel = target.id;
  await settings.save();

  return `Configuration enregistrée ! Les logs des ticket seront envoyés à ${target.toString()}`;
}

async function setupLimit(limit, settings) {
  if (Number.parseInt(limit, 10) < 5) return "La limite de tickets ne peut pas être inférieure à 5";

  settings.ticket.limit = limit;
  await settings.save();

  return `Configuration enregistrée. Vous pouvez maintenant avoir un maximum de \`${limit}\` ticket ouverts`;
}

async function close({ channel }, author) {
  if (!isTicketChannel(channel)) return "Cette commande ne peut être utilisée que dans les channels de ticket";
  const status = await closeTicket(channel, author, "Fermé par un modérateur");
  if (status === "MISSING_PERMISSIONS") return "Je n'ai pas la permission de fermerer tickets";
  if (status === "ERROR") return "Une erreur s'est produite lors de la fermeture du ticket";
  return null;
}

async function closeAll({ guild }, user) {
  const stats = await closeAllTickets(guild, user);
  return `Complété ! Succès: \`${stats[0]}\` Échoué : \`${stats[1]}\``;
}

async function addToTicket({ channel }, inputId) {
  if (!isTicketChannel(channel)) return "Cette commande ne peut être utilisée que dans le channel de ticket";
  if (!inputId || isNaN(inputId)) return "Oops ! Vous devez saisir un utilisateur / roleid valide";

  try {
    await channel.permissionOverwrites.create(inputId, {
      ViewChannel: true,
      SendMessages: true,
    });

    return "Fait";
  } catch (ex) {
    return "Impossible d'ajouter l'utilisateur / le rôle. Avez-vous fourni un ID valide ?";
  }
}

async function removeFromTicket({ channel }, inputId) {
  if (!isTicketChannel(channel)) return "Cette commande ne peut être utilisée que dans le channel de ticket";
  if (!inputId || isNaN(inputId)) return "Oops ! Vous devez saisir un utilisateur / roleid valide";

  try {
    channel.permissionOverwrites.create(inputId, {
      ViewChannel: false,
      SendMessages: false,
    });
    return "Fait";
  } catch (ex) {
    return "Impossible d'ajouter l'utilisateur / le rôle. Avez-vous fourni un ID valide ?";
  }
}
