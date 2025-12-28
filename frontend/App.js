// App.js - Frozen Fury: Survival
// A complete idle survival game based on Whiteout Survival ad mechanics

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated,
  Modal,
  Alert,
  Dimensions,
  Platform,
  AppState,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Google AdMob for rewarded ads
import { 
  RewardedAd, 
  RewardedAdEventType, 
  AdEventType,
  TestIds 
} from 'react-native-google-mobile-ads';
import styles from './styles';

// ============================================================================
// CONFIGURATION
// ============================================================================

const API_URL = 'https://your-server-url.com/api'; // Replace with your server

// Ad Unit IDs (Replace with your actual IDs in production)
const AD_UNITS = {
  REVIVE: Platform.select({
    android: TestIds.REWARDED,
    ios: TestIds.REWARDED,
  }),
  RESOURCE_BOOST: Platform.select({
    android: TestIds.REWARDED,
    ios: TestIds.REWARDED,
  }),
  RESEARCH_SPEED: Platform.select({
    android: TestIds.REWARDED,
    ios: TestIds.REWARDED,
  }),
};

// ============================================================================
// GAME DATA - MODULAR SHOP ITEMS
// ============================================================================

export const SHOP_ITEMS = {
  // Resource Packs
  resources: [
    {
      id: 'wood_pack_small',
      name: 'Wood Bundle',
      description: '+500 Wood',
      icon: '🪵',
      price: 0.99,
      priceType: 'usd',
      reward: { wood: 500 },
      category: 'resources',
    },
    {
      id: 'wood_pack_large',
      name: 'Lumber Haul',
      description: '+2500 Wood',
      icon: '🪵',
      price: 3.99,
      priceType: 'usd',
      reward: { wood: 2500 },
      category: 'resources',
    },
    {
      id: 'meat_pack_small',
      name: 'Meat Stash',
      description: '+200 Meat',
      icon: '🥩',
      price: 0.99,
      priceType: 'usd',
      reward: { meat: 200 },
      category: 'resources',
    },
    {
      id: 'meat_pack_large',
      name: 'Feast Pack',
      description: '+1000 Meat',
      icon: '🥩',
      price: 3.99,
      priceType: 'usd',
      reward: { meat: 1000 },
      category: 'resources',
    },
    {
      id: 'starter_bundle',
      name: 'Starter Bundle',
      description: '+1000 Wood, +500 Meat, +100 Gems',
      icon: '🎁',
      price: 4.99,
      priceType: 'usd',
      reward: { wood: 1000, meat: 500, gems: 100 },
      category: 'resources',
      featured: true,
    },
  ],

  // Premium Currency
  currency: [
    {
      id: 'gems_100',
      name: 'Gem Pouch',
      description: '100 Gems',
      icon: '💎',
      price: 0.99,
      priceType: 'usd',
      reward: { gems: 100 },
      category: 'currency',
    },
    {
      id: 'gems_500',
      name: 'Gem Sack',
      description: '500 Gems + 50 Bonus',
      icon: '💎',
      price: 4.99,
      priceType: 'usd',
      reward: { gems: 550 },
      category: 'currency',
      popular: true,
    },
    {
      id: 'gems_1200',
      name: 'Gem Chest',
      description: '1200 Gems + 200 Bonus',
      icon: '💎',
      price: 9.99,
      priceType: 'usd',
      reward: { gems: 1400 },
      category: 'currency',
    },
    {
      id: 'gems_3000',
      name: 'Gem Vault',
      description: '3000 Gems + 750 Bonus',
      icon: '💎',
      price: 19.99,
      priceType: 'usd',
      reward: { gems: 3750 },
      category: 'currency',
      bestValue: true,
    },
  ],

  // Cosmetics
  cosmetics: [
    {
      id: 'axe_fire',
      name: 'Inferno Axe',
      description: 'Flaming axe cosmetic',
      icon: '🪓🔥',
      price: 200,
      priceType: 'gems',
      type: 'axeSkin',
      skinId: 'fire',
      category: 'cosmetics',
    },
    {
      id: 'axe_ice',
      name: 'Frost Cleaver',
      description: 'Frozen axe cosmetic',
      icon: '🪓❄️',
      price: 200,
      priceType: 'gems',
      type: 'axeSkin',
      skinId: 'ice',
      category: 'cosmetics',
    },
    {
      id: 'axe_gold',
      name: 'Golden Axe',
      description: 'Legendary golden axe',
      icon: '🪓✨',
      price: 500,
      priceType: 'gems',
      type: 'axeSkin',
      skinId: 'gold',
      category: 'cosmetics',
    },
    {
      id: 'outfit_warrior',
      name: 'Warrior Outfit',
      description: 'Battle-hardened look',
      icon: '🛡️',
      price: 300,
      priceType: 'gems',
      type: 'outfit',
      skinId: 'warrior',
      category: 'cosmetics',
    },
    {
      id: 'outfit_hunter',
      name: 'Hunter Garb',
      description: 'Master tracker outfit',
      icon: '🏹',
      price: 300,
      priceType: 'gems',
      type: 'outfit',
      skinId: 'hunter',
      category: 'cosmetics',
    },
  ],

  // Boosters
  boosters: [
    {
      id: 'boost_2x_1h',
      name: '2x Resources (1hr)',
      description: 'Double all resources for 1 hour',
      icon: '⚡',
      price: 50,
      priceType: 'gems',
      duration: 3600000,
      multiplier: 2,
      category: 'boosters',
    },
    {
      id: 'boost_2x_24h',
      name: '2x Resources (24hr)',
      description: 'Double all resources for 24 hours',
      icon: '⚡⚡',
      price: 200,
      priceType: 'gems',
      duration: 86400000,
      multiplier: 2,
      category: 'boosters',
    },
    {
      id: 'shield_1h',
      name: 'Protection Shield (1hr)',
      description: 'No animal attacks for 1 hour',
      icon: '🛡️',
      price: 75,
      priceType: 'gems',
      duration: 3600000,
      effect: 'shield',
      category: 'boosters',
    },
    {
      id: 'auto_chop_1h',
      name: 'Auto-Chop (1hr)',
      description: 'Automatically chop at max speed',
      icon: '🤖',
      price: 100,
      priceType: 'gems',
      duration: 3600000,
      effect: 'autoChop',
      category: 'boosters',
    },
  ],

  // Premium Subscriptions
  subscriptions: [
    {
      id: 'premium_weekly',
      name: 'Survivor Pass (Weekly)',
      description: 'No ads, +50% resources, daily gems',
      icon: '👑',
      price: 2.99,
      priceType: 'usd',
      duration: 604800000, // 7 days
      benefits: {
        adFree: true,
        resourceBonus: 1.5,
        dailyGems: 25,
      },
      category: 'subscriptions',
    },
    {
      id: 'premium_monthly',
      name: 'Survivor Pass (Monthly)',
      description: 'No ads, +100% resources, daily gems',
      icon: '👑',
      price: 7.99,
      priceType: 'usd',
      duration: 2592000000, // 30 days
      benefits: {
        adFree: true,
        resourceBonus: 2.0,
        dailyGems: 50,
      },
      category: 'subscriptions',
      popular: true,
    },
  ],

  // Remove Ads
  removeAds: [
    {
      id: 'remove_ads',
      name: 'Remove Ads Forever',
      description: 'One-time purchase to remove all ads',
      icon: '🚫📺',
      price: 4.99,
      priceType: 'usd',
      permanent: true,
      category: 'removeAds',
    },
  ],
};

// ============================================================================
// GAME DATA - MODULAR RESEARCH TREE
// ============================================================================

