require("dotenv").config();

const required = ["DISCORD_TOKEN", "CLIENT_ID"];
const missing = required.filter((key) => !process.env[key]);

if (missing.length) {
  console.error(`إعدادات ناقصة: ${missing.join(", ")}. راجع ملف .env.`);
  process.exit(1);
}

module.exports = {
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID || null
};
