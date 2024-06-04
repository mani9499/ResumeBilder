const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

const resumesDir = path.join(__dirname, 'resumes');
if (!fs.existsSync(resumesDir)) {
  fs.mkdirSync(resumesDir);
}

app.use(bodyParser.json({ limit: '50mb' }));

app.use(express.static(path.join(__dirname, 'public')));

app.post('/resumes', (req, res) => {
  const resumeData = req.body;
  const filePath = path.join(resumesDir, 'resume.json');

  fs.writeFile(filePath, JSON.stringify(resumeData, null, 2), (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error saving resume');
      return;
    }

    res.json({ message: 'Resume saved successfully', downloadUrl: '/resumes/resume.json' });
  });
});

app.post('/save-resume-image', (req, res) => {
  const imageData = req.body.image.replace(/^data:application\/pdf;filename=generated.pdf;base64,/, "");
  const buffer = Buffer.from(imageData, 'base64');
  const filePath = path.join(__dirname, 'resumes', 'resume.pdf');

  fs.writeFile(filePath, buffer, (err) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Error saving resume image' });
      return;
    }

    res.json({ message: 'Resume image saved successfully', downloadUrl: '/resumes/resume.pdf' });
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});

app.get('/resumes', (req, res) => {
  const resumesDir = path.join(__dirname, 'public/resumes');
  fs.readdir(resumesDir, (err, files) => {
      if (err) {
          return res.status(500).send('Unable to scan resumes directory');
      }
      const jsonFiles = files.filter(file => file.endsWith('.json'));
      res.json(jsonFiles);
  });
});
