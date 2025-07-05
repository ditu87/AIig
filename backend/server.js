const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const generate = require('./api/generate.js');

app.post('/api/generate', generate);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
