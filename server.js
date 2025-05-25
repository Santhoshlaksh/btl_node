const express = require('express');
const cors = require('cors');
require('dotenv').config();

const loginRoutes = require('./routes/btl');

const app = express();
app.use(cors());
app.use(express.json()); // Parses incoming JSON requests

app.use('/api', loginRoutes);


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
