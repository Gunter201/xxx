document.addEventListener("DOMContentLoaded", function () {
    const dropZone = document.getElementById("dragdrop-area");
    const fileInput = document.getElementById("input-file");
    const inputContainer = document.getElementById("user-input-img");
    const outputContainer = document.getElementById("user-output-img");

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        handleFile(e.dataTransfer.files);
    });

    fileInput.addEventListener("change", function () {
        handleFile(fileInput.files);
    });

    function appendInputData(el) {
        inputContainer.innerHTML = '';
        inputContainer.appendChild(el);
    }

    function renderOutput(filename, type = "image") {
        let outputEl = document.createElement(type == "image" ? "img" : "video");
        outputEl.src = filename;
        outputEl.style.width = "300px";
        outputEl.style.height = "200px";
        outputEl.style.margin = "5px 5px 5px 5px"
        outputContainer.appendChild(outputEl);
    }

    function sendDataToModel(file, type = "image") {
        const formData = new FormData();
        formData.append('query_img', file);

        fetch("/search-image", {
            method: "POST",
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            console.log(data); // Log the data received from the server

            let results = data.results;
            outputContainer.innerHTML = '';

            results.forEach(result => {
                renderOutput(result.image_path, type);
            });
        })
        .catch(error => {
            console.error('Error during processing', error);
        });
    }

    function handleFile(files) {
        if (!files || files.length === 0) {
            console.log("No files selected");
            return;
        }

        let file = files[0];

        if (!file || !file.type) {
            console.log("Invalid file object or type");
            return;
        }

        if (file.type.startsWith('image/')) {
            displayImage(file);
            sendDataToModel(file, "image");
        } else if (file.type.startsWith('video/')) {
            console.log("Video files not supported in this version.");
        }
    }

    function displayImage(file) {
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                let imageEl = document.createElement("img");
                imageEl.src = e.target.result;
                imageEl.style.width = "300px";
                imageEl.style.height = "200px";
                appendInputData(imageEl);
            };
            reader.readAsDataURL(file);
        }
    }
});
