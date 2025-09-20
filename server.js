import express from 'express';
import fileUpload from 'express-fileupload';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 10000;

// Needed for ES Modules to get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(fileUpload());
app.use(express.static(path.join(__dirname, 'public'))); // Make sure 'public' is lowercase

// Your other routes here
// Example route
app.get('/hello', (req, res) => {
  res.send('Hello world!');
});

// Catch-all route to serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
