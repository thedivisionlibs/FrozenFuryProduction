// server.js - Frozen Fury: Survival Backend v2.0
// Production-ready Node.js server with MongoDB for Railway deployment

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  PORT: process.env.PORT || 3000,
  MONGODB_URI: process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/frozen-fury',
  JWT_SECRET: process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex'),
  JWT_EXPIRY: '30d',
  
  // Game balance
  MAX_OFFLINE_HOURS: 8,
  OFFLINE_EFFICIENCY: 0.5,
  AD_REWARD_COOLDOWN: 60000,
  PVP_COOLDOWN: 3600000,
  PVP_STEAL_PERCENT: 0.1,
  PVP_SHIELD_DURATION: 14400000,
  ALLIANCE_MAX_MEMBERS: 50,
  ALLIANCE_CREATE_COST: 100,
  
  // Rate limiting
  RATE_LIMIT_WINDOW: 15 * 60 * 1000,
  RATE_LIMIT_MAX: 200,
};

// ============================================================================
// MONGODB SCHEMAS
// ============================================================================

const UserSchema = new mongoose.Schema({
  visibleId: { type: String, unique: true, sparse: true, default: () => uuidv4() },
  username: { type: String, required: true, unique: true, minlength: 3, maxlength: 20, trim: true },
  email: { type: String, sparse: true, lowercase: true, trim: true },
  password: { type: String },
  isGuest: { type: Boolean, default: false },
  deviceId: { type: String, index: true },
  avatar: { type: String, default: 'default' },
  country: { type: String, maxlength: 2 },
  allianceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Alliance', index: true },
  allianceRole: { type: String, enum: ['leader', 'officer', 'member'], default: 'member' },
  pvpRating: { type: Number, default: 1000, index: true },
  pvpWins: { type: Number, default: 0 },
  pvpLosses: { type: Number, default: 0 },
  lastAttackedAt: { type: Date },
  shieldUntil: { type: Date },
  lastPvpAttacks: { type: Map, of: Date },
  referralCode: { type: String, unique: true, sparse: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  referralCount: { type: Number, default: 0 },
  pushToken: { type: String },
  pushPlatform: { type: String, enum: ['ios', 'android'] },
  lastDailyClaim: { type: Date },
  dailyStreak: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now },
}, { timestamps: true });

const GameSaveSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true, index: true },
  player: {
    level: { type: Number, default: 1, min: 1, max: 1000 },
    experience: { type: Number, default: 0, min: 0 },
    experienceToLevel: { type: Number, default: 100 },
    health: { type: Number, default: 100 },
    maxHealth: { type: Number, default: 100 },
  },
  resources: {
    wood: { type: Number, default: 50, min: 0, max: 100000000 },
    meat: { type: Number, default: 25, min: 0, max: 50000000 },
    gems: { type: Number, default: 10, min: 0, max: 10000000 },
    maxWood: { type: Number, default: 1000 },
    maxMeat: { type: Number, default: 500 },
  },
  base: {
    temperature: { type: Number, default: 70, min: 0, max: 100 },
    maxTemperature: { type: Number, default: 100 },
    heatLossRate: { type: Number, default: 0.5 },
    survivors: { type: Number, default: 1 },
    maxSurvivors: { type: Number, default: 5 },
    defenseLevel: { type: Number, default: 1 },
    wallLevel: { type: Number, default: 0 },
  },
  combat: {
    axeDamage: { type: Number, default: 10 },
    attackSpeed: { type: Number, default: 1.0 },
    critChance: { type: Number, default: 0.05 },
    critDamage: { type: Number, default: 1.5 },
    lifesteal: { type: Number, default: 0 },
    damageReduction: { type: Number, default: 0 },
    dodgeChance: { type: Number, default: 0 },
    thorns: { type: Number, default: 0 },
  },
  gathering: {
    chopSpeed: { type: Number, default: 1.0 },
    woodPerChop: { type: Number, default: 5 },
    meatBonus: { type: Number, default: 1.0 },
    idleWoodRate: { type: Number, default: 0.5 },
    idleMeatRate: { type: Number, default: 0.1 },
    offlineMultiplier: { type: Number, default: 0.5 },
  },
  research: { type: Map, of: Number, default: new Map() },
  activeResearch: { id: String, startTime: Date, endTime: Date },
  unlocked: {
    animalTiers: { type: [String], default: ['tier1'] },
    weapons: { type: [String], default: ['axe'] },
    traps: { type: Boolean, default: false },
    cosmetics: { type: [String], default: [] },
  },
  boosters: [{ id: String, type: String, multiplier: Number, effect: String, endTime: Date }],
  wave: { number: { type: Number, default: 1 }, highestWave: { type: Number, default: 1, index: true } },
  stats: {
    totalWoodChopped: { type: Number, default: 0 },
    totalMeatGathered: { type: Number, default: 0 },
    animalsDefeated: { type: Number, default: 0 },
    deaths: { type: Number, default: 0 },
    timePlayed: { type: Number, default: 0 },
    pvpAttacks: { type: Number, default: 0 },
    pvpDefends: { type: Number, default: 0 },
    allianceGiftsSent: { type: Number, default: 0 },
    allianceGiftsReceived: { type: Number, default: 0 },
  },
  settings: {
    soundEnabled: { type: Boolean, default: true },
    musicEnabled: { type: Boolean, default: true },
    notificationsEnabled: { type: Boolean, default: true },
    selectedAxeSkin: { type: String, default: 'default' },
    selectedOutfit: { type: String, default: 'default' },
  },
  purchases: {
    removeAds: { type: Boolean, default: false },
    premiumExpiry: { type: Date },
    totalSpent: { type: Number, default: 0 },
  },
  lastSaveTime: { type: Date, default: Date.now },
  lastOnlineTime: { type: Date, default: Date.now },
}, { timestamps: true });

const AllianceSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, minlength: 3, maxlength: 20, trim: true },
  tag: { type: String, required: true, unique: true, minlength: 2, maxlength: 5, uppercase: true, trim: true },
  description: { type: String, maxlength: 500, default: '' },
  icon: { type: String, default: '⚔️' },
  banner: { type: String, default: 'default' },
  leaderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  officers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  members: [{ userId: mongoose.Schema.Types.ObjectId, joinedAt: { type: Date, default: Date.now }, contribution: { type: Number, default: 0 }, lastActive: { type: Date, default: Date.now } }],
  memberCount: { type: Number, default: 1 },
  maxMembers: { type: Number, default: CONFIG.ALLIANCE_MAX_MEMBERS },
  totalPower: { type: Number, default: 0, index: true },
  totalWaves: { type: Number, default: 0 },
  pvpWins: { type: Number, default: 0 },
  isPublic: { type: Boolean, default: true },
  minLevel: { type: Number, default: 1 },
  autoAccept: { type: Boolean, default: true },
  treasury: { wood: { type: Number, default: 0 }, meat: { type: Number, default: 0 }, gems: { type: Number, default: 0 } },
  joinRequests: [{ userId: mongoose.Schema.Types.ObjectId, requestedAt: { type: Date, default: Date.now }, message: { type: String, maxlength: 100 } }],
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

const AllianceGiftSchema = new mongoose.Schema({
  fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  toUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  allianceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Alliance', required: true },
  resources: { wood: { type: Number, default: 0 }, meat: { type: Number, default: 0 }, gems: { type: Number, default: 0 } },
  message: { type: String, maxlength: 100 },
  claimed: { type: Boolean, default: false, index: true },
  claimedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), index: true },
});

const PvPBattleSchema = new mongoose.Schema({
  attackerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  defenderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  winner: { type: String, enum: ['attacker', 'defender'], required: true },
  resourcesStolen: { wood: { type: Number, default: 0 }, meat: { type: Number, default: 0 } },
  attackerPower: { type: Number },
  defenderPower: { type: Number },
  attackerRatingChange: { type: Number },
  defenderRatingChange: { type: Number },
  createdAt: { type: Date, default: Date.now, index: true },
});

const TransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  productId: { type: String, required: true },
  platform: { type: String, enum: ['google', 'apple'], required: true },
  purchaseToken: { type: String },
  receiptData: { type: String },
  orderId: { type: String },
  amount: { type: Number },
  currency: { type: String, default: 'USD' },
  rewards: { type: Object },
  status: { type: String, enum: ['pending', 'verified', 'failed', 'refunded'], default: 'pending' },
  verifiedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', UserSchema);
const GameSave = mongoose.model('GameSave', GameSaveSchema);
const Alliance = mongoose.model('Alliance', AllianceSchema);
const AllianceGift = mongoose.model('AllianceGift', AllianceGiftSchema);
const PvPBattle = mongoose.model('PvPBattle', PvPBattleSchema);
const Transaction = mongoose.model('Transaction', TransactionSchema);

// ============================================================================
// EXPRESS APP SETUP
// ============================================================================

const app = express();
app.set('trust proxy', 1);
app.use(compression());
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" }, contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') || '*', credentials: true, methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] }));

