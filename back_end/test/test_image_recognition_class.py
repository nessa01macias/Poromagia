# library for running unit tests
import pytest
from back_end.source.image_recognition_class import ImageMatch


@pytest.fixture()
def get_match1():
    file_path = 'C:\\Users\\nessa\\Poromagia\\Poromagia\\back_end\\resources\\img\\1.jpg'
    return ImageMatch(file_path, "Lightning Strike", "Instant", "en", "2017")


@pytest.fixture()
def get_match2():
    file_path = 'C:\\Users\\nessa\\Poromagia\\Poromagia\\back_end\\resources\\img\\2.jpg'
    return ImageMatch(file_path, "Arcbound Slasher", "Artifact Creature Cat", "en", "2021")


@pytest.fixture()
def get_match3():
    file_path = 'C:\\Users\\nessa\\Poromagia\\Poromagia\\back_end\\resources\\img\\3.jpg'
    return ImageMatch(file_path, "Hour of Reckoning", "Sorcery", "en", "2019")


@pytest.fixture()
def get_match4():
    file_path = 'C:\\Users\\nessa\\Poromagia\\Poromagia\\back_end\\resources\\img\\4.jpg'
    return ImageMatch(file_path, "Kenriths Transformation", "Enchantment Aura", "en", "2019")


@pytest.fixture()
def get_match5():
    file_path = 'C:\\Users\\nessa\\Poromagia\\Poromagia\\back_end\\resources\\img\\5.jpg'
    return ImageMatch(file_path, "Tormods Crypt", "Artifact", "en", "2020")


@pytest.fixture()
def get_match6():
    file_path = 'C:\\Users\\nessa\\Poromagia\\Poromagia\\back_end\\resources\\img\\6.jpg'
    return ImageMatch(file_path, "Trumpet Blast", "Instant", "en", "2018")


@pytest.fixture()
def get_match7():
    file_path = 'C:\\Users\\nessa\\Poromagia\\Poromagia\\back_end\\resources\\img\\7.jpg'
    return ImageMatch(file_path, "Mayhem Devil", "Creature Devil", "en", "2019")


@pytest.fixture()
def get_match8():
    file_path = 'C:\\Users\\nessa\\Poromagia\\Poromagia\\back_end\\resources\\img\\8.jpg'
    return ImageMatch(file_path, "Tanglepool Bridge", "Artifact Land", "en", "2021")


@pytest.fixture()
def get_match9():
    file_path = 'C:\\Users\\nessa\\Poromagia\\Poromagia\\back_end\\resources\\img\\9.jpg'
    return ImageMatch(file_path, "Khalni Heart Expedition", "Enchantment", "en", "Undefined")


@pytest.fixture()
def get_match10():
    file_path = 'C:\\Users\\nessa\\Poromagia\\Poromagia\\back_end\\resources\\img\\10.jpg'
    return ImageMatch(file_path, "Soldevi Sage", "Summon Wizard", "en", "Undefined")


@pytest.fixture()
def get_match11():
    file_path = 'C:\\Users\\nessa\\Poromagia\\Poromagia\\back_end\\resources\\img\\11.jpg'
    return ImageMatch(file_path, "Renata Called to the Hunt", "Legendary Enchantment Creature Demigod", "en", "2020")


@pytest.fixture()
def get_match12():
    file_path = 'C:\\Users\\nessa\\Poromagia\\Poromagia\\back_end\\resources\\img\\12.jpg'
    return ImageMatch(file_path, "Thrashing Brontodon", "Creature Dinosaur", "en", "2019")


@pytest.fixture()
def get_match13():
    file_path = 'C:\\Users\\nessa\\Poromagia\\Poromagia\\back_end\\resources\\img\\13.jpg'
    return ImageMatch(file_path, "Shriekmaw", "Creature Elemental", "en", "2018")


@pytest.fixture()
def get_match14():
    file_path = 'C:\\Users\\nessa\\Poromagia\\Poromagia\\back_end\\resources\\img\\14.jpg'
    return ImageMatch(file_path, "Talrand Sky Summoner", "Legendary Creature Merfolk Wizard", "en", "2015")


@pytest.fixture()
def get_match15():
    file_path = 'C:\\Users\\nessa\\Poromagia\\Poromagia\\back_end\\resources\\img\\15.jpg'
    return ImageMatch(file_path, "Yavimaya Granger", "Summon Elf", "en", "Undefined")


def test_get_id(get_match1, get_match2, get_match3, get_match4, get_match5, get_match6, get_match7, get_match8,
                get_match9, get_match10, get_match11, get_match12, get_match13, get_match14, get_match15):

    assert get_match1.get_id() == "f0f55dee-7e39-4183-8e74-844d9c299bf5"
    assert get_match2.get_id() == "dcafff1a-e220-40ff-8c00-de6037219bc6"
    assert get_match3.get_id() == "0a14b17e-bfff-4859-92cb-a82d2e90580b"
    assert get_match4.get_id() == "6da7cd39-1f8a-4f68-adb7-df2beac02263"
    assert get_match5.get_id() == "9c224bf0-5641-4160-9d5c-46141ea8372a"
    assert get_match6.get_id() == "c676a5b0-bd46-46b3-b71b-a50b86c9b0bd"
    assert get_match7.get_id() == "17416926-168b-49b3-9231-acbb8f8a1d13"
    assert get_match8.get_id() == "57d2b895-8921-4615-a674-fb85eed5ea3f"
    assert get_match9.get_id() == "45cbbcfb-1b1b-4991-988d-17a22a08d5b0"
  #  assert get_match10.get_id() == "268c3726-0e2d-40df-811d-2cdf6b328ea3" couldnt find the proper ID

