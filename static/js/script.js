
document.addEventListener("DOMContentLoaded", function () {
    const dropZone = document.getElementById("dragdrop-area");
    const fileInput = document.getElementById("input-file");
    const inputContainer = document.getElementById("user-input-img");
    const outputContainer = document.getElementById("user-output-img");
    const superContainer = document.getElementById("super-container");
    const loader = document.getElementById("loader-container");

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
    // hover drag
    function handleDragEnter(event) {
        event.preventDefault();
        event.stopPropagation();
        dragdropArea.classList.add('hover');
    }
    function handleDragLeave(event) {
        event.preventDefault();
        event.stopPropagation();
        dragdropArea.classList.remove('hover');
    }


    
    function appendInputData(el) {
        inputContainer.innerHTML = '';
        inputContainer.appendChild(el);
    }

    function renderOutput(result, type = "image") {
        function renderDivInfo(obj) {
            let container = document.createElement("div");
            container.className = obj.class
            container.textContent = obj.field.toUpperCase() + ": " + obj.content
            
            return container
        }
        let container = document.createElement("div");
        container.style.display = "flex";
        container.style.flexDirection = "row";
        container.style.border = "1px solid white";
        container.style.borderRadius = "10px";
        container.style.marginTop = "8vh";
        container.style.padding = "5vh";
        container.style.backgroundColor = "white";

        let outputEl = document.createElement(type == "image" ? "img" : "video");
        outputEl.src = result.image_path;
        outputEl.style.maxWidth = "300px";
        outputEl.style.maxHeight = "200px";
        // outputEl.style.margin = "2vh 2vh 5vh";
        outputEl.style.padding = "2vh 2vh";
        outputEl.style.border = "1px solid white";
        outputEl.style.borderRadius = "5px";
        outputEl.style.backgroundColor = "white";
        outputEl.style.borderRight = '2px solid black';
        outputEl.style.paddingRight = '3vw';
        outputEl.style.borderTopRightRadius = '0px';
        outputEl.style.borderBottomRightRadius = '0px';
        container.appendChild(outputEl);

        let textDiv = document.createElement("div");
        textDiv.style.display = "flex";
        textDiv.style.flexDirection = "column";
        // customize here
        textDiv.style.marginTop = "1.5vh";
        textDiv.style.marginBottom = "5vh";
        textDiv.style.marginLeft = "3vw";
        textDiv.style.lineHeight = "2.2";
        textDiv.style.fontSize = "1rem";
        textDiv.style.fontWeight = "500";
        // delte .npy

        let lastIndex = result.name.lastIndexOf(".");
        if (lastIndex !== -1) {
            result.name = result.name.substring(0, lastIndex);
        }
        let contents = [
            {
                field: "id",
                content: result.id,
                class: "text-id"
            },
            {
                field: "name",
                content: result.name,
                class: "text-name"
            },
            {
                field: "score",
                content: Math.floor(result.score * 100) / 100,
                class: "text-score"
            },
        ]
        contents.forEach(content => {
            let el = renderDivInfo(content)
            textDiv.appendChild(el)
        })

        container.appendChild(textDiv)
        outputContainer.appendChild(container);
    }

    function sendDataToModel(file, type = "image") {
        loader.style.display = "flex";
        window.scroll({ 
            top:500,
            behavior: "smooth" 
        });
        const formData = new FormData();
        formData.append('query_img', file);

        fetch("/search-image", {
            method: "POST",
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            console.log(data); // Log the data received from the server
            loader.style.display = "none";
            superContainer.style.display = "flex";
            let results = data.results;
            outputContainer.innerHTML = '';
            let targetElement = document.getElementById("user-output-img");
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
            
            }
            results.forEach(result => {
                renderOutput(result, type);
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
                imageEl.style.maxWidth = "300px";
                imageEl.style.maxHeight = "200px";
                imageEl.style.padding = "2vh 2vh";
                imageEl.style.border = "1px solid white";
                imageEl.style.borderRadius = "5px";
                imageEl.style.backgroundColor = "white";
                appendInputData(imageEl);
            };
            reader.readAsDataURL(file);
        }
    }
});
