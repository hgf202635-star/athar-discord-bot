const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("athar-help")
    .setDescription("عرض نبذة عن أوامر بوت أثر"),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0xC6A45C)
      .setTitle("أثر | المساعدة")
      .setDescription("بوت أثر لنشر الخير والتذكير بالمحتوى الإسلامي في سيرفرك.")
      .addFields(
        { name: "/ping", value: "اختبار استجابة البوت.", inline: true },
        { name: "/athar-help", value: "عرض هذه المساعدة.", inline: true }
      )
      .setFooter({ text: "أثر • ازرع ذكراً واترك أثراً" });
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
