require('dotenv').config();
const { MongoClient } = require('mongodb');

async function run() {
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  const db = client.db('sprint');
  const admins = await db.collection('users').find({ isAdmin: true }).toArray();
  console.log("Admins count:", admins.length);
  if (admins.length > 0) {
    console.log("First admin ID:", admins[0].id);
  }
  await client.close();
}
run();
