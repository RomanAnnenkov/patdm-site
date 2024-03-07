const form = document.querySelector("form");
const fileInput = document.querySelector("input");
const submitButton = document.querySelector("button");
const preview = document.getElementById("preview");
const linksToDownload = document.getElementById("linksToDownload");
const spinner = document.getElementById("spinner");

form.addEventListener("submit", handleSubmit);
fileInput.addEventListener("change", handleInputChange);

function handleSubmit(event) {
  event.preventDefault();
  preview.hidden = true;
  uploadFiles(fileInput.files);
}

function handleInputChange(event) {
  resetFormState();

  try {
    assertFilesValid(event.target.files);
  } catch (err) {
    renderError(err.message);
    return;
  }

  submitButton.disabled = false;
}

function uploadFiles(files) {
  const url = window.location.protocol + "//" + window.location.host + "/upload";
  const method = "post";

  const xhr = new XMLHttpRequest();

  xhr.onreadystatechange = () => {
    spinner.hidden = false;
    submitButton.disabled = true;
    if (xhr.readyState === 4) {
      const res = xhr.response;
      if (JSON.parse(res).cause === undefined) {
        if (JSON.parse(res).error === undefined) {
          renderPreview(res);
          renderLinksToDownload(res);
        } else {
          renderError(JSON.parse(res).message);
          spinner.hidden = true;
          submitButton.disabled = false;
          return;
        }
      } else {
        renderError("Service is unavailable, please try again later.");
      }
      spinner.hidden = true;
      submitButton.disabled = false;
    }
  };

  const data = new FormData();

  for (const file of files) {
    data.append("image", file);
  }

  xhr.open(method, url);
  xhr.send(data);
}

function renderLinksToDownload(fileMap) {
  linksToDownload.textContent = "";
  linksToDownload.hidden = false;

  const jsonResponse = JSON.parse(fileMap);

  linksToDownload.insertAdjacentHTML(
    "beforeend",
    `
        <p><strong>Output pdf files, click for download:</strong</p>
        <a href=${jsonResponse.palette} download>
          <p>Palette</p>
        </a>
        <a href=${jsonResponse.map} download>
          <p>Map</p>
        </a>
        `
  );
}

function renderPreview(fileMap) {
  preview.textContent = "";
  preview.hidden = false;

  const jsonResponse = JSON.parse(fileMap);

  preview.insertAdjacentHTML(
    "beforeend",
    `
      <p>Image before and after conversion to DMC colors:</p>
      <img src=${jsonResponse.resized} alt="Resized image."/>
      <img src=${jsonResponse.preview} alt="Preview image."/>
    `
  );
}

function renderError(message) {
  preview.textContent = "";
  preview.hidden = false;

  preview.insertAdjacentHTML(
    "beforeend",
    `
    <strong>${message}</strong>
    `
  );
}

function assertFilesValid(fileList) {
  const allowedTypes = ["image/png"];
  const sizeLimit = 1024 * 1024 * 5;

  for (const file of fileList) {
    const { name: fileName, size: fileSize } = file;

    if (!allowedTypes.includes(file.type)) {
      throw new Error(
        `❌ File "${fileName}" could not be uploaded. Only PNG images are allowed.`
      );
    }

    if (fileSize > sizeLimit) {
      throw new Error(
        `❌ File "${fileName}" could not be uploaded. Only images up to 1 MB are allowed.`
      );
    }
  }
}

function resetFormState() {
  linksToDownload.hidden = true;
  linksToDownload.textContent = "";
  preview.hidden = true;
  preview.textContent = "";
  submitButton.hidden = true;
  submitButton.disabled = true;
}
