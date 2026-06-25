require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const problemRoutes = require('./routes/problemRoutes');
const executionRoutes = require('./routes/executionRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const aiRoutes = require('./routes/aiRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

connectDB();


app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:5173',
      'https://events-123-9e564.web.app',
      process.env.FRONTEND_URL,
    ].filter(Boolean);
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // temporarily allow all during testing
    }
  },
  credentials: true,
}));


app.options("*", cors());


app.use(express.json());


app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running' });
});


app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/execute', executionRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/ai', aiRoutes);


app.use(errorHandler);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => 
 console.log(`Server running on port ${PORT}`)
);