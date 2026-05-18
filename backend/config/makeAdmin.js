/**
 * Usage: node config/makeAdmin.js your@email.com
 * Promotes an existing user to admin role.
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const email = process.argv[2];

if (!email) {
  console.error('Usage: node config/makeAdmin.js <email>');
  process.exit(1);
}

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    { isAdmin: true },
    { new: true }
  );
  if (!user) {
    console.error(`❌ No user found with email: ${email}`);
  } else {
    console.log(`✅ "${user.name}" (${user.email}) is now an admin.`);
  }
  process.exit(0);
};

run().catch((err) => { console.error(err); process.exit(1); });
