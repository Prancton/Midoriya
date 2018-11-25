////////////* Importante *///////////
global.Discord = require('discord.js');
global.client = new Discord.Client();
global.config = require('./config.json');
let token = require('./bot/token/token.json')
////////////////////////////////////

////////////* Utilidade *///////////
global.fs = require("fs");
global.pixelUtil = require('pixel-util');
client.comandos = new Discord.Collection();
const talkedRecently = new Set();
////////////////////////////////////


////////////* Globais *///////////
global.moment = require("moment");
global.moment.locale('pt-BR');
global.color = "#36393E";
global.servidorofc = "493509622368436225";
//////////////////////////////////


////////////* Handler *///////////
const Command = require('./Command.js');
const CommandManager = require('./CommandManager.js');
let commands = {};
let CommandManagers = [];
let reload = require('require-reload')
module.exports = {
    CommandManagers
};
//////////////////////////////////

////////////* Requires *///////////
require('./eventos/entrouservidor.js').run(client);
require('./eventos/saiuservidor.js').run(client);
///////////////////////////////////

////////////* Firebase *///////////
global.firebase = require('firebase-admin');
var serviceAccount = require('./Database/serviceAccountKey.json');
firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: 'https://spux-bot.firebaseio.com'
});
///////////////////////////////////


/* module.exports = {
    help: '',
    aliases: [''],
    ownerOnly: false,
    cooldown: 3,
    run: async (client, message, args) => {
        //CODE
    }
} */

client.on("ready", async () => {
    const logm = `
    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
        Nome ⪧ SpuxBOT                                                                        
        ID ⪧ ${client.user.id}                                                                
        Bot Versão ⪧ ${config.version}                                                             
        Total de servidores ⪧ ${client.guilds.size}                                            
        Total de membros  ⪧ ${client.users.size}
        Server de suporte ⪧ https://discordapp.com/invite/dzPYj5z
        Convite ⪧ https://discordapp.com/api/oauth2/authorize?client_id=487315503623176222&permissions=1275456576&scope=bot
    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`
    console.log(logm);
    let status = [
        `Felicidades a ${client.users.size} pessoas em ${client.guilds.size} servidores!`,
        `Amor, alegria, carinho e diversão a ${client.users.size} pessoas!`,
        `Ajuda? minha prefix é ${config.prefix}`,
        `Está perdido(a)? para saber meus comandos use ${config.prefix}ajuda`,
        `Obrigado a todos os ${client.guilds.size} servers por terem me adicionado!`,
        `Achou algum BUG? ERRO? reporte eles usando ${config.prefix}reportarbug <bug>`,
        `Dashboard em desenvolvimento! :D`
    ];

    async function setGame() {
        let data = await firebase.database().ref('Bot/Manutencao/Bot/Global/Manutenção').once('value');
        let val = data.val();
        if (val == 'ligada') {
            client.user.setStatus('dnd');
            return client.user.setPresence({
                game: {
                    name: "Bot em manutenção, todos comandos bloqueados.",
                    type: 0
                }
            });
        }
        let game = status[Math.floor(Math.random() * status.length)];
        return client.user.setPresence({
            game: {
                name: game,
                type: 1,
                url: 'https://www.twitch.tv/Spux'
            }
        });
    }

    await setGame();

    setInterval(async () => {
        await setGame();
    }, 5 * 60 * 1E3);
});


