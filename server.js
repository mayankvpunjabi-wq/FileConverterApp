import express from 'express';
import fileUpload from 'express-fileupload';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')));

app.use(fileUpload());
app.use(express.json());

// Example: Environment variable for API key
const API_KEY = process.env.API_KEY;

// Multer setup for file uploads
const upload = multer({ dest: 'uploads/' });

// Example route: file upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded');
  // Process the file or send to conversion API here
  res.send({ filename: req.file.originalname, path: req.file.path });
});

// Fallback route to index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
