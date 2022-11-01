# more information in doc_jupyter/developing the feature detection and image classifier
import pandas as pd


def data(path: str):
    df = pd.read_json(path)
    df = df[['id', 'name', 'type_line', 'image_status', 'image_uris', 'scryfall_uri', 'lang']]
    df['type_line'] = df['type_line'].replace("—|,|'", '', regex=True)
    df['name'] = df['name'].replace("—|,|'", '', regex=True)
    df['type_line'] = df['type_line'].str.replace('  ', ' ')
    df['name'] = df['name'].str.replace('  ', ' ')
    df_images = pd.json_normalize(df['image_uris'])
    df_images = df_images['large']
    df_images = pd.DataFrame(data=df_images)
    df2 = pd.concat([df, df_images], axis=1)
    df2.drop(["image_uris"], inplace=True, axis=1)
    df2.rename(columns={'id': 'card_ID', 'name': 'card_name', 'type_line': 'card_type', 'large': 'card_image',
                        'scryfall_uri': 'card_scryfall_URL', 'image_status': 'card_image_status',
                        'lang': 'card_language'}, inplace=True)
    df2 = df2[
        ['card_ID', 'card_name', 'card_type', 'card_language', 'card_image_status', 'card_image', 'card_scryfall_URL']]

    return df2


