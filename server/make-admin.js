require('dotenv').config();
const { MongoClient } = require('mongodb');

async function run() {
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  const db = client.db('sprint');
  await db.collection('users').updateOne({ username: 'soboll_ek' }, { $set: { isAdmin: true } });
  console.log("Updated soboll_ek to isAdmin: true");
  await client.close();
}
run();
