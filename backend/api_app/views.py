from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
import pickle
import os
from pathlib import Path
import tensorflow as tf
from util.util import image_to_ela, predict
from django.shortcuts import render


# Construct the file path to the model
dir = Path(__file__).resolve().parent.parent
model_path = os.path.join(dir, 'models', 'model.h5')
# Load the model
model = tf.keras.models.load_model(model_path)

class Predict(APIView):
    parser_classes = [MultiPartParser]

    def post(self, request, format=None):
        image_file = request.FILES['image']
        
        ela_image = image_to_ela(image_file, quality=90)

        prediction = predict(ela_image, model)
        
        return Response({'message': prediction})
    
class KeyView(APIView):
    def get(self, request):
        return Response({'key': 'Hi@Witness'})