client.on('guildMemberAdd', async member => {
    let bemvindo = await firebase.database().ref(`Bot/Servidores/${member.guild.id}/Sistema_de_bemvindo`).once('value');
    let valbemvindo = bemvindo.val();
    if (valbemvindo == true) {
        let bemvindomsg = await firebase.database().ref(`Bot/Servidores/${member.guild.id}/Mensagem_de_bemvindo`).once('value');
        let valbemvindomsg = bemvindomsg.val().replace('{membro}', `${member}`).replace('{membrotag}', `${member.user.tag}`).replace('{servidor}', `${member.guild.name}`).replace('{usuarios}', `${member.guild.members.size}`);
        let bemvindoembedcor = await firebase.database().ref(`Bot/Servidores/${member.guild.id}/Mensagem_de_bemvindo_embedcor`).once('value');
        let valbemvindoembedcor = bemvindoembedcor.val();
        let bemvindoembed = new Discord.RichEmbed()
            .setDescription(valbemvindomsg)
            .setColor(valbemvindoembedcor)
        let bemvindocanal = await firebase.database().ref(`Bot/Servidores/${member.guild.id}/Canal_de_bemvindo`).once('value');
        let valbemvindocanal = bemvindocanal.val();
        let bemvindotipo = await firebase.database().ref(`Bot/Servidores/${member.guild.id}/Mensagem_de_bemvindo_tipo`).once('value');
        let valbemvindotipo = bemvindotipo.val();
        let canal = member.guild.channels.get(valbemvindocanal)
        if (!canal) {
            bemvindo.ref.set(false);
            bemvindocanal.ref.set('');
            return;
        } else if (!valbemvindomsg) {
            bemvindo.ref.set(false);
            bemvindocanal.ref.set('');
            return;
        }
        if (valbemvindotipo == "embed") {
            client.guilds.get(member.guild.id).channels.get(valbemvindocanal).send(bemvindoembed)
        } else if (valbemvindotipo == "normal") {
            client.guilds.get(member.guild.id).channels.get(valbemvindocanal).send(valbemvindomsg)
        }
    }
})

