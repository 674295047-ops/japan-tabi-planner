# 🇯🇵 Japan Tabi Planner (ระบบจัดสถานที่น่าเที่ยวและแผนการเดินทางในญี่ปุ่น)

เว็บแอปพลิเคชันสำหรับค้นหาสถานที่ท่องเที่ยวยอดนิยมทั่ว 47 จังหวัดในญี่ปุ่น พร้อมระบบจัดตารางทริปรายวันอัจฉริยะ (Smart Itinerary Planner) ตรวจจับวันปิดทำการ และประมาณการค่าเข้าชม พัฒนาในเฟสที่ 1 (Phase 1: MVP)

---

## ✨ ฟีเจอร์หลักในเฟสที่ 1 (Features)

1. **ระบบค้นหาและตัวกรองสถานที่ (Destination Catalog & Discovery)**:
   - รวบรวมแลนด์มาร์กสำคัญครอบคลุมทุกภูมิภาค (คันโต, คันไซ, ฮอกไกโด, โทโฮคุ, ชูบุ, ชิโกกุ, ชูโกกุ, คิวชู, โอกินาวา)
   - กรองตามภูมิภาค (Region), หมวดหมู่ (วัด/ศาลเจ้า, ธรรมชาติ, ช้อปปิ้ง, อาหาร, ออนเซ็น, ธีมปาร์ค) และฤดูกาลท่องเที่ยว (ซากุระ, ใบไม้เปลี่ยนสี, หิมะ)
   - ค้นหาแบบ Real-time รองรับทั้งภาษาไทย อังกฤษ และญี่ปุ่น
2. **ระบบจัดแผนการเดินทางรายวัน (Smart Itinerary Builder)**:
   - เพิ่ม/ลดจำนวนวันในทริป (Day 1, Day 2, Day 3, ...)
   - จัดลำดับจุดแวะเที่ยวในแต่ละวัน (Reorder Move Up / Move Down)
   - ระบุเวลาที่ต้องการไปถึง และบันทึกโน้ต
   - **ระบบตรวจจับวันปิดทำการ (Conflict Warning)**: แจ้งเตือน Badge สีส้มทันทีหากสถานที่นั้นมีกำหนดปิดในวันดังกล่าว เพื่อป้องกันการไปเก้อ
   - คำนวณสรุปค่าเข้าชมรวมทั้งหมดของทริปอัตโนมัติ
3. **ระบบรายการโปรด (Wishlist & Persistence)**:
   - กดบันทึกสถานที่ที่สนใจเก็บไว้ในเครื่องผ่าน LocalStorage (ทำงานแบบ Offline ได้)
4. **การส่งออกแผนการเดินทาง (Export & Print)**:
   - คัดลอกสรุปแผนการเดินทางทั้งหมดไปยัง Clipboard เพื่อส่งต่อในแชตกลุ่ม
   - รองรับการพิมพ์ (Print Friendly)
   - ป็อปอัปเปิดดูพิกัดสถานที่บน Google Maps ได้ทันที

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4, Lucide React Icons
- **Authentication**: Google OAuth 2.0 (`@react-oauth/google`, `jwt-decode`)
- **Deployment**: Cloudflare Pages, Wrangler CLI, GitHub Actions CI/CD

---

## 🔑 การตั้งค่า Google OAuth 2.0 (Google Sign-In)

1. เข้าไปที่ [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. สร้างโปรเจกต์ใหม่ และไปที่เมนู **Credentials** > **Create Credentials** > **OAuth client ID**
3. เลือก Application type: **Web application**
4. ในส่วน **Authorized JavaScript origins** ให้เพิ่ม:
   - สำหรับรันในเครื่อง: `http://localhost:5173`
   - สำหรับ Cloudflare Pages: `https://japan-tabi-planner.pages.dev` (หรือโดเมนของคุณ)
5. คัดลอก **Client ID** นำมาใส่ในไฟล์ `.env`:
   ```bash
   VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   ```
*(หมายเหตุ: ระบบมีโหมด **Demo Google Account** ให้ทดสอบได้ทันทีโดยไม่ต้องรอตั้งค่า Client ID)*

---

## 🛡️ สิทธิ์ผู้ดูแลระบบ (Role-Based Access Control: RBAC)

ระบบกำหนดสิทธิ์การเข้าถึงแยกตามอีเมลของผู้ใช้งานโดยอัตโนมัติ (ทั้งการล็อกอินด้วย Google OAuth หรืออีเมล/รหัสผ่าน):
- 👑 **Super Admin**: `muhammadrokibchemat@gmail.com`
  - มีสิทธิ์สูงสุดในการจัดการระบบ ดูแลผู้ใช้งานทั้งหมด และสามารถปรับเปลี่ยนสิทธิ์ของสมาชิกอื่นได้
- 🛡️ **Admin**: `seree999@gmail.com`
  - มีสิทธิ์เข้าถึงศูนย์จัดการระบบ (Admin Console) ตรวจสอบและดูแลข้อมูลสถานที่ท่องเที่ยว
- 👤 **Traveler / User**: บัญชีทั่วไปอื่นๆ ที่สมัครสมาชิกหรือล็อกอินผ่าน Google

*(สำหรับรหัสผ่านเริ่มต้นของบัญชี Admin/Super Admin เมื่อทดสอบผ่านระบบอีเมลคือ: `Admin@123456`)*



---

## 🚀 วิธีการรันในเครื่อง (Local Development)

```bash
# 1. ติดตั้ง Dependencies
npm install

# 2. เริ่มต้น Dev Server
npm run dev
```

---

## ☁️ วิธีการ Deploy ไปยัง Cloudflare Pages แบบอัตโนมัติ

### วิธีที่ 1: Deploy ผ่าน GitHub Actions (อัตโนมัติทุกครั้งที่ Push Code)
1. นำโค้ดขึ้น GitHub Repository
2. เข้าไปที่ **Repository Settings** > **Secrets and variables** > **Actions**
3. เพิ่ม Repository Secrets:
   - `CLOUDFLARE_API_TOKEN`: สร้าง Token ได้จาก Cloudflare Dashboard > My Profile > API Tokens (เลือกสิทธิ์ Edit Cloudflare Pages)
   - `CLOUDFLARE_ACCOUNT_ID`: Account ID ของบัญชี Cloudflare ของคุณ
4. เมื่อใดก็ตามที่มีการ `git push origin main` ตัว GitHub Actions Workflow [`.github/workflows/deploy-cloudflare.yml`](.github/workflows/deploy-cloudflare.yml) จะทำการ build และ deploy ขึ้น Cloudflare Pages ให้ทันทีแบบอัตโนมัติ 100%

### วิธีที่ 2: Deploy ผ่านคำสั่ง Wrangler CLI จากเครื่องโดยตรง
```bash
# ล็อกอินเข้าสู่ Cloudflare ผ่าน CLI (ทำครั้งแรก)
npx wrangler login

# รันคำสั่ง deploy อัตโนมัติ (จะ build และ upload ขึ้น Cloudflare Pages ให้ทันที)
npm run deploy
```
