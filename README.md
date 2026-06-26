# မြန်မာပဲရောင်းဝယ် အလေးချိန်နှင့်ငွေတွက်စနစ်

မြန်မာလယ်သမားများအတွက် ပဲရောင်းဝယ်ငွေတွက်စနစ် — Phase 1

## 🔗 Live Demo

**[https://beancalculator.vercel.app](https://beancalculator.vercel.app)**

| အကောင့် | |
|---|---|
| အသုံးပြုသူအမည် | `admin` |
| စကားဝှက် | `admin123` |

## 📸 Screenshots

- အကောင့်ဝင်ရန် (Login with JWT auth)
- ပင်မစာမျက်နှာ (Dashboard with charts & farmer tracking)
- ငွေရှင်းစာရင်း (Multi-bean invoice creation with print/PDF)
- တွက်ချက်စနစ် (Quick calculator for checking amounts)
- မှတ်တမ်းများ (Invoice history with search, filter & delete)
- ပဲအမျိုးအစားများ (37 bean types with standard weights)
- ကိုယ်ရေး / ဆက်တင်များ / စကားဝှက် ပြောင်းရန်

## 🛠 နည်းပညာ

| Layer | Stack |
|-------|-------|
| **Frontend** | React 18 + Vite + TailwindCSS + Recharts |
| **Backend** | Node.js + Express (Vercel Serverless) |
| **Storage** | In-memory (dev) / Upstash Redis (production) |
| **Auth** | JWT + bcrypt (single admin) |
| **Deployment** | Vercel |

## 🚀 တပ်ဆင်နည်း (Local)

### 1. Clone

```bash
git clone https://github.com/builtby-ap/beancalculator.git
cd beancalculator
```

### 2. Server

```bash
cd server
npm install
npm run dev
```

Runs on `http://localhost:3001`

### 3. Client

```bash
cd client
npm install
npm run dev
```

Runs on `http://localhost:5173`

## 📖 အသုံးပြုပုံ

1. **အကောင့်ဝင်ရန်** — admin / admin123 ဖြင့်ဝင်ပါ
2. **ပဲအမျိုးအစားများ** — ပဲ ၃၇ မျိုး၏ စံချိန်တန်း အလေးချိန်များ ကြည့်/ပြင်
3. **ငွေရှင်းစာရင်း** — တောင်သူအမည်၊ ပဲအမျိုးအစား၊ အလေးချိန်၊ နုတ်ယူငွေများ ထည့်ကာ ဘောင်ချာထုတ်ပါ
4. **တွက်ချက်စနစ်** — ဈေးနှုန်း အကြမ်းတွက်ရန် အတွက်စက်
5. **မှတ်တမ်းများ** — ဘောင်ချာမှတ်တမ်းအားလုံး ရှာ/စစ်/ဖျက်
6. **ပင်မစာမျက်နှာ** — စာရင်းဇယားများ၊ ဖြတ်တောက်ငွေဇယား၊ ပဲစျေးနှုန်းလမ်းကြောင်း၊ တောင်သူငွေစာရင်း

## 🧮 တွက်ချက်ပုံ

```
value            = total_viss × price ÷ standard_weight
final_amount     = value - total_deductions

နုတ်ယူငွေများ:
  အလုပ်ခ / အိတ်ခ / ကားခ / အခြား  = per_bag_amount × total_bags
  ပွဲခ                               = value × percentage ÷ 100
```

## 🔒 Authentication

- JWT token (7-day expiry)
- bcrypt password hashing
- All API routes protected except `/api/auth/login`
- Session restored on page refresh

## 📄 License

Private — Phase 1
