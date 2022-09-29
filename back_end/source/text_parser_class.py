# more comments on card_name_type_functions.py which contains the functionalities of the class (just for reference)
import string
from abc import ABC
import cv2
import numpy as np
import pytesseract
from PIL import Image

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'


class TextParser:
    def __init__(self, file_path):
        self.file_path = file_path

    def gray_thresh(self) -> int:
        image = cv2.imread(self.file_path)
        gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        thresh, gray_thresh_image = cv2.threshold(gray_image, 135, 255, cv2.THRESH_BINARY)
        gray_thresh_image = np.asarray(gray_thresh_image)
        return gray_thresh_image

    @staticmethod
    def extract_text(rows, columns, gray_thresh_image) -> str:
        custom_oem_psm_config = r'--oem 3 --psm 3'
        roi_image = gray_thresh_image[rows[0]:rows[1], columns[0]:columns[1]]
        roi_image = cv2.rotate(roi_image, cv2.ROTATE_90_CLOCKWISE)
        Image.fromarray(roi_image).show()
        # cv2.waitKey(1000)
        # cv2.destroyAllWindows()
        text = pytesseract.image_to_string(roi_image, lang="eng", config=custom_oem_psm_config)
        return text

    @staticmethod
    def clean_text(text: str) -> str:
        included = string.ascii_letters
        new_str = []
        for char in text:
            if char in included or char == ' ' or char == '—':
                new_str.append(char)
        new_text = ''.join(new_str)
        return new_text.strip()

    def parse_name(self) -> str:
        rows_card_name = [350, 1250]
        columns_card_name = [290, 395]
        gray_thresh_image = self.gray_thresh()
        text = self.extract_text(rows_card_name, columns_card_name, gray_thresh_image)
        return self.clean_text(text)

    def parse_type(self) -> str:
        rows_card_type = [360, 1250]
        columns_card_type = [1080, 1150]
        gray_thresh_image = self.gray_thresh()
        text = self.extract_text(rows_card_type, columns_card_type, gray_thresh_image)
        return self.clean_text(text)


if __name__ == "__main__":
    data = TextParser("C:/Users/nessa/Poromagia/Software/back_end/resources/img/1.jpg")
    print("the name is", data.parse_name())
    print("the type is", data.parse_type())
