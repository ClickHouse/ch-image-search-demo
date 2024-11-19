from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import torch
import clip
import base64
from PIL import Image
import io
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize CLIP model
device = "cuda" if torch.cuda.is_available() else "cpu"
model, preprocess = clip.load("ViT-L/14", device=device)

class ImageRequest(BaseModel):
    base64_image: str

@app.post("/get-embedding")
async def get_embedding(image_request: ImageRequest):
    try:
        # Decode base64 image
        image_data = base64.b64decode(image_request.base64_image)
        image = Image.open(io.BytesIO(image_data))
        
        # Preprocess and get embedding
        image_input = preprocess(image).unsqueeze(0).to(device)
        
        with torch.no_grad():
            image_features = model.encode_image(image_input)
            
        # Convert to regular list for JSON serialization
        embedding = image_features.cpu().numpy().tolist()[0]
        return {"embedding": embedding}
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))