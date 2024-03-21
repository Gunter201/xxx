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

    function renderOutput(filename) {
        let outputEl = document.createElement("img");
        outputEl.src = filename;
        outputEl.style.width = "100%";
        outputEl.style.height = "auto";
        outputContainer.innerHTML = '';
        outputContainer.appendChild(outputEl);
    }

    function sendDataToModel(file) {
        const formData = new FormData();
        formData.append('image', file);
        
        fetch("/process-image", {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            let filename = data.processed_image;
            renderOutput(filename);
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
            sendDataToModel(file);
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
                imageEl.style.width = "100%";
                imageEl.style.height = "auto";
                appendInputData(imageEl);
            };
            reader.readAsDataURL(file);
        }
    }
});
