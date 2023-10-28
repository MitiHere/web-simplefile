const express = require("express");
const fileUpload = require("express-fileupload");
const path = require("path");
const axios = require("axios");
const cookieParser = require("cookie-parser");
const app = express();
const bodyParser = require("body-parser");
const util = require("util");

const port = 8100;
const CURR_FILE_EXT = "currentfile";
const PUB_FOLDER = "/publicFs/";
let currentFile = { filename: "nofile" };

const MAPIURL = "https://fmapi.ceyraud.com";
const authorisationErrorJson = {
  Response: "Error",
  data: { type: "Not Authorized" },
};
app.use(fileUpload());
app.use(cookieParser());
app.use(bodyParser.json());
const cookieSett = {
  maxAge: 3 * 24 * 60 * 60 * 1000,
  secure: true,
  httpOnly: true,
  sameSite: "Lax",
};
const deleteCookie = {
  expires: new Date(0),
  secure: true,
  httpOnly: true,
  sameSite: "Lax",
};
app.get("/home.js", (req, res) => {
  res.sendFile(__dirname + "/scripts/home.js");
});

app.get("/upload", async (req, res) => {
  const mapiToken = req.cookies.mapiTok;
  if (await checkValidity(mapiToken)) {
    res.sendFile(__dirname + "/scripts/index.html");
  } else {
    res.redirect("/login");
  }
});

app.get("/", async (req, res) => {
  const mapiToken = req.cookies.mapiTok;
  if (await checkValidity(mapiToken)) {
    res.redirect("/upload");
  } else {
    res.redirect("/login");
  }
});

app.get("/login", async (req, res) => {
  const mapiToken = req.cookies.mapiTok;
  if (await checkValidity(mapiToken)) {
    res.redirect("/upload");
  } else {
    res.sendFile(__dirname + "/scripts/login.html");
  }
});

app.get("/login.js", async (req, res) => {
  res.sendFile(__dirname + "/scripts/login.js");
});
app.get("/getFileInfo", async (req, res) => {
  const mapiToken = req.cookies.mapiTok;
  if (await checkValidity(mapiToken)) {
    res.json(currentFile);
  } else {
    res.redirect("/login");
  }
});

app.get("/getCurrentFile", async (req, res) => {
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${currentFile.filename}"`
  );
  res.sendFile(__dirname + PUB_FOLDER + CURR_FILE_EXT);
});

app.post("/login", async (req, res) => {
  const mapiToken = req.cookies.mapiTok;
  const { login, password } = req.body;
  if (mapiToken) {
    const response = await axios.post(MAPIURL + "/validate", {
      token: mapiToken,
    });
    if (response.data.Response === "Ok") {
      res.status(200).json({
        Response: "Ok",
        data: { message: "Logged In" },
      });
    } else {
      if (response.data.data.type === "Invalid Token") {
        res.cookie("mapiTok", "", deleteCookie);
      }
      res.status(500).json({
        Response: "Api Error",
        data: { message: response.data.data.type },
      });
    }
  } else {
    const response = await axios.post(MAPIURL + "/login", {
      login: login,
      password: password,
    });

    if (response.data.Response === "Ok") {
      res.cookie("mapiTok", response.data.data.token, cookieSett);
      res.status(200).json({
        Response: "Ok",
        data: { message: "Logged In" },
      });
    } else {
      res.status(500).json({
        Response: "Api Error",
        data: { message: response.data.data.type },
      });
    }
  }
});

app.post("/logout", async (req, res) => {
  const mapiToken = req.cookies.mapiTok;
  if (mapiToken) {
    const response = await axios.post(MAPIURL + "/logout", {
      token: mapiToken,
    });
    if (response.data.Response === "Ok") {
      res.cookie("mapiTok", "", deleteCookie);
      res.status(200).json({
        Response: "Ok",
        data: { message: "Logged Out" },
      });
    } else {
      res.status(500).json({
        Response: "Api Error",
        data: { message: "error" },
      });
    }
  }
});

app.post("/upload", async (req, res) => {
  const mapiToken = req.cookies.mapiTok;
  if (await checkValidity(mapiToken)) {
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
  } else {
    res.status(500).json(authorisationErrorJson);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});

async function checkValidity(mapiToken) {
  if (mapiToken) {
    const response = await axios.post(MAPIURL + "/validate", {
      token: mapiToken,
    });
    return response.data.Response === "Ok";
  } else {
    return false;
  }
}

function showObj(obj) {
  console.log(util.inspect(obj, { depth: null }));
}