export const RESEARCH_TREE = {
  // Combat Branch
  combat: {
    name: 'Combat',
    icon: '⚔️',
    color: '#e74c3c',
    items: [
      {
        id: 'axe_damage_1',
        name: 'Sharpened Edge',
        description: '+10% Axe Damage',
        icon: '🪓',
        level: 0,
        maxLevel: 10,
        baseCost: { wood: 100, meat: 50 },
        costMultiplier: 1.5,
        timeBase: 60000, // 1 minute base
        timeMultiplier: 1.3,
        effect: { axeDamage: 0.1 },
        requirements: [],
      },
      {
        id: 'axe_speed_1',
        name: 'Swift Strikes',
        description: '+15% Attack Speed',
        icon: '💨',
        level: 0,
        maxLevel: 8,
        baseCost: { wood: 150, meat: 75 },
        costMultiplier: 1.6,
        timeBase: 90000,
        timeMultiplier: 1.35,
        effect: { attackSpeed: 0.15 },
        requirements: ['axe_damage_1:3'],
      },
      {
        id: 'critical_hit',
        name: 'Critical Strikes',
        description: '+5% Critical Hit Chance',
        icon: '💥',
        level: 0,
        maxLevel: 10,
        baseCost: { wood: 200, meat: 100, gems: 5 },
        costMultiplier: 1.7,
        timeBase: 180000,
        timeMultiplier: 1.4,
        effect: { critChance: 0.05 },
        requirements: ['axe_speed_1:2'],
      },
      {
        id: 'critical_damage',
        name: 'Devastating Blows',
        description: '+25% Critical Damage',
        icon: '☠️',
        level: 0,
        maxLevel: 8,
        baseCost: { wood: 300, meat: 150, gems: 10 },
        costMultiplier: 1.8,
        timeBase: 300000,
        timeMultiplier: 1.45,
        effect: { critDamage: 0.25 },
        requirements: ['critical_hit:3'],
      },
      {
        id: 'lifesteal',
        name: 'Vampiric Strikes',
        description: '+3% Lifesteal',
        icon: '🩸',
        level: 0,
        maxLevel: 5,
        baseCost: { meat: 500, gems: 25 },
        costMultiplier: 2.0,
        timeBase: 600000,
        timeMultiplier: 1.5,
        effect: { lifesteal: 0.03 },
        requirements: ['critical_damage:2'],
      },
    ],
  },

  // Defense Branch
  defense: {
    name: 'Defense',
    icon: '🛡️',
    color: '#3498db',
    items: [
      {
        id: 'armor_1',
        name: 'Thick Hide',
        description: '+5% Damage Reduction',
        icon: '🧥',
        level: 0,
        maxLevel: 10,
        baseCost: { wood: 80, meat: 80 },
        costMultiplier: 1.5,
        timeBase: 60000,
        timeMultiplier: 1.3,
        effect: { damageReduction: 0.05 },
        requirements: [],
      },
      {
        id: 'health_1',
        name: 'Vitality',
        description: '+50 Max Health',
        icon: '❤️',
        level: 0,
        maxLevel: 15,
        baseCost: { meat: 100 },
        costMultiplier: 1.4,
        timeBase: 45000,
        timeMultiplier: 1.25,
        effect: { maxHealth: 50 },
        requirements: [],
      },
      {
        id: 'health_regen',
        name: 'Regeneration',
        description: '+2 Health/second',
        icon: '💚',
        level: 0,
        maxLevel: 8,
        baseCost: { meat: 200, gems: 5 },
        costMultiplier: 1.6,
        timeBase: 120000,
        timeMultiplier: 1.35,
        effect: { healthRegen: 2 },
        requirements: ['health_1:5'],
      },
      {
        id: 'dodge',
        name: 'Evasion',
        description: '+3% Dodge Chance',
        icon: '🏃',
        level: 0,
        maxLevel: 10,
        baseCost: { wood: 150, meat: 150 },
        costMultiplier: 1.65,
        timeBase: 150000,
        timeMultiplier: 1.4,
        effect: { dodgeChance: 0.03 },
        requirements: ['armor_1:3'],
      },
      {
        id: 'thorns',
        name: 'Thorns',
        description: 'Reflect 5% damage to attackers',
        icon: '🌵',
        level: 0,
        maxLevel: 5,
        baseCost: { wood: 400, gems: 20 },
        costMultiplier: 2.0,
        timeBase: 480000,
        timeMultiplier: 1.5,
        effect: { thorns: 0.05 },
        requirements: ['dodge:3', 'armor_1:5'],
      },
    ],
  },

  // Gathering Branch
  gathering: {
    name: 'Gathering',
    icon: '🪓',
    color: '#27ae60',
    items: [
      {
        id: 'chop_speed',
        name: 'Efficient Chopping',
        description: '+20% Wood Gathering Speed',
        icon: '🌲',
        level: 0,
        maxLevel: 10,
        baseCost: { wood: 50 },
        costMultiplier: 1.4,
        timeBase: 30000,
        timeMultiplier: 1.2,
        effect: { chopSpeed: 0.2 },
        requirements: [],
      },
      {
        id: 'wood_bonus',
        name: 'Lumber Expert',
        description: '+15% Wood per Chop',
        icon: '🪵',
        level: 0,
        maxLevel: 10,
        baseCost: { wood: 100 },
        costMultiplier: 1.5,
        timeBase: 60000,
        timeMultiplier: 1.3,
        effect: { woodBonus: 0.15 },
        requirements: ['chop_speed:3'],
      },
      {
        id: 'meat_bonus',
        name: 'Butcher',
        description: '+20% Meat from Animals',
        icon: '🥩',
        level: 0,
        maxLevel: 10,
        baseCost: { meat: 100 },
        costMultiplier: 1.5,
        timeBase: 60000,
        timeMultiplier: 1.3,
        effect: { meatBonus: 0.2 },
        requirements: [],
      },
      {
        id: 'idle_efficiency',
        name: 'Camp Workers',
        description: '+25% Idle Resource Generation',
        icon: '⛺',
        level: 0,
        maxLevel: 8,
        baseCost: { wood: 200, meat: 100 },
        costMultiplier: 1.6,
        timeBase: 180000,
        timeMultiplier: 1.4,
        effect: { idleEfficiency: 0.25 },
        requirements: ['wood_bonus:2', 'meat_bonus:2'],
      },
      {
        id: 'offline_bonus',
        name: 'Night Watch',
        description: '+10% Offline Earnings',
        icon: '🌙',
        level: 0,
        maxLevel: 10,
        baseCost: { wood: 300, meat: 150, gems: 10 },
        costMultiplier: 1.7,
        timeBase: 300000,
        timeMultiplier: 1.45,
        effect: { offlineBonus: 0.1 },
        requirements: ['idle_efficiency:3'],
      },
    ],
  },

  // Base Branch
  base: {
    name: 'Base',
    icon: '🏠',
    color: '#9b59b6',
    items: [
      {
        id: 'warmth_1',
        name: 'Better Insulation',
        description: '-10% Heat Loss Rate',
        icon: '🔥',
        level: 0,
        maxLevel: 10,
        baseCost: { wood: 150 },
        costMultiplier: 1.5,
        timeBase: 90000,
        timeMultiplier: 1.3,
        effect: { heatLossReduction: 0.1 },
        requirements: [],
      },
      {
        id: 'fire_efficiency',
        name: 'Efficient Fires',
        description: '-15% Wood Cost for Heating',
        icon: '🪵🔥',
        level: 0,
        maxLevel: 8,
        baseCost: { wood: 200 },
        costMultiplier: 1.55,
        timeBase: 120000,
        timeMultiplier: 1.35,
        effect: { heatingCostReduction: 0.15 },
        requirements: ['warmth_1:3'],
      },
      {
        id: 'survivor_capacity',
        name: 'Expand Camp',
        description: '+2 Survivor Capacity',
        icon: '👥',
        level: 0,
        maxLevel: 10,
        baseCost: { wood: 500, meat: 200 },
        costMultiplier: 2.0,
        timeBase: 600000,
        timeMultiplier: 1.5,
        effect: { survivorCapacity: 2 },
        requirements: ['warmth_1:5'],
      },
      {
        id: 'storage_upgrade',
        name: 'Storage Expansion',
        description: '+500 Max Resource Storage',
        icon: '📦',
        level: 0,
        maxLevel: 10,
        baseCost: { wood: 300 },
        costMultiplier: 1.6,
        timeBase: 180000,
        timeMultiplier: 1.4,
        effect: { maxStorage: 500 },
        requirements: [],
      },
      {
        id: 'watchtower',
        name: 'Watchtower',
        description: '+30s Early Warning for Attacks',
        icon: '🗼',
        level: 0,
        maxLevel: 5,
        baseCost: { wood: 800, gems: 30 },
        costMultiplier: 2.5,
        timeBase: 900000,
        timeMultiplier: 1.6,
        effect: { earlyWarning: 30 },
        requirements: ['survivor_capacity:3'],
      },
    ],
  },

  // Military Branch (Late Game)
  military: {
    name: 'Military',
    icon: '🎖️',
    color: '#e67e22',
    items: [
      {
        id: 'bow_unlock',
        name: 'Archery',
        description: 'Unlock Bow weapon',
        icon: '🏹',
        level: 0,
        maxLevel: 1,
        baseCost: { wood: 1000, meat: 500, gems: 50 },
        costMultiplier: 1,
        timeBase: 1800000, // 30 min
        timeMultiplier: 1,
        effect: { unlockWeapon: 'bow' },
        requirements: ['axe_damage_1:5', 'axe_speed_1:3'],
      },
      {
        id: 'bow_damage',
        name: 'Piercing Arrows',
        description: '+15% Bow Damage',
        icon: '🎯',
        level: 0,
        maxLevel: 10,
        baseCost: { wood: 400, gems: 15 },
        costMultiplier: 1.6,
        timeBase: 300000,
        timeMultiplier: 1.4,
        effect: { bowDamage: 0.15 },
        requirements: ['bow_unlock:1'],
      },
      {
        id: 'spear_unlock',
        name: 'Spear Mastery',
        description: 'Unlock Spear weapon',
        icon: '🔱',
        level: 0,
        maxLevel: 1,
        baseCost: { wood: 2000, meat: 1000, gems: 100 },
        costMultiplier: 1,
        timeBase: 3600000, // 1 hour
        timeMultiplier: 1,
        effect: { unlockWeapon: 'spear' },
        requirements: ['bow_damage:5'],
      },
      {
        id: 'trap_unlock',
        name: 'Traps',
        description: 'Unlock defensive traps',
        icon: '🪤',
        level: 0,
        maxLevel: 1,
        baseCost: { wood: 1500, gems: 75 },
        costMultiplier: 1,
        timeBase: 2400000, // 40 min
        timeMultiplier: 1,
        effect: { unlockTraps: true },
        requirements: ['watchtower:2'],
      },
      {
        id: 'trap_damage',
        name: 'Deadly Traps',
        description: '+30% Trap Damage',
        icon: '💀',
        level: 0,
        maxLevel: 5,
        baseCost: { wood: 600, gems: 25 },
        costMultiplier: 1.8,
        timeBase: 420000,
        timeMultiplier: 1.5,
        effect: { trapDamage: 0.3 },
        requirements: ['trap_unlock:1'],
      },
    ],
  },
};

// ============================================================================
// GAME DATA - ANIMAL WAVES (Purchasable Tiers)
// ============================================================================

export const ANIMAL_TIERS = {
  tier1: {
    name: 'Forest Creatures',
    icon: '🐺',
    unlockCost: 0, // Free tier
    animals: [
      { id: 'rabbit', name: 'Rabbit', health: 20, damage: 5, meatReward: 10, icon: '🐰', weight: 40 },
      { id: 'fox', name: 'Fox', health: 40, damage: 10, meatReward: 25, icon: '🦊', weight: 35 },
      { id: 'wolf', name: 'Wolf', health: 80, damage: 20, meatReward: 50, icon: '🐺', weight: 20 },
      { id: 'deer', name: 'Deer', health: 60, damage: 8, meatReward: 75, icon: '🦌', weight: 5 },
    ],
  },
  tier2: {
    name: 'Mountain Beasts',
    icon: '🐻',
    unlockCost: { gems: 100 },
    unlockLevel: 10,
    animals: [
      { id: 'boar', name: 'Wild Boar', health: 100, damage: 25, meatReward: 80, icon: '🐗', weight: 35 },
      { id: 'bear', name: 'Brown Bear', health: 200, damage: 40, meatReward: 150, icon: '🐻', weight: 30 },
      { id: 'moose', name: 'Moose', health: 180, damage: 35, meatReward: 200, icon: '🦌', weight: 25 },
      { id: 'mountain_lion', name: 'Mountain Lion', health: 150, damage: 50, meatReward: 175, icon: '🦁', weight: 10 },
    ],
  },
  tier3: {
    name: 'Arctic Predators',
    icon: '🐻‍❄️',
    unlockCost: { gems: 300 },
    unlockLevel: 25,
    animals: [
      { id: 'arctic_wolf', name: 'Arctic Wolf', health: 180, damage: 45, meatReward: 200, icon: '🐺', weight: 30 },
      { id: 'polar_bear', name: 'Polar Bear', health: 400, damage: 60, meatReward: 350, icon: '🐻‍❄️', weight: 25 },
      { id: 'wolverine', name: 'Wolverine', health: 250, damage: 70, meatReward: 275, icon: '🦡', weight: 25 },
      { id: 'saber_cat', name: 'Sabertooth', health: 350, damage: 80, meatReward: 400, icon: '🐅', weight: 20 },
    ],
  },
  tier4: {
    name: 'Legendary Beasts',
    icon: '🐉',
    unlockCost: { gems: 750 },
    unlockLevel: 50,
    animals: [
      { id: 'dire_wolf', name: 'Dire Wolf', health: 500, damage: 100, meatReward: 600, icon: '🐺', weight: 30 },
      { id: 'mammoth', name: 'Mammoth', health: 1000, damage: 80, meatReward: 1000, icon: '🦣', weight: 25 },
      { id: 'alpha_bear', name: 'Alpha Bear', health: 800, damage: 120, meatReward: 850, icon: '🐻', weight: 25 },
      { id: 'wendigo', name: 'Wendigo', health: 600, damage: 150, meatReward: 750, icon: '👹', weight: 20 },
    ],
  },
  tier5: {
    name: 'Mythic Horrors',
    icon: '🐲',
    unlockCost: { gems: 1500, usd: 9.99 }, // Can also be purchased
    unlockLevel: 75,
    animals: [
      { id: 'frost_wyrm', name: 'Frost Wyrm', health: 1500, damage: 200, meatReward: 1500, icon: '🐉', weight: 25 },
      { id: 'yeti', name: 'Yeti', health: 2000, damage: 180, meatReward: 2000, icon: '🦍', weight: 25 },
      { id: 'ice_titan', name: 'Ice Titan', health: 3000, damage: 150, meatReward: 2500, icon: '🗿', weight: 25 },
      { id: 'ancient_one', name: 'Ancient One', health: 5000, damage: 250, meatReward: 5000, icon: '👁️', weight: 25 },
    ],
  },
};

