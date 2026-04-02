const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'Test API working' });
});

app.post('/api/chat', (req, res) => {
  res.json({ success: true, data: { answer: '是' } });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
