from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")

db = client["meal_planner"]
print("Connected to MongoDB database 'meal_planner'")