/* if (cmd === `${prefix}dm`) {
    if (!message.member.roles.find(`name`, "STAFF")) return message.reply("você não tem permissão para executar este comando");
    let arguments = args.slice(1).join(" ");
    if (arguments.length < 1) return message.channel.send(`Digite algo`);
    let botembed = new Discord.RichEmbed()
        .setTitle("Comunicado")
        .setColor("#fa0a00")
        .setDescription(`${args.join(" ").replace(message.mentions.users.first(), ``)}`)
        .setFooter(`Mensagem enviada por: ${message.author.username} `, "https://images-ext-1.discordapp.net/external/BCKxPNzZzEVfkbIublv7_3wG2016jTwGk3onTemVRnM/%3Fv%3D1/https/cdn.discordapp.com/emojis/450112878108999680.gif")
    message.delete();
    let user = message.mentions.users.first();
    bot.users.get(user.id).send(botembed);
    message.channel.send(`${message.member}, Enviei uma mensagem em seu DM! Checa lá :wink: `);
    return;
} */