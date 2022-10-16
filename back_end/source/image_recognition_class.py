from data_cleaning import data
import numpy as np
from PIL import Image
import requests
import cv2
import time


class ImageMatch:
    def __init__(self, file_path:str, card_name:str, card_type:str, card_language:str):
        self.file_path = file_path
        self.card_name = card_name
        self.card_type = card_type
        self.card_language = card_language
        self.possible_arrays = []
        self.possible_ids = []

    @staticmethod
    def orb_sim(img1:int, img2:int) -> float:
        orb = cv2.ORB_create()

        kp_a, desc_a = orb.detectAndCompute(img1, None)
        kp_b, desc_b = orb.detectAndCompute(img2, None)

        # bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
        bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
        matches = bf.match(desc_a, desc_b)

        similar_regions = [i for i in matches if i.distance < 55]
        if len(matches) == 0:
            return 0
        return len(similar_regions) / len(matches)

    def collecting_arrays(self, possible_images: list):
        for image_url in possible_images:
            original_img = Image.open(requests.get(image_url, stream=True).raw)
            # noinspection PyTypeChecker
            img = np.asarray(original_img)
            img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            # Image.fromarray(img).show()
            self.possible_arrays.append(img)

    def clean_data(self, data_frame: int) -> bool:
        # needs to be replaced by the db stuff
        df_possible = data_frame[
            (data_frame['card_type'] == self.card_type) & (data_frame['card_name'] == self.card_name) & (
                    data_frame['card_language'] == self.card_language)]
        if len(df_possible) == 0:
            return False
        possible_images = df_possible['card_image'].tolist()
        self.collecting_arrays(possible_images)
        possible_ids = df_possible['card_ID'].tolist()
        for possible_id in possible_ids:
            self.possible_ids.append(possible_id)
        return True

    def similarities_array(self, image: int) -> int:
        similarities_percentages = []
        for array in self.possible_arrays:
            percentage = self.orb_sim(image, array)
            similarities_percentages.append(percentage)
        index = similarities_percentages.index(max(similarities_percentages))
        return self.possible_arrays[index]

    def get_original(self):
        img1 = cv2.imread(self.file_path, 0)
        img1 = cv2.rotate(img1, cv2.ROTATE_90_CLOCKWISE)
        return img1

    def get_match(self, data_frame:int) -> int:
        img1 = self.get_original()
        success = self.clean_data(data_frame)
        if success:
            match = self.similarities_array(img1)
            return match
        return img1

    def get_id(self):
        pass

    def display_images(self, data_frame:int):
        img1 = self.get_original()
        img2 = self.get_match(data_frame)
        if not(np.array_equal(img1, img2)):
            Image.fromarray(img1).show()
            Image.fromarray(img2).show()
        else:
            print("Not found possibilities of match as the card properties were not properly extracted")


if __name__ == '__main__':
    # timing the code
    start_time = time.time()

    df = data(r'C:\Users\nessa\Poromagia\Poromagia\back_end\resources\all-cards-20221006091839.json')
    image_match = ImageMatch(r"C:\Users\nessa\Poromagia\Poromagia\back_end\resources\img\5.jpg", "Tormods Crypt",
                             "Artifact", "en")
    image_match.display_images(df)

    end_time = time.time()
    final_time = end_time - start_time

    print("Finding the match image took", final_time, "seconds")


