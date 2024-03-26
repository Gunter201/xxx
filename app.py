from fastapi import FastAPI
import os
from PIL import Image
from torchvision import transforms
import tritonclient.http as httpclient
from qdrant_client import QdrantClient
#new
from pymongo import MongoClient
from dotenv import load_dotenv, find_dotenv
import numpy as np
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware  # Add CORS middleware for cross-origin requests
from fastapi.staticfiles import StaticFiles  # Import StaticFiles
from fastapi.responses import HTMLResponse
from qdrant_client.http import models


app = FastAPI()

#new
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow requests from any origin, you might want to restrict this in production
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],
    )
app.mount("/static", StaticFiles(directory="static"), name="static")  # Adjust the path to match your static files directory
# Mount the directory containing the image files
app.mount("/data/image", StaticFiles(directory="data/image"), name="images")


#new 
QDRANT_URL = os.getenv("QDRANT_URL")
API_KEY = os.getenv("API_KEY")
COLLECTION_NAME = os.getenv("COLLECTION_NAME")

#new
# #mongo db
client = MongoClient('mongodb://localhost:27017/')
db = client['image_database']
collection = db['image_paths']

img_paths = []

results = collection.find()
img_paths = [result['img_path'] for result in results]
img_paths = np.array(img_paths)


# new
qdrant_client = QdrantClient(url=QDRANT_URL, api_key=API_KEY)



triton_host = os.getenv("TRITON_HOST") or "triton"
# qdrant_host = os.getenv("QDRANT_HOST") or "qdrant"
triton_http_endpoint = triton_host + ":8000"
triton_grpc_endpoint = triton_host + ":8001"

triton_client = httpclient.InferenceServerClient(url=triton_http_endpoint)
# qdrant_client = QdrantClient(qdrant_host, port=os.getenv("QDRANT_PORT") or 6333)
def vgg16_preprocess(img_path):
    img = Image.open(img_path)
    preprocess = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])
    return preprocess(img).numpy()

def triton_infer(buffer):
    transformed_img = vgg16_preprocess(buffer)
    inputs = httpclient.InferInput("input__0", transformed_img.shape, datatype="FP32")
    inputs.set_data_from_numpy(transformed_img, binary_data=True)
    outputs = httpclient.InferRequestedOutput("output__0", binary_data=True)
    results = triton_client.infer(model_name="vgg16", inputs=[inputs], outputs=[outputs])
    return results.as_numpy("output__0")

#index-html
@app.get("/", response_class=HTMLResponse)
async def get_index():
    try:
        with open("templates/index.html", "r") as file:
            return file.read()
    except Exception as e:
        return {"error": f"An error occurred: {e}"}




# @app.route('/vector/compare/')
@app.post("/search-image")
async def compare(f: UploadFile = File(...)):
    try:
        with open(f.filename, "wb") as buffer:
            output_vector = triton_infer(buffer)
            # result = qdrant_client.search(output_vector)
            # result = [vector.payload for vector in result]
            #new
            result_vectors = qdrant_client.search(
                collection_name=COLLECTION_NAME,
                search_params=models.SearchParams(hnsw_ef=128, exact=False),
                query_vector=output_vector,
                limit=5
            )
            results = []
            for point in result_vectors:
                img_path = img_paths[point.id - 1]
                results.append({
                    "image_path": str(img_path),
                    "id": point.id,
                    "score": float(point.score),
                    "name": point.payload['name'],
                })
                print('result ne`',results[-1])
            return {"results": results}

    except Exception as e:
        return {"error": f"An error occurred while processing the image: {e}"}
    # return {'payload': result}

