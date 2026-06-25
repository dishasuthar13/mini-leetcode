require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const email = process.argv[2];

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOneAndUpdate({ email }, { role: 'admin' }, { new: true });
  console.log(user ? `${user.email} is now admin` : 'User not found');
  process.exit();
};

run();