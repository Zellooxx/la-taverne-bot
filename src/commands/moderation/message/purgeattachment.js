const { purgeMessages } = require("@helpers/ModUtils");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "purgeattach",
  description: "Supprime la quantité spécifiée de messages avec des pièces jointes",
  category: "MODERATION",
  userPermissions: ["ManageMessages"],
  botPermissions: ["ManageMessages", "ReadMessageHistory"],
  command: {
    enabled: true,
    usage: "[amount]",
    aliases: ["purgeattachment", "purgeattachments"],
  },

  async messageRun(message, args) {
    const amount = args[0] || 99;

    if (amount) {
      if (isNaN(amount)) return message.safeReply("Les nombres ne sont autorisés que");
      if (parseInt(amount) > 99) return message.safeReply("La quantité maximale de messages que je peux supprimer est de 99");
    }

    const { channel } = message;
    const response = await purgeMessages(message.member, message.channel, "ATTACHMENT", amount);

    if (typeof response === "number") {
      return channel.safeSend(`Supprimé avec succès ${response} messages`, 5);
    } else if (response === "BOT_PERM") {
      return message.safeReply("Vous n'avez pas « Lire l'historique des messages » et «  Gérer les messages » pour supprimer les messages", 5);
    } else if (response === "MEMBER_PERM") {
      return message.safeReply("Vous n'avez pas « Lire l'historique des messages » et « Gérer les messages » pour supprimer les messages", 5);
    } else if (response === "NO_MESSAGES") {
      return channel.safeSend("Aucun message trouvé qui peut être nettoyé", 5);
    } else {
      return message.safeReply(`Erreur est survenue ! Échec de la suppression des messages`);
    }
  },
};
