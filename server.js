#!/usr/bin/env node
const net = require("net");
const readline = require ("readline")
const { IpAddress, port } = require("./config");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

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

  client.on("connect", () => {
    console.log("Got Connection!");
  });

  client.on("data", (data) => {
    console.log("............\nGot Data!: ", data, '\n............');
    try {
      
      let parsed = data.split('\n')
      for(let i of parsed){
        if(i !== ''){
          JSON.parse(i);
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
    console.log("Client connection timeout.");
    client.end()
  });

  client.on("error", function(err) {
    console.error(JSON.stringify(err));
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

const additionalParam = () => {
  return new Promise((resolve, reject) => {
    rl.question('enter commands as you get data', (input) => {
      input = input.toLowerCase()
      switch( input !== ''){
        case input === 'time':
          resolve( {'request': 'time'})
        case input === 'count':
          resolve( {'request': 'count'})
        default:
          reject(null)
      }
    })
  })
}

const login = (name) => {
  if(name.length > 12){
    console.log('Usernames cannot be longer than 12 characters')
    relogin();
    return
  }
  var nodeClient = getConn("Node");
  nodeClient.write(JSON.stringify({ name }));

  new Promise((resolve, reject) => {
    additionalParam().then(data => {resolve(data)})
  }).then(data => {
    nodeClient.write(JSON.stringify(data))
  })

};

module.exports = { login };
