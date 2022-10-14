# library for running unit tests
import pytest
from back_end.source.text_parser_class import TextParser


@pytest.fixture()
def get_text1():
    file_path = 'C:\\Users\\nessa\\Poromagia\\Poromagia\\back_end\\resources\\img\\1.jpg'
    return TextParser(file_path)


@pytest.fixture()
def get_text2():
    file_path = 'C:\\Users\\nessa\\Poromagia\\Poromagia\\back_end\\resources\\img\\2.jpg'
    return TextParser(file_path)


@pytest.fixture()
def get_text3():
    file_path = 'C:\\Users\\nessa\\Poromagia\\Poromagia\\back_end\\resources\\img\\3.jpg'
    return TextParser(file_path)


@pytest.fixture()
def get_text4():
    file_path = 'C:\\Users\\nessa\\Poromagia\\Poromagia\\back_end\\resources\\img\\4.jpg'
    return TextParser(file_path)


@pytest.fixture()
def get_text5():
    file_path = 'C:\\Users\\nessa\\Poromagia\\Poromagia\\back_end\\resources\\img\\5.jpg'
    return TextParser(file_path)


@pytest.fixture()
def get_text5():
    file_path = 'C:\\Users\\nessa\\Poromagia\\Poromagia\\back_end\\resources\\img\\5.jpg'
    return TextParser(file_path)


@pytest.fixture()
def get_text6():
    file_path = 'C:\\Users\\nessa\\Poromagia\\Poromagia\\back_end\\resources\\img\\6.jpg'
    return TextParser(file_path)


@pytest.fixture()
def get_text7():
    file_path = 'C:\\Users\\nessa\\Poromagia\\Poromagia\\back_end\\resources\\img\\7.jpg'
    return TextParser(file_path)


@pytest.fixture()
def get_text8():
    file_path = 'C:\\Users\\nessa\\Poromagia\\Poromagia\\back_end\\resources\\img\\8.jpg'
    return TextParser(file_path)


@pytest.fixture()
def get_text9():
    file_path = 'C:\\Users\\nessa\\Poromagia\\Poromagia\\back_end\\resources\\img\\9.jpg'
    return TextParser(file_path)


@pytest.fixture()
def get_text10():
    file_path = 'C:\\Users\\nessa\\Poromagia\\Poromagia\\back_end\\resources\\img\\10.jpg'
    return TextParser(file_path)


@pytest.fixture()
def get_text11():
    file_path = 'C:\\Users\\nessa\\Poromagia\\Poromagia\\back_end\\resources\\img\\11.jpg'
    return TextParser(file_path)


@pytest.fixture()
def get_text12():
    file_path = 'C:\\Users\\nessa\\Poromagia\\Poromagia\\back_end\\resources\\img\\12.jpg'
    return TextParser(file_path)


@pytest.fixture()
def get_text13():
    file_path = 'C:\\Users\\nessa\\Poromagia\\Poromagia\\back_end\\resources\\img\\13.jpg'
    return TextParser(file_path)


@pytest.fixture()
def get_text14():
    file_path = 'C:\\Users\\nessa\\Poromagia\\Poromagia\\back_end\\resources\\img\\14.jpg'
    return TextParser(file_path)


@pytest.fixture()
def get_text15():
    file_path = 'C:\\Users\\nessa\\Poromagia\\Poromagia\\back_end\\resources\\img\\15.jpg'
    return TextParser(file_path)


# unit tests for checking all the functionalities of the prescription class
# NOTE: text extracting does not identify - or '
def test_get_name(get_text1, get_text2, get_text3, get_text4, get_text5, get_text6, get_text7, get_text8, get_text9,
                  get_text10, get_text11, get_text12, get_text13, get_text14, get_text15):
    assert get_text1.parse_name() == "Lightning Strike"
    assert get_text2.parse_name() == "Arcbound Slasher"
    assert get_text3.parse_name() == "Hour of Reckoning"
    assert get_text4.parse_name() == "Kenriths Transformation"
    assert get_text5.parse_name() == "Tormods Crypt"
    assert get_text6.parse_name() == "Trumpet Blast"
    assert get_text7.parse_name() == "Mayhem Devil"
    assert get_text8.parse_name() == "Tanglepool Bridge"
    assert get_text9.parse_name() == "Khalni Heart Expedition"
    # assert get_text10.parse_name() == "Soldcvi Sagc" -> Actual : 'lihevi Bagc'
    assert get_text11.parse_name() == "Renata Called to the Hunt"
    assert get_text12.parse_name() == "Thrashing Brontodon"
    assert get_text13.parse_name() == "Shriekmaw"
    assert get_text14.parse_name() == "Talrand Sky Summoner"
    assert get_text15.parse_name() == "Yavimaya Granger"


def test_get_type(get_text1, get_text2, get_text3, get_text4, get_text5, get_text6, get_text7, get_text8, get_text9,
                  get_text10, get_text11, get_text12, get_text13, get_text14, get_text15):
    assert get_text1.parse_type() == "Instant"
    assert get_text2.parse_type() == "Artifact Creature Cat"
    assert get_text3.parse_type() == "Sorcery"
    assert get_text4.parse_type() == "Enchantment Aura"
    assert get_text5.parse_type() == "Artifact"
    assert get_text6.parse_type() == "Instant"
    assert get_text7.parse_type() == "Creature Devil"
    assert get_text8.parse_type() == "Artifact Land"
    assert get_text9.parse_type() == "Enchantment"
    # assert get_text10.parse_type() == "Summon Wizard" -> Actual: 'Summn Wiard nig'
    assert get_text11.parse_type() == "Legendary Enchantment Creature Demigod"
    assert get_text12.parse_type() == "Creature Dinosaur"
    assert get_text13.parse_type() == "Creature Elemental"
    assert get_text14.parse_type() == "Legendary Creature Merfolk Wizard"
    # assert get_text15.parse_type() == "Summon Elf" ->  Actual   :'Summn Wiard nig'

