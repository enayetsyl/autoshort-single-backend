const express = require('express');
const session = require("express-session");
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const userRoutes = require('./routes/userRoutes')
const seriesRoutes = require('./routes/seriesRoutes')
const authRoutes = require('./routes/authRoutes')
const taskRoutes = require('./routes/taskRoutes')
const videoRoutes = require('./routes/videoRoutes')
const scheduleRoutes = require('./routes/scheduleRoutes')
const cloudinary = require('./config/cloudinaryConfig')
const { connect } = require('./mongoConnection')
const { getChatGPTAPI, setupChatGPTAPI} = require('./config/gptConfig')
const cron = require('node-cron');
const gptPromptGenerate = require('./scheduleTask/promptGenerate');



const app = express();

// Middleware for parsing JSON bodies
app.use(bodyParser.json());

// CORS configuration
app.use(cors({
    origin: ["http://localhost:5173", "https://autoshortsfrontend-q417.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    headers: ["Content-Type", "Authorization"]
}));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

app.use(userRoutes);
app.use(authRoutes);
app.use(seriesRoutes);
app.use(taskRoutes); 
app.use(videoRoutes); 
app.use(scheduleRoutes); 


async function ensureChatGPTAPI() {
  if (!getChatGPTAPI()) {
      await setupChatGPTAPI();
  }
  return getChatGPTAPI();
}

// Initialize and start the server
async function startServer() {
  try {
      // Connect to MongoDB before starting the server
      await connect();
      console.log('Connected to MongoDB successfully.');
    //   '*/20 * * * * *' for 20 seconds
    // '*/50 * * * *' for 50 min
      // cron.schedule('*/5 * * * * *', gptPromptGenerate);


      const PORT = process.env.PORT || 3000;
      app.listen(PORT, () => {
          console.log(`Server is running on http://localhost:${PORT}`);
      });
  } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      process.exit(1); // Exit the process if the connection fails
  }
}

startServer();