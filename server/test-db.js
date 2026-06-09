import { MongoClient } from 'mongodb';
const uri = "mongodb+srv://khanamangulov:NURl41o2uJt9VbK9@cluster0.n190t.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);
async function run() {
  await client.connect();
  const db = client.db('dragracing');
  const user = await db.collection('users').findOne({ firstName: 'katrin' });
  console.log("User doc:", JSON.stringify(user, null, 2));
  await client.close();
}
run().catch(console.error);
