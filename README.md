# ❄️ Frozen Fury: Survival

An idle survival mobile game inspired by Whiteout Survival ads - tap to chop wood, fight animals, survive the cold, attack other players, and build your empire!

## 🚀 Quick Start (Railway Deployment)

### 1. Deploy Backend to Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Navigate to backend
cd backend

# Initialize and deploy
railway init
railway add --database mongodb
railway up
```

### 2. Configure Environment Variables in Railway Dashboard
```
MONGODB_URI=<auto-provided by railway>
JWT_SECRET=your-super-secret-key-change-this-to-something-secure
NODE_ENV=production
```

### 3. Update Frontend API URL
```javascript
// In App.js, update:
const API_URL = 'https://your-app.railway.app/api';
```

## 📱 Game Overview

**Core Gameplay Loop:**
1. **Chop wood** → Build resources
2. **Keep fire burning** → Survive the cold
3. **Fight animal waves** → Earn meat & XP
4. **Research upgrades** → Get stronger
5. **Attack players (PvP)** → Steal resources
6. **Join alliances** → Team up & gift resources
7. **Idle earnings** → Progress while away

## 🎮 Features

### Gameplay
- **Tap-to-chop** wood gathering with satisfying animations
- **Animal attack waves** with increasing difficulty (5 tiers)
- **Temperature survival** mechanic - keep the fire burning!
- **Idle earnings** - resources accumulate even when offline (up to 8 hours)
- **Leveling system** with experience points

### ⚔️ PvP System
- **Find targets** - Search for other players to attack
- **Steal resources** - Take 10% of their wood and meat
- **ELO Rating** - Skill-based matchmaking
- **Shield system** - Protection after being attacked
- **Leaderboards** - Compete for top rankings

### 🏰 Alliance System
- **Create alliances** - Cost: 100 gems
- **Join existing alliances** - Browse and search
- **Send gifts** - Share wood, meat, gems with members
- **Alliance treasury** - Donate to shared storage
- **Member rankings** - By power and contribution

### 💰 Monetization Strategy

| Revenue Stream | Implementation |
|----------------|----------------|
| **Rewarded Ads** | Revive, 2x boost, speed research, double offline |
| **IAP - Gems** | $0.99 to $19.99 packs with bonuses |
| **IAP - Resources** | Wood/meat bundles |
| **IAP - Shields** | 4hr ($1.99), 24hr ($4.99) PvP protection |
| **Premium Pass** | Weekly ($2.99) / Monthly ($7.99) |
| **Remove Ads** | $4.99 one-time |
| **Beast Tiers** | Unlock with gems |

## 📁 Project Structure

```
frozen-fury/
├── frontend/
│   ├── App.js           # Complete React Native app (3000+ lines)
│   ├── styles.js        # All styling (1200+ lines)
│   └── package.json     # Frontend dependencies
│
├── backend/
│   ├── server.js        # Node.js + MongoDB server (800+ lines)
│   ├── package.json     # Backend dependencies
│   └── railway.toml     # Railway deployment config
│
└── README.md
```

## 🔧 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/guest` | Guest login |

### Game
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/save` | Save game state |
| GET | `/api/load` | Load game + offline rewards |
| POST | `/api/rewards/daily` | Claim daily reward |

### PvP
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/pvp/targets` | Find attack targets |
| POST | `/api/pvp/attack/:id` | Attack a player |
| GET | `/api/pvp/history` | Battle history |
| GET | `/api/pvp/leaderboard` | PvP rankings |
| POST | `/api/pvp/shield` | Buy protection |

### Alliance
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/alliance/create` | Create alliance (100 gems) |
| POST | `/api/alliance/join/:id` | Join alliance |
| POST | `/api/alliance/leave` | Leave alliance |
| GET | `/api/alliance/my` | Get my alliance |
| GET | `/api/alliances/search` | Search alliances |
| POST | `/api/alliance/gift` | Send gift to member |
| GET | `/api/alliance/gifts` | Get pending gifts |
| POST | `/api/alliance/gifts/:id/claim` | Claim gift |
| POST | `/api/alliance/donate` | Donate to treasury |

### IAP & Ads
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/iap/verify/:platform` | Verify purchase |
| POST | `/api/iap/restore` | Restore purchases |
| POST | `/api/ads/reward` | Claim ad reward |

### Leaderboards
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leaderboard/waves` | Wave leaderboard |
| GET | `/api/leaderboard/pvp` | PvP leaderboard |
| GET | `/api/leaderboard/alliances` | Alliance leaderboard |

## 🛠️ Setup Instructions

### Frontend (React Native)

```bash
cd frontend

# Install dependencies
npm install

# For iOS (Mac only)
cd ios && pod install && cd ..
npx react-native run-ios

# For Android
npx react-native run-android
```

### Backend (Node.js + MongoDB)

```bash
cd backend

# Install dependencies
npm install

# Start with local MongoDB
MONGODB_URI=mongodb://localhost:27017/frozen-fury npm run dev

# Or deploy to Railway (recommended)
railway up
```

## ⚙️ Environment Variables

### Backend (.env)
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/frozen-fury
JWT_SECRET=your-super-secret-key-change-in-production
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend
Update `API_URL` in App.js with your deployed backend URL.

### AdMob Setup
1. Create AdMob account at https://admob.google.com
2. Create rewarded ad units
3. Replace test IDs in `App.js`:
```javascript
const AD_UNITS = {
  REVIVE: 'ca-app-pub-XXXXX/YYYYY',
  RESOURCE_BOOST: 'ca-app-pub-XXXXX/ZZZZZ',
  RESEARCH_SPEED: 'ca-app-pub-XXXXX/WWWWW',
};
```

## 🔒 Security Features

- JWT authentication with 30-day expiry
- Password hashing with bcrypt (12 rounds)
- Rate limiting (200 requests/15 min)
- Anti-cheat resource validation
- PvP cooldowns prevent spam attacks
- Shield system after being attacked

## 📈 Monetization Tips

1. **Ad Placement**
   - Show revive ad after EVERY death
   - Offer 2x boost when resources low
   - Prompt research speedup when timer > 5 min

2. **PvP Monetization**
   - Shields are high-value purchases
   - Players will pay to protect resources

3. **Alliance Monetization**
   - 100 gem cost to create (premium currency)
   - Encourages gem purchases

4. **Psychological Pricing**
   - Best value badge on $19.99 gem pack
   - Popular badge on $4.99 gem pack

## 📄 License

MIT License - Use freely for commercial purposes.

---

Built with ❄️ for maximum profit and player engagement!
