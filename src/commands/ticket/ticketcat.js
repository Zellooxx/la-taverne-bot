const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "ticketcat",
  description: "Gérer les catégories de tickets",
  category: "TICKET",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    minArgsCount: 1,
    subcommands: [
      {
        trigger: "list",
        description: "Listez toutes les catégories de tickets",
      },
      {
        trigger: "add <catégorie> | <rôlesDuPersonnel>",
        description: "Ajouter une catégorie de tickets",
      },
      {
        trigger: "remove <catégorie>",
        description: "Supprimer une catégorie de tickets",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "list",
        description: "Listez toutes les catégories de tickets",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "add",
        description: "Ajouter une catégorie de tickets",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "category",
            description: "le nom de la catégorie",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
          {
            name: "staff_roles",
            description: "les rôles du personnel",
            type: ApplicationCommandOptionType.String,
            required: false,
          },
        ],
      },
      {
        name: "remove",
        description: "Supprimer une catégorie de tickets",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "category",
            description: "le nom de la catégorie",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
    ],
  },

  async messageRun(message, args, data) {
    const sub = args[0].toLowerCase();
    let response;

    // list
    if (sub === "list") {
      response = listCategories(data);
    }

    // add
    else if (sub === "add") {
      const split = args.slice(1).join(" ").split("|");
      const category = split[0].trim();
      const staff_roles = split[1]?.trim();
      response = await addCategory(message.guild, data, category, staff_roles);
    }

    // remove
    else if (sub === "remove") {
      const category = args.slice(1).join(" ").trim();
      response = await removeCategory(data, category);
    }

    // invalid subcommand
    else {
      response = "Command non valide.";
    }

    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand();
    let response;

    // list
    if (sub === "list") {
      response = listCategories(data);
    }

    // add
    else if (sub === "add") {
      const category = interaction.options.getString("category");
      const staff_roles = interaction.options.getString("staff_roles");
      response = await addCategory(interaction.guild, data, category, staff_roles);
    }

    // remove
    else if (sub === "remove") {
      const category = interaction.options.getString("category");
      response = await removeCategory(data, category);
    }

    //
    else response = "Command non valide.";
    await interaction.followUp(response);
  },
};

function listCategories(data) {
  const categories = data.settings.ticket.categories;
  if (categories?.length === 0) return "Pas de catégories de tickets trouvés.";

  const fields = [];
  for (const category of categories) {
    const roleNames = category.staff_roles.map((r) => `<@&${r}>`).join(", ");
    fields.push({ name: category.name, value: `**Staff :** ${roleNames || "None"}` });
  }
  const embed = new EmbedBuilder().setAuthor({ name: "Catégories de tickets" }).addFields(fields);
  return { embeds: [embed] };
}

async function addCategory(guild, data, category, staff_roles) {
  if (!category) return "Utilisation invalide ! Nom de la catégorie manquante.";

  // check if category already exists
  if (data.settings.ticket.categories.find((c) => c.name === category)) {
    return `Catégorie \`${category}\` existe déjà.`;
  }

  const staffRoles = (staff_roles?.split(",")?.map((r) => r.trim()) || []).filter((r) => guild.roles.cache.has(r));

  data.settings.ticket.categories.push({ name: category, staff_roles: staffRoles });
  await data.settings.save();

  return `Catégorie \`${category}\` ajoutée.`;
}

async function removeCategory(data, category) {
  const categories = data.settings.ticket.categories;
  // check if category exists
  if (!categories.find((c) => c.name === category)) {
    return `Catégorie \`${category}\` n'existe pas.`;
  }

  data.settings.ticket.categories = categories.filter((c) => c.name !== category);
  await data.settings.save();

  return `Catégorie \`${category}\` supprimé.`;
}
