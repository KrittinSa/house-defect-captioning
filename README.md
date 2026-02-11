# House Defect AI Webapp

A PWA-ready web application for detecting house defects using AI.

## 🚀 Quick Start

### 1. Start Backend (AI API)
Open a terminal and run:
```bash
cd backend
uv run app.py
```
> **Note:** The backend runs on Port `8000`.

### 2. Start Frontend (Web UI)
Open a new terminal and run:
```bash
npm run dev
```
> **Note:** The frontend runs on Port `3000`.

---

## 📱 Mobile Access & Wi-Fi Changes

To use the app on your phone, both devices must be on the **same Wi-Fi network**.

### If you change Wi-Fi or IP Address:

1.  **Find your Computer's IP Address:**
    *   **Mac:** System Settings -> Wi-Fi -> Details -> Check "IP Address" (e.g., `<YOUR_IP_ADDRESS>`)
    *   **Windows:** Command Prompt -> type `ipconfig` -> Look for IPv4 Address.

2.  **Update Config File:**
    Open `src/config.ts` and update the `apiUrl`:

    ```typescript
    export const CONFIG: AppConfig = {
        inferenceProvider: 'local-api',
        
        // Change this to your NEW IP address
        apiUrl: 'http://<YOUR_IP_ADDRESS>:8000', 
    };
    ```

3.  **Access on Phone:**
    Open Chrome/Safari on your phone and go to:
    `http://<YOUR_IP_ADDRESS>:3000` (Replace with your IP)

---

## 🛠 Project Structure

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Python + FastAPI + PyTorch
- **AI Model:** Vision Encoder-Decoder (ViT + GPT2)
