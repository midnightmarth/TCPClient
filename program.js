const program = require('commander');
const readline = require ("readline")


let rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let recursive = () => {
  rl.question('Login: ', (name) => {
    if(name.length > 12){
      console.log('Usernames cannot be longer than 12 characters')
      recursive()
    }
    const {login} = require('./server')
    rl.close()
    login(name)
  })

}

program
  .version('0.0.1')
  .description('A TCP client that communicates with a server')
program.parse(process.argv);

recursive()