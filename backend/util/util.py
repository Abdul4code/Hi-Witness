import tensorflow as tf
import tensorflow_io as tfio
import numpy as np
import numpy as np
from PIL import Image, ImageChops, ImageEnhance
import pickle
import tensorflow as tf
import openai
import datetime

openai.api_key = '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'


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

def compare(place, time, summary):
    prompt = ''' 
                Answer the following question. 
                1. Answer True or false, Is {} same place with or somewhere located within {}?
                2. True or false, Is {} same with {}?
                3. True or false, is {} same with {}?
                4. True or false, is {} same with {}
                5. On a percentage scale where 100% signifies equality and for every one hour difference subtract 50% from your answer. How accurate is {} equal to {}?
                6. For every  1 min difference subtract 4%. How accurate is {} equal to {}?
                7. True or False, is {} same with {} 
                
                 Here is the instruction for answering the questions; 
                
                - For questions where one of the provided values is unknown, respond with unknown
                - Just answer True, false, percentage or Unknown. Dont provide explanations
                - Number your response
            '''.format( 
                place, summary[0],
                time['year'] , summary[1],
                time['month'], summary[2],
                time['day'], summary[3],
                time['hour'], summary[4],
                time['min'], summary[5],
                time['meridian'], summary[6]
            )

    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[ 
                {"role": "user", "content": prompt},     
            ]
    )

    #  lines = data.strip().splitlines()
    # data = [line.split('. ', 1)[1] for line in lines]
    data = (response['choices'][0]['message'].content)
    return data