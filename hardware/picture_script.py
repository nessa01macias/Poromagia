import time
from picamera import PiCamera
from time import sleep
from PIL import Image
import requests

def take_picture():
    camera = PiCamera()
    camera.resolution= (1280, 720)
    camera.rotation = 180

    time.sleep(2)

    # to actually take a picture
    # camera.capture("picture.jpg")
    
    # to open an image 
    # img = Image.open("/home/melany/Documentos/Poromagia/picture.jpg")
    # print(img)

    url = "http://54.83.117.198:3000/"
    files =  {'image': open('picture.jpg', 'rb')}
    r = requests.post(url, files=files)
    print(r.text)
