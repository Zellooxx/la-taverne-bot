module.exports = {
  OWNER_IDS: ["1199829935875965190"], // ID du propriétaire du bot
  SUPPORT_SERVER: "1198625511706996757", // Votre serveur de support du bot
  PREFIX_COMMANDS: {
    ENABLED: true, // Activer/désactiver les commandes de préfixe
    DEFAULT_PREFIX: "!", // Préfixe par défaut pour le bot
  },
  INTERACTIONS: {
    SLASH: true, // Les interactions doivent-elles être activées ?
    CONTEXT: true, // Les contextes doivent-ils être activés ?
    GLOBAL: true, // Les interactions doivent-elles être enregistrées globalement ?
    TEST_GUILD_ID: "xxxxxxxxxxx", // ID de la guilde où les interactions doivent être enregistrées. [** Testez d'abord vos commandes ici **]
  },
  EMBED_COLORS: {
    BOT_EMBED: "#068ADD",
    TRANSPARENT: "#36393F",
    SUCCESS: "#00A56A",
    ERROR: "#D61A3C",
    WARNING: "#F7E919",
  },
  CACHE_SIZE: {
    GUILDS: 100,
    USERS: 10000,
    MEMBERS: 10000,
  },
  MESSAGES: {
    API_ERROR: "Erreur inattendue du backend ! Réessayez plus tard ou contactez le serveur d'assistance",
  },

  // PLUGINS

  AUTOMOD: {
    ENABLED: false,
    LOG_EMBED: "#36393F",
    DM_EMBED: "#36393F",
  },

  DASHBOARD: {
    enabled: false, // activer ou désactiver le tableau de bord
    baseURL: "http://localhost:8080", // url de base
    failureURL: "http://localhost:8080", // échec redirection url
    port: "8080", // le port sur lequel le robot doit être exécuté
  },

  ECONOMY: {
    ENABLED: false,
    CURRENCY: "₪",
    DAILY_COINS: 100, // pièces à recevoir par commandement quotidien
    MIN_BEG_AMOUNT: 100, // pièces minimales à recevoir lors de l'utilisation de la commande beg
    MAX_BEG_AMOUNT: 2500, // pièces maximales à recevoir lorsque la commande beg est utilisée
  },

  MUSIC: {
    ENABLED: true,
    IDLE_TIME: 60, // Temps en secondes avant que le bot ne se déconnecte d'un canal vocal inactif
    MAX_SEARCH_RESULTS: 5,
    DEFAULT_SOURCE: "YT", // YT = Youtube, YTM = Youtube Music, SC = SoundCloud
    // Ajouter ici un nombre quelconque de nœuds lavalink
    // Consultez le site https://github.com/freyacodes/Lavalink pour héberger votre propre serveur lavalink.
    LAVALINK_NODES: [
      {
        host: "lava.dcmusic.ca",
        port: 443,
        password: "youshallnotpass",
        id: "Lavalink",
        secure: true,
      },
    ],
  },

  GIVEAWAYS: {
    ENABLED: false,
    REACTION: "🎁",
    START_EMBED: "#FF468A",
    END_EMBED: "#FF468A",
  },

  IMAGE: {
    ENABLED: false,
    BASE_API: "https://strangeapi.fun/api",
  },

  INVITE: {
    ENABLED: false,
  },

  MODERATION: {
    ENABLED: true, // Si le BOT doit ou non mettre à jour le statut de
    EMBED_COLORS: {
      TIMEOUT: "#102027",
      UNTIMEOUT: "#4B636E",
      KICK: "#FF7961",
      SOFTBAN: "#AF4448",
      BAN: "#D32F2F",
      UNBAN: "#00C853",
      VMUTE: "#102027",
      VUNMUTE: "#4B636E",
      DEAFEN: "#102027",
      UNDEAFEN: "#4B636E",
      DISCONNECT: "RANDOM",
      MOVE: "RANDOM",
    },
  },

  PRESENCE: {
    ENABLED: true, // Si le BOT doit ou non mettre à jour son statut
    STATUS: "online", // Le statut du bot [en ligne, inactif, en sommeil, invisible].
    TYPE: "PLAYING", // Type d'état du bot [PLAYING | LISTENING | WATCHING | COMPETING]
    MESSAGE: "Surveille {members} membres sur la taverne", // Votre message status du bot
  },

  STATS: {
    ENABLED: true,
    XP_COOLDOWN: 5, // Délai de réflexion en secondes entre les messages
    DEFAULT_LVL_UP_MSG: "{member:tag}, Vous venez de progresser vers le**Niveau {level}**",
  },

  SUGGESTIONS: {
    ENABLED: false, // Faut-il activer le système de suggestions ?
    EMOJI: {
      UP_VOTE: "⬆️",
      DOWN_VOTE: "⬇️",
    },
    DEFAULT_EMBED: "#4F545C",
    APPROVED_EMBED: "#43B581",
    DENIED_EMBED: "#F04747",
  },

  TICKET: {
    ENABLED: true,
    CREATE_EMBED: "#068ADD",
    CLOSE_EMBED: "#068ADD",
  },
};
