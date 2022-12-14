# needed to clean the text
import string
# cv2 is the module import name for opencv-python needed for the cv algorithm
import cv2
# pillow is needed to editing images, printing them, rotating them...
from PIL import Image
# array handling
import numpy as np
# for text detecting
import easyocr
# for detecting the language of the text extracted
import langid
# reglex expressions
import re
import time

reader_popular = easyocr.Reader(['en', 'es', 'fr', 'de', 'it', 'pt'], verbose=False)  # multiple languages


class TextParser:
    def __init__(self, file_path):
        self.__file_path = file_path
        self.image = self.gray_thresh()

    @staticmethod
    def clean_text(text: str) -> str:
        try:
            included = string.ascii_letters
            new_str = []
            for word in text.split():
                if len(word) > 1:
                    for letter in word:
                        if letter in included or letter == ' ':
                            new_str.append(letter)
                    new_str.append(" ")
            new_text = ''.join(new_str)
            return new_text.strip()
        except: 
            print("Something failed during clean_text method! Text Processing Output ", new_text.strip())

    @staticmethod
    def noise_removal(image):
        kernel = np.ones((1, 1), np.uint8)
        image = cv2.dilate(image, kernel, iterations=1)
        kernel = np.ones((1, 1), np.uint8)
        image = cv2.erode(image, kernel, iterations=1)
        image = cv2.morphologyEx(image, cv2.MORPH_CLOSE, kernel)
        image = cv2.medianBlur(image, 3)
        return image

    @staticmethod
    def remove_borders(image):
        # finding the contours of the letters
        contours, heiarchy = cv2.findContours(image, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        cnts_sorted = sorted(contours, key=lambda x: cv2.contourArea(x))
        # grabbing the bounding box
        cnt = cnts_sorted[-1]
        x, y, w, h = cv2.boundingRect(cnt)
        crop = image[y:y + h, x:x + w]
        return crop

    @property  # getter
    def file_path(self) -> str:
        return self.__file_path

    def gray_thresh(self) -> int:
        try: 
            gray_image = cv2.imread(self.__file_path, 0)
            gray_image = cv2.rotate(gray_image, cv2.ROTATE_90_COUNTERCLOCKWISE)
            # thresh, gray_thresh_image = cv2.threshold(gray_image, 180, 30, cv2.THRESH_BINARY)
            # gray_image = cv2.resize(gray_image, None, fx=1.5, fy=1.5, interpolation=cv2.INTER_LINEAR)
            # we need adaptive thresholding because there are many shade colors in the image
            gray_thresh_image = cv2.adaptiveThreshold(
                gray_image, 250,
                # specify that it is the adaptive threst
                cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                # and that the pic going to be white&black
                cv2.THRESH_BINARY,
                # block size of the black area
                11,
                # constant
                3
            )
            # Image.fromarray(gray_thresh_image).show()
            # print(gray_thresh_image.shape)
            return gray_thresh_image
        except:
            print("Something failed during gray_thresh method in textParser class!")

    def extract_text(self, rows, columns) -> str:
        try:
            roi_image = self.image[rows[0]:rows[1], columns[0]:columns[1]]
            #Image.fromarray(roi_image).show()

            # applied noise removal
            roi_image = self.noise_removal(roi_image)
            # we should only apply remove_borders when the background is white
            avg_color_per_row = np.average(roi_image, axis=0)
            avg_color = np.average(avg_color_per_row, axis=0)
            if avg_color > 100:
                # applied remove borders
                roi_image = self.remove_borders(roi_image)
            # maybe it has removed borders, maybe it has not
            # Image.fromarray(roi_image).show()
            roi_image = np.array(roi_image)
            results = reader_popular.readtext(roi_image, detail=0, paragraph=True)
            if len(results) > 1:
                return ' '.join(results)
            elif len(results) == 0:
                return "No results"
            return results[0]
        except:
            print("Something failed during extract_text in textParser class!")


    def parse_name(self) -> str:
        rows_card_name = [150, 280]
        columns_card_name = [30, 700]
        try:
            text = self.extract_text(rows_card_name, columns_card_name)
            return self.clean_text(text)
        except:
            print("Something failed during parse_name in textParser")

    def parse_type(self) -> str:
        rows_card_type = [620, 750]
        columns_card_type =  [30, 700]
        try:
            text_type = self.extract_text(rows_card_type, columns_card_type)
            return self.clean_text(text_type)
        except:
            print("Something failed during parse_type in textParser")

    def get_language(self) -> str:
        rows_card_text = [720, 1000]
        columns_card_text =  [30, 700]
        try:
            text_card_text = self.extract_text(rows_card_text, columns_card_text)
            language = langid.classify(text_card_text)
            return language[0]
        except:
            print("Something failed during get_language in textParser")


    def parse_year(self) -> str:
        rows_card_year = [900, 1100]
        columns_card_year = [300, 700]
        # rows_card_year = [1000, 1150]
        # columns_card_year =  [100, 700]
        try:
            text = self.extract_text(rows_card_year, columns_card_year)
            expression = r'20[0-2][0-9]|2029' # mach all the numbers between 2000 - 2029
            year = re.findall(expression, text)
            if len(year) > 0:
                return year[0]
            return "Undefined"
        except:
            print("Something failed during parse_yearin textParser")

    def __str__(self) -> str:
        return f"Name: {self.parse_name()}, Type: {self.parse_type()}, Language: {self.get_language()}, Year: {self.parse_year()} "


# if __name__ == '__main__':
#     # timing the code
#     start_time = time.time()

#     parser = TextParser(r'C:\Users\nessa\Poromagia\Poromagia\test_raspimg\1.jpg')
#     print(parser)

#     end_time = time.time()
#     final_time = end_time - start_time

#     # card_file = parser.file_path
#     # print(card_file)
#     print("It took", final_time)
