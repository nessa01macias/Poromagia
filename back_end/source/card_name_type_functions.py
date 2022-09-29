# functions were made to make the process of making the class easier

# cv2 is the module import name for opencv-python needed for the cv algorithm
import cv2
# pillow is needed to editing images, printing them, rotating them...
from PIL import Image
# exact text from images using pytesseract
import pytesseract
# basic path works for all the files
import sys
# array handling
import numpy as np
import string

# this is something to look into when someone else uses the code!!!! they need to install pytesseract
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'


def gray_thresh(path: str):
    image = cv2.imread(path)
    # cv2.COLOR_BGR2GRAY converts an image to grey
    gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    # applying the threshold: chose thresh_binary because we want each pixel to be either white or black. 
    # Also, we need them to be back & white as it is easier in pytesseract to work with them
    thresh, gray_thresh_image = cv2.threshold(gray_image, 140, 255, cv2.THRESH_BINARY)
    # Image.fromarray(gray_thresh_image).show()
    # i can also use Image.fromarray(sys.path[0]+"/temp/card-01-grey-thresh.jpg").show()
    gray_thresh_image = np.asarray(gray_thresh_image)
    return gray_thresh_image


def extract_text(rows, columns, gray_thresh_image) -> str:
    # print(rows[0],rows[1])
    # print(columns[0], columns[1])
    custom_oem_psm_config = r'--oem 3 --psm 3'
    # first we implement the region cutting
    roi_image = gray_thresh_image[rows[0]:rows[1], columns[0]:columns[1]]
    # then we rotate the image
    roi_image = cv2.rotate(roi_image, cv2.ROTATE_90_CLOCKWISE)
    # showing it just for testing 
    Image.fromarray(roi_image).show()
    # and we extract the text from it
    text = pytesseract.image_to_string(roi_image, lang="eng", config=custom_oem_psm_config)
    return text


def clean_text(text: str) -> str:
    # ascii_letters include all the letters from english alphabet in lower and upper case
    included = string.ascii_letters
    # first we treat the text as an array because strings are inmutable in python
    new_str = []
    for char in text:  # h, #o, #l, #a,
        if char in included or char == ' ' or char == '—':
            # appending to the array if the string is included
            new_str.append(char)
    # removing extra spaces
    new_text = ''.join(new_str)
    return new_text.strip()


# maybe at some point we also need to pass rows:array, and columns:array
# but now for testing the variables are hard-coded
def text_from_type(path: str) -> str:
    rows_card_type = [350, 1250]
    columns_card_type = [1050, 1150]
    gray_thresh_image = gray_thresh(path)
    text = extract_text(rows_card_type, columns_card_type, gray_thresh_image)
    return clean_text(text)


def text_from_name(path: str) -> str:
    rows_card_name = [350, 1250]
    columns_card_name = [280, 395]
    gray_thresh_image = gray_thresh(path)
    text = extract_text(rows_card_name, columns_card_name, gray_thresh_image)
    return clean_text(text)
