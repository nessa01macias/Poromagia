#TODO: to actually take a picture, the camera module is not working right now
import subprocess

image = subprocess.Popen(["feh", "--hide-pointer", "-x", "-q", "-B", "black", "-g", "1280x800", "/home/melany/Poromagia/test_img/1.jpg"])
