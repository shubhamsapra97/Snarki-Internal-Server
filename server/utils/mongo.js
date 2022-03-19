const { MongoClient } = require('mongodb');
// const { fetchSSMSecrets } = require('./aws/ssmSecrets');
// const ssmKeys = require('./aws/ssmKeys');

let db;
async function connectToMongoServer() {
  // const url = await fetchSSMSecrets(ssmKeys.mongoUrl);
  const url = 'mongodb://127.0.0.1:27017';
  // const url = "mongodb+srv://shubhamSnarkiAdmin:E5F_aiSjaE_vDnd@cluster0.se5ps.mongodb.net/Snarki?retryWrites=true&w=majority";
  const client = new MongoClient(url);
  await client.connect();
  db = client.db('Snarki');
  console.log("Connected to Snarki db");
  return;
}

const getDb = () => {
  return db;
};

module.exports = {
  getDb,
  connectToMongoServer
};