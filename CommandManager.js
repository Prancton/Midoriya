const Command = require('./Command');
const reload = require('require-reload');
const fs = require('fs');



class CommandManager {
    constructor(config, category, dir) {
        this.config = config;
        this.category = category;
        this.directory = `${__dirname}/${dir}`;
        this.commands = {};
    }

    
    init(client, config) {
        return new Promise((resolve, reject) => {
            fs.readdir(this.directory, (err, files) => {
                if (err) reject(`Erro ao ler o diretorio de comandos: ${err}`);
                else if (!files) reject(`Nenhum arquivo no diretorio ${this.directory}`);
                else {
                    for (let name of files) {
                        if (name.endsWith('.js')) {
                            try {
                                name = name.replace(/\.js$/, '');
                                this.commands[name] = new Command(name, reload(this.directory + name + '.js'), config);
                            } catch (e) {
                                console.error(`${e}\n${e.stack}`, 'Erro ao carregar comando ' + name);
                            }
                        }
                    }
                    resolve();
                }
            });
        });
    }

    processCommand(client, message) {
        let name = message.content.slice(prefix.length).split(' ')[0].trim();
        let command = this.checkForMatch(name.toLowerCase());

        if (command) {

            let args = message.content.slice(prefix.length).trim().split(/ +/g);
            return command.execute(client, message, args);
        }

        return null;
    }

    reload(name) {
        this.commands[name] = new Command(name, reload(this.directory + name + '.js'), this.config);
    }

    checkForMatch(name) {
        for (let command in this.commands)
            if (command == name || this.commands[command].aliases.includes(name))
                return this.commands[command];

        return null;
    }
}




module.exports = CommandManager;