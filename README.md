# House Defect AI Webapp

A PWA-ready web application for detecting house defects using AI image captioning.

## 🛠 Tech Stack

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Python + FastAPI + PyTorch
- **AI Model:** Vision Encoder-Decoder (ViT + GPT2)
- **Deployment:** Vercel (Frontend) + ngrok (Backend tunnel)

---

## 🚀 Quick Start (Local Development)

### 1. Start Backend (AI API)
```bash
uv run backend/app.py
```
> Backend runs on Port `8000`

### 2. Start Frontend (Web UI)
```bash
npm run dev
```
> Frontend runs on Port `3000`

---

## 🌐 Vercel Deployment (Hybrid Architecture)

This app uses a **hybrid architecture**: Frontend is deployed on Vercel, Backend runs on your local machine and is exposed via ngrok.

```
┌──────────────┐     HTTPS      ┌───────────────┐     tunnel     ┌──────────────┐
│   Browser /  │ ──────────────▶│    Vercel      │               │  Your Mac    │
│   Phone      │                │  (Frontend)    │               │              │
│              │◀──────────────│               │               │  Backend     │
│              │  static files  │               │               │  (port 8000) │
│              │                └───────────────┘               │              │
│              │                                                │              │
│              │ ── API calls ──▶ ngrok URL ─── tunnel ────────▶│  FastAPI     │
│              │◀── JSON data ── ngrok URL ◀── tunnel ─────────│  + AI Model  │
└──────────────┘                                                └──────────────┘
```

### Setup Steps (One-time)

1. **Install ngrok** — https://ngrok.com/download
2. **Login & get authtoken:**
   ```bash
   ngrok config add-authtoken <YOUR_TOKEN>
   ```
3. **Set Vercel Environment Variable:**
   - Go to Vercel → Project Settings → Environment Variables
   - Add `VITE_API_URL` = `https://<your-subdomain>.ngrok-free.dev`
   - Redeploy

### Every Time You Want to Use Vercel

**Terminal 1** — Start Backend:
```bash
uv run backend/app.py
```

**Terminal 2** — Start ngrok tunnel:
```bash
ngrok http 8000 --url=algometrically-scyphate-lavelle.ngrok-free.dev
```

> ✅ **No IP changes needed!** ngrok works on any WiFi/network.  
> ⚠️ Backend + ngrok must be running for Vercel to work.  
> ⚠️ If you close ngrok or shut down your computer, Vercel won't have data.

---

## 📁 Project Structure

```
house-defect-webapp/
├── backend/                 # Python FastAPI backend
│   ├── app.py               # Main API server
│   ├── models/              # AI model weights
│   └── outputs/             # Uploaded images & reports
├── src/                     # React frontend
│   ├── components/          # UI components
│   ├── services/            # API service layer (apiFetch, defectService, etc.)
│   ├── lib/                 # State management (Zustand store)
│   ├── hooks/               # Custom React hooks
│   └── config.ts            # App configuration (API URL)
├── .env                     # Local environment variables
└── README.md
```

---

## 📝 Key Notes

- **`apiFetch`**: All API calls use a custom fetch wrapper (`src/services/apiFetch.ts`) that includes the `ngrok-skip-browser-warning` header to bypass ngrok's free-tier interstitial page.
- **`ProxiedImage`**: Images are loaded through a proxy component (`src/components/ProxiedImage.tsx`) because `<img>` tags cannot send custom headers.
- **Auto-init**: If no projects exist in the database, the app automatically creates a "Default Project" on first load.

---

## 🔍 ระบบการทำงาน (How It Works)

### Flow การวิเคราะห์ภาพ
```
1. ผู้ใช้ถ่ายรูป / อัปโหลดรูป → Frontend (React)
2. Frontend ส่งรูปไปที่ → POST /predict (Backend)
3. Backend ประมวลผลด้วย AI Model:
   - ViT (Vision Transformer) → แปลงรูปเป็น feature vector
   - GPT-2 (Thai) → สร้างคำอธิบายภาษาไทย (caption)
4. บันทึกผลลงฐานข้อมูล SQLite (DefectRecord)
5. ส่ง JSON response กลับ → Frontend แสดงผล
```

### ฐานข้อมูล (Data Models)
| Model | Fields | หน้าที่ |
|---|---|---|
| **Project** | id, name, address, created_at | จัดกลุ่มงานตรวจสอบ |
| **DefectRecord** | id, filename, caption, label, confidence, image_path, room, severity, project_id | บันทึกผลการวิเคราะห์ |

### AI Model
- **Architecture:** Vision Encoder-Decoder (ViT encoder + GPT-2 decoder)
- **Output:** คำอธิบายข้อบกพร่องเป็นภาษาไทย
- **Inference:** Beam search (num_beams=4), max_length=50, repetition_penalty=2.0

