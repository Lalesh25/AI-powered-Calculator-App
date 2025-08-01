# 🧠 AI-Image Solver

An intelligent image-based expression solver that allows users to draw mathematical expressions on a digital canvas and get accurate results using Google Gemini AI.

## 🔍 Project Overview

**AI-Image Solver** is a full-stack web application that converts handwritten or digitally drawn math problems into text using Google Gemini's vision capabilities and returns the evaluated results. It bridges the gap between visual input and computational logic using AI.

## ✨ Features

- ✏️ Draw expressions on a digital canvas
- 🧠 Process images with Google Gemini (via Gemini API)
- 📈 Get real-time results for math problems or expressions
- 🔁 Seamless integration between frontend and backend
- ⚡ Fast response using FastAPI

## 🛠️ Tech Stack

| Layer      | Technology           |
|------------|----------------------|
| Frontend   | React.js             |
| Drawing UI | HTML5 Canvas / React Component |
| Backend    | Python, FastAPI      |
| AI Engine  | Google Gemini API    |

## 📸 Screenshots

<!-- Add your screenshots here -->
![Demo](./screenshots/demo.png)

## 🧪 How It Works

1. User writes or draws a math problem on the canvas.
2. The canvas is converted into a base64 image and sent to the backend.
3. FastAPI backend sends the image to Google Gemini API.
4. Gemini returns the interpreted text and result.
5. Result is displayed on the frontend in real time.

## 📁 Project Structure

ai-image-solver/
├── backend/
│ ├── main.py # FastAPI server
│ └── utils.py # Gemini API integration
├── frontend/
│ ├── src/
│ │ ├── components/
│ │ │ └── DrawingBoard.jsx
│ │ ├── App.jsx
│ │ └── index.jsx
│ └── vite.config.js
├── .gitignore
├── README.md
└── requirements.txt

bash
Copy
Edit

## 🚀 Getting Started

### 🔧 Prerequisites

- Node.js & npm
- Python 3.8+
- Google Gemini API Key (enabled for Vision)

### ⚙️ Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn main:app --reload
🌐 Frontend Setup
bash
Copy
Edit
cd frontend
npm install
npm run dev
🔑 Environment Variables
Create a .env file in your backend directory with:

ini
Copy
Edit
GEMINI_API_KEY=your_gemini_api_key_here
🧠 Example Gemini Prompt
You can send image + prompt like:

json
Copy
Edit
{
  "prompt": "Solve the math expression in the image",
  "image": "<base64_image_data>"
}
📦 Dependencies
React, Axios, Canvas

Python, FastAPI, httpx

Google Gemini Pro Vision API
