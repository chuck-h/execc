#!/usr/bin/env node

const fs = require('fs')
const fetch = require('node-fetch');

const telosHost = 'telos.caleos.io';
const csvFileName = 'seeds_accounts.txt';

const seedsaccountsPageSize = 50;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}



async function seedsaccounts1Page(next) {
  try {
    const url = `https://${telosHost}/v1/chain/get_table_by_scope`;
    const customHeaders = {
      "Content-Type": "application/json",
      "accept": "application/json",
    };
    const data = {
      code: "token.seeds",
      table: "accounts",
      lower_bound: `${next}`,
      limit: seedsaccountsPageSize,
      reverse: false,
      json: true
    };
                         
    res = await fetch(url, {
      method: "POST",
      headers: customHeaders,
      body: JSON.stringify(data),
    })

    response = await res.json();
    return response;
  } catch (error) {
    console.log(error);
    return error;
  }
};

var accountlist = [];
async function seedsaccountsAll() {
  var next = ""
  while (true) {
    const r = await seedsaccounts1Page(next);

    accounts = r.rows.map((row)=>row.scope);
    accountlist.push(...accounts);
    console.log(accountlist.length)
    if (r.more == "") {
      break;
    } else {
      next = r.more
      await sleep(100) // be kind to blockchain server
    }
    
  }
};

// main routine
(async() => {
  console.log(`seeds_accounts.js run started at \n   ${Date()}`);

  await seedsaccountsAll();
  console.log(`... ${accountlist.length} accounts.`);

  //console.log(accountlist);

  const csv = accountlist.join('\r\n');
  
  console.log(`Writing to ${csvFileName}.`);
  fs.writeFileSync(csvFileName, csv);

})();