---

## 🔒 ความปลอดภัย (Security)

### ✅ สิ่งที่ทำไปแล้ว
- **CORS** ตั้งค่าไว้ (แม้จะเป็น wildcard `*`)
- **ngrok HTTPS** ข้อมูลถูกเข้ารหัสระหว่างทาง
- **.gitignore** ป้องกันไม่ให้ `.env`, `database.db`, model weights ถูก push

### ⚠️ จุดที่ควรระวัง
| ประเด็น | ระดับ | รายละเอียด |
|---|---|---|
| CORS `allow_origins=["*"]` | 🟡 ปานกลาง | ควรจำกัดเป็น Vercel domain เท่านั้น |
| ไม่มี Authentication | 🔴 สูง | ใครก็ได้ที่มี ngrok URL เข้าถึง API ได้ |
| SQLite ไม่มีการเข้ารหัส | 🟡 ปานกลาง | ข้อมูลบนเครื่องเป็น plaintext |
| ngrok Free Tier | 🟡 ปานกลาง | URL เป็น public, ไม่มี access control |
| File Upload ไม่มี validation | 🟡 ปานกลาง | ควรเช็ค file type/size ก่อนรับ |

### 💡 คำแนะนำด้านความปลอดภัย
1. เพิ่ม **API Key** หรือ **JWT Authentication** สำหรับ API endpoints
2. จำกัด **CORS origins** เป็น `["https://your-app.vercel.app"]`
3. เพิ่ม **Rate Limiting** ป้องกันการเรียก API มากเกินไป
4. **Validate file uploads** — ตรวจสอบ MIME type และจำกัดขนาดไฟล์

---

## 💡 ข้อเสนอแนะ (Recommendations)

### Performance
- **Model Loading:** โมเดล AI โหลดตอนเริ่มเซิร์ฟเวอร์ (~10-30 วินาที) — ดีแล้ว ไม่ต้องโหลดซ้ำทุก request
- **Image Compression:** ควรลดขนาดรูปก่อนส่งไป predict เพื่อเร่งความเร็ว
- **Database Indexing:** เพิ่ม index บน `project_id` ใน DefectRecord เมื่อข้อมูลเริ่มเยอะ

### UX/UI
- **Offline Support:** เพิ่ม Service Worker ให้ถ่ายรูปได้แม้ไม่มี internet แล้ว sync ทีหลัง
- **Batch Upload:** รองรับอัปโหลดรูปหลายรูปพร้อมกัน
- **Search & Filter:** เพิ่มการค้นหาและกรองข้อมูลตาม room, severity, วันที่

### Architecture
- **Database Path:** ตอนนี้ `database.db` ใช้ relative path — ถ้ารันจาก directory อื่นจะได้ DB คนละไฟล์ ควรใช้ absolute path
- **Error Handling:** Backend ส่ง `confidence: 0.95` แบบ hardcode ทุกครั้ง (ไม่ใช่ค่าจริงจากโมเดล)

---

## 🚧 แผนพัฒนาต่อ (Future Development)

### Phase 1: ปรับปรุงโมเดล AI
- [ ] ใช้ **confidence score จริง** จากโมเดลแทนค่า hardcode
- [ ] เพิ่ม **multi-label classification** (ตรวจพบหลายข้อบกพร่องในรูปเดียว)
- [ ] Fine-tune โมเดลด้วย **ข้อมูลเพิ่มเติม** เพื่อเพิ่มความแม่นยำ

### Phase 2: ปรับปรุง Backend
- [ ] เปลี่ยนจาก **SQLite → PostgreSQL** สำหรับ production
- [ ] เพิ่ม **Authentication** (API Key / OAuth)
- [ ] Deploy Backend บน **Cloud** (AWS/GCP/Railway) แทน ngrok
- [ ] เพิ่ม **Image compression** ก่อนบันทึก

### Phase 3: ปรับปรุง Frontend
- [ ] **Offline mode** — ถ่ายรูปออฟไลน์ แล้ว sync ตอนมี internet
- [ ] **Dashboard analytics** — กราฟแสดงสถิติข้อบกพร่องตามเวลา
- [ ] **Export รายงาน** — PDF ที่สมบูรณ์มากขึ้น (แผนผัง, ตำแหน่ง)
- [ ] **Push notifications** — แจ้งเตือนเมื่อวิเคราะห์เสร็จ

### Phase 4: Production Ready
- [ ] **CI/CD Pipeline** — Auto-test & deploy
- [ ] **Monitoring & Logging** — ติดตาม error และ performance
- [ ] **Multi-user support** — ระบบ login, แยกข้อมูลแต่ละคน
- [ ] **Cloud-hosted AI** — ย้ายโมเดลไป GPU server เพื่อประสิทธิภาพ