// ============================================================================
// INITIAL GAME STATE
// ============================================================================

const getInitialGameState = () => ({
  // Player Stats
  player: {
    level: 1,
    experience: 0,
    experienceToLevel: 100,
    health: 100,
    maxHealth: 100,
    energy: 100,
    maxEnergy: 100,
  },

  // Resources
  resources: {
    wood: 50,
    meat: 25,
    gems: 10,
    maxWood: 1000,
    maxMeat: 500,
  },

  // Base Stats
  base: {
    temperature: 70,
    maxTemperature: 100,
    heatLossRate: 0.5, // degrees per second
    survivors: 1,
    maxSurvivors: 5,
  },

  // Combat Stats (calculated from research)
  combat: {
    axeDamage: 10,
    attackSpeed: 1.0,
    critChance: 0.05,
    critDamage: 1.5,
    lifesteal: 0,
    damageReduction: 0,
    dodgeChance: 0,
    thorns: 0,
  },

  // Gathering Stats
  gathering: {
    chopSpeed: 1.0,
    woodPerChop: 5,
    meatBonus: 1.0,
    idleWoodRate: 0.5, // per second
    idleMeatRate: 0.1, // per second
    offlineMultiplier: 0.5,
  },

  // Research Progress
  research: {},

  // Active Researching
  activeResearch: null, // { id, startTime, endTime }

  // Unlocked Features
  unlocked: {
    animalTiers: ['tier1'],
    weapons: ['axe'],
    traps: false,
    cosmetics: [],
  },

  // Active Boosters
  boosters: [],

  // Current Wave
  wave: {
    number: 1,
    active: false,
    currentAnimal: null,
    timeUntilNextWave: 60000, // 1 minute
  },

  // Statistics
  stats: {
    totalWoodChopped: 0,
    totalMeatGathered: 0,
    animalsDefeated: 0,
    deaths: 0,
    timePlayed: 0,
    longestSurvival: 0,
  },

  // Settings
  settings: {
    soundEnabled: true,
    musicEnabled: true,
    notificationsEnabled: true,
    selectedAxeSkin: 'default',
    selectedOutfit: 'default',
  },

  // IAP Status
  purchases: {
    removeAds: false,
    premiumExpiry: null,
  },

  // Timestamps
  lastSaveTime: Date.now(),
  lastOnlineTime: Date.now(),
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const calculateResearchCost = (research, level) => {
  const cost = {};
  Object.entries(research.baseCost).forEach(([resource, amount]) => {
    cost[resource] = Math.floor(amount * Math.pow(research.costMultiplier, level));
  });
  return cost;
};

const calculateResearchTime = (research, level) => {
  return Math.floor(research.timeBase * Math.pow(research.timeMultiplier, level));
};

const canAfford = (resources, cost) => {
  return Object.entries(cost).every(([resource, amount]) => {
    return (resources[resource] || 0) >= amount;
  });
};

const formatTime = (ms) => {
  if (ms < 0) return '0s';
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
};

const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return Math.floor(num).toString();
};

// ============================================================================
// AD MANAGER
// ============================================================================

class AdManager {
  static rewardedAds = {};

  static async loadRewardedAd(adType) {
    const adUnitId = AD_UNITS[adType];
    if (!adUnitId) return;

    const rewarded = RewardedAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    this.rewardedAds[adType] = rewarded;

    return new Promise((resolve, reject) => {
      rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
        resolve(true);
      });
      rewarded.addAdEventListener(AdEventType.ERROR, (error) => {
        reject(error);
      });
      rewarded.load();
    });
  }

  static async showRewardedAd(adType, onReward) {
    const rewarded = this.rewardedAds[adType];
    if (!rewarded) {
      await this.loadRewardedAd(adType);
    }

    return new Promise((resolve, reject) => {
      const ad = this.rewardedAds[adType];
      
      ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward) => {
        onReward(reward);
        resolve(true);
      });

      ad.addAdEventListener(AdEventType.CLOSED, () => {
        this.loadRewardedAd(adType); // Preload next ad
      });

      ad.show();
    });
  }
}

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

