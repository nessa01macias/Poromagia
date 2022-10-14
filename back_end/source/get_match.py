from back_end.source.text_parser_class import TextParser
from back_end.source.image_recognition_class import ImageMatch
from back_end.source.data_cleaning import data
import time

df = data(r'C:\Users\nessa\Poromagia\Poromagia\back_end\resources\all-cards-20221006091839.json')

if __name__ == '__main__':
    # timing the code
    start_time = time.time()

    parser = TextParser('C:\\Users\\nessa\\Poromagia\\Poromagia\\back_end\\resources\\img\\6.jpg')
    card_name = parser.parse_name()
    card_type = parser.parse_type()
    card_language = parser.get_language()
    recognition = ImageMatch(parser.file_path, card_name, card_type, card_language)

    end_time = time.time()
    final_time = end_time - start_time

    print("The whole process took", final_time, "seconds")
    print(parser)
    recognition.display_images(df)
