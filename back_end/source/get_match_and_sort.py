from text_parser_class import TextParser
from image_recognition_class import ImageMatch
import sys


def get_match_and_sort():
    path = sys.argv[1]
    #print(path)

    parser = TextParser(path)
    recognition = ImageMatch(parser.file_path, parser.parse_name(), parser.parse_type(), parser.get_language(),
                             parser.parse_year())
    # print(parser)
    # print(recognition)
    image_match_id = recognition.get_id()
    if image_match_id == 0 or image_match_id == -1:
        print("0")
    else:
        print(image_match_id)
    
    # api = 'https://poromagia.com/store_manager/card_api/?access_token=4f02d606&id=' + image_match_id
    # response = requests.get(api)
    # if response.status_code == 200:
    #     response_json = response.json()
    #     print(response_json)
    # else:
    #     print("None")
    
    # # ID, price , 
    # # option 0 -> price, option 1 -> stock, option 2 -> wanted
    # if option == 0:
    #     if float(response_json["price"]) < parameter1:
    #         print("cheap")
    #     elif parameter1 <= float(response_json["price"]) < parameter2:
    #         print("normal")
    #     elif float(response_json["price"]) >= parameter2:
    #         print("expensive")
    # elif option == 1:
    #     if response_json["stock"] < parameter1:
    #         print("low stock")
    #     elif parameter1 <= response_json["stock"] < parameter2:
    #         print("normal stock")
    #     elif response_json["stock"] >= parameter2:
    #         print("high stock")
    # elif option == 2:
    #     if response_json["wanted"]:
    #         print("wanted")
    #     else:
    #         print("not wanted")

if __name__ == '__main__':
    get_match_and_sort = get_match_and_sort()
