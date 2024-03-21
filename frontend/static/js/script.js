const inputFile = document.getElementById("input-file")
const userInputFile = document.getElementById("user-input-img")
const userOutputFile = document.getElementById("user-output-img")
const dropZone = document.getElementById('drop-zone-border')

let imagesArray = []

inputFile.addEventListener('change', (event) => {
    let files = event.target.files[0]
    for (let i = 0; i < files.length; i++) {
        imagesArray.push(files[i]) }
    getImg()
})


dropZone.addEventListener('drop', (event) => {
    event.preventDefault()

    let files = event.dataTransfer.files[0]
    if (imagesArray.every(image => image.name !== files[i].name))
        imagesArray.push(files[i])
    
    getImg()
})

function getImg () {
    let images = ""
    imagesArray.forEach((image, index) => {
        images += `<div class="image">
                    <img src="${URL.createObjectURL(image)}" alt="image">
                    <span onclick="deleteImage(${index})">&times;</span>
                  </div>`
      })
      output.innerHTML = images
}

function deleteImage(index) {
    imagesArray.splice(index, 1)
    displayImages()
}