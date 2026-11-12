const fs = require("node:fs");
const path = require("node:path");
const { REST, Routes } = require("discord.js");
const config = require("./config");

const commands = [];
const commandsPath = path.join(__dirname, "commands");

for (const file of fs.readdirSync(commandsPath).filter((name) => name.endsWith(".js"))) {
  const command = require(path.join(commandsPath, file));
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(config.token);

(async () => {
  try {
    console.log(`جارٍ تسجيل ${commands.length} أمر...`);

    if (config.guildId) {
      await rest.put(
        Routes.applicationGuildCommands(config.clientId, config.guildId),
        { body: commands }
      );
      console.log("تم تسجيل الأوامر في سيرفر الاختبار.");
    } else {
      await rest.put(
        Routes.applicationCommands(config.clientId),
        { body: commands }
      );
      console.log("تم تسجيل الأوامر العامة. قد يستغرق ظهورها بعض الوقت.");
    }
  } catch (error) {
    console.error("تعذر تسجيل الأوامر:", error);
    process.exitCode = 1;
  }
})();
