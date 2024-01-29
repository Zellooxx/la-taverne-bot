const { getBuffer } = require("@helpers/HttpUtils");
const { AttachmentBuilder, ApplicationCommandOptionType } = require("discord.js");

const PROXY_TYPES = ["all", "http", "socks4", "socks5"];

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "proxies",
  description: "récupérer les procurations.Types disponibles: HTTP, SOCKS4, SOCKS5",
  cooldown: 5,
  category: "UTILITAIRE",
  botPermissions: ["EmbedLinks", "AttachFiles"],
  command: {
    enabled: true,
    usage: "[type]",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "type",
        description: "type of proxy",
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: PROXY_TYPES.map((p) => ({ name: p, value: p })),
      },
    ],
  },

  async messageRun(message, args) {
    let type = "all";

    if (args[0]) {
      if (PROXY_TYPES.includes(args[0].toLowerCase())) type = args[0].toLowerCase();
      else return message.safeReply("Type de proxy incorrect. Types disponibles: `HTTP ',` Socks4`, `socks5'");
    }

    const msg = await message.channel.send("Réclamer des procurations ... Veuillez patienter");
    const response = await getProxies(type);
    if (msg.deletable) await msg.delete();
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const type = interaction.options.getString("type");
    await interaction.followUp("Réclamer des procurations ... Veuillez patienter");
    const response = await getProxies(type);
    await interaction.editReply(response);
  },
};

async function getProxies(type) {
  const response = await getBuffer(
    `https://api.proxyscrape.com/?request=displayproxies&proxytype=${type}&timeout=10000&country=all&anonymity=all&ssl=all`
  );

  if (!response.success || !response.buffer) return "Échec de récupérer les procurations";
  if (response.buffer.length === 0) return "Ne pouvait pas récupérer les données. Réessayez plus tard";

  const attachment = new AttachmentBuilder(response.buffer, { name: `${type.toLowerCase()}_proxies.txt` });
  return { content: `${type.toUpperCase()} Proxys récupérés`, files: [attachment] };
}
