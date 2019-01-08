#!/usr/bin/env node
const program = require('commander');
const net = require("net");
const readline = require ("readline")

const { IpAddress, port } = require("./config");
const option = { host: IpAddress.IpAddress, port: port.port };
let rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

program
  .version('0.0.1')
  .description('A TCP client that communicates with a server')
  
program.parse(process.argv);

let getConn = connName => {
  let client = net.createConnection(option, () => {
    console.log("Connection name : " + connName);
    console.log(
      "Connection local address : " +
        client.localAddress +
        ":" +
        client.localPort
    );
    console.log(
      "Connection remote address : " +
        client.remoteAddress +
        ":" +
        client.remotePort
    );
  });

  client.setEncoding("utf8");

  client.on("connect", () => {

    console.log("Got Connection!");
    connected = true;
    rl.setPrompt('Enter a command')
    rl.prompt()
    rl.on('line', (input) => {
      input = input.toLowerCase()
      switch( input !== '' ){
        case input === 'time':
          client.write( JSON.stringify({'request': 'time'}) )
          console.log('Asking for Server Time')
          break;
        case input === 'count':
          client.write(JSON.stringify({'request': 'count'}) )
          console.log('Asking for Count')
          break;
        case input === 'exit':
          client.end()
          break;
        default:
          return
      }
    })
    rl.prompt()
  });

  let hb = null;
  client.on("data", (data) => {
    console.log("\n............\nGot Data!: ", data, '\n............\n');
    try {
      let parsed = data.split('\n')
      for(let i of parsed){
        if(i !== ''){
          let incomingData = JSON.parse(i);
          if(incomingData.type === 'heartbeat' && hb && !incomingData.msg){
            if (incomingData.epoch == hb.epoch+1 || incomingData.epoch == hb.epoch){
              hb = incomingData
            }else{
              console.log('Data didnt get received in 2 seconds')
              cleint.end()
            }
          }else{
            if(!incomingData.msg)
              hb = incomingData
          }
        }
      }
    } catch (err) {
      console.log("JSON object not formatted properly");
      client.end()
    }
  });

  client.on("end", function() {
    console.log("Client socket disconnect. ");
    relogin()
  });

  client.on("timeout", function() {
    console.log("Connection timeout.");
    client.end()
  });

  client.on("error", function(err) {
    console.error('An error has occurred: ', JSON.stringify(err));
    client.end()
  });

  return client;
};

const relogin = () => {
  rl.question('Login: ', (name)=> {
    if(name.length > 12){
      console.log('Usernames cannot be longer than 12 characters')
      relogin();
    }
    login(name)
  })
}

const login = (name) => {
  var nodeClient = getConn("Node");
  nodeClient.write(JSON.stringify({ name }));
};

relogin()