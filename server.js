import express from "express";
import fileUpload from "express-fileupload";
import path from "path";
import fs from "fs";
import fetch from "node-fetch"; // Make sure node-fetch is installed
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Use your API key from Render environment variable
const API_KEY = process.env.API_KEY;

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(fileUpload());

// Handle file conversion
app.post("/convert", async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const file = req.files.file;
    const fromFormat = req.body.fromFormat; // e.g., "pdf", "txt", "image"
    const toFormat = req.body.toFormat;     // e.g., "png", "jpg", "pdf"

    // Save temporarily to uploads folder
    const uploadsDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
    const filePath = path.join(uploadsDir, file.name);
    await file.mv(filePath);

    // Create CloudConvert job
    const jobPayload = {
      tasks: {
        "import-my-file": {
          operation: "import/upload"
        },
        "convert-my-file": {
          operation: "convert",
          input: "import-my-file",
          output_format: toFormat
        },
        "export-my-file": {
          operation: "export/url",
          input: "convert-my-file"
        }
      }
    };

    const jobRes = await fetch("https://api.cloudconvert.com/v2/jobs", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(jobPayload)
    });

    const jobData = await jobRes.json();

    // Upload file to CloudConvert import task
    const importTask = jobData.data.tasks.find(t => t.name === "import-my-file");
    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath));

    await fetch(importTask.result.form.url, {
      method: "POST",
      body: formData
    });

    // Wait for conversion to finish
    let convertedFileUrl;
    let finished = false;
    while (!finished) {
      const jobStatusRes = await fetch(`https://api.cloudconvert.com/v2/jobs/${jobData.data.id}`, {
        headers: { Authorization: `Bearer ${API_KEY}` }
      });
      const jobStatus = await jobStatusRes.json();

      const exportTask = jobStatus.data.tasks.find(t => t.name === "export-my-file");
      if (exportTask.status === "finished") {
        convertedFileUrl = exportTask.result.files[0].url;
        finished = true;
      } else if (exportTask.status === "error") {
        return res.status(500).json({ error: "Conversion failed." });
      }
      await new Promise(r => setTimeout(r, 1000)); // wait 1 sec
    }

    // Send download URL back to frontend
    res.json({ downloadUrl: convertedFileUrl });

    // Delete local uploaded file
    fs.unlinkSync(filePath);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error during conversion." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
