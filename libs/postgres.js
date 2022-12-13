const { Client } = require('pg');

async function getConnection() {
  const client = new Client({
    host: 'VMTESTBD',
    port: 5432,
    user: 'adempiere',
    password: 'adempiere',
    database: 'adempiere_productores_light'
  });
  await client.connect();
  return client;
}


module.exports = getConnection;