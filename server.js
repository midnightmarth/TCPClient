#!/usr/bin/env node
const net = require("net")
const jsonlines = require('jsonlines')

const parser = jsonlines.parse({emitInvalidLines: true})
const {IpAddress, port} = require('./config')

const option = {host: IpAddress.IpAddress, port: port.port}

let getConn = (connName) => {
  let client = net.createConnection(option ,() =>{
    console.log('Connection name : ' + connName);
    console.log('Connection local address : ' + client.localAddress + ":" + client.localPort);
    console.log('Connection remote address : ' + client.remoteAddress + ":" + client.remotePort);
  })

  client.setEncoding('utf8')

  client.on('connect', () => {
    console.log('Got Connection!')
  })
  
  client.on('data', (data) => {
    console.log('Got Data!: ', data)
  })

  client.on('end',function () {
      console.log('Client socket disconnect. ');
  });

  client.on('timeout', function () {
      console.log('Client connection timeout. Need to Login?');
  });

  client.on('error', function (err) {
      console.error(JSON.stringify(err));
  });

  return client;
}

const login = (username) =>{

  var nodeClient = getConn('Node');
  nodeClient.write(JSON.stringify({name: username}))
}

module.exports = {login}