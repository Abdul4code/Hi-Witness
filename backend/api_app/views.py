from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
import pickle
import os
from pathlib import Path

from util.util import image_to_ela, predict

# Construct the file path to the model
dir = Path(__file__).resolve().parent.parent
model_path = os.path.join(dir, 'models', 'model.pkl')

with open(model_path, 'rb') as file:
    model = pickle.load(file)

# class ImageUploadView(APIView):
#     parser_classes = [MultiPartParser]

#     def post(self, request, format=None):
#         image_file = request.FILES['image']
        
#         ela_image = image_to_ela(image_file, quality=90)
#         print(ela_image.shape)
#         prediction = predict(ela_image, model)
        
#         print(prediction)
#         # Return a response
#         return Response({'message': prediction})




