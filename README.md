## 🚀 AI-Powered PDF Summarizer Web App

This project is a lightweight web application that enables users to upload PDF documents and receive concise, AI-generated summaries. Built with user-friendly design and seamless functionality, the app leverages OpenAI's API to process the uploaded content and deliver clear. It's a practical tool for quickly understanding lengthy documents without reading them in full.

## 🛠️ Setup Instructions

1. Clone the Repository

```bash
git clone https://github.com/your-username/pdf-summary-ai.git
cd pdf-summary-ai
```

2. Install Dependencies

```bash
npm install
```

3. Configure Environment Variables

```ini
OPENAI_API_KEY=your_openai_api_key
```

4. Run application

```ini
npm run dev
```

## 📡 API Documentation

POST /api/upload
Headers
```
Content-Type: multipart/form-data
```
Body

file type file

## 🐳 Docker Usage

This project includes a Docker setup to easily run both the backend and frontend.

```bash
docker compose up
```