client.on('message', async message => {
    let nao = ':nao:487408951013670923',
        sim = ':sim:487408950770401285';
    if (message.author.bot) return;
    if (message.channel.type === 'dm') {
        if (talkedRecently.has(message.author.id)) return message.react(nao);
        if (!config.ownerId.includes(message.author.id)) {
            let eb = new Discord.RichEmbed()
                .setDescription(`<${nao}> | **${message.author.username}**, Você não pode enviar mensagens ou executar comandos no meu privado! \n Caso queira me adicionar no servidor \n [[Clique aqui]](https://discordapp.com/api/oauth2/authorize?client_id=487315503623176222&permissions=1275456576&scope=bot)`)
                .setColor(color)
                .setFooter('Mensagem será removida em 10 segundos..', client.user.avatarURL)
                .setTimestamp()
            message.react(nao);
            talkedRecently.add(message.author.id);
            setTimeout(() => {
                talkedRecently.delete(message.author.id);
            }, 120000);
            return message.channel.send(eb).then(msg => {
                msg.delete(10000)
            });
        }
    }

    ////////////* Configuração prefix *///////////
    global.dataprefix = await firebase.database().ref(`Bot/Servidores/${message.guild.id}/Prefix`).once('value');
    global.prefix = dataprefix.val() || config.prefix;


    if (RegExp(`^(<@!?${client.user.id}>)`).test(message.content)) {
        let data = await firebase.database().ref('Bot/Manutencao/Bot/Global/Manutenção').once('value');
        let val = data.val();
        if (val == 'ligada') {
            if (message.author.id !== config.ownerId) {
                let eb = new Discord.RichEmbed()
                .setColor(color)
                .setTimestamp()
                .setImage('https://support.discordapp.com/hc/en-us/article_attachments/206303208/eJwVyksOwiAQANC7sJfp8Ke7Lt15A0MoUpJWGmZcGe-ubl_eW7zGLmaxMZ80A6yNch-rJO4j1SJr73Uv6Wwkcz8gMae8HeXJBOjC5NEap42dokUX_4SotI8GVfBaYYDldr3n3y_jomRtD_H5ArCeI9g.zGz1JSL-9DXgpkX_SkmMDM8NWGg.gif')
                .setFooter(message.author.username, message.author.avatarURL)
                .setDescription(`\n <${nao}> | Olá **${message.author.username}**, no momento o bot está em manutenção`)
            return message.channel.send(eb);
            }
        }
        let eb = new Discord.RichEmbed()
            .setColor(color)
            .setTimestamp()
            .setThumbnail(client.user.avatarURL)
            .setFooter(message.author.username, message.author.avatarURL)
            .setDescription(`\n <${sim}> | Olá **${message.author.username}**!\n<:__:491398290919653396> Está precisando de ajuda? \n<:__:491398290919653396> Use **${prefix}ajuda**\n<:__:491398290919653396> Meu prefixo é **${prefix}**\n `)
            .addField(`<${sim}> | Servidor de **Suporte**`, `ㅤㅤ[[Clique aqui]](https://discord.gg/uMZrw2j)`, true)
            .addField(`<${sim}> | Me adicione ao seu **Servidor**`, `ㅤㅤ[[Clique aqui]](https://discordapp.com/api/oauth2/authorize?client_id=487315503623176222&permissions=1275456576&scope=bot)`, false);
        message.channel.send(eb);
    }

    ////////////* Sistemas *///////////
    ////////////* Anti invite *///////////
    let datainv = await firebase.database().ref(`Bot/Servidores/${message.guild.id}/Sistema_de_antiinvite`).once('value');
    let valinv = datainv.val();
    if (valinv == true) {
        if (message.content.includes('discord.gg') || message.content.includes('discordapp.com/invite')) {
            if (!message.member.hasPermission("MANAGE_GUILD")) {
                message.delete();
                let embed = new Discord.RichEmbed()
                    .setDescription("<:nao:487408951013670923> | **" + message.author.username + "** Você não tem permissão para enviar convites nesse servidor!")
                    .setColor(color)
                    .setTimestamp()
                    .setFooter(message.author.username, message.author.avatarURL)
                message.channel.send(embed);
            }

        }
        client.on('messageUpdate', async (oldMsg, newMsg) => {
            if (newMsg.author.bot) return;
            if (newMsg.content.includes('discordapp.com/invite') || newMsg.content.includes('discord.gg')) {
                if (!newMsg.member.hasPermission("MANAGE_GUILD")) {
                    newMsg.delete();
                    let embed = new Discord.RichEmbed()
                        .setDescription("<:nao:487408951013670923> | **" + newMsg.author.username + "** Você não tem permissão para enviar convites nesse servidor!")
                        .setColor(color)
                        .setTimestamp()
                        .setFooter(newMsg.author.username, newMsg.author.avatarURL)
                    newMsg.channel.send(embed);
                }
            }

        });
    }




    if (!message.content.startsWith(prefix)) return;

    if ((await firebase.database().ref(`Bot/Banidosdobot/Usuarios`).once('value')).hasChild(message.author.id)) {
        let datadono = await firebase.database().ref(`Bot/Usuarios/${message.author.id}/Cargo`).once('value');
        let valdono = datadono.val();
        if (valdono !== 'Dono') return;
    }
    ////////////* Manutenção *///////////
    let data = await firebase.database().ref('Bot/Manutencao/Bot/Global/Manutenção').once('value');
    let val = data.val();
    if (val == 'ligada') {
        let datadono = await firebase.database().ref(`Bot/Usuarios/${message.author.id}/Cargo`).once('value');
        let valdono = datadono.val();
        if (valdono !== 'Dono') {
            let eb = new Discord.RichEmbed()
                .setColor(color)
                .setTimestamp()
                .setImage('https://support.discordapp.com/hc/en-us/article_attachments/206303208/eJwVyksOwiAQANC7sJfp8Ke7Lt15A0MoUpJWGmZcGe-ubl_eW7zGLmaxMZ80A6yNch-rJO4j1SJr73Uv6Wwkcz8gMae8HeXJBOjC5NEap42dokUX_4SotI8GVfBaYYDldr3n3y_jomRtD_H5ArCeI9g.zGz1JSL-9DXgpkX_SkmMDM8NWGg.gif')
                .setFooter(message.author.username, message.author.avatarURL)
                .setDescription(`\n <${nao}> | Olá **${message.author.username}**, no momento o bot está em manutenção`)
            return message.channel.send(eb);
        }
    }


    ////////////* Execução dos comandos *///////////

    global.name = message.content.slice(prefix.length).split(' ')[0].trim();
    let manager = CommandManagers.find(c => !!c.checkForMatch(name));
    if (!manager) {
        if (!name) {
            let eb = new Discord.RichEmbed()
                .setColor(color)
                .setTimestamp()
                .setThumbnail(client.user.avatarURL)
                .setFooter(message.author.username, message.author.avatarURL)
                .setDescription(`\n <${sim}> | Olá **${message.author.username}**!\n<:__:491398290919653396> Está precisando de ajuda? \n<:__:491398290919653396> Use **${prefix}ajuda**\n<:__:491398290919653396> Meu prefixo é **${prefix}**\n `)
                .addField(`<${sim}> | Servidor de **Suporte**`, `ㅤㅤ[[Clique aqui]](https://discord.gg/uMZrw2j)`, true)
                .addField(`<${sim}> | Me adicione ao seu **Servidor**`, `ㅤㅤ[[Clique aqui]](https://discordapp.com/api/oauth2/authorize?client_id=487315503623176222&permissions=1275456576&scope=bot)`, false);
            message.channel.send(eb);
        } else {
            message.react(nao)
        }
    } else {
        manager.processCommand(client, message);
        let datauser = await firebase.database().ref(`Bot/Usuarios/`).once('value');
        if (!datauser.hasChild(message.author.id)) {
            if (message.author.id == '249670124238405652') {
                datauser.ref.child(message.author.id).set({
                    Nome: message.author.username,
                    ID: message.author.id,
                    Servidor: message.guild.name,
                    ServidorID: message.guild.id,
                    Perfil_descricao: 'Digite //perfil descrição',
                    Cargo: 'Dono'
                });
            } else {
                datauser.ref.child(message.author.id).set({
                    Nome: message.author.username,
                    ID: message.author.id,
                    Servidor: message.guild.name,
                    ServidorID: message.guild.id,
                    Perfil_descricao: 'Digite //perfil descrição',
                    Cargo: 'Usuario'
                });
            }
        }
        let dataserver = await firebase.database().ref(`Bot/Servidores/`).once('value');
        if (!dataserver.hasChild(message.guild.id)) {
            dataserver.ref.child(message.guild.id).set({
                /* INFO */
                Nome: message.guild.name,
                ID: message.guild.id,
                Prefix: 'sp.',
                /* SISTEMAS */
                Sistema_de_antiinvite: false,
                Sistema_de_anticapslock: false,
                Sistema_de_levels: false,
                Sistema_de_bemvindo: false,
                Sistema_de_adeus: false,
                /* CONIG LEVEL */
                Mensagem_de_levels: '',
                /* CONIG BEM-VINDO */
                Mensagem_de_bemvindo: '',
                Mensagem_de_bemvindo_tipo: 'normal',
                Mensagem_de_bemvindo_embedcor: '',
                /* CONIG ADEUS */
                Canal_de_bemvindo: '',
                Mensagem_de_adeus: '',
                Mensagem_de_adeus_tipo: 'normal',
                Mensagem_de_adeus_embedcor: '#36393E',
                Canal_de_adeus: ''
            });
        }
    }

});
let chokidar = require('chokidar');
let watcher = chokidar.watch([
    './comandos'
]);
watcher
    .on('change', (path) => reloadCommand(path))
    .on('unlink', (path) => reloadCommand(path));

function reloadCommand(path) {
    let [category, name] = path.split(/\\|.js/).slice(1);
    let manager = CommandManagers.find(c => c.category == category && c.checkForMatch(name));
    if (manager)
        manager.reload(name);
}


function loadCommandSets() {
    return new Promise(resolve => {
        CommandManagers = [];
        for (let category in config.commandSets) {
            CommandManagers.push(new CommandManager(config, category, config.commandSets[category].dir));
        }
        resolve();
    });
}

function initCommandManagers(index = 0) {
    return new Promise((resolve, reject) => {
        CommandManagers[index].init(client, config) //Load CommandManager at {index}
            .then(() => {
                console.debug('CATEG', `Carregado categoria ${CommandManagers[index].category}`);
                index++;
                if (CommandManagers.length > index) {
                    initCommandManagers(index)
                        .then(resolve)
                        .catch(reject);
                } else
                    resolve();
            }).catch(reject);
    });
}

function login() {
    client.login(token.token);
}

loadCommandSets()
    .then(initCommandManagers)
    .then(login);