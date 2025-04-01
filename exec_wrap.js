#!/usr/bin/env node

const fs = require('fs/promises')
const fetch = require('node-fetch');
const path = require('path');

const executatorHost = '127.0.0.1:3000';
const telosHost = 'https://telos.caleos.io';
const task_lifetime = 5*60*60*1000; // 5 hrs
let actor;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}



async function getactions(filedata) {
  try {
    const url = `http://${executatorHost}/maketask`;
    const customHeaders = {
      "Content-Type": "application/json",
      "accept": "application/json",
    };
    const body = `{"account":"${actor}", "permission":"active", "trx_csv":"${filedata}",`
      + ` "lifetime": ${task_lifetime}, "endpoint":"${telosHost}"`;
    //console.log(`body...\n${body}`)                   
    res = await fetch(url, {
      method: "POST",
      headers: customHeaders,
      body: body,
    })

    response = await res.json();
    return response;
  } catch (error) {
    console.log(error);
    return error;
  }
};

async function getactionsfile(filename) {
  try {
    const url = `http://${executatorHost}/maketask`;
    const customHeaders = {
      "Content-Type": "application/json",
      "accept": "application/json",
    };
    const body = `{"account":"${actor}", "permission":"active", "trx_file":"${filename}",`
      + ` "lifetime": ${task_lifetime}, "endpoint":"${telosHost}"}`;
    console.log(`body...\n${body}`)                   
    res = await fetch(url, {
      method: "POST",
      headers: customHeaders,
      body: body,
    })

    response = await res.json();
    return response;
  } catch (error) {
    console.log(`getactionsfile: ${error}`);
    return error;
  }
};


async function getqr(actions_text) {
  try {
    const url = `http://${executatorHost}/qr`;
    const customHeaders = {
      "Content-Type": "application/json",
      "accept": "application/json",
    };
    const body = `{"endpoint":"https://mainnet.telos.net", "actions":${actions_text}}`;
                         
    res = await fetch(url, {
      method: "POST",
      headers: customHeaders,
      body: body,
    })

    response = await res.json();
    console.log(`qr response ${JSON.stringify(response)}`);
    return response;
  } catch (error) {
    console.log(error);
    return error;
  }
};


// main routine
(async() => {

  const readFirst = process.argv.indexOf('-r') > -1;
  const fileIndex = process.argv.indexOf('-f');
  const actorIndex = process.argv.indexOf('-a');
  let datafile;
  if (fileIndex > -1 && actorIndex > -1) {
    datafile = process.argv[fileIndex + 1];
    actor = process.argv[actorIndex + 1];
  } else {
    console.log (`Usage: node ${path.basename(process.argv[1])} [-r] -f <filename.csv> -a <actor account>\n`
      + '  -r  read from file first and pass data to executator\n');
    return;
  }
  
  if (readFirst) {
    console.log(`exec_wrap.js run reading data from ${datafile}, started at \n   ${Date()}`);
    var filedata
    try {
      filedata = await fs.readFile(datafile, { encoding: 'utf8'});
    } catch(e) {
      console.log(e);
      return;
    }
    filedata = filedata.replace(/\n/g, '\\n')
    actions = await getactions(filedata);
  } else {
    console.log(`exec_wrap.js run passing filename ${datafile}, started at \n   ${Date()}`);
    result = await getactionsfile(datafile);
    if (result.error) {
      console.log(result.error);
      return;
    }    
    actions = result;
  }
  
  actions_text = JSON.stringify(actions);
  console.log(actions_text);
  
  qr = await getqr(actions_text);
  console.log(`\n${qr.qr.replace(/https:/g, 'http:')}`);

})();
