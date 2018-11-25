class Command {
    constructor(name, cmd, config) {
        this.name = name;
        this.config = config;
        this.help = cmd.help || '';
        this.desc = cmd.desc || '';
        this.aliases = cmd.aliases || [];
        this.ownerOnly = cmd.ownerOnly || false;
        this.cooldown = cmd.cooldown || 0;
        this.run = cmd.run;
        this.usersOnCooldown = new Set();
    }

    async execute(client, message, args) {

        // check de comando pro dono
        let datadono = await firebase.database().ref(`Bot/Usuarios/${message.author.id}/Cargo`).once('value');
        let valdono = datadono.val();
        if (this.ownerOnly && valdono !== 'Dono') {
            let argu = new Discord.RichEmbed()
                .setDescription(`<:nao:487408951013670923> | **${message.author.username}** Este comando só os donos pode usar. `)
                .setColor(color)
                .setTimestamp()
                .setFooter(message.author.username, message.author.avatarURL)
            return message.channel.send(argu);
        }

        // check de usuários no cooldown
        if (!this.config.ownerId.includes(message.author.id)) {
            if (this.usersOnCooldown.has(message.author.id))
                return message.reply('esse comando só pode ser usado a cada ' + this.cooldown + ' segundos');
        }

        let result = null;

        try {
            result = this.run(client, message, args);
            //console.log(`${message.author.username} usou o comando ${this.name}`);
        } catch (e) {
            console.error(e);
        }

        if (result !== null) {
            this.usersOnCooldown.add(message.author.id);
            setTimeout(() => {
                this.usersOnCooldown.delete(message.author.id);
            }, this.cooldown * 1000);
        }
    }
}

module.exports = Command;