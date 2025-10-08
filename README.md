# 🍳 Personalized Recipe & Shopping App

A full-stack web app that suggests recipes based on your ingredients and builds your shopping list (integrated with lidl bulgaria for promotion products' price).

---

## 🔴 Live demo: [https://personalized-recipe-and-shopping-as.vercel.app](https://personalized-recipe-and-shopping-as.vercel.app/)

---

## 🚀 Features

- 🛒 **Shopping list integration** – Add ingredients and compare with Lidl promos.
- 🧍‍♂️ **User authentication** – Signup, login, and persistent sessions with JWT & cookies.
- 📸 **Recipe creation** – Upload and save your own recipes with images.

---

## 🧩 Tech Stack

### Frontend
- React + TypeScript
- Axios for API calls
- React Router
- TailwindCSS

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Multer for image uploads
- JWT authentication with cookies
- CORS setup for secure cross-domain cookies

### Recipe Scraping
- Python
- BeautifulSoup4 + Requests
- Data cleaning and structuring for database integration
- CRON scheduler for lidl promotions

---

## ⚙️ Setup

### 1️⃣ Clone the repository
```bash
git clone https://github.com/vichmi/personalized-recipe-assistant
cd personalized-recipe-assistant
```

### 2️⃣ Backend setup
```bash
cd server
npm install
npm run dev
```

Make sure your `.env` includes:
```
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret
CLIENT_URL=client_url
PORT = 
SERVER_URL
```

### 3️⃣ Frontend setup
```bash
cd client
npm install
npm run dev
```

---

## 🌐 Deployment

- **Frontend:** [Vercel](https://vercel.com)  
- **Backend:** [Render](https://render.com)  
- **Database:** MongoDB Atlas  
- Ensure CORS origin matches the frontend exactly (no trailing slash).

---

## 🧰 Future Plans
- Support for dietary preferences
- Categorize recipes
