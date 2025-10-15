import pandas as pd
from sklearn.model_selection import train_test_split
from datasets import Dataset, Value
from transformers import AutoTokenizer, AutoModelForSequenceClassification, TrainingArguments, Trainer, pipeline
import numpy as np
import torch
import evaluate
from sklearn.preprocessing import LabelEncoder

model_name = 'bert-base-multilingual-cased'
tokenizer = AutoTokenizer.from_pretrained(model_name)

df = pd.read_csv('./data/recipes.csv')
df['category'] = ''
ingredients_cols = [col for col in df.columns if col.startswith('ingredients[')]
df['ingredients_combined'] = df[ingredients_cols].astype(str).apply(lambda x: ' '.join(x), axis=1)
text_fields = ["title", "ingredients_combined"]
df["text"] = df[text_fields].fillna("").apply(lambda x: " ".join(x), axis=1)


classifier = pipeline('zero-shot-classification', model='facebook/bart-large-mnli')
candidate_labels = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Soup', 'Salad', 'Snack', 'Beverage']
df['category'] = df['category'].apply(lambda x: classifier(x, candidate_labels)['labels'][0])


'''
train_df, test_df = train_test_split(df, test_size=0.2, stratify=df['category'])

train_dataset = Dataset.from_pandas(train_df)
test_dataset = Dataset.from_pandas(test_df)

def tokenize(batch):
    return tokenizer(batch['text'], padding='max_length', truncation=True)

train_dataset = train_dataset.map(tokenize, batched=True)
test_dataset = test_dataset.map(tokenize, batched=True)


le = LabelEncoder()
df['label'] = le.fit_transform(df['category'])

train_dataset = train_dataset.add_column('labels', le.transform(train_dataset['category']))
test_dataset = test_dataset.add_column('labels', le.transform(test_dataset['category']))
train_dataset = train_dataset.cast_column("labels", Value("int64"))
test_dataset = test_dataset.cast_column("labels", Value("int64"))
num_labels = len(df["category"].unique())
model = AutoModelForSequenceClassification.from_pretrained(model_name, num_labels=num_labels)

accuracy = evaluate.load('accuracy')

def compute_metrics(p):
    preds = np.argmax(p.predictions, axis=1)
    return accuracy.compute(predictions=preds, references=p.label_ids)

training_args = TrainingArguments(
    output_dir="./results",
    eval_strategy="epoch",
    save_strategy="epoch",
    learning_rate=2e-5,
    per_device_train_batch_size=8,
    per_device_eval_batch_size=8,
    num_train_epochs=3,
    weight_decay=0.01,
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=test_dataset,
    tokenizer=tokenizer,
    compute_metrics=compute_metrics,
)

trainer.train()

# text = "Спагети болонезе"
# inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)
# outputs = model(**inputs)
# pred = outputs.logits.argmax(dim=1).item()
# category = le.inverse_transform([pred])[0]
# print(category)'''