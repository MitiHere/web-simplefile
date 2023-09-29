const express = require("express");
const fileUpload = require("express-fileupload");
const path = require("path");
const app = express();
const port = 8100;
const CURR_FILE_EXT = "currentfile";
const PUB_FOLDER = "/publicFs/";
let currentFile = { filename: "nofile" };

app.use(fileUpload());

app.get("/home.js", (req, res) => {
  res.sendFile(__dirname + "/scripts/home.js");
});

app.get("/", async (req, res) => {
  res.sendFile(__dirname + "/scripts/index.html");
});

app.get("/getFileInfo", async (req, res) => {
  res.json(currentFile);
});

app.get("/getCurrentFile", async (req, res) => {
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${currentFile.filename}"`
  );
  res.sendFile(__dirname + PUB_FOLDER + CURR_FILE_EXT);
});

app.post("/upload", (req, res) => {
  if (!req.files || !req.files.file) {
    return res.status(400).send("No files were uploaded.");
  }
  const file = req.files.file;
  const uploadPath = path.join(__dirname, PUB_FOLDER, CURR_FILE_EXT); // Change the filename as needed
  // Save the uploaded file to the server
  file.mv(uploadPath, (err) => {
    if (err) {
      return res.status(500).send(err);
    } else {
      currentFile = { filename: req.files.file.name };
      return res.json(currentFile);
    }
  });
});
app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
