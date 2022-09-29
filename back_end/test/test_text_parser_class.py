# library for running unit tests
import pytest
from back_end.source.text_parser_class import TextParser


@pytest.fixture()
def get_name1():
    file_path = "C:/Users/nessa/Poromagia/Software/back_end/resources/img/1.jpg"
    return TextParser(file_path)


@pytest.fixture()
def get_name2():
    file_path = "C:/Users/nessa/Poromagia/Software/back_end/resources/img/2.jpg"
    return TextParser(file_path)


@pytest.fixture()
def get_name3():
    file_path = "C:/Users/nessa/Poromagia/Software/back_end/resources/img/3.jpg"
    return TextParser(file_path)


@pytest.fixture()
def get_name4():
    file_path = "C:/Users/nessa/Poromagia/Software/back_end/resources/img/4.jpg"
    return TextParser(file_path)


@pytest.fixture()
def get_name5():
    file_path = "C:/Users/nessa/Poromagia/Software/back_end/resources/img/5.jpg"
    return TextParser(file_path)


@pytest.fixture()
def get_type1():
    file_path = "C:/Users/nessa/Poromagia/Software/back_end/resources/img/1.jpg"
    return TextParser(file_path)


@pytest.fixture()
def get_type2():
    file_path = "C:/Users/nessa/Poromagia/Software/back_end/resources/img/2.jpg"
    return TextParser(file_path)


@pytest.fixture()
def get_type3():
    file_path = "C:/Users/nessa/Poromagia/Software/back_end/resources/img/3.jpg"
    return TextParser(file_path)


@pytest.fixture()
def get_type4():
    file_path = "C:/Users/nessa/Poromagia/Software/back_end/resources/img/4.jpg"
    return TextParser(file_path)


@pytest.fixture()
def get_type5():
    file_path = "C:/Users/nessa/Poromagia/Software/back_end/resources/img/5.jpg"
    return TextParser(file_path)


# unit tests for checking all the functionalities of the prescription class
def test_get_name(get_name1, get_name2, get_name3, get_name4, get_name5):
    assert get_name1.parse_name() == "Lightning Strike"
    assert get_name2.parse_name() == "Arcbound Slasher"
    assert get_name3.parse_name() == "Hour of Reckoning"
    # assert get_name4.parse() == "Kenrith's Transformation"
    # assert get_name5.parse() == "Tormod's Crypt"


def test_get_type(get_type1, get_type2, get_type3, get_type4, get_type5):
    assert get_type1.parse_type() == "Instant"
    assert get_type2.parse_type() == "Artifact Creature — Cat"
    assert get_type3.parse_type() == "Sorcery"
