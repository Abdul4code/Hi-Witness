import tensorflow as tf
import tensorflow_io as tfio
import numpy as np
import numpy as np
from PIL import Image, ImageChops, ImageEnhance
import pickle
import tensorflow as tf


def image_to_ela(image, quality):
    # Create a PIL Image object from the 'InMemoryUploadedFile'
    image = Image.open(image).convert('RGB')
    
    # Resave the image with the specified quality
    resaved = image.copy()
    resaved.save('resaved.jpg', 'JPEG', quality=quality)
    resaved = Image.open('resaved.jpg')

    # Calculate the ELA (Error Level Analysis) image by taking the difference between the original and resaved image
    ela_image = ImageChops.difference(image, resaved)

    # Get the minimum and maximum pixel values in the ELA image
    band_values = ela_image.getextrema()
    max_value = max([val[1] for val in band_values])

    # If the maximum value is 0, set it to 1 to avoid division by zero
    if max_value == 0:
        max_value = 1

    # Scale the pixel values of the ELA image to the range [0, 255]
    scale = 255.0 / max_value
    ela_image = ImageEnhance.Brightness(ela_image).enhance(scale)

    # Resize the ELA image to 150 x 150
    ela_image = ela_image.resize((150, 150))

    # Convert the ELA image to a NumPy array
    ela_array = np.array(ela_image)

    return ela_array

def predict(ela_image, model):
    return model.predict(ela_image)

