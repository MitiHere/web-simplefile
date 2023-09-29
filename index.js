const express = require("express");
const fileUpload = require("express-fileupload");
const app = express();
const port = 3000;

app.use(fileUpload());

app.get("/", async (req, res) => {
  res.send("HelloWorld");
});

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
