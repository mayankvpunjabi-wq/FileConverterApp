import express from 'express';
import fileUpload from 'express-fileupload';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 10000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(fileUpload());
app.use(express.static(path.join(__dirname, 'public'))); // make sure folder is lowercase

// Your other routes here
app.get('/hello', (req, res) => {
  res.send('Hello world!');
});

// Correct catch-all for Express v5+
app.all('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