export default function App() {
  // Game State
  const [gameState, setGameState] = useState(getInitialGameState());
  const [isLoading, setIsLoading] = useState(true);

  // UI State
  const [activeScreen, setActiveScreen] = useState('game'); // game, shop, research, settings
  const [showDeathModal, setShowDeathModal] = useState(false);
  const [showWaveWarning, setShowWaveWarning] = useState(false);
  const [showOfflineRewards, setShowOfflineRewards] = useState(false);
  const [offlineRewards, setOfflineRewards] = useState({ wood: 0, meat: 0 });

  // Animation refs
  const chopAnimation = useRef(new Animated.Value(0)).current;
  const temperatureAnimation = useRef(new Animated.Value(gameState.base.temperature)).current;
  const damageAnimation = useRef(new Animated.Value(0)).current;

  // Game loop refs
  const gameLoopRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);

  // ============================================================================
  // GAME PERSISTENCE
  // ============================================================================

  const saveGame = useCallback(async () => {
    try {
      const saveData = {
        ...gameState,
        lastSaveTime: Date.now(),
        lastOnlineTime: Date.now(),
      };
      await AsyncStorage.setItem('frozenFury_gameState', JSON.stringify(saveData));
      
      // Sync with server
      try {
        await fetch(`${API_URL}/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(saveData),
        });
      } catch (e) {
        console.log('Server sync failed, local save preserved');
      }
    } catch (error) {
      console.error('Save failed:', error);
    }
  }, [gameState]);

  const loadGame = useCallback(async () => {
    try {
      const savedData = await AsyncStorage.getItem('frozenFury_gameState');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        
        // Calculate offline rewards
        const offlineTime = Date.now() - parsed.lastOnlineTime;
        const maxOfflineTime = 8 * 60 * 60 * 1000; // 8 hours max
        const effectiveOfflineTime = Math.min(offlineTime, maxOfflineTime);
        
        if (effectiveOfflineTime > 60000) { // More than 1 minute
          const offlineMultiplier = parsed.gathering?.offlineMultiplier || 0.5;
          const woodEarned = Math.floor(
            (parsed.gathering?.idleWoodRate || 0.5) * 
            (effectiveOfflineTime / 1000) * 
            offlineMultiplier
          );
          const meatEarned = Math.floor(
            (parsed.gathering?.idleMeatRate || 0.1) * 
            (effectiveOfflineTime / 1000) * 
            offlineMultiplier
          );

          parsed.resources.wood = Math.min(
            parsed.resources.wood + woodEarned,
            parsed.resources.maxWood
          );
          parsed.resources.meat = Math.min(
            parsed.resources.meat + meatEarned,
            parsed.resources.maxMeat
          );

          setOfflineRewards({ wood: woodEarned, meat: meatEarned, time: effectiveOfflineTime });
          setShowOfflineRewards(true);
        }

        setGameState(parsed);
      }
    } catch (error) {
      console.error('Load failed:', error);
    }
    setIsLoading(false);
  }, []);

  // ============================================================================
  // GAME LOOP
  // ============================================================================

  useEffect(() => {
    loadGame();

    // Preload ads
    Object.keys(AD_UNITS).forEach(adType => {
      AdManager.loadRewardedAd(adType).catch(() => {});
    });

    // App state handling for background/foreground
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        loadGame();
      }
      if (nextAppState.match(/inactive|background/)) {
        saveGame();
      }
      appStateRef.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Main game loop
  useEffect(() => {
    if (isLoading) return;

    const tick = () => {
      setGameState(prev => {
        const now = Date.now();
        const deltaTime = (now - prev.lastSaveTime) / 1000; // in seconds
        const newState = { ...prev };

        // Check active boosters
        newState.boosters = prev.boosters.filter(b => b.endTime > now);
        const hasResourceBoost = newState.boosters.some(b => b.multiplier);
        const resourceMultiplier = hasResourceBoost ? 
          newState.boosters.find(b => b.multiplier)?.multiplier || 1 : 1;
        const hasShield = newState.boosters.some(b => b.effect === 'shield');
        const hasAutoChop = newState.boosters.some(b => b.effect === 'autoChop');

        // Idle resource generation
        const idleWood = prev.gathering.idleWoodRate * deltaTime * resourceMultiplier;
        const idleMeat = prev.gathering.idleMeatRate * deltaTime * resourceMultiplier;
        
        newState.resources.wood = Math.min(
          prev.resources.wood + idleWood,
          prev.resources.maxWood
        );
        newState.resources.meat = Math.min(
          prev.resources.meat + idleMeat,
          prev.resources.maxMeat
        );

        // Auto-chop if booster active
        if (hasAutoChop && !prev.wave.active) {
          const autoChopWood = prev.gathering.woodPerChop * prev.gathering.chopSpeed * 2;
          newState.resources.wood = Math.min(
            newState.resources.wood + autoChopWood,
            prev.resources.maxWood
          );
        }

        // Temperature decay
        if (!hasShield) {
          newState.base.temperature = Math.max(
            0,
            prev.base.temperature - (prev.base.heatLossRate * deltaTime)
          );
        }

        // Check for freezing death
        if (newState.base.temperature <= 0 && !prev.wave.active) {
          newState.player.health = 0;
          setShowDeathModal(true);
        }

        // Health regeneration
        if (prev.combat.healthRegen && prev.player.health > 0) {
          newState.player.health = Math.min(
            prev.player.maxHealth,
            prev.player.health + prev.combat.healthRegen * deltaTime
          );
        }

        // Wave timer
        if (!prev.wave.active && !hasShield) {
          newState.wave.timeUntilNextWave = prev.wave.timeUntilNextWave - (deltaTime * 1000);
          
          if (newState.wave.timeUntilNextWave <= 10000 && !showWaveWarning) {
            setShowWaveWarning(true);
          }
          
          if (newState.wave.timeUntilNextWave <= 0) {
            // Start wave
            newState.wave.active = true;
            newState.wave.number = prev.wave.number;
            setShowWaveWarning(false);
            
            // Spawn random animal from unlocked tiers
            const availableTiers = prev.unlocked.animalTiers;
            const randomTier = availableTiers[Math.floor(Math.random() * availableTiers.length)];
            const tierData = ANIMAL_TIERS[randomTier];
            
            // Weighted random selection
            const totalWeight = tierData.animals.reduce((sum, a) => sum + a.weight, 0);
            let random = Math.random() * totalWeight;
            let selectedAnimal = tierData.animals[0];
            
            for (const animal of tierData.animals) {
              random -= animal.weight;
              if (random <= 0) {
                selectedAnimal = animal;
                break;
              }
            }

            // Scale with wave number
            const waveMultiplier = 1 + (prev.wave.number * 0.1);
            newState.wave.currentAnimal = {
              ...selectedAnimal,
              currentHealth: Math.floor(selectedAnimal.health * waveMultiplier),
              maxHealth: Math.floor(selectedAnimal.health * waveMultiplier),
              damage: Math.floor(selectedAnimal.damage * waveMultiplier),
              meatReward: Math.floor(selectedAnimal.meatReward * waveMultiplier),
            };
          }
        }

        // Check research completion
        if (prev.activeResearch && now >= prev.activeResearch.endTime) {
          const researchId = prev.activeResearch.id;
          newState.research[researchId] = (prev.research[researchId] || 0) + 1;
          newState.activeResearch = null;
          
          // Apply research effects
          applyResearchEffects(newState, researchId);
        }

        // Update stats
        newState.stats.timePlayed = prev.stats.timePlayed + deltaTime;
        newState.lastSaveTime = now;

        return newState;
      });
    };

    gameLoopRef.current = setInterval(tick, 100); // 10 FPS game loop

    // Auto-save every 30 seconds
    const saveInterval = setInterval(saveGame, 30000);

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      clearInterval(saveInterval);
    };
  }, [isLoading, showWaveWarning, saveGame]);

  // ============================================================================
  // RESEARCH EFFECTS
  // ============================================================================

  const applyResearchEffects = (state, researchId) => {
    // Find the research item
    let researchItem = null;
    Object.values(RESEARCH_TREE).forEach(branch => {
      const found = branch.items.find(item => item.id === researchId);
      if (found) researchItem = found;
    });

    if (!researchItem) return;

    const level = state.research[researchId] || 1;
    const effect = researchItem.effect;

    // Apply effects based on type
    if (effect.axeDamage) {
      state.combat.axeDamage = 10 * (1 + effect.axeDamage * level);
    }
    if (effect.attackSpeed) {
      state.combat.attackSpeed = 1 * (1 + effect.attackSpeed * level);
    }
    if (effect.critChance) {
      state.combat.critChance = 0.05 + effect.critChance * level;
    }
    if (effect.critDamage) {
      state.combat.critDamage = 1.5 + effect.critDamage * level;
    }
    if (effect.lifesteal) {
      state.combat.lifesteal = effect.lifesteal * level;
    }
    if (effect.damageReduction) {
      state.combat.damageReduction = effect.damageReduction * level;
    }
    if (effect.dodgeChance) {
      state.combat.dodgeChance = effect.dodgeChance * level;
    }
    if (effect.thorns) {
      state.combat.thorns = effect.thorns * level;
    }
    if (effect.maxHealth) {
      state.player.maxHealth = 100 + effect.maxHealth * level;
    }
    if (effect.healthRegen) {
      state.combat.healthRegen = effect.healthRegen * level;
    }
    if (effect.chopSpeed) {
      state.gathering.chopSpeed = 1 * (1 + effect.chopSpeed * level);
    }
    if (effect.woodBonus) {
      state.gathering.woodPerChop = 5 * (1 + effect.woodBonus * level);
    }
    if (effect.meatBonus) {
      state.gathering.meatBonus = 1 + effect.meatBonus * level;
    }
    if (effect.idleEfficiency) {
      state.gathering.idleWoodRate = 0.5 * (1 + effect.idleEfficiency * level);
      state.gathering.idleMeatRate = 0.1 * (1 + effect.idleEfficiency * level);
    }
    if (effect.offlineBonus) {
      state.gathering.offlineMultiplier = 0.5 + effect.offlineBonus * level;
    }
    if (effect.heatLossReduction) {
      state.base.heatLossRate = 0.5 * (1 - effect.heatLossReduction * level);
    }
    if (effect.survivorCapacity) {
      state.base.maxSurvivors = 5 + effect.survivorCapacity * level;
    }
    if (effect.maxStorage) {
      state.resources.maxWood = 1000 + effect.maxStorage * level;
      state.resources.maxMeat = 500 + Math.floor(effect.maxStorage * level * 0.5);
    }
    if (effect.unlockWeapon) {
      if (!state.unlocked.weapons.includes(effect.unlockWeapon)) {
        state.unlocked.weapons.push(effect.unlockWeapon);
      }
    }
    if (effect.unlockTraps) {
      state.unlocked.traps = true;
    }
  };

  // ============================================================================
  // GAME ACTIONS
  // ============================================================================

  const handleChop = useCallback(() => {
    if (gameState.wave.active) return;

    // Animate
    Animated.sequence([
      Animated.timing(chopAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(chopAnimation, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setGameState(prev => {
      const hasResourceBoost = prev.boosters.some(b => b.multiplier);
      const multiplier = hasResourceBoost ? 
        prev.boosters.find(b => b.multiplier)?.multiplier || 1 : 1;

      const woodGained = prev.gathering.woodPerChop * multiplier;
      
      return {
        ...prev,
        resources: {
          ...prev.resources,
          wood: Math.min(prev.resources.wood + woodGained, prev.resources.maxWood),
        },
        stats: {
          ...prev.stats,
          totalWoodChopped: prev.stats.totalWoodChopped + woodGained,
        },
      };
    });
  }, [gameState.wave.active, chopAnimation]);

  const handleAttack = useCallback(() => {
    if (!gameState.wave.active || !gameState.wave.currentAnimal) return;

    // Calculate damage
    const baseDamage = gameState.combat.axeDamage;
    const isCrit = Math.random() < gameState.combat.critChance;
    const damage = isCrit ? baseDamage * gameState.combat.critDamage : baseDamage;

    // Animate damage
    Animated.sequence([
      Animated.timing(damageAnimation, {
        toValue: 1,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(damageAnimation, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();

    setGameState(prev => {
      const animal = prev.wave.currentAnimal;
      if (!animal) return prev;

      const newAnimalHealth = animal.currentHealth - damage;
      
      // Lifesteal
      const healAmount = damage * prev.combat.lifesteal;
      const newPlayerHealth = Math.min(
        prev.player.maxHealth,
        prev.player.health + healAmount
      );

      // Animal defeated
      if (newAnimalHealth <= 0) {
        const meatReward = Math.floor(animal.meatReward * prev.gathering.meatBonus);
        const expReward = Math.floor(animal.meatReward * 0.5);
        
        let newExp = prev.player.experience + expReward;
        let newLevel = prev.player.level;
        let newExpToLevel = prev.player.experienceToLevel;

        // Level up check
        while (newExp >= newExpToLevel) {
          newExp -= newExpToLevel;
          newLevel++;
          newExpToLevel = Math.floor(100 * Math.pow(1.2, newLevel - 1));
        }

        return {
          ...prev,
          player: {
            ...prev.player,
            health: newPlayerHealth,
            level: newLevel,
            experience: newExp,
            experienceToLevel: newExpToLevel,
          },
          resources: {
            ...prev.resources,
            meat: Math.min(prev.resources.meat + meatReward, prev.resources.maxMeat),
          },
          wave: {
            ...prev.wave,
            active: false,
            currentAnimal: null,
            number: prev.wave.number + 1,
            timeUntilNextWave: Math.max(30000, 60000 - (prev.wave.number * 1000)), // Gets faster
          },
          stats: {
            ...prev.stats,
            totalMeatGathered: prev.stats.totalMeatGathered + meatReward,
            animalsDefeated: prev.stats.animalsDefeated + 1,
          },
        };
      }

      // Animal counterattack
      const dodged = Math.random() < prev.combat.dodgeChance;
      let playerDamage = 0;
      
      if (!dodged) {
        playerDamage = animal.damage * (1 - prev.combat.damageReduction);
        
        // Thorns damage
        if (prev.combat.thorns > 0) {
          const thornsDamage = playerDamage * prev.combat.thorns;
          animal.currentHealth = Math.max(0, newAnimalHealth - thornsDamage);
        }
      }

      const finalPlayerHealth = Math.max(0, newPlayerHealth - playerDamage);

      // Player death
      if (finalPlayerHealth <= 0) {
        setShowDeathModal(true);
        return {
          ...prev,
          player: {
            ...prev.player,
            health: 0,
          },
          wave: {
            ...prev.wave,
            currentAnimal: {
              ...animal,
              currentHealth: newAnimalHealth,
            },
          },
          stats: {
            ...prev.stats,
            deaths: prev.stats.deaths + 1,
          },
        };
      }

      return {
        ...prev,
        player: {
          ...prev.player,
          health: finalPlayerHealth,
        },
        wave: {
          ...prev.wave,
          currentAnimal: {
            ...animal,
            currentHealth: newAnimalHealth,
          },
        },
      };
    });
  }, [gameState, damageAnimation]);

  const handleAddFuel = useCallback(() => {
    const fuelCost = 10;
    if (gameState.resources.wood < fuelCost) {
      Alert.alert('Not Enough Wood', 'You need 10 wood to add fuel to the fire.');
      return;
    }

    setGameState(prev => ({
      ...prev,
      resources: {
        ...prev.resources,
        wood: prev.resources.wood - fuelCost,
      },
      base: {
        ...prev.base,
        temperature: Math.min(prev.base.maxTemperature, prev.base.temperature + 20),
      },
    }));
  }, [gameState.resources.wood]);

  const handleHeal = useCallback(() => {
    const healCost = 20;
    if (gameState.resources.meat < healCost) {
      Alert.alert('Not Enough Meat', 'You need 20 meat to heal.');
      return;
    }

    setGameState(prev => ({
      ...prev,
      resources: {
        ...prev.resources,
        meat: prev.resources.meat - healCost,
      },
      player: {
        ...prev.player,
        health: Math.min(prev.player.maxHealth, prev.player.health + 50),
      },
    }));
  }, [gameState.resources.meat]);

  // ============================================================================
  // AD REWARDS
  // ============================================================================

  const handleWatchAdRevive = async () => {
    if (gameState.purchases.removeAds) {
      // Free revive for premium users
      handleRevive();
      return;
    }

    try {
      await AdManager.showRewardedAd('REVIVE', () => {
        handleRevive();
      });
    } catch (error) {
      Alert.alert('Ad Error', 'Could not load ad. Try again later.');
    }
  };

  const handleRevive = () => {
    setShowDeathModal(false);
    setGameState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        health: prev.player.maxHealth,
      },
      base: {
        ...prev.base,
        temperature: 50,
      },
      wave: {
        ...prev.wave,
        active: false,
        currentAnimal: null,
        timeUntilNextWave: 60000,
      },
    }));
  };

  const handleWatchAdBoost = async () => {
    try {
      await AdManager.showRewardedAd('RESOURCE_BOOST', () => {
        setGameState(prev => ({
          ...prev,
          boosters: [
            ...prev.boosters,
            {
              id: 'ad_boost_' + Date.now(),
              multiplier: 2,
              endTime: Date.now() + 300000, // 5 minutes
            },
          ],
        }));
        Alert.alert('Boost Active!', 'You now earn 2x resources for 5 minutes!');
      });
    } catch (error) {
      Alert.alert('Ad Error', 'Could not load ad. Try again later.');
    }
  };

  const handleWatchAdSpeedResearch = async () => {
    if (!gameState.activeResearch) return;

    try {
      await AdManager.showRewardedAd('RESEARCH_SPEED', () => {
        setGameState(prev => ({
          ...prev,
          activeResearch: {
            ...prev.activeResearch,
            endTime: prev.activeResearch.endTime - 600000, // Skip 10 minutes
          },
        }));
        Alert.alert('Research Accelerated!', 'Research time reduced by 10 minutes!');
      });
    } catch (error) {
      Alert.alert('Ad Error', 'Could not load ad. Try again later.');
    }
  };

  // ============================================================================
  // SHOP HANDLERS
  // ============================================================================

  const handlePurchase = async (item) => {
    if (item.priceType === 'gems') {
      if (gameState.resources.gems < item.price) {
        Alert.alert('Not Enough Gems', 'Purchase more gems in the shop.');
        return;
      }

      setGameState(prev => {
        const newState = { ...prev };
        newState.resources.gems -= item.price;

        // Apply rewards
        if (item.reward) {
          Object.entries(item.reward).forEach(([resource, amount]) => {
            if (resource === 'gems') {
              newState.resources.gems += amount;
            } else if (resource === 'wood') {
              newState.resources.wood = Math.min(
                prev.resources.wood + amount,
                prev.resources.maxWood
              );
            } else if (resource === 'meat') {
              newState.resources.meat = Math.min(
                prev.resources.meat + amount,
                prev.resources.maxMeat
              );
            }
          });
        }

        // Apply cosmetics
        if (item.type === 'axeSkin' || item.type === 'outfit') {
          newState.unlocked.cosmetics.push(item.skinId);
          if (item.type === 'axeSkin') {
            newState.settings.selectedAxeSkin = item.skinId;
          } else {
            newState.settings.selectedOutfit = item.skinId;
          }
        }

        // Apply boosters
        if (item.duration) {
          newState.boosters.push({
            id: item.id + '_' + Date.now(),
            multiplier: item.multiplier,
            effect: item.effect,
            endTime: Date.now() + item.duration,
          });
        }

        return newState;
      });

      Alert.alert('Purchase Complete!', `You bought ${item.name}!`);
    } else if (item.priceType === 'usd') {
      // In production, integrate with React Native IAP
      Alert.alert(
        'Purchase',
        `This would open a $${item.price} purchase flow.\n\nIn production, integrate with react-native-iap.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Simulate Purchase', 
            onPress: () => {
              setGameState(prev => {
                const newState = { ...prev };

                if (item.reward) {
                  Object.entries(item.reward).forEach(([resource, amount]) => {
                    if (resource === 'gems') {
                      newState.resources.gems += amount;
                    } else if (resource === 'wood') {
                      newState.resources.wood = Math.min(
                        prev.resources.wood + amount,
                        prev.resources.maxWood
                      );
                    } else if (resource === 'meat') {
                      newState.resources.meat = Math.min(
                        prev.resources.meat + amount,
                        prev.resources.maxMeat
                      );
                    }
                  });
                }

                if (item.id === 'remove_ads') {
                  newState.purchases.removeAds = true;
                }

                if (item.benefits) {
                  newState.purchases.premiumExpiry = Date.now() + item.duration;
                }

                return newState;
              });
              Alert.alert('Thank you!', `${item.name} activated!`);
            }
          },
        ]
      );
    }
  };

  // ============================================================================
  // RESEARCH HANDLERS
  // ============================================================================

  const handleStartResearch = (researchId) => {
    if (gameState.activeResearch) {
      Alert.alert('Research in Progress', 'Wait for current research to complete.');
      return;
    }

    // Find research item
    let researchItem = null;
    Object.values(RESEARCH_TREE).forEach(branch => {
      const found = branch.items.find(item => item.id === researchId);
      if (found) researchItem = found;
    });

    if (!researchItem) return;

    const currentLevel = gameState.research[researchId] || 0;
    if (currentLevel >= researchItem.maxLevel) {
      Alert.alert('Max Level', 'This research is fully upgraded.');
      return;
    }

    // Check requirements
    for (const req of researchItem.requirements) {
      const [reqId, reqLevel] = req.split(':');
      if ((gameState.research[reqId] || 0) < parseInt(reqLevel)) {
        Alert.alert('Requirements Not Met', 'Complete prerequisite research first.');
        return;
      }
    }

    const cost = calculateResearchCost(researchItem, currentLevel);
    if (!canAfford(gameState.resources, cost)) {
      Alert.alert('Insufficient Resources', 'Gather more resources to start this research.');
      return;
    }

    const duration = calculateResearchTime(researchItem, currentLevel);

    setGameState(prev => {
      const newState = { ...prev };
      
      // Deduct cost
      Object.entries(cost).forEach(([resource, amount]) => {
        newState.resources[resource] -= amount;
      });

      newState.activeResearch = {
        id: researchId,
        startTime: Date.now(),
        endTime: Date.now() + duration,
      };

      return newState;
    });
  };

  const handleUnlockAnimalTier = (tierId) => {
    const tier = ANIMAL_TIERS[tierId];
    if (!tier || !tier.unlockCost) return;

    if (gameState.player.level < tier.unlockLevel) {
      Alert.alert('Level Required', `Reach level ${tier.unlockLevel} to unlock this tier.`);
      return;
    }

    if (tier.unlockCost.gems && gameState.resources.gems < tier.unlockCost.gems) {
      Alert.alert('Not Enough Gems', 'Purchase more gems in the shop.');
      return;
    }

    setGameState(prev => ({
      ...prev,
      resources: {
        ...prev.resources,
        gems: prev.resources.gems - (tier.unlockCost.gems || 0),
      },
      unlocked: {
        ...prev.unlocked,
        animalTiers: [...prev.unlocked.animalTiers, tierId],
      },
    }));

    Alert.alert('Tier Unlocked!', `${tier.name} are now available!`);
  };

  // ============================================================================
  // RENDER COMPONENTS
  // ============================================================================

  const renderGameScreen = () => (
    <View style={styles.gameContainer}>
      {/* Resource Bar */}
      <View style={styles.resourceBar}>
        <View style={styles.resourceItem}>
          <Text style={styles.resourceIcon}>🪵</Text>
          <Text style={styles.resourceText}>
            {formatNumber(gameState.resources.wood)}/{formatNumber(gameState.resources.maxWood)}
          </Text>
        </View>
        <View style={styles.resourceItem}>
          <Text style={styles.resourceIcon}>🥩</Text>
          <Text style={styles.resourceText}>
            {formatNumber(gameState.resources.meat)}/{formatNumber(gameState.resources.maxMeat)}
          </Text>
        </View>
        <View style={styles.resourceItem}>
          <Text style={styles.resourceIcon}>💎</Text>
          <Text style={styles.resourceText}>{formatNumber(gameState.resources.gems)}</Text>
        </View>
      </View>

      {/* Player Stats */}
      <View style={styles.playerStats}>
        <View style={styles.statRow}>
          <Text style={styles.levelText}>Lv.{gameState.player.level}</Text>
          <View style={styles.expBar}>
            <View 
              style={[
                styles.expFill,
                { width: `${(gameState.player.experience / gameState.player.experienceToLevel) * 100}%` }
              ]} 
            />
          </View>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>❤️</Text>
          <View style={styles.healthBar}>
            <View 
              style={[
                styles.healthFill,
                { 
                  width: `${(gameState.player.health / gameState.player.maxHealth) * 100}%`,
                  backgroundColor: gameState.player.health < 30 ? '#e74c3c' : '#2ecc71',
                }
              ]} 
            />
          </View>
          <Text style={styles.statValue}>
            {Math.floor(gameState.player.health)}/{gameState.player.maxHealth}
          </Text>
        </View>
      </View>

      {/* Temperature */}
      <View style={styles.temperatureContainer}>
        <Text style={styles.temperatureIcon}>🌡️</Text>
        <View style={styles.temperatureBar}>
          <View 
            style={[
              styles.temperatureFill,
              { 
                width: `${gameState.base.temperature}%`,
                backgroundColor: gameState.base.temperature < 30 ? '#3498db' : 
                  gameState.base.temperature < 60 ? '#f39c12' : '#e74c3c',
              }
            ]} 
          />
        </View>
        <Text style={styles.temperatureText}>{Math.floor(gameState.base.temperature)}°</Text>
        <TouchableOpacity 
          style={styles.fuelButton}
          onPress={handleAddFuel}
        >
          <Text style={styles.fuelButtonText}>🔥 +Fuel</Text>
        </TouchableOpacity>
      </View>

      {/* Main Game Area */}
      <View style={styles.gameArea}>
        {gameState.wave.active && gameState.wave.currentAnimal ? (
          // Combat View
          <View style={styles.combatContainer}>
            <Text style={styles.waveText}>Wave {gameState.wave.number}</Text>
            
            <Animated.View 
              style={[
                styles.animalContainer,
                {
                  transform: [{
                    translateX: damageAnimation.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0, -10, 10],
                    }),
                  }],
                },
              ]}
            >
              <Text style={styles.animalEmoji}>{gameState.wave.currentAnimal.icon}</Text>
              <Text style={styles.animalName}>{gameState.wave.currentAnimal.name}</Text>
              <View style={styles.animalHealthBar}>
                <View 
                  style={[
                    styles.animalHealthFill,
                    { 
                      width: `${(gameState.wave.currentAnimal.currentHealth / gameState.wave.currentAnimal.maxHealth) * 100}%` 
                    }
                  ]} 
                />
              </View>
              <Text style={styles.animalHealthText}>
                {gameState.wave.currentAnimal.currentHealth}/{gameState.wave.currentAnimal.maxHealth}
              </Text>
            </Animated.View>

            <TouchableOpacity 
              style={styles.attackButton}
              onPress={handleAttack}
            >
              <Text style={styles.attackButtonText}>⚔️ ATTACK!</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Woodcutting View
          <View style={styles.chopContainer}>
            {showWaveWarning && (
              <View style={styles.warningBanner}>
                <Text style={styles.warningText}>
                  ⚠️ Animal attack in {Math.ceil(gameState.wave.timeUntilNextWave / 1000)}s!
                </Text>
              </View>
            )}
            
            <View style={styles.timerContainer}>
              <Text style={styles.timerText}>
                Next Wave: {formatTime(gameState.wave.timeUntilNextWave)}
              </Text>
            </View>

            <Animated.View 
              style={[
                styles.treeContainer,
                {
                  transform: [{
                    rotate: chopAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '-15deg'],
                    }),
                  }],
                },
              ]}
            >
              <Text style={styles.treeEmoji}>🌲</Text>
            </Animated.View>

            <TouchableOpacity 
              style={styles.chopButton}
              onPress={handleChop}
            >
              <Text style={styles.chopButtonText}>🪓 CHOP!</Text>
            </TouchableOpacity>

            <Text style={styles.woodPerChop}>
              +{gameState.gathering.woodPerChop.toFixed(1)} wood/chop
            </Text>
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={handleHeal}
        >
          <Text style={styles.quickActionIcon}>🥩</Text>
          <Text style={styles.quickActionText}>Heal (20)</Text>
        </TouchableOpacity>

        {!gameState.purchases.removeAds && (
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={handleWatchAdBoost}
          >
            <Text style={styles.quickActionIcon}>📺</Text>
            <Text style={styles.quickActionText}>2x Boost</Text>
          </TouchableOpacity>
        )}

        {gameState.activeResearch && (
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={handleWatchAdSpeedResearch}
          >
            <Text style={styles.quickActionIcon}>⏩</Text>
            <Text style={styles.quickActionText}>Speed Up</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Active Boosters */}
      {gameState.boosters.length > 0 && (
        <View style={styles.boostersContainer}>
          {gameState.boosters.map(booster => (
            <View key={booster.id} style={styles.boosterBadge}>
              <Text style={styles.boosterText}>
                {booster.multiplier ? `${booster.multiplier}x` : '🛡️'} 
                {' '}{formatTime(booster.endTime - Date.now())}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Active Research */}
      {gameState.activeResearch && (
        <View style={styles.activeResearchBanner}>
          <Text style={styles.activeResearchText}>
            🔬 Researching: {formatTime(gameState.activeResearch.endTime - Date.now())}
          </Text>
        </View>
      )}
    </View>
  );

  const renderShopScreen = () => (
    <ScrollView style={styles.shopContainer}>
      <Text style={styles.screenTitle}>🛒 Shop</Text>

      {/* Featured */}
      <View style={styles.shopSection}>
        <Text style={styles.shopSectionTitle}>⭐ Featured</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[...SHOP_ITEMS.resources, ...SHOP_ITEMS.currency]
            .filter(item => item.featured || item.popular || item.bestValue)
            .map(item => (
              <TouchableOpacity 
                key={item.id}
                style={[styles.shopItemCard, styles.featuredCard]}
                onPress={() => handlePurchase(item)}
              >
                {item.bestValue && <View style={styles.bestValueBadge}><Text style={styles.badgeText}>BEST VALUE</Text></View>}
                {item.popular && <View style={styles.popularBadge}><Text style={styles.badgeText}>POPULAR</Text></View>}
                <Text style={styles.shopItemIcon}>{item.icon}</Text>
                <Text style={styles.shopItemName}>{item.name}</Text>
                <Text style={styles.shopItemDesc}>{item.description}</Text>
                <Text style={styles.shopItemPrice}>
                  {item.priceType === 'usd' ? `$${item.price}` : `💎 ${item.price}`}
                </Text>
              </TouchableOpacity>
            ))}
        </ScrollView>
      </View>

      {/* Gems */}
      <View style={styles.shopSection}>
        <Text style={styles.shopSectionTitle}>💎 Gems</Text>
        <View style={styles.shopGrid}>
          {SHOP_ITEMS.currency.map(item => (
            <TouchableOpacity 
              key={item.id}
              style={styles.shopItemCard}
              onPress={() => handlePurchase(item)}
            >
              <Text style={styles.shopItemIcon}>{item.icon}</Text>
              <Text style={styles.shopItemName}>{item.name}</Text>
              <Text style={styles.shopItemDesc}>{item.description}</Text>
              <Text style={styles.shopItemPrice}>${item.price}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Resources */}
      <View style={styles.shopSection}>
        <Text style={styles.shopSectionTitle}>📦 Resource Packs</Text>
        <View style={styles.shopGrid}>
          {SHOP_ITEMS.resources.map(item => (
            <TouchableOpacity 
              key={item.id}
              style={styles.shopItemCard}
              onPress={() => handlePurchase(item)}
            >
              <Text style={styles.shopItemIcon}>{item.icon}</Text>
              <Text style={styles.shopItemName}>{item.name}</Text>
              <Text style={styles.shopItemDesc}>{item.description}</Text>
              <Text style={styles.shopItemPrice}>${item.price}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Boosters */}
      <View style={styles.shopSection}>
        <Text style={styles.shopSectionTitle}>⚡ Boosters</Text>
        <View style={styles.shopGrid}>
          {SHOP_ITEMS.boosters.map(item => (
            <TouchableOpacity 
              key={item.id}
              style={styles.shopItemCard}
              onPress={() => handlePurchase(item)}
            >
              <Text style={styles.shopItemIcon}>{item.icon}</Text>
              <Text style={styles.shopItemName}>{item.name}</Text>
              <Text style={styles.shopItemDesc}>{item.description}</Text>
              <Text style={styles.shopItemPrice}>💎 {item.price}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Cosmetics */}
      <View style={styles.shopSection}>
        <Text style={styles.shopSectionTitle}>🎨 Cosmetics</Text>
        <View style={styles.shopGrid}>
          {SHOP_ITEMS.cosmetics.map(item => (
            <TouchableOpacity 
              key={item.id}
              style={[
                styles.shopItemCard,
                gameState.unlocked.cosmetics.includes(item.skinId) && styles.ownedItem
              ]}
              onPress={() => handlePurchase(item)}
              disabled={gameState.unlocked.cosmetics.includes(item.skinId)}
            >
              <Text style={styles.shopItemIcon}>{item.icon}</Text>
              <Text style={styles.shopItemName}>{item.name}</Text>
              <Text style={styles.shopItemDesc}>{item.description}</Text>
              <Text style={styles.shopItemPrice}>
                {gameState.unlocked.cosmetics.includes(item.skinId) ? 'OWNED' : `💎 ${item.price}`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Premium */}
      <View style={styles.shopSection}>
        <Text style={styles.shopSectionTitle}>👑 Premium</Text>
        <View style={styles.shopGrid}>
          {SHOP_ITEMS.subscriptions.map(item => (
            <TouchableOpacity 
              key={item.id}
              style={[styles.shopItemCard, styles.premiumCard]}
              onPress={() => handlePurchase(item)}
            >
              <Text style={styles.shopItemIcon}>{item.icon}</Text>
              <Text style={styles.shopItemName}>{item.name}</Text>
              <Text style={styles.shopItemDesc}>{item.description}</Text>
              <Text style={styles.shopItemPrice}>${item.price}</Text>
            </TouchableOpacity>
          ))}
          {SHOP_ITEMS.removeAds.map(item => (
            <TouchableOpacity 
              key={item.id}
              style={[
                styles.shopItemCard,
                gameState.purchases.removeAds && styles.ownedItem
              ]}
              onPress={() => handlePurchase(item)}
              disabled={gameState.purchases.removeAds}
            >
              <Text style={styles.shopItemIcon}>{item.icon}</Text>
              <Text style={styles.shopItemName}>{item.name}</Text>
              <Text style={styles.shopItemDesc}>{item.description}</Text>
              <Text style={styles.shopItemPrice}>
                {gameState.purchases.removeAds ? 'OWNED' : `$${item.price}`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Animal Tiers */}
      <View style={styles.shopSection}>
        <Text style={styles.shopSectionTitle}>🐾 Beast Tiers</Text>
        <View style={styles.shopGrid}>
          {Object.entries(ANIMAL_TIERS).map(([tierId, tier]) => {
            const isUnlocked = gameState.unlocked.animalTiers.includes(tierId);
            const canUnlock = gameState.player.level >= (tier.unlockLevel || 0);
            
            return (
              <TouchableOpacity 
                key={tierId}
                style={[
                  styles.shopItemCard,
                  isUnlocked && styles.ownedItem,
                  !canUnlock && !isUnlocked && styles.lockedItem
                ]}
                onPress={() => !isUnlocked && canUnlock && handleUnlockAnimalTier(tierId)}
                disabled={isUnlocked || !canUnlock}
              >
                <Text style={styles.shopItemIcon}>{tier.icon}</Text>
                <Text style={styles.shopItemName}>{tier.name}</Text>
                <Text style={styles.shopItemDesc}>
                  {tier.animals.map(a => a.icon).join(' ')}
                </Text>
                <Text style={styles.shopItemPrice}>
                  {isUnlocked ? 'UNLOCKED' : 
                    !canUnlock ? `Lv.${tier.unlockLevel}` :
                    tier.unlockCost?.gems ? `💎 ${tier.unlockCost.gems}` : 'FREE'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );

  const renderResearchScreen = () => (
    <ScrollView style={styles.researchContainer}>
      <Text style={styles.screenTitle}>🔬 Research</Text>

      {/* Active Research */}
      {gameState.activeResearch && (
        <View style={styles.activeResearchCard}>
          <Text style={styles.activeResearchTitle}>Currently Researching</Text>
          <Text style={styles.activeResearchName}>{gameState.activeResearch.id}</Text>
          <View style={styles.researchProgressBar}>
            <View 
              style={[
                styles.researchProgressFill,
                { 
                  width: `${((Date.now() - gameState.activeResearch.startTime) / 
                    (gameState.activeResearch.endTime - gameState.activeResearch.startTime)) * 100}%` 
                }
              ]} 
            />
          </View>
          <Text style={styles.activeResearchTime}>
            {formatTime(gameState.activeResearch.endTime - Date.now())} remaining
          </Text>
          {!gameState.purchases.removeAds && (
            <TouchableOpacity 
              style={styles.speedUpButton}
              onPress={handleWatchAdSpeedResearch}
            >
              <Text style={styles.speedUpButtonText}>📺 Watch Ad to Speed Up</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Research Branches */}
      {Object.entries(RESEARCH_TREE).map(([branchId, branch]) => (
        <View key={branchId} style={styles.researchBranch}>
          <View style={[styles.branchHeader, { backgroundColor: branch.color + '33' }]}>
            <Text style={styles.branchIcon}>{branch.icon}</Text>
            <Text style={[styles.branchTitle, { color: branch.color }]}>{branch.name}</Text>
          </View>
          
          <View style={styles.researchItems}>
            {branch.items.map(item => {
              const currentLevel = gameState.research[item.id] || 0;
              const isMaxed = currentLevel >= item.maxLevel;
              const cost = calculateResearchCost(item, currentLevel);
              const time = calculateResearchTime(item, currentLevel);
              const affordable = canAfford(gameState.resources, cost);
              
              // Check requirements
              let requirementsMet = true;
              let missingReq = null;
              for (const req of item.requirements) {
                const [reqId, reqLevel] = req.split(':');
                if ((gameState.research[reqId] || 0) < parseInt(reqLevel)) {
                  requirementsMet = false;
                  missingReq = req;
                  break;
                }
              }

              const isActive = gameState.activeResearch?.id === item.id;

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.researchItemCard,
                    isMaxed && styles.maxedResearch,
                    !requirementsMet && styles.lockedResearch,
                    isActive && styles.activeResearchItem,
                  ]}
                  onPress={() => handleStartResearch(item.id)}
                  disabled={isMaxed || !requirementsMet || !affordable || gameState.activeResearch}
                >
                  <View style={styles.researchItemHeader}>
                    <Text style={styles.researchItemIcon}>{item.icon}</Text>
                    <View style={styles.researchItemInfo}>
                      <Text style={styles.researchItemName}>{item.name}</Text>
                      <Text style={styles.researchItemLevel}>
                        Level {currentLevel}/{item.maxLevel}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={styles.researchItemDesc}>{item.description}</Text>
                  
                  {!isMaxed && requirementsMet && (
                    <View style={styles.researchCost}>
                      {Object.entries(cost).map(([resource, amount]) => (
                        <Text 
                          key={resource}
                          style={[
                            styles.costText,
                            gameState.resources[resource] < amount && styles.insufficientCost
                          ]}
                        >
                          {resource === 'wood' ? '🪵' : resource === 'meat' ? '🥩' : '💎'} {formatNumber(amount)}
                        </Text>
                      ))}
                      <Text style={styles.timeText}>⏱️ {formatTime(time)}</Text>
                    </View>
                  )}
                  
                  {!requirementsMet && missingReq && (
                    <Text style={styles.requirementText}>
                      🔒 Requires: {missingReq.replace(':', ' Lv.')}
                    </Text>
                  )}
                  
                  {isMaxed && (
                    <Text style={styles.maxedText}>✅ MAX LEVEL</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ))}

      <View style={{ height: 100 }} />
    </ScrollView>
  );

  // ============================================================================
  // PVP SCREEN
  // ============================================================================

  const [pvpTargets, setPvpTargets] = useState([]);
  const [pvpLoading, setPvpLoading] = useState(false);
  const [pvpHistory, setPvpHistory] = useState([]);
  const [myPvpRating, setMyPvpRating] = useState(1000);

  const loadPvpTargets = async () => {
    setPvpLoading(true);
    try {
      const response = await fetch(`${API_URL}/pvp/targets`, {
        headers: { 'Authorization': `Bearer ${await AsyncStorage.getItem('authToken')}` },
      });
      const data = await response.json();
      if (data.success) {
        setPvpTargets(data.targets || []);
        setMyPvpRating(data.myRating || 1000);
      }
    } catch (e) {
      console.log('Failed to load PvP targets');
    }
    setPvpLoading(false);
  };

  const handlePvpAttack = async (targetId) => {
    try {
      const response = await fetch(`${API_URL}/pvp/attack/${targetId}`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${await AsyncStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert(
          data.victory ? '⚔️ Victory!' : '💀 Defeat!',
          data.victory 
            ? `You stole ${formatNumber(data.battle.resourcesStolen.wood)} wood and ${formatNumber(data.battle.resourcesStolen.meat)} meat!\n\nRating: +${data.battle.ratingChange}`
            : `The enemy was too strong!\n\nRating: ${data.battle.ratingChange}`,
          [{ text: 'OK', onPress: loadPvpTargets }]
        );
        if (data.victory) {
          setGameState(prev => ({
            ...prev,
            resources: {
              ...prev.resources,
              wood: Math.min(prev.resources.wood + data.battle.resourcesStolen.wood, prev.resources.maxWood),
              meat: Math.min(prev.resources.meat + data.battle.resourcesStolen.meat, prev.resources.maxMeat),
            },
          }));
        }
      } else {
        Alert.alert('Attack Failed', data.error || 'Try again later');
      }
    } catch (e) {
      Alert.alert('Error', 'Network error');
    }
  };

  const renderPvPScreen = () => (
    <ScrollView style={styles.pvpContainer}>
      <View style={styles.pvpHeader}>
        <Text style={styles.screenTitle}>⚔️ PvP Arena</Text>
        <View style={styles.pvpRatingBox}>
          <Text style={styles.pvpRatingLabel}>Your Rating</Text>
          <Text style={styles.pvpRatingValue}>🏆 {myPvpRating}</Text>
        </View>
      </View>

      <Text style={styles.pvpSubtitle}>Attack other players to steal their resources!</Text>

      <TouchableOpacity style={styles.refreshButton} onPress={loadPvpTargets}>
        <Text style={styles.refreshButtonText}>{pvpLoading ? '⏳ Loading...' : '🔄 Find Targets'}</Text>
      </TouchableOpacity>

      {pvpTargets.length === 0 && !pvpLoading && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>🎯</Text>
          <Text style={styles.emptyStateText}>Tap "Find Targets" to search for enemies</Text>
        </View>
      )}

      <View style={styles.pvpTargetList}>
        {pvpTargets.map((target, index) => (
          <Animated.View key={target.id || index} style={styles.pvpTargetCard}>
            <View style={styles.pvpTargetHeader}>
              <Text style={styles.pvpTargetName}>{target.username}</Text>
              <Text style={styles.pvpTargetLevel}>Lv.{target.level}</Text>
            </View>
            
            <View style={styles.pvpTargetStats}>
              <View style={styles.pvpTargetStat}>
                <Text style={styles.pvpStatLabel}>Power</Text>
                <Text style={styles.pvpStatValue}>⚡ {formatNumber(target.power)}</Text>
              </View>
              <View style={styles.pvpTargetStat}>
                <Text style={styles.pvpStatLabel}>Rating</Text>
                <Text style={styles.pvpStatValue}>🏆 {target.rating}</Text>
              </View>
            </View>

            <View style={styles.pvpLootPreview}>
              <Text style={styles.pvpLootTitle}>Potential Loot:</Text>
              <Text style={styles.pvpLootText}>🪵 {formatNumber(target.potentialLoot?.wood || 0)} | 🥩 {formatNumber(target.potentialLoot?.meat || 0)}</Text>
            </View>

            <TouchableOpacity 
              style={[styles.pvpAttackButton, !target.canAttack && styles.pvpAttackButtonDisabled]}
              onPress={() => target.canAttack && handlePvpAttack(target.id)}
              disabled={!target.canAttack}
            >
              <Text style={styles.pvpAttackButtonText}>
                {target.canAttack ? '⚔️ ATTACK!' : '⏱️ Cooldown'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      <View style={{ height: 120 }} />
    </ScrollView>
  );

  // ============================================================================
  // ALLIANCE SCREEN
  // ============================================================================

  const [myAlliance, setMyAlliance] = useState(null);
  const [allianceSearch, setAllianceSearch] = useState([]);
  const [pendingGifts, setPendingGifts] = useState([]);
  const [allianceLoading, setAllianceLoading] = useState(false);

  const loadMyAlliance = async () => {
    setAllianceLoading(true);
    try {
      const response = await fetch(`${API_URL}/alliance/my`, {
        headers: { 'Authorization': `Bearer ${await AsyncStorage.getItem('authToken')}` },
      });
      const data = await response.json();
      if (data.success) {
        setMyAlliance(data.alliance);
      }
    } catch (e) {}
    setAllianceLoading(false);
  };

  const loadPendingGifts = async () => {
    try {
      const response = await fetch(`${API_URL}/alliance/gifts`, {
        headers: { 'Authorization': `Bearer ${await AsyncStorage.getItem('authToken')}` },
      });
      const data = await response.json();
      if (data.success) {
        setPendingGifts(data.gifts || []);
      }
    } catch (e) {}
  };

  const handleClaimGift = async (giftId) => {
    try {
      const response = await fetch(`${API_URL}/alliance/gifts/${giftId}/claim`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${await AsyncStorage.getItem('authToken')}` },
      });
      const data = await response.json();
      if (data.success) {
        setGameState(prev => ({
          ...prev,
          resources: {
            ...prev.resources,
            wood: Math.min(prev.resources.wood + (data.resources?.wood || 0), prev.resources.maxWood),
            meat: Math.min(prev.resources.meat + (data.resources?.meat || 0), prev.resources.maxMeat),
            gems: prev.resources.gems + (data.resources?.gems || 0),
          },
        }));
        Alert.alert('🎁 Gift Claimed!', `Received ${formatNumber(data.resources?.wood || 0)} wood, ${formatNumber(data.resources?.meat || 0)} meat, ${data.resources?.gems || 0} gems`);
        loadPendingGifts();
      }
    } catch (e) {}
  };

  const handleSendGift = async (toUserId, resources) => {
    try {
      const response = await fetch(`${API_URL}/alliance/gift`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${await AsyncStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ toUserId, resources }),
      });
      const data = await response.json();
      if (data.success) {
        setGameState(prev => ({
          ...prev,
          resources: {
            ...prev.resources,
            wood: prev.resources.wood - (resources.wood || 0),
            meat: prev.resources.meat - (resources.meat || 0),
            gems: prev.resources.gems - (resources.gems || 0),
          },
        }));
        Alert.alert('🎁 Gift Sent!', 'Your alliance member will receive it soon.');
      } else {
        Alert.alert('Error', data.error || 'Failed to send gift');
      }
    } catch (e) {}
  };

  const renderAllianceScreen = () => (
    <ScrollView style={styles.allianceContainer}>
      <Text style={styles.screenTitle}>🏰 Alliance</Text>

      {!myAlliance ? (
        // No Alliance View
        <View style={styles.noAllianceContainer}>
          <Text style={styles.noAllianceIcon}>🏰</Text>
          <Text style={styles.noAllianceTitle}>Join an Alliance!</Text>
          <Text style={styles.noAllianceText}>Team up with other players to share resources and dominate the leaderboards!</Text>
          
          <TouchableOpacity style={styles.createAllianceButton} onPress={async () => {
            if (gameState.resources.gems < 100) {
              Alert.alert('Not Enough Gems', 'You need 100 gems to create an alliance. Purchase gems in the shop!');
              return;
            }
            // Generate random alliance for quick creation (in production, add TextInput modal)
            const randomNum = Math.floor(Math.random() * 10000);
            const name = `Alliance${randomNum}`;
            const tag = `A${randomNum}`.slice(0, 5);
            
            Alert.alert(
              'Create Alliance',
              `Create "${name}" with tag [${tag}] for 100 gems?`,
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Create',
                  onPress: async () => {
                    try {
                      const response = await fetch(`${API_URL}/alliance/create`, {
                        method: 'POST',
                        headers: { 
                          'Authorization': `Bearer ${await AsyncStorage.getItem('authToken')}`,
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ name, tag }),
                      });
                      const data = await response.json();
                      if (data.success) {
                        setGameState(prev => ({ ...prev, resources: { ...prev.resources, gems: prev.resources.gems - 100 } }));
                        loadMyAlliance();
                        Alert.alert('🎉 Alliance Created!', `Welcome to [${tag}] ${name}!`);
                      } else {
                        Alert.alert('Error', data.error || 'Failed to create alliance');
                      }
                    } catch (e) {
                      Alert.alert('Error', 'Network error');
                    }
                  },
                },
              ]
            );
          }}>
            <Text style={styles.createAllianceButtonText}>🏰 Create Alliance (100 💎)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.searchAllianceButton} onPress={async () => {
            try {
              const response = await fetch(`${API_URL}/alliances/search`);
              const data = await response.json();
              if (data.success) {
                setAllianceSearch(data.alliances || []);
              }
            } catch (e) {}
          }}>
            <Text style={styles.searchAllianceButtonText}>🔍 Browse Alliances</Text>
          </TouchableOpacity>

          {allianceSearch.length > 0 && (
            <View style={styles.allianceSearchResults}>
              {allianceSearch.map((alliance, i) => (
                <View key={alliance._id || i} style={styles.allianceSearchCard}>
                  <View style={styles.allianceSearchInfo}>
                    <Text style={styles.allianceSearchName}>[{alliance.tag}] {alliance.name}</Text>
                    <Text style={styles.allianceSearchStats}>👥 {alliance.memberCount}/{alliance.maxMembers} | ⚡ {formatNumber(alliance.totalPower)}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.joinAllianceButton}
                    onPress={async () => {
                      try {
                        const response = await fetch(`${API_URL}/alliance/join/${alliance._id}`, {
                          method: 'POST',
                          headers: { 'Authorization': `Bearer ${await AsyncStorage.getItem('authToken')}` },
                        });
                        const data = await response.json();
                        if (data.success) {
                          loadMyAlliance();
                          Alert.alert('🎉 Joined!', `Welcome to ${alliance.name}!`);
                        } else {
                          Alert.alert('Error', data.error);
                        }
                      } catch (e) {}
                    }}
                  >
                    <Text style={styles.joinAllianceButtonText}>Join</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      ) : (
        // In Alliance View
        <View style={styles.myAllianceContainer}>
          <View style={styles.allianceInfoCard}>
            <Text style={styles.allianceIcon}>{myAlliance.icon || '⚔️'}</Text>
            <Text style={styles.allianceName}>[{myAlliance.tag}] {myAlliance.name}</Text>
            <Text style={styles.allianceStats}>👥 {myAlliance.memberCount}/{myAlliance.maxMembers} | ⚡ {formatNumber(myAlliance.totalPower)}</Text>
            
            <View style={styles.treasuryBox}>
              <Text style={styles.treasuryTitle}>🏦 Treasury</Text>
              <Text style={styles.treasuryText}>🪵 {formatNumber(myAlliance.treasury?.wood || 0)} | 🥩 {formatNumber(myAlliance.treasury?.meat || 0)} | 💎 {myAlliance.treasury?.gems || 0}</Text>
            </View>
          </View>

          {/* Pending Gifts */}
          {pendingGifts.length > 0 && (
            <View style={styles.giftsSection}>
              <Text style={styles.giftsSectionTitle}>🎁 Pending Gifts ({pendingGifts.length})</Text>
              {pendingGifts.map((gift, i) => (
                <View key={gift.id || i} style={styles.giftCard}>
                  <View style={styles.giftInfo}>
                    <Text style={styles.giftFrom}>From: {gift.from}</Text>
                    <Text style={styles.giftResources}>🪵 {gift.resources?.wood || 0} | 🥩 {gift.resources?.meat || 0} | 💎 {gift.resources?.gems || 0}</Text>
                  </View>
                  <TouchableOpacity style={styles.claimGiftButton} onPress={() => handleClaimGift(gift.id)}>
                    <Text style={styles.claimGiftButtonText}>Claim</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.refreshButton} onPress={() => { loadMyAlliance(); loadPendingGifts(); }}>
            <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.leaveAllianceButton} onPress={async () => {
            Alert.alert('Leave Alliance', 'Are you sure you want to leave?', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Leave',
                style: 'destructive',
                onPress: async () => {
                  try {
                    const response = await fetch(`${API_URL}/alliance/leave`, {
                      method: 'POST',
                      headers: { 'Authorization': `Bearer ${await AsyncStorage.getItem('authToken')}` },
                    });
                    const data = await response.json();
                    if (data.success) {
                      setMyAlliance(null);
                      Alert.alert('Left Alliance', 'You have left the alliance.');
                    }
                  } catch (e) {}
                },
              },
            ]);
          }}>
            <Text style={styles.leaveAllianceButtonText}>🚪 Leave Alliance</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ height: 120 }} />
    </ScrollView>
  );

  const renderSettingsScreen = () => (
    <ScrollView style={styles.settingsContainer}>
      <Text style={styles.screenTitle}>⚙️ Settings</Text>

      {/* Statistics */}
      <View style={styles.settingsSection}>
        <Text style={styles.settingsSectionTitle}>📊 Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Time Played</Text>
            <Text style={styles.statValue}>{formatTime(gameState.stats.timePlayed * 1000)}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Wood Chopped</Text>
            <Text style={styles.statValue}>{formatNumber(gameState.stats.totalWoodChopped)}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Meat Gathered</Text>
            <Text style={styles.statValue}>{formatNumber(gameState.stats.totalMeatGathered)}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Animals Defeated</Text>
            <Text style={styles.statValue}>{formatNumber(gameState.stats.animalsDefeated)}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Deaths</Text>
            <Text style={styles.statValue}>{gameState.stats.deaths}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Wave</Text>
            <Text style={styles.statValue}>{gameState.wave.number}</Text>
          </View>
        </View>
      </View>

      {/* Game Settings */}
      <View style={styles.settingsSection}>
        <Text style={styles.settingsSectionTitle}>🎮 Game</Text>
        <TouchableOpacity 
          style={styles.settingRow}
          onPress={() => setGameState(prev => ({
            ...prev,
            settings: { ...prev.settings, soundEnabled: !prev.settings.soundEnabled }
          }))}
        >
          <Text style={styles.settingLabel}>Sound Effects</Text>
          <Text style={styles.settingValue}>
            {gameState.settings.soundEnabled ? '🔊 ON' : '🔇 OFF'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.settingRow}
          onPress={() => setGameState(prev => ({
            ...prev,
            settings: { ...prev.settings, musicEnabled: !prev.settings.musicEnabled }
          }))}
        >
          <Text style={styles.settingLabel}>Music</Text>
          <Text style={styles.settingValue}>
            {gameState.settings.musicEnabled ? '🎵 ON' : '🔇 OFF'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.settingRow}
          onPress={() => setGameState(prev => ({
            ...prev,
            settings: { ...prev.settings, notificationsEnabled: !prev.settings.notificationsEnabled }
          }))}
        >
          <Text style={styles.settingLabel}>Notifications</Text>
          <Text style={styles.settingValue}>
            {gameState.settings.notificationsEnabled ? '🔔 ON' : '🔕 OFF'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Account */}
      <View style={styles.settingsSection}>
        <Text style={styles.settingsSectionTitle}>👤 Account</Text>
        <TouchableOpacity style={styles.settingRow}>
          <Text style={styles.settingLabel}>Restore Purchases</Text>
          <Text style={styles.settingValue}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.settingRow}
          onPress={saveGame}
        >
          <Text style={styles.settingLabel}>Save Game</Text>
          <Text style={styles.settingValue}>💾</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.settingRow, styles.dangerRow]}
          onPress={() => {
            Alert.alert(
              'Reset Game',
              'Are you sure? This will delete all progress!',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Reset', 
                  style: 'destructive',
                  onPress: async () => {
                    await AsyncStorage.removeItem('frozenFury_gameState');
                    setGameState(getInitialGameState());
                  }
                },
              ]
            );
          }}
        >
          <Text style={[styles.settingLabel, styles.dangerText]}>Reset Game</Text>
          <Text style={styles.settingValue}>⚠️</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>❄️ Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Main Content */}
      {activeScreen === 'game' && renderGameScreen()}
      {activeScreen === 'shop' && renderShopScreen()}
      {activeScreen === 'research' && renderResearchScreen()}
      {activeScreen === 'pvp' && renderPvPScreen()}
      {activeScreen === 'alliance' && renderAllianceScreen()}
      {activeScreen === 'settings' && renderSettingsScreen()}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={[styles.navButton, activeScreen === 'game' && styles.navButtonActive]}
          onPress={() => setActiveScreen('game')}
        >
          <Text style={styles.navIcon}>🎮</Text>
          <Text style={[styles.navLabel, activeScreen === 'game' && styles.navLabelActive]}>Play</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.navButton, activeScreen === 'pvp' && styles.navButtonActive]}
          onPress={() => setActiveScreen('pvp')}
        >
          <Text style={styles.navIcon}>⚔️</Text>
          <Text style={[styles.navLabel, activeScreen === 'pvp' && styles.navLabelActive]}>PvP</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.navButton, activeScreen === 'alliance' && styles.navButtonActive]}
          onPress={() => setActiveScreen('alliance')}
        >
          <Text style={styles.navIcon}>🏰</Text>
          <Text style={[styles.navLabel, activeScreen === 'alliance' && styles.navLabelActive]}>Alliance</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.navButton, activeScreen === 'shop' && styles.navButtonActive]}
          onPress={() => setActiveScreen('shop')}
        >
          <Text style={styles.navIcon}>🛒</Text>
          <Text style={[styles.navLabel, activeScreen === 'shop' && styles.navLabelActive]}>Shop</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.navButton, activeScreen === 'research' && styles.navButtonActive]}
          onPress={() => setActiveScreen('research')}
        >
          <Text style={styles.navIcon}>🔬</Text>
          <Text style={[styles.navLabel, activeScreen === 'research' && styles.navLabelActive]}>Upgrade</Text>
        </TouchableOpacity>
      </View>

      {/* Death Modal */}
      <Modal
        visible={showDeathModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deathModal}>
            <Text style={styles.deathTitle}>☠️ You Died!</Text>
            <Text style={styles.deathSubtitle}>
              {gameState.base.temperature <= 0 
                ? 'You froze to death...' 
                : 'The beast was too strong...'}
            </Text>
            
            <TouchableOpacity 
              style={styles.reviveButton}
              onPress={handleWatchAdRevive}
            >
              <Text style={styles.reviveButtonText}>
                {gameState.purchases.removeAds ? '💖 Revive' : '📺 Watch Ad to Revive'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.restartButton}
              onPress={() => {
                setShowDeathModal(false);
                setGameState(prev => ({
                  ...getInitialGameState(),
                  stats: prev.stats,
                  purchases: prev.purchases,
                  research: prev.research,
                  unlocked: prev.unlocked,
                }));
              }}
            >
              <Text style={styles.restartButtonText}>🔄 Restart (Keep Research)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Offline Rewards Modal */}
      <Modal
        visible={showOfflineRewards}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.offlineModal}>
            <Text style={styles.offlineTitle}>🌙 Welcome Back!</Text>
            <Text style={styles.offlineSubtitle}>
              Your camp worked while you were away ({formatTime(offlineRewards.time)})
            </Text>
            
            <View style={styles.offlineRewards}>
              <Text style={styles.offlineRewardText}>🪵 +{formatNumber(offlineRewards.wood)} Wood</Text>
              <Text style={styles.offlineRewardText}>🥩 +{formatNumber(offlineRewards.meat)} Meat</Text>
            </View>

            {!gameState.purchases.removeAds && (
              <TouchableOpacity 
                style={styles.doubleButton}
                onPress={async () => {
                  try {
                    await AdManager.showRewardedAd('RESOURCE_BOOST', () => {
                      setGameState(prev => ({
                        ...prev,
                        resources: {
                          ...prev.resources,
                          wood: Math.min(prev.resources.wood + offlineRewards.wood, prev.resources.maxWood),
                          meat: Math.min(prev.resources.meat + offlineRewards.meat, prev.resources.maxMeat),
                        },
                      }));
                    });
                  } catch (e) {}
                  setShowOfflineRewards(false);
                }}
              >
                <Text style={styles.doubleButtonText}>📺 Watch Ad for 2x Rewards</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={styles.collectButton}
              onPress={() => setShowOfflineRewards(false)}
            >
              <Text style={styles.collectButtonText}>Collect</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