const limiter = rateLimit({
  windowMs: CONFIG.RATE_LIMIT_WINDOW,
  max: CONFIG.RATE_LIMIT_MAX,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    if (req.path !== '/api/health') {
      console.log(\`[\${new Date().toISOString()}] \${req.method} \${req.path} \${res.statusCode} \${Date.now() - start}ms\`);
    }
  });
  next();
});

// ============================================================================
// DATABASE CONNECTION
// ============================================================================

const connectDB = async () => {
  try {
    await mongoose.connect(CONFIG.MONGODB_URI, { maxPoolSize: 10, serverSelectionTimeoutMS: 5000, socketTimeoutMS: 45000, retryWrites: true, w: 'majority' });
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};

mongoose.connection.on('error', (err) => console.error('MongoDB error:', err));
mongoose.connection.on('disconnected', () => console.log('MongoDB disconnected, reconnecting...'));

// ============================================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================================

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access token required' });
    const decoded = jwt.verify(token, CONFIG.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password').lean();
    if (!user) return res.status(403).json({ error: 'User not found' });
    req.user = user;
    req.userId = user._id;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') return res.status(401).json({ error: 'Token expired' });
    return res.status(403).json({ error: 'Invalid token' });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (token) {
      const decoded = jwt.verify(token, CONFIG.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password').lean();
      if (user) { req.user = user; req.userId = user._id; }
    }
  } catch (err) {}
  next();
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const generateToken = (userId) => jwt.sign({ userId: userId.toString() }, CONFIG.JWT_SECRET, { expiresIn: CONFIG.JWT_EXPIRY });
const generateReferralCode = () => 'FF' + crypto.randomBytes(4).toString('hex').toUpperCase();

const calculatePlayerPower = (gameSave) => {
  if (!gameSave) return 0;
  const c = gameSave.combat || {}, p = gameSave.player || {}, b = gameSave.base || {}, w = gameSave.wave || {};
  return Math.floor(
    (c.axeDamage || 10) * 10 + (c.critChance || 0.05) * 500 + (c.critDamage || 1.5) * 100 +
    (c.damageReduction || 0) * 300 + (p.maxHealth || 100) * 2 + (c.attackSpeed || 1) * 50 +
    (p.level || 1) * 50 + (w.highestWave || 1) * 20 + ((b.defenseLevel || 1) + (b.wallLevel || 0)) * 100
  );
};

const calculateOfflineRewards = (gameSave) => {
  if (!gameSave?.lastOnlineTime) return { wood: 0, meat: 0, time: 0 };
  const offlineTime = Math.min(Date.now() - new Date(gameSave.lastOnlineTime).getTime(), CONFIG.MAX_OFFLINE_HOURS * 3600000);
  if (offlineTime < 60000) return { wood: 0, meat: 0, time: 0 };
  const g = gameSave.gathering || {};
  return {
    wood: Math.floor((g.idleWoodRate || 0.5) * (offlineTime / 1000) * (g.offlineMultiplier || 0.5)),
    meat: Math.floor((g.idleMeatRate || 0.1) * (offlineTime / 1000) * (g.offlineMultiplier || 0.5)),
    time: offlineTime,
  };
};

const getPurchaseRewards = (productId) => ({
  'gems_100': { gems: 100 }, 'gems_500': { gems: 550 }, 'gems_1200': { gems: 1400 }, 'gems_3000': { gems: 3750 },
  'wood_pack_small': { wood: 500 }, 'wood_pack_large': { wood: 2500 },
  'meat_pack_small': { meat: 200 }, 'meat_pack_large': { meat: 1000 },
  'starter_bundle': { wood: 1000, meat: 500, gems: 100 },
  'remove_ads': { removeAds: true }, 'premium_weekly': { premium: 604800000 }, 'premium_monthly': { premium: 2592000000 },
  'shield_4h': { shield: 14400000 }, 'shield_24h': { shield: 86400000 },
}[productId] || { gems: 0 });

const sanitizeGameSave = (data) => {
  if (data.resources) {
    data.resources.wood = Math.min(Math.max(0, data.resources.wood || 0), 100000000);
    data.resources.meat = Math.min(Math.max(0, data.resources.meat || 0), 50000000);
    data.resources.gems = Math.min(Math.max(0, data.resources.gems || 0), 10000000);
  }
  if (data.player) {
    data.player.level = Math.min(Math.max(1, data.player.level || 1), 1000);
    data.player.health = Math.max(0, data.player.health || 100);
  }
  return data;
};

// ============================================================================
// AUTH ROUTES
// ============================================================================

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || username.length < 3 || username.length > 20) return res.status(400).json({ error: 'Username must be 3-20 characters' });
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return res.status(400).json({ error: 'Username can only contain letters, numbers, underscores' });
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Valid email required' });
    if (!password || password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const existing = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username: { $regex: new RegExp(\`^\${username}$\`, 'i') } }] });
    if (existing) return res.status(409).json({ error: existing.email === email.toLowerCase() ? 'Email already registered' : 'Username taken' });

    const user = new User({ username, email: email.toLowerCase(), password: await bcrypt.hash(password, 12), referralCode: generateReferralCode() });
    await user.save();
    const gameSave = new GameSave({ userId: user._id });
    await gameSave.save();

    res.status(201).json({ success: true, token: generateToken(user._id), user: { id: user._id, visibleId: user.visibleId, username: user.username, email: user.email } });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !await bcrypt.compare(password, user.password)) return res.status(401).json({ error: 'Invalid credentials' });

    user.lastLogin = new Date();
    await user.save();

    res.json({ success: true, token: generateToken(user._id), user: { id: user._id, visibleId: user.visibleId, username: user.username, email: user.email } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/guest', async (req, res) => {
  try {
    const { deviceId } = req.body;
    const guestId = deviceId ? \`guest_\${crypto.createHash('sha256').update(deviceId).digest('hex').slice(0, 16)}\` : \`guest_\${uuidv4().slice(0, 8)}\`;

    let user = await User.findOne({ deviceId: guestId, isGuest: true });
    if (!user) {
      user = new User({ username: \`Survivor\${Math.floor(Math.random() * 100000)}\`, isGuest: true, deviceId: guestId, referralCode: generateReferralCode() });
      await user.save();
      const gameSave = new GameSave({ userId: user._id });
      await gameSave.save();
    } else {
      user.lastLogin = new Date();
      await user.save();
    }

    res.json({ success: true, token: generateToken(user._id), user: { id: user._id, visibleId: user.visibleId, username: user.username, isGuest: true } });
  } catch (error) {
    console.error('Guest login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================================================
// GAME SAVE ROUTES
// ============================================================================

app.post('/api/save', authenticateToken, async (req, res) => {
  try {
    const gameData = sanitizeGameSave(req.body);
    gameData.lastSaveTime = new Date();
    gameData.lastOnlineTime = new Date();

    let gameSave = await GameSave.findOne({ userId: req.userId });
    if (gameSave) {
      Object.assign(gameSave, gameData);
      await gameSave.save();
    } else {
      gameSave = new GameSave({ userId: req.userId, ...gameData });
      await gameSave.save();
    }

    res.json({ success: true, savedAt: gameSave.lastSaveTime });
  } catch (error) {
    console.error('Save error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/load', authenticateToken, async (req, res) => {
  try {
    const gameSave = await GameSave.findOne({ userId: req.userId });
    if (!gameSave) return res.json({ success: true, gameState: null, offlineRewards: null });

    const offlineRewards = calculateOfflineRewards(gameSave);
    if (offlineRewards.wood > 0 || offlineRewards.meat > 0) {
      gameSave.resources.wood = Math.min(gameSave.resources.wood + offlineRewards.wood, gameSave.resources.maxWood || 10000);
      gameSave.resources.meat = Math.min(gameSave.resources.meat + offlineRewards.meat, gameSave.resources.maxMeat || 5000);
    }
    gameSave.lastOnlineTime = new Date();
    await gameSave.save();

    res.json({ success: true, gameState: gameSave.toObject(), offlineRewards: offlineRewards.time > 60000 ? offlineRewards : null });
  } catch (error) {
    console.error('Load error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================================================
// PVP ROUTES
// ============================================================================

app.get('/api/pvp/targets', authenticateToken, async (req, res) => {
  try {
    const myUser = await User.findById(req.userId);
    const mySave = await GameSave.findOne({ userId: req.userId });
    const myPower = calculatePlayerPower(mySave);

    const targets = await User.aggregate([
      { $match: { _id: { $ne: req.userId }, isGuest: false, $or: [{ shieldUntil: null }, { shieldUntil: { $lt: new Date() } }] } },
      { $sample: { size: 10 } },
    ]);

    const targetDetails = await Promise.all(targets.map(async (t) => {
      const save = await GameSave.findOne({ userId: t._id });
      const power = calculatePlayerPower(save);
      const cooldownKey = t._id.toString();
      const lastAttack = myUser.lastPvpAttacks?.get(cooldownKey);
      const canAttack = !lastAttack || (Date.now() - new Date(lastAttack).getTime()) > CONFIG.PVP_COOLDOWN;

      return {
        id: t._id, visibleId: t.visibleId, username: t.username, level: save?.player?.level || 1,
        power, rating: t.pvpRating || 1000, canAttack,
        potentialLoot: { wood: Math.floor((save?.resources?.wood || 0) * CONFIG.PVP_STEAL_PERCENT), meat: Math.floor((save?.resources?.meat || 0) * CONFIG.PVP_STEAL_PERCENT) },
      };
    }));

    res.json({ success: true, targets: targetDetails.filter(t => t.power > 0), myPower, myRating: myUser.pvpRating });
  } catch (error) {
    console.error('PvP targets error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/pvp/attack/:targetId', authenticateToken, async (req, res) => {
  try {
    const { targetId } = req.params;
    const [attacker, target] = await Promise.all([User.findById(req.userId), User.findById(targetId)]);

    if (!target) return res.status(404).json({ error: 'Target not found' });
    if (target.shieldUntil && new Date(target.shieldUntil) > new Date()) return res.status(400).json({ error: 'Target is shielded' });

    const cooldownKey = targetId.toString();
    const lastAttack = attacker.lastPvpAttacks?.get(cooldownKey);
    if (lastAttack && (Date.now() - new Date(lastAttack).getTime()) < CONFIG.PVP_COOLDOWN) {
      return res.status(400).json({ error: 'Cooldown active', remainingMs: CONFIG.PVP_COOLDOWN - (Date.now() - new Date(lastAttack).getTime()) });
    }

    const [attackerSave, targetSave] = await Promise.all([GameSave.findOne({ userId: req.userId }), GameSave.findOne({ userId: targetId })]);
    const attackerPower = calculatePlayerPower(attackerSave);
    const defenderPower = calculatePlayerPower(targetSave);

    const attackerRoll = attackerPower * (0.8 + Math.random() * 0.4);
    const defenderRoll = defenderPower * (0.8 + Math.random() * 0.4);
    const attackerWins = attackerRoll > defenderRoll;

    let resourcesStolen = { wood: 0, meat: 0 };
    let ratingChange = 0;

    if (attackerWins) {
      resourcesStolen.wood = Math.floor((targetSave?.resources?.wood || 0) * CONFIG.PVP_STEAL_PERCENT);
      resourcesStolen.meat = Math.floor((targetSave?.resources?.meat || 0) * CONFIG.PVP_STEAL_PERCENT);

      if (targetSave) {
        targetSave.resources.wood = Math.max(0, targetSave.resources.wood - resourcesStolen.wood);
        targetSave.resources.meat = Math.max(0, targetSave.resources.meat - resourcesStolen.meat);
      }
      if (attackerSave) {
        attackerSave.resources.wood = Math.min(attackerSave.resources.wood + resourcesStolen.wood, attackerSave.resources.maxWood);
        attackerSave.resources.meat = Math.min(attackerSave.resources.meat + resourcesStolen.meat, attackerSave.resources.maxMeat);
        attackerSave.stats.pvpAttacks = (attackerSave.stats.pvpAttacks || 0) + 1;
      }

      const expectedScore = 1 / (1 + Math.pow(10, (target.pvpRating - attacker.pvpRating) / 400));
      ratingChange = Math.round(32 * (1 - expectedScore));

      attacker.pvpRating = (attacker.pvpRating || 1000) + ratingChange;
      attacker.pvpWins = (attacker.pvpWins || 0) + 1;
      target.pvpRating = Math.max(100, (target.pvpRating || 1000) - ratingChange);
      target.pvpLosses = (target.pvpLosses || 0) + 1;
    } else {
      const expectedScore = 1 / (1 + Math.pow(10, (target.pvpRating - attacker.pvpRating) / 400));
      ratingChange = Math.round(32 * expectedScore);
      attacker.pvpRating = Math.max(100, (attacker.pvpRating || 1000) - ratingChange);
      attacker.pvpLosses = (attacker.pvpLosses || 0) + 1;
      target.pvpRating = (target.pvpRating || 1000) + ratingChange;
      target.pvpWins = (target.pvpWins || 0) + 1;
      ratingChange = -ratingChange;
    }

    if (!attacker.lastPvpAttacks) attacker.lastPvpAttacks = new Map();
    attacker.lastPvpAttacks.set(cooldownKey, new Date());
    target.lastAttackedAt = new Date();
    target.shieldUntil = new Date(Date.now() + CONFIG.PVP_SHIELD_DURATION);

    await Promise.all([attackerSave?.save(), targetSave?.save(), attacker.save(), target.save()]);

    const battle = new PvPBattle({
      attackerId: req.userId, defenderId: targetId, winner: attackerWins ? 'attacker' : 'defender',
      resourcesStolen, attackerPower, defenderPower, attackerRatingChange: ratingChange, defenderRatingChange: -ratingChange,
    });
    await battle.save();

    res.json({ success: true, victory: attackerWins, battle: { yourPower: attackerPower, enemyPower: defenderPower, resourcesStolen, ratingChange, newRating: attacker.pvpRating } });
  } catch (error) {
    console.error('PvP attack error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/pvp/history', authenticateToken, async (req, res) => {
  try {
    const battles = await PvPBattle.find({ $or: [{ attackerId: req.userId }, { defenderId: req.userId }] })
      .sort({ createdAt: -1 }).limit(50).populate('attackerId', 'username').populate('defenderId', 'username');

    res.json({
      success: true,
      battles: battles.map(b => ({
        id: b._id, isAttacker: b.attackerId._id.toString() === req.userId.toString(),
        opponent: b.attackerId._id.toString() === req.userId.toString() ? b.defenderId?.username : b.attackerId?.username,
        victory: (b.attackerId._id.toString() === req.userId.toString()) === (b.winner === 'attacker'),
        resourcesStolen: b.resourcesStolen,
        ratingChange: b.attackerId._id.toString() === req.userId.toString() ? b.attackerRatingChange : b.defenderRatingChange,
        time: b.createdAt,
      })),
    });
  } catch (error) {
    console.error('Battle history error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/pvp/leaderboard', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const [leaders, total] = await Promise.all([
      User.find({ pvpRating: { $gt: 0 } }).sort({ pvpRating: -1 }).skip(parseInt(offset)).limit(parseInt(limit)).select('username pvpRating pvpWins pvpLosses visibleId'),
      User.countDocuments({ pvpRating: { $gt: 0 } }),
    ]);

    res.json({
      success: true, total,
      leaders: leaders.map((l, i) => ({
        rank: parseInt(offset) + i + 1, visibleId: l.visibleId, username: l.username, rating: l.pvpRating,
        wins: l.pvpWins || 0, losses: l.pvpLosses || 0,
        winRate: l.pvpWins + l.pvpLosses > 0 ? Math.round((l.pvpWins / (l.pvpWins + l.pvpLosses)) * 100) : 0,
      })),
    });
  } catch (error) {
    console.error('PvP leaderboard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/pvp/shield', authenticateToken, async (req, res) => {
  try {
    const { hours = 4 } = req.body;
    const cost = hours === 4 ? 50 : hours === 24 ? 200 : 50;

    const gameSave = await GameSave.findOne({ userId: req.userId });
    if (!gameSave || gameSave.resources.gems < cost) return res.status(400).json({ error: \`Need \${cost} gems\` });

    gameSave.resources.gems -= cost;
    await gameSave.save();

    const user = await User.findById(req.userId);
    user.shieldUntil = new Date(Date.now() + hours * 3600000);
    await user.save();

    res.json({ success: true, shieldUntil: user.shieldUntil });
  } catch (error) {
    console.error('Buy shield error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================================================
// ALLIANCE ROUTES
// ============================================================================

app.post('/api/alliance/create', authenticateToken, async (req, res) => {
  try {
    const { name, tag, description, isPublic = true } = req.body;
    const user = await User.findById(req.userId);
    if (user.allianceId) return res.status(400).json({ error: 'Already in an alliance' });
    if (!name || name.length < 3 || name.length > 20) return res.status(400).json({ error: 'Name must be 3-20 characters' });
    if (!tag || tag.length < 2 || tag.length > 5) return res.status(400).json({ error: 'Tag must be 2-5 characters' });

    const gameSave = await GameSave.findOne({ userId: req.userId });
    if (!gameSave || gameSave.resources.gems < CONFIG.ALLIANCE_CREATE_COST) return res.status(400).json({ error: \`Need \${CONFIG.ALLIANCE_CREATE_COST} gems\` });

    const existing = await Alliance.findOne({ $or: [{ name: { $regex: new RegExp(\`^\${name}$\`, 'i') } }, { tag: tag.toUpperCase() }] });
    if (existing) return res.status(409).json({ error: 'Alliance name or tag taken' });

    gameSave.resources.gems -= CONFIG.ALLIANCE_CREATE_COST;
    await gameSave.save();

    const alliance = new Alliance({ name, tag: tag.toUpperCase(), description, isPublic, leaderId: req.userId, members: [{ userId: req.userId }], memberCount: 1, totalPower: calculatePlayerPower(gameSave) });
    await alliance.save();

    user.allianceId = alliance._id;
    user.allianceRole = 'leader';
    await user.save();

    res.status(201).json({ success: true, alliance: { id: alliance._id, name: alliance.name, tag: alliance.tag } });
  } catch (error) {
    console.error('Create alliance error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/alliance/join/:allianceId', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (user.allianceId) return res.status(400).json({ error: 'Already in an alliance' });

    const alliance = await Alliance.findById(req.params.allianceId);
    if (!alliance) return res.status(404).json({ error: 'Alliance not found' });
    if (!alliance.isPublic) return res.status(400).json({ error: 'Alliance is private' });
    if (alliance.memberCount >= alliance.maxMembers) return res.status(400).json({ error: 'Alliance full' });

    const gameSave = await GameSave.findOne({ userId: req.userId });
    if (gameSave && gameSave.player.level < alliance.minLevel) return res.status(400).json({ error: \`Min level \${alliance.minLevel} required\` });

    alliance.members.push({ userId: req.userId });
    alliance.memberCount += 1;
    alliance.totalPower += calculatePlayerPower(gameSave);
    await alliance.save();

    user.allianceId = alliance._id;
    user.allianceRole = 'member';
    await user.save();

    res.json({ success: true, alliance: { id: alliance._id, name: alliance.name, tag: alliance.tag } });
  } catch (error) {
    console.error('Join alliance error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/alliance/leave', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user.allianceId) return res.status(400).json({ error: 'Not in an alliance' });

    const alliance = await Alliance.findById(user.allianceId);
    if (!alliance) {
      user.allianceId = null;
      user.allianceRole = 'member';
      await user.save();
      return res.json({ success: true });
    }

    if (alliance.leaderId.equals(req.userId)) {
      if (alliance.memberCount > 1) return res.status(400).json({ error: 'Transfer leadership first' });
      await Alliance.findByIdAndDelete(alliance._id);
    } else {
      alliance.members = alliance.members.filter(m => !m.userId.equals(req.userId));
      alliance.officers = alliance.officers.filter(o => !o.equals(req.userId));
      alliance.memberCount -= 1;
      const gameSave = await GameSave.findOne({ userId: req.userId });
      alliance.totalPower -= calculatePlayerPower(gameSave);
      await alliance.save();
    }

    user.allianceId = null;
    user.allianceRole = 'member';
    await user.save();

    res.json({ success: true });
  } catch (error) {
    console.error('Leave alliance error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/alliance/my', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user.allianceId) return res.json({ success: true, alliance: null });

    const alliance = await Alliance.findById(user.allianceId).populate('leaderId', 'username');
    if (!alliance) return res.json({ success: true, alliance: null });

    const memberDetails = await Promise.all(alliance.members.map(async (m) => {
      const [u, s] = await Promise.all([User.findById(m.userId).select('username pvpRating lastLogin visibleId'), GameSave.findOne({ userId: m.userId })]);
      return {
        id: m.userId, visibleId: u?.visibleId, username: u?.username || 'Unknown', power: calculatePlayerPower(s),
        level: s?.player?.level || 1, contribution: m.contribution, joinedAt: m.joinedAt, lastActive: u?.lastLogin,
        isLeader: alliance.leaderId.equals(m.userId), isOfficer: alliance.officers.some(o => o.equals(m.userId)),
      };
    }));

    res.json({
      success: true,
      alliance: {
        id: alliance._id, name: alliance.name, tag: alliance.tag, description: alliance.description, icon: alliance.icon,
        memberCount: alliance.memberCount, maxMembers: alliance.maxMembers, totalPower: alliance.totalPower,
        isPublic: alliance.isPublic, minLevel: alliance.minLevel, treasury: alliance.treasury, createdAt: alliance.createdAt,
      },
      members: memberDetails.sort((a, b) => b.power - a.power),
      isLeader: alliance.leaderId.equals(req.userId),
      isOfficer: alliance.officers.some(o => o.equals(req.userId)),
      myRole: user.allianceRole,
    });
  } catch (error) {
    console.error('Get my alliance error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/alliances/search', async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    const query = { isPublic: true };
    if (q) query.$or = [{ name: { $regex: q, $options: 'i' } }, { tag: { $regex: q, $options: 'i' } }];

    const [alliances, total] = await Promise.all([
      Alliance.find(query).sort({ totalPower: -1 }).skip((parseInt(page) - 1) * parseInt(limit)).limit(parseInt(limit))
        .select('name tag description icon memberCount maxMembers totalPower minLevel'),
      Alliance.countDocuments(query),
    ]);

    res.json({ success: true, alliances, total, pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    console.error('Search alliances error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/alliance/gift', authenticateToken, async (req, res) => {
  try {
    const { toUserId, resources, message } = req.body;
    const user = await User.findById(req.userId);
    if (!user.allianceId) return res.status(400).json({ error: 'Not in an alliance' });
    if (!toUserId || toUserId === req.userId.toString()) return res.status(400).json({ error: 'Invalid recipient' });

    const recipient = await User.findById(toUserId);
    if (!recipient || !recipient.allianceId?.equals(user.allianceId)) return res.status(400).json({ error: 'Recipient must be in your alliance' });

    const senderSave = await GameSave.findOne({ userId: req.userId });
    if (!senderSave) return res.status(400).json({ error: 'Save not found' });

    const wood = Math.min(Math.max(0, resources?.wood || 0), senderSave.resources.wood);
    const meat = Math.min(Math.max(0, resources?.meat || 0), senderSave.resources.meat);
    const gems = Math.min(Math.max(0, resources?.gems || 0), senderSave.resources.gems);
    if (wood === 0 && meat === 0 && gems === 0) return res.status(400).json({ error: 'Nothing to send' });

    senderSave.resources.wood -= wood;
    senderSave.resources.meat -= meat;
    senderSave.resources.gems -= gems;
    senderSave.stats.allianceGiftsSent = (senderSave.stats.allianceGiftsSent || 0) + 1;
    await senderSave.save();

    const gift = new AllianceGift({ fromUserId: req.userId, toUserId, allianceId: user.allianceId, resources: { wood, meat, gems }, message });
    await gift.save();

    await Alliance.updateOne({ _id: user.allianceId, 'members.userId': req.userId }, { $inc: { 'members.$.contribution': wood + meat + gems * 10 } });

    res.json({ success: true, gift: { id: gift._id, resources: gift.resources } });
  } catch (error) {
    console.error('Send gift error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/alliance/gifts', authenticateToken, async (req, res) => {
  try {
    const gifts = await AllianceGift.find({ toUserId: req.userId, claimed: false, expiresAt: { $gt: new Date() } })
      .populate('fromUserId', 'username').sort({ createdAt: -1 });

    res.json({
      success: true,
      gifts: gifts.map(g => ({ id: g._id, from: g.fromUserId?.username || 'Unknown', resources: g.resources, message: g.message, createdAt: g.createdAt, expiresAt: g.expiresAt })),
    });
  } catch (error) {
    console.error('Get gifts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/alliance/gifts/:giftId/claim', authenticateToken, async (req, res) => {
  try {
    const gift = await AllianceGift.findOne({ _id: req.params.giftId, toUserId: req.userId, claimed: false, expiresAt: { $gt: new Date() } });
    if (!gift) return res.status(404).json({ error: 'Gift not found or expired' });

    const recipientSave = await GameSave.findOne({ userId: req.userId });
    if (!recipientSave) return res.status(400).json({ error: 'Save not found' });

    recipientSave.resources.wood = Math.min(recipientSave.resources.wood + gift.resources.wood, recipientSave.resources.maxWood);
    recipientSave.resources.meat = Math.min(recipientSave.resources.meat + gift.resources.meat, recipientSave.resources.maxMeat);
    recipientSave.resources.gems += gift.resources.gems;
    recipientSave.stats.allianceGiftsReceived = (recipientSave.stats.allianceGiftsReceived || 0) + 1;
    await recipientSave.save();

    gift.claimed = true;
    gift.claimedAt = new Date();
    await gift.save();

    res.json({ success: true, resources: gift.resources });
  } catch (error) {
    console.error('Claim gift error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/alliance/donate', authenticateToken, async (req, res) => {
  try {
    const { resources } = req.body;
    const user = await User.findById(req.userId);
    if (!user.allianceId) return res.status(400).json({ error: 'Not in an alliance' });

    const gameSave = await GameSave.findOne({ userId: req.userId });
    if (!gameSave) return res.status(400).json({ error: 'Save not found' });

    const wood = Math.min(Math.max(0, resources?.wood || 0), gameSave.resources.wood);
    const meat = Math.min(Math.max(0, resources?.meat || 0), gameSave.resources.meat);
    const gems = Math.min(Math.max(0, resources?.gems || 0), gameSave.resources.gems);
    if (wood === 0 && meat === 0 && gems === 0) return res.status(400).json({ error: 'Nothing to donate' });

    gameSave.resources.wood -= wood;
    gameSave.resources.meat -= meat;
    gameSave.resources.gems -= gems;
    await gameSave.save();

    await Alliance.updateOne({ _id: user.allianceId, 'members.userId': req.userId }, {
      $inc: { 'treasury.wood': wood, 'treasury.meat': meat, 'treasury.gems': gems, 'members.$.contribution': wood + meat + gems * 10 }
    });

    res.json({ success: true, donated: { wood, meat, gems } });
  } catch (error) {
    console.error('Donate error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================================================
// LEADERBOARD ROUTES
// ============================================================================

app.get('/api/leaderboard/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    let leaders = [], total = 0;

    if (category === 'waves') {
      const saves = await GameSave.find().sort({ 'wave.highestWave': -1 }).skip(parseInt(offset)).limit(parseInt(limit)).populate('userId', 'username visibleId');
      leaders = saves.map((s, i) => ({ rank: parseInt(offset) + i + 1, visibleId: s.userId?.visibleId, username: s.userId?.username || 'Unknown', score: s.wave?.highestWave || 0 }));
      total = await GameSave.countDocuments();
    } else if (category === 'pvp') {
      const users = await User.find({ pvpRating: { $gt: 0 } }).sort({ pvpRating: -1 }).skip(parseInt(offset)).limit(parseInt(limit)).select('username pvpRating pvpWins pvpLosses visibleId');
      leaders = users.map((u, i) => ({ rank: parseInt(offset) + i + 1, visibleId: u.visibleId, username: u.username, score: u.pvpRating, wins: u.pvpWins || 0, losses: u.pvpLosses || 0 }));
      total = await User.countDocuments({ pvpRating: { $gt: 0 } });
    } else if (category === 'alliances') {
      const alliances = await Alliance.find().sort({ totalPower: -1 }).skip(parseInt(offset)).limit(parseInt(limit)).select('name tag totalPower memberCount');
      leaders = alliances.map((a, i) => ({ rank: parseInt(offset) + i + 1, name: a.name, tag: a.tag, score: a.totalPower, members: a.memberCount }));
      total = await Alliance.countDocuments();
    }

    res.json({ success: true, category, leaders, total });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================================================
// DAILY REWARDS
// ============================================================================

app.post('/api/rewards/daily', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const gameSave = await GameSave.findOne({ userId: req.userId });
    if (!gameSave) return res.status(400).json({ error: 'Save not found' });

    const lastClaim = user.lastDailyClaim ? new Date(user.lastDailyClaim).getTime() : 0;
    const now = Date.now();
    const dayMs = 86400000;

    if (now - lastClaim < dayMs) return res.status(400).json({ error: 'Already claimed', nextClaimIn: dayMs - (now - lastClaim) });

    let streak = user.dailyStreak || 0;
    streak = (now - lastClaim < dayMs * 2) ? streak + 1 : 1;

    const rewards = { 1: { wood: 100, meat: 50 }, 2: { wood: 150, meat: 75 }, 3: { wood: 200, meat: 100, gems: 5 }, 4: { wood: 250, meat: 125 }, 5: { wood: 300, meat: 150 }, 6: { wood: 350, meat: 175, gems: 10 }, 7: { wood: 500, meat: 250, gems: 25 } };
    const reward = rewards[Math.min(streak, 7)];

    gameSave.resources.wood = Math.min(gameSave.resources.wood + (reward.wood || 0), gameSave.resources.maxWood);
    gameSave.resources.meat = Math.min(gameSave.resources.meat + (reward.meat || 0), gameSave.resources.maxMeat);
    gameSave.resources.gems = (gameSave.resources.gems || 0) + (reward.gems || 0);
    await gameSave.save();

    user.lastDailyClaim = new Date();
    user.dailyStreak = streak > 7 ? 1 : streak;
    await user.save();

    res.json({ success: true, streak, rewards: reward, nextStreakRewards: rewards[Math.min(streak + 1, 7)] });
  } catch (error) {
    console.error('Daily reward error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================================================
// IAP VERIFICATION
// ============================================================================

app.post('/api/iap/verify/:platform', authenticateToken, async (req, res) => {
  try {
    const { platform } = req.params;
    const { productId, purchaseToken, receiptData } = req.body;
    if (!productId) return res.status(400).json({ error: 'Product ID required' });

    // In production: Verify with Google Play / Apple APIs
    const rewards = getPurchaseRewards(productId);
    const gameSave = await GameSave.findOne({ userId: req.userId });

    if (rewards.gems) gameSave.resources.gems = (gameSave.resources.gems || 0) + rewards.gems;
    if (rewards.wood) gameSave.resources.wood = Math.min(gameSave.resources.wood + rewards.wood, gameSave.resources.maxWood);
    if (rewards.meat) gameSave.resources.meat = Math.min(gameSave.resources.meat + rewards.meat, gameSave.resources.maxMeat);
    if (rewards.removeAds) gameSave.purchases.removeAds = true;
    if (rewards.premium) gameSave.purchases.premiumExpiry = new Date(Date.now() + rewards.premium);
    if (rewards.shield) {
      const user = await User.findById(req.userId);
      user.shieldUntil = new Date(Date.now() + rewards.shield);
      await user.save();
    }

    gameSave.purchases.totalSpent = (gameSave.purchases.totalSpent || 0) + (getPurchaseRewards(productId).price || 0);
    await gameSave.save();

    const transaction = new Transaction({ userId: req.userId, productId, platform, purchaseToken, receiptData, rewards, status: 'verified', verifiedAt: new Date() });
    await transaction.save();

    res.json({ success: true, transactionId: transaction._id, rewards });
  } catch (error) {
    console.error('IAP verify error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/iap/restore', authenticateToken, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId, status: 'verified' });
    const nonConsumable = ['remove_ads', 'premium_weekly', 'premium_monthly'];
    const restored = transactions.filter(t => nonConsumable.includes(t.productId)).map(t => ({ productId: t.productId, rewards: getPurchaseRewards(t.productId), purchasedAt: t.verifiedAt }));

    res.json({ success: true, purchases: restored });
  } catch (error) {
    console.error('Restore error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================================================
// ADS VERIFICATION
// ============================================================================

app.post('/api/ads/reward', authenticateToken, async (req, res) => {
  try {
    const { adType } = req.body;
    const gameSave = await GameSave.findOne({ userId: req.userId });
    if (!gameSave) return res.status(400).json({ error: 'Save not found' });

    const rewards = { REVIVE: { type: 'revive' }, RESOURCE_BOOST: { type: 'boost', multiplier: 2, duration: 300000 }, RESEARCH_SPEED: { type: 'speedup', value: 600000 }, OFFLINE_DOUBLE: { type: 'double_offline' } };
    const reward = rewards[adType] || { type: 'gems', value: 5 };

    if (reward.type === 'gems') gameSave.resources.gems = (gameSave.resources.gems || 0) + (reward.value || 5);
    await gameSave.save();

    res.json({ success: true, reward });
  } catch (error) {
    console.error('Ad reward error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================================================
// PROFILE & STATS
// ============================================================================

app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const [user, gameSave] = await Promise.all([User.findById(req.userId).select('-password'), GameSave.findOne({ userId: req.userId })]);

    res.json({
      success: true,
      profile: {
        id: user._id, visibleId: user.visibleId, username: user.username, email: user.email, isGuest: user.isGuest,
        avatar: user.avatar, pvpRating: user.pvpRating, pvpWins: user.pvpWins || 0, pvpLosses: user.pvpLosses || 0,
        shieldUntil: user.shieldUntil, allianceId: user.allianceId, allianceRole: user.allianceRole,
        dailyStreak: user.dailyStreak || 0, referralCode: user.referralCode, referralCount: user.referralCount || 0,
        createdAt: user.createdAt,
      },
      stats: gameSave ? {
        level: gameSave.player?.level || 1, power: calculatePlayerPower(gameSave), highestWave: gameSave.wave?.highestWave || 1,
        animalsDefeated: gameSave.stats?.animalsDefeated || 0, timePlayed: gameSave.stats?.timePlayed || 0,
        totalWoodChopped: gameSave.stats?.totalWoodChopped || 0, totalMeatGathered: gameSave.stats?.totalMeatGathered || 0,
      } : null,
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: Date.now(), version: '2.0.0', uptime: process.uptime(), db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

app.get('/api/config', (req, res) => {
  res.json({
    version: '2.0.0', minVersion: '1.0.0', maintenanceMode: false,
    features: { leaderboards: true, dailyRewards: true, referrals: true, cloudSave: true, pvp: true, alliances: true },
  });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.use((req, res) => res.status(404).json({ error: 'Endpoint not found' }));
app.use((err, req, res, next) => { console.error('Unhandled error:', err); res.status(500).json({ error: 'Internal server error' }); });

// ============================================================================
// START SERVER
// ============================================================================

const startServer = async () => {
  await connectDB();
  app.listen(CONFIG.PORT, () => {
    console.log(\`
╔════════════════════════════════════════════════════════════════╗
║  ❄️  FROZEN FURY: SURVIVAL - Game Server v2.0  ❄️             ║
║  Server: http://localhost:\${CONFIG.PORT}                          ║
║  MongoDB: \${mongoose.connection.readyState === 1 ? 'Connected ✅' : 'Connecting...'}                           ║
║  Features: PvP, Alliances, Cloud Save, Leaderboards           ║
╚════════════════════════════════════════════════════════════════╝\`);
  });
};

startServer();
module.exports = app;
