import { usersCol, connectDB } from './src/core/database';

async function run() {
  await connectDB();
  const user = await usersCol.findOne({ firstName: 'katrin' });
  console.log("User doc:", JSON.stringify(user, null, 2));
  process.exit(0);
}

run().catch(console.error);
