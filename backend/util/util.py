import tensorflow as tf
import tensorflow_io as tfio
import numpy as np
import numpy as np
from PIL import Image, ImageChops, ImageEnhance
import pickle
import tensorflow as tf
import openai
import datetime
from geopy.distance import geodesic
import re

openai.api_key = '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'



def is_location_within_bounds(lat, lon, min_lat, max_lat, min_lon, max_lon):
    target_point = (lat, lon)
    sw_point = (min_lat, min_lon)
    ne_point = (max_lat, max_lon)

    distance_lat = geodesic(target_point, (target_point[0], sw_point[1])).meters
    distance_lon = geodesic(target_point, (sw_point[0], target_point[1])).meters

    within_bounds = (
        sw_point[0] <= lat <= ne_point[0] and
        sw_point[1] <= lon <= ne_point[1] and
        distance_lat <= geodesic(sw_point, ne_point).meters and
        distance_lon <= geodesic(sw_point, ne_point).meters
    )

    return within_bounds

def extract_numbers(string):
    pattern = r"\d+"  # Matches one or more digits
    matches = re.findall(pattern, string)
    return matches

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
    ela_array = ela_array.reshape(-1, 150, 150, 3)

    return ela_array



def predict(ela_image, model):
    return model.predict(ela_image)



def get_place_name(longitude, latitude):
    prompt = ''' Mention just the name of the place with its country with longitude = {} and latitude = {} in this format i.e place, country'''.format(longitude, latitude)

    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[ 
                {"role": "user", "content": prompt},     
            ]
    )

    data = (response['choices'][0]['message'].content)

    return data
    
def get_time(timestamp):
    timestamp = timestamp / 1000  # Convert milliseconds to seconds

    # Convert the Unix timestamp to a datetime object
    datetime_obj = datetime.datetime.fromtimestamp(timestamp)

    # Format the datetime object as a string
    year = datetime_obj.strftime("%Y")
    month = datetime_obj.strftime("%B")
    day = datetime_obj.strftime("%A")
    hour = datetime_obj.strftime('%I')
    min = datetime_obj.strftime('%M')
    meridian = datetime_obj.strftime('%p')
    
    return {'year': year, 'month': month, 'day': day, 'hour':hour, 'min':min, 'meridian': meridian}

def summarize_report(report):
    prompt = ''' 
                I need a summary of this report. Here is the report "{}".  The summary should answer the following questions
                1. Which place did the reported event occur?
                
                If todays timestamp is {} then 
                
                2. Compute or infer from the report the year the reported event occur. 
                You can use keywords in the report such as today, tommorrow etc and use the todays timstamp as reference date.
                
                3. Compute from the report the Month name the event occur?
                4. Compute from the report the Day name the event occur?
                5. Compute from the report the hour the event occur?
                6. Compute from the report the minute the event occur?
                7. Compute from the report if the event happen in AM or PM?
                8. What is the Latitude and longitude of the place where the event occured?
                
                
                Here is the instruction for answering the questions; 
                
                - For questions where the answers cannot be determined or infered from the report and the todays timestamp, respond with Unknown.
                - For question relating to place, ensure your answer is in this format i.e place, country.
                - Just say the answer straight forward in one or max of two words and number each question on a new line 
    
            '''.format(report, datetime.datetime.timestamp(datetime.datetime.now()))

    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[ 
                {"role": "user", "content": prompt},     
            ]
    )

    data = (response['choices'][0]['message'].content)
    

    lines = data.strip().splitlines()
    data = [line.split('. ', 1)[1] for line in lines]

    return data

def compare(coords, place, time, summary):
    prompt = ''' 
                What is the bounding latitude and longitude of {}?
                
                 Here is the instruction for answering the questions; 
                
                Provide your answer in this format
                1. Minimum Latitude
                2. Maximum Latitude
                3. Minimum Longitude
                4. Maximum Latitude
                
                Just provide the numeric values without explanations i.e 1. value \n 2. value etc.
            '''.format(place)

    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[ 
                {"role": "user", "content": prompt},     
            ]
    )
    
    data = (response['choices'][0]['message'].content)

    lines = data.strip().splitlines()
    
    try:
        data = [line.split('. ', 1)[1].split(':')[1] for line in lines]
    except:
        data = [line.split('. ', 1)[1] for line in lines]
        
    print(type(coords[0]), type(coords[1]))
    print(time)
    print(summary)
    
    place_compare = is_location_within_bounds(coords[0], coords[1], float(data[0]), float(data[1]), float(data[2]), float(data[3]))
    year_compare = time['year'] == summary[1]
    month_compare = time['month'] == summary[2].replace('.', '')
    day_compare = time['day'] == summary[3]
    
    try:
        hour_compare = abs((extract_numbers(time['hour'])[0] - extract_numbers(summary[4])[0])) * 50
        hour_compare = 0 if hour_compare > 100 else 100 - hour_compare
    except:
        hour_compare = False
    
    try:
        minute_compare = abs((extract_numbers(time['min'])[0] - extract_numbers(summary[5])[0])) * 4
        minute_compare = 0 if minute_compare > 100 else 100 - minute_compare
    except:
        minute_compare = False
        
    period_compare = time['meridian'] == summary[6]
    
    return [place_compare, year_compare, month_compare, day_compare, hour_compare, minute_compare, period_compare]