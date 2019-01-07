const program = require('commander');
const {login} = require('./server')

program
  .version('0.0.1')
  .description('A TCP client that communicates with a server')

program
  .command('login <user>')
  .description('login to client')
  .action((user) => {
    login(user)
  })


program.parse(process.argv);
