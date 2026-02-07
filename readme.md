# Local Personal Dev Assistant

## Overview

**Local Personal Dev Assistant** is a desktop application that allows developers to run and interact with a Large Language Model (LLM) entirely on their local machine.

The application integrates **Ollama** to provide a private AI chat assistant without relying on external cloud services. It includes a modern desktop interface, user account management, guest access, and file interaction — all designed to improve developer productivity and experimentation.

This project serves as a strong foundation for developers who want to explore local AI workflows, desktop application architecture, and full-stack system design.

---

## Features

- Local AI chat powered by Ollama
- Interactive developer-friendly interface
- User account creation and login system
- Guest mode access
- File upload and interaction support
- Desktop experience via Electron
- Lightweight local database
- Modular and expandable architecture

---

## Tech Stack

### Frontend
- Electron
- React
- TailwindCSS

### Backend
- Python
- FastAPI

### Database
- SQLite

### LLM Integration
- Ollama  
- Model: **llama3.2:1b**

---

## Project Structure

```
project-root/
│
├── frontend/   → Electron + React desktop application
└── backend/    → FastAPI backend API
```

---

## Getting Started

### Clone the repository

```bash
git clone https://github.com/elab-development/internet-tehnologije-2025-localpersonaldevassistant_2022_0550.git
cd internet-tehnologije-2025-localpersonaldevassistant_2022_0550
```

---

## Frontend Setup

Navigate to the frontend directory:

```bash
cd frontend
npm install
npm start
```

This launches the Electron + React desktop application.

---

## Backend Setup

Navigate to the backend directory:

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

This starts the FastAPI backend server.

---

## Installing Ollama and the Model

### Install Ollama

Download Ollama from:

https://ollama.com

Follow the installation instructions for your operating system.

---

### Pull the required LLM model

```bash
ollama pull llama3.2:1b
```

Optional verification:

```bash
ollama run llama3.2:1b
```

If the model responds, Ollama is properly configured.

---

## Running the Full Application

1. Install and run Ollama with the required model
2. Start the backend server
3. Launch the frontend application

The system will automatically connect the frontend, backend, and local LLM.

---

## Use Cases

- Local AI coding assistant
- Developer experimentation platform
- Privacy-focused AI workflows
- Learning full-stack + AI architecture

---

## Contributing

Feel free to fork, explore, and expand the project. The architecture is designed to support further development and customization.

---

## License

This project is intended for educational and development purposes.
