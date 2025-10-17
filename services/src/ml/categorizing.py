from src.database.db import *
import pandas as pd
import spacy
# from sklearn.feature_extraction.text import TfidVectorizer
import re
import nltk
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline 
from sklearn.metrics import classification_report
from transformers import pipeline

collection = db['recipes_bg']
cursor = collection.find({}, {'_id': 1, 'title': 1, 'ingredients': 1})
recipe_data = list(cursor)

df = pd.DataFrame(recipe_data)

def concatenate_recipe_parts(row):
    title = str(row['title'] if 'title' in row and row['title'] is not None else '')
    ingredients = []
    if 'ingredients' in row and isinstance(row['ingredients'], list):
        ingredients = [str(item['name']) for item in row['ingredients'] if item is not None]

    return title + ' ' + ' '.join(ingredients)

df['recipe_text'] = df.apply(concatenate_recipe_parts, axis=1)
df.drop(columns=['title', 'ingredients'], inplace=True, errors='ignore')

CANDIDATE_LABELS = [
    'Закуска', 'Основно', 'Предястие', 'Десерт', 'Супа', 'Салата'
]

print("Loading zero shot classification")
classifier = pipeline(
    "zero-shot-classification",
    model='joeddav/xlm-roberta-large-xnli'
)

print(f'Starting zero-shot classification for {len(df)} recipes..')
batch_size = 100
predictions = []

for i in range(0, len(df), batch_size):
    batch = df['recipe_text'].iloc[i:i + batch_size].tolist()
    results = classifier(batch, CANDIDATE_LABELS, multi_label=False)
    predicted_labels = [r['labels'][0] for r in results]
    predictions.extend(predicted_labels)

    if (i + batch_size) % 500 == 0:
        print(f'Processed {i + batch_size} recipes....')

df['predicted_category'] = predictions

print("\nZero-Shot Classification Complete!")
print("Predicted Category Distribution:")
print(df['predicted_category'].value_counts())

# n = 700
# df_sample = df.sample(n=n, random_state=42).copy()
# df_to_label = df_sample[['_id', 'recipe_text']].copy()
# df_to_label['category'] = ''

# labeling_file_path = 'manual_recipes.csv'
# df_to_label.to_csv(labeling_file_path, index=False, encoding='utf-8')


# bulgarian_stopwords = [
#     'на', 'и', 'да', 'с', 'в', 'от', 'за', 'към', 'по', 'като', 'под', 'през', 'след', 'до', 'го', 'се', 'а', 'но', 'или'
# ]
# nlp_bg = spacy.load('bg_pipeline')

# def bulgairan_preprocessor(text):
#     if not isinstance(text, str):
#         return ''
#     text = re.sub(r'[^а-яa-z\s]', '', text.lower())

#     doc = nlp_bg(text)
#     lemmas = [
#         token.lemma_
#         for token in doc
#         if token.lemma_ not in bulgarian_stopwords and len(token.lemma_) > 2
#     ]
#     return ' '.join(lemmas)

# df_labeled['processed_text'] = df_labeled['recipe_text'].apply(bulgairan_preprocessor)

# X = df_labeled['processed_text']
# y = df_labeled['category']
# X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)

# classification_pipeline = Pipeline([
#     ('tfidf', TfidVectorizer()),
#     ('classifier', LogisticRegression(max_iter=1000, multi_class='ovr', random_state=42))
# ])

# print("Training model...")
# classification_pipeline.fit(X_train, y_train)
# print("Training complete.")

# # Evaluate model performance (optional but highly recommended)
# y_pred = classification_pipeline.predict(X_test)
# print("\n--- Model Evaluation ---")
# print(classification_report(y_test, y_pred, zero_division=0))
# print(f"Overall Accuracy: {classification_pipeline.score(X_test, y_test):.4f}")
