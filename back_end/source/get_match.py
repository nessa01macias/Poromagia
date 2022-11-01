from back_end.source.text_parser_class import TextParser
from back_end.source.image_recognition_class import ImageMatch
import time

# df = data(r'C:\Users\nessa\Poromagia\Poromagia\back_end\resources\all-cards-20221006091839.json')

if __name__ == '__main__':
    # timing the code
    start_time = time.time()

    parser = TextParser('C:\\Users\\nessa\\Poromagia\\Poromagia\\back_end\\resources\\img\\8.jpg')
    recognition = ImageMatch(parser.file_path, parser.parse_name(), parser.parse_type(),  parser.get_language(),
                             parser.parse_year())

    end_time = time.time()
    final_time = end_time - start_time

    print("The whole process took", final_time, "seconds")
    print(parser)
    print(recognition)
