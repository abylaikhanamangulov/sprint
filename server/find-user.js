require('dotenv').config();
const { MongoClient } = require('mongodb');

async function run() {
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  const db = client.db('sprint');
  const user = await db.collection('users').findOne({ username: 'soboll_ek' });
  if (user) {
    console.log("User found:", user.username, "isAdmin:", user.isAdmin, "id:", user.id);
  } else {
    console.log("User soboll_ek NOT found in the database.");
    const allUsers = await db.collection('users').find({}).toArray();
    console.log("Total users in DB:", allUsers.length);
    if (allUsers.length > 0) {
      console.log("Some users:", allUsers.slice(0, 3).map(u => u.username || u.firstName || u.id));
    }
  }
  await client.close();
}
run();
