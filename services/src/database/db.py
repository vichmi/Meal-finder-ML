from pymongo import MongoClient

client = MongoClient("mongodb+srv://vichmi:1nQTauKpjIhlbxTa@recipe-app.wnvwhil.mongodb.net/?retryWrites=true&w=majority&appName=recipe-app")

db = client["meal_planner"]
print("Connected to MongoDB database 'meal_planner'")