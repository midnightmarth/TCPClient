#!/usr/bin/env node
const net = require("net");
const readline = require ("readline")

const { IpAddress, port } = require("./config");
const option = { host: IpAddress.IpAddress, port: port.port };

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

  client.on("data", (data) => {
    console.log("\n............\nGot Data!: ", data, '\n............\n');
    try {
      let parsed = data.split('\n')
      for(let json of parsed){
        if(json !== ''){
          let incomingData = JSON.parse(json);
          if(incomingData.type === 'msg'){ //checks to see if there is only a message attribute
            try{
              if (incomingData.msg.time) {
                if(incomingData.msg.random > 30){
                  console.log('Random number is greater than 30: ', incomingData.msg.random)
                }
            }
            }catch(err){
              console.log('Could not parse time object: ', err)
            }
          }
        }
      }
    } catch (err) {
      console.error("*******ERROR******* \nJSON object not formatted properly");
    }
  });


  client.on("end", function() {
    console.log("Client socket disconnect. ");
  });

  client.on("error", function(err) {
    console.error('An error has occurred: ', JSON.stringify(err));
    client.end()
  });
  return client;
}

const listenForCommand = (rl)=>{
  rl.prompt();
  return new Promise((res,rej) => {
    rl.once('line', (input) => {
    input = input.toLowerCase();
    switch( input ){
      case 'time':
        res ({'request': 'time'});
        console.log('Asking for Server Time');
        break;
      case 'count':
        res({'request': 'count'});
        console.log('Asking for Count');
        break;
      case 'exit':
        rej("exit");
        break;
      default:
        try{
          let parse = JSON.parse(input)
          console.log('valid json input')
          res(parse)
        }catch(e){
          res("bad");
        }
    }
    rl.once('close',()=>rej('closed'));
  });
});
}

const login = (client,name) => {
  client.write(JSON.stringify({ name }));
}

const connect = (name) => {
  let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.setPrompt('Enter a command');

  let client = getConn("Node");
  client.setTimeout(2000);
  client.once("connect", () => {
    login(client,name);
    mainLoop(rl,client);
  });
  client.once("timeout", function() {
    console.log("Connection timeout.");
    client.end();
    rl.close();
    return connect(name);
  });
};

const getLogin=()=> {
  return new Promise((res,rej)=>{
    let rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
      rl.question('Login: ', (name)=> {
      if(name.length > 12){
        rl.close();
        rej('Usernames cannot be longer than 12 characters');
      } else {
        rl.close();
        res(name)
      };
    });
  });
}

const mainLoop=(rl,client) => {
  listenForCommand(rl).then(data=>{
    if (!client.destroyed) {
      if (data!=='bad')
        client.write(JSON.stringify(data));
      mainLoop(rl,client);
    }
  }).catch((e)=>{
    console.error("*** Catch in mainloop.....")
  })
}

getLogin().then(name=>{
  connect(name);
});