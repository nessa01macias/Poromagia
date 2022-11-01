from data_cleaning import data
import numpy as np
from PIL import Image
import requests
import cv2
import time


class ImageMatch:
    def __init__(self, file_path: str, card_name: str, card_type: str, card_language: str, card_year: str):
        self.file_path = file_path
        self.card_name = card_name
        self.card_type = card_type
        self.card_language = card_language
        self.card_year = card_year
        self.possible_matches = []

    @staticmethod
    def orb_sim(img1: int, img2: int) -> float:
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

    def get_original(self):
        image = cv2.imread(self.file_path, 0)
        image = cv2.rotate(image, cv2.ROTATE_90_CLOCKWISE)
        return image

    def get_apis_name(self) -> tuple:
        api = 'https://api.scryfall.com/cards/search?order=rarity&q='
        name_api = f"{api}!'{self.card_name}'+include%3Aextras&unique=prints"

        card_type_list = list(self.card_type.split(" "))
        string = ""
        for i in range(len(card_type_list)):
            string += f"t:{card_type_list[i]}"
            if i < len(card_type_list) - 1:
                string += "+"
        type_lan_api = f"{api}{string}+lang:{self.card_language}"
        if self.card_year != "Undefined":
            type_lan_api = f"{api}{string}+year:{self.card_year}+lang:{self.card_language}"

        #print(name_api, type_lan_api)
        return name_api, type_lan_api

    def requests_to_server(self) -> int:
        response_json = ""
        result = 0

        api_urls = self.get_apis_name()

        response = requests.get(api_urls[0])
        if response.status_code == 200:
            response_json = response.json()
            result = 1
        else:
            time.sleep(2)  # sleeping two seconds to avoid getting banned!
            response = requests.get(api_urls[1])
            if response.status_code == 200:
                response_json = response.json()
                result = 2

        time.sleep(1)
        if result != 0:
            for each_card in response_json["data"]:
                possible_match = {}

                possible_match["card_id"] = each_card["id"]
                # converting image_link into an image_array
                try:
                    image_url = each_card["image_uris"]["large"]
                except:  # large image does not exist
                    image_url = each_card["image_uris"]["normal"]
                original_img = Image.open(requests.get(image_url, stream=True).raw)
                img = np.asarray(original_img)
                img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
                possible_match["card_image"] = img

                self.possible_matches.append(possible_match)
            #print( self.possible_matches)

        return result

    def get_the_matching_picture(self, image: int) -> int:
        similarities_percentages = []
        result = self.requests_to_server()
        if result != 0:
            # print("The method for api used is", result)
            for each_possible_match in self.possible_matches:
                percentage = self.orb_sim(image, each_possible_match["card_image"])
                similarities_percentages.append(percentage)
            #print(similarities_percentages)
            if max(similarities_percentages) < 0.15:
                return -1
            index = similarities_percentages.index(max(similarities_percentages))
            return self.possible_matches[index]["card_id"]
        return 0

    def get_id(self):
        the_id = self.get_the_matching_picture(self.get_original())
        return the_id

    def __str__(self) -> str:
        the_id = self.get_id()
        if the_id == -1:
            return f"ID has not been found because the scryfall API probably does not have that picture"
        elif the_id == 0:
            return f"ID has not been found because there was an error in the process"

        return f"ID has been found: {the_id}"


if __name__ == '__main__':
    # timing the code
    start_time = time.time()

    image_match = ImageMatch(r"C:\Users\nessa\Poromagia\Poromagia\back_end\resources\img\2.jpg", "Mayhem Devil",
                             "Creature Devil", "en", "Undefined")
    print(image_match)

    end_time = time.time()
    final_time = end_time - start_time

    print("Finding the match image took", final_time, "seconds")
