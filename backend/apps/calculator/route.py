from fastapi import APIRouter, HTTPException  # type: ignore
import base64
from io import BytesIO
from apps.calculator.utils import analyze_image
from schema import ImageData
from PIL import Image  # type: ignore

router = APIRouter()

@router.post('')
async def run(data: ImageData):
    try:
        image_data = base64.b64decode(data.image.split(",")[1])  # Assumes data:image/png;base64,<data>
        image_bytes = BytesIO(image_data)
        image = Image.open(image_bytes)

        responses = analyze_image(image, dict_of_vars=data.dict_of_vars)
        response_data = []
        
        for response in responses:
            print("response in loop:", response)
            response_data.append(response)

        return {
            "message": "Image processed",
            "data": response_data,
            "status": "success"
        }

    except Exception as e:
        print("Error in route:", str(e))
        raise HTTPException(status_code=500, detail=str(e))
