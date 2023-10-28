const uploadButton = document.getElementById("uploadButton");
const logoutButton = document.getElementById("logoutButton");
const fileinput = document.getElementById("fileinput");
const currFile = document.getElementById("currFile");
const img = document.getElementById("img");

uploadButton.addEventListener("click", () => {
  const formData = new FormData();
  formData.append("file", fileinput.files[0]);

  fetch("/upload", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      //currFile.textContent = ;
      console.log(`The current file is here : ${data.filename}`);
      updateTable();
    })
    .catch((error) => {
      console.error(error);
      currFile.textContent = "Error uploading file. " + error;
    });
});

logoutButton.addEventListener("click", () => {
  fetch("/logout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Include credentials (cookies) in the request
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.Response !== "Ok") {
        console.log("error");
        console.log(data);
        errorDiv.textContent = "Error :" + data.data.message;
      } else {
        window.location.reload();
      }
    })
    .catch((error) => {
      console.log(error);
      errorDiv.textContent = "Error : " + error;
    });
});

function updateTable() {
  fetch("/getFileInfo") // Replace with your actual server endpoint
    .then((response) => response.json()) // Assuming the server returns JSON data
    .then((data) => {
      if (data.filename === "nofile") {
        document.getElementById("currentDiv").style.display = "none";
      } else {
        document.getElementById("currentDiv").style.display = "block";
        document.getElementById(
          "fileName"
        ).innerHTML = `<p>${data.filename}</p>`;
        document.getElementById(
          "fileLink"
        ).innerHTML = `<a href="/getCurrentFile">Download</a>`;
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
  fetch("https://qr.ceyraud.com/gen?value=" + window.location.origin)
    .then((response) => response.text())
    .then((data) => {
      img.src = data;
      img.alt = "Fetched Image";
    })
    .catch((error) => {
      console.error("Error fetching image:", error);
    });
}

updateTable();
