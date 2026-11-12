const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("اختبار استجابة بوت أثر"),
  async execute(interaction) {
    await interaction.reply({
      content: `حيّاك الله! أنا أثر 🤍\nزمن الاستجابة: ${interaction.client.ws.ping}ms`,
      ephemeral: true
    });
  }
};
