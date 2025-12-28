// styles.js - Frozen Fury: Survival
// Complete StyleSheet for the game

import { StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';

const { width, height } = Dimensions.get('window');

// Theme Colors
const COLORS = {
  // Primary
  primary: '#3498db',
  primaryDark: '#2980b9',
  
  // Background
  background: '#0a1628',
  backgroundLight: '#1a2a4a',
  backgroundCard: '#152238',
  
  // Text
  textPrimary: '#ffffff',
  textSecondary: '#a0b4c8',
  textMuted: '#6a7d8f',
  
  // Status
  success: '#2ecc71',
  warning: '#f39c12',
  danger: '#e74c3c',
  info: '#3498db',
  
  // Game specific
  health: '#e74c3c',
  healthLow: '#c0392b',
  energy: '#3498db',
  experience: '#9b59b6',
  wood: '#8b4513',
  meat: '#c0392b',
  gems: '#9b59b6',
  temperature: {
    cold: '#3498db',
    warm: '#f39c12',
    hot: '#e74c3c',
  },
  
  // UI
  border: '#2a4a6a',
  overlay: 'rgba(0, 0, 0, 0.8)',
  buttonPrimary: '#e74c3c',
  buttonSecondary: '#3498db',
  buttonDisabled: '#4a5a6a',
};

export default StyleSheet.create({
  // ============================================================================
  // LAYOUT
  // ============================================================================
  
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  loadingText: {
    fontSize: 32,
    color: COLORS.textPrimary,
  },
  
  // ============================================================================
  // GAME SCREEN
  // ============================================================================
  
  gameContainer: {
    flex: 1,
    padding: 16,
  },
  
  // Resource Bar
  resourceBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  resourceIcon: {
    fontSize: 20,
    marginRight: 6,
  },
  
  resourceText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Player Stats
  playerStats: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  levelText: {
    color: COLORS.experience,
    fontSize: 16,
    fontWeight: 'bold',
    width: 60,
  },
  
  expBar: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  
  expFill: {
    height: '100%',
    backgroundColor: COLORS.experience,
    borderRadius: 4,
  },
  
  statLabel: {
    fontSize: 16,
    width: 30,
  },
  
  healthBar: {
    flex: 1,
    height: 16,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 8,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  
  healthFill: {
    height: '100%',
    borderRadius: 8,
  },
  
  statValue: {
    color: COLORS.textSecondary,
    fontSize: 12,
    width: 70,
    textAlign: 'right',
  },
  
  // Temperature
  temperatureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  
  temperatureIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  
  temperatureBar: {
    flex: 1,
    height: 16,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 8,
  },
  
  temperatureFill: {
    height: '100%',
    borderRadius: 8,
  },
  
  temperatureText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    width: 40,
  },
  
  fuelButton: {
    backgroundColor: COLORS.warning,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  
  fuelButtonText: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    fontSize: 12,
  },
  
  // Game Area
  gameArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Woodcutting
  chopContainer: {
    alignItems: 'center',
    width: '100%',
  },
  
  timerContainer: {
    marginBottom: 20,
  },
  
  timerText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  
  warningBanner: {
    backgroundColor: COLORS.danger,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  
  warningText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  treeContainer: {
    marginBottom: 30,
  },
  
  treeEmoji: {
    fontSize: 120,
  },
  
  chopButton: {
    backgroundColor: COLORS.buttonPrimary,
    paddingHorizontal: 60,
    paddingVertical: 20,
    borderRadius: 16,
    elevation: 5,
    shadowColor: COLORS.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  
  chopButtonText: {
    color: COLORS.textPrimary,
    fontSize: 28,
    fontWeight: 'bold',
  },
  
  woodPerChop: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 12,
  },
  
  // Combat
  combatContainer: {
    alignItems: 'center',
    width: '100%',
  },
  
  waveText: {
    color: COLORS.danger,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  
  animalContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  
  animalEmoji: {
    fontSize: 100,
    marginBottom: 10,
  },
  
  animalName: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  
  animalHealthBar: {
    width: width * 0.6,
    height: 20,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 10,
    overflow: 'hidden',
  },
  
  animalHealthFill: {
    height: '100%',
    backgroundColor: COLORS.danger,
    borderRadius: 10,
  },
  
  animalHealthText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 6,
  },
  
  attackButton: {
    backgroundColor: COLORS.danger,
    paddingHorizontal: 60,
    paddingVertical: 20,
    borderRadius: 16,
    elevation: 5,
    shadowColor: COLORS.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  
  attackButtonText: {
    color: COLORS.textPrimary,
    fontSize: 28,
    fontWeight: 'bold',
  },
  
  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  
  quickActionButton: {
    backgroundColor: COLORS.backgroundCard,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 80,
  },
  
  quickActionIcon: {
    fontSize: 24,
  },
  
  quickActionText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 4,
  },
  
  // Boosters
  boostersContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  
  boosterBadge: {
    backgroundColor: COLORS.success + '33',
    borderColor: COLORS.success,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  
  boosterText: {
    color: COLORS.success,
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  // Active Research Banner
  activeResearchBanner: {
    backgroundColor: COLORS.info + '33',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  
  activeResearchText: {
    color: COLORS.info,
    fontSize: 13,
    textAlign: 'center',
  },
  
  // ============================================================================
  // SHOP SCREEN
  // ============================================================================
  
  shopContainer: {
    flex: 1,
    padding: 16,
  },
  
  screenTitle: {
    color: COLORS.textPrimary,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  
  shopSection: {
    marginBottom: 24,
  },
  
  shopSectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  
  shopGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  
  shopItemCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 12,
    padding: 14,
    width: (width - 56) / 2,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  
  featuredCard: {
    width: (width - 56) / 2,
    marginRight: 12,
    borderColor: COLORS.warning,
    borderWidth: 2,
  },
  
  premiumCard: {
    borderColor: COLORS.experience,
    borderWidth: 2,
  },
  
  ownedItem: {
    opacity: 0.6,
    borderColor: COLORS.success,
  },
  
  lockedItem: {
    opacity: 0.4,
  },
  
  bestValueBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.warning,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  
  badgeText: {
    color: COLORS.textPrimary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  
  shopItemIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  
  shopItemName: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  
  shopItemDesc: {
    color: COLORS.textSecondary,
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 8,
  },
  
  shopItemPrice: {
    color: COLORS.success,
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // ============================================================================
  // RESEARCH SCREEN
  // ============================================================================
  
  researchContainer: {
    flex: 1,
    padding: 16,
  },
  
  activeResearchCard: {
    backgroundColor: COLORS.info + '22',
    borderColor: COLORS.info,
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  
  activeResearchTitle: {
    color: COLORS.info,
    fontSize: 14,
    marginBottom: 8,
  },
  
  activeResearchName: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  
  researchProgressBar: {
    width: '100%',
    height: 12,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  
  researchProgressFill: {
    height: '100%',
    backgroundColor: COLORS.info,
    borderRadius: 6,
  },
  
  activeResearchTime: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  
  speedUpButton: {
    backgroundColor: COLORS.warning,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  
  speedUpButtonText: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  
  researchBranch: {
    marginBottom: 24,
  },
  
  branchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  
  branchIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  
  branchTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  researchItems: {
    gap: 10,
  },
  
  researchItemCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  
  maxedResearch: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.success + '11',
  },
  
  lockedResearch: {
    opacity: 0.5,
  },
  
  activeResearchItem: {
    borderColor: COLORS.info,
    borderWidth: 2,
  },
  
  researchItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  researchItemIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  
  researchItemInfo: {
    flex: 1,
  },
  
  researchItemName: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  researchItemLevel: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  
  researchItemDesc: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginBottom: 10,
  },
  
  researchCost: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    alignItems: 'center',
  },
  
  costText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    backgroundColor: COLORS.backgroundLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  
  insufficientCost: {
    color: COLORS.danger,
    backgroundColor: COLORS.danger + '22',
  },
  
  timeText: {
    color: COLORS.info,
    fontSize: 13,
  },
  
  requirementText: {
    color: COLORS.warning,
    fontSize: 12,
    fontStyle: 'italic',
  },
  
  maxedText: {
    color: COLORS.success,
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  // ============================================================================
  // SETTINGS SCREEN
  // ============================================================================
  
  settingsContainer: {
    flex: 1,
    padding: 16,
  },
  
  settingsSection: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  
  settingsSectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  
  statItem: {
    width: '45%',
    backgroundColor: COLORS.backgroundLight,
    padding: 12,
    borderRadius: 10,
  },
  
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  
  settingLabel: {
    color: COLORS.textPrimary,
    fontSize: 15,
  },
  
  settingValue: {
    color: COLORS.textSecondary,
    fontSize: 15,
  },
  
  dangerRow: {
    borderBottomWidth: 0,
  },
  
  dangerText: {
    color: COLORS.danger,
  },
  
  // ============================================================================
  // BOTTOM NAVIGATION
  // ============================================================================
  
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: COLORS.backgroundCard,
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  
  navButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  
  navButtonActive: {
    borderTopWidth: 2,
    borderTopColor: COLORS.primary,
    marginTop: -2,
  },
  
  navIcon: {
    fontSize: 24,
  },
  
  navLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 4,
  },
  
  // ============================================================================
  // MODALS
  // ============================================================================
  
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  
  // Death Modal
  deathModal: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.danger,
  },
  
  deathTitle: {
    color: COLORS.danger,
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  
  deathSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  
  reviveButton: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    marginBottom: 12,
  },
  
  reviveButtonText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  restartButton: {
    backgroundColor: COLORS.backgroundLight,
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
  },
  
  restartButtonText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  
  // Offline Modal
  offlineModal: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.experience,
  },
  
  offlineTitle: {
    color: COLORS.textPrimary,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  
  offlineSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  
  offlineRewards: {
    backgroundColor: COLORS.backgroundLight,
    padding: 16,
    borderRadius: 12,
    width: '100%',
    marginBottom: 20,
  },
  
  offlineRewardText: {
    color: COLORS.textPrimary,
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 4,
  },
  
  doubleButton: {
    backgroundColor: COLORS.warning,
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    marginBottom: 12,
  },
  
  doubleButtonText: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  collectButton: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
  },
  
  collectButtonText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  // ============================================================================
  // PVP SCREEN STYLES
  // ============================================================================
  
  pvpContainer: {
    flex: 1,
    padding: 16,
  },

  pvpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  pvpRatingBox: {
    backgroundColor: '#f39c12',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },

  pvpRatingLabel: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },

  pvpRatingValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  pvpSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },

  refreshButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },

  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },

  emptyStateIcon: {
    fontSize: 60,
    marginBottom: 16,
  },

  emptyStateText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  },

  pvpTargetList: {
    gap: 16,
  },

  pvpTargetCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },

  pvpTargetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  pvpTargetName: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },

  pvpTargetLevel: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },

  pvpTargetStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 10,
    padding: 12,
  },

  pvpTargetStat: {
    alignItems: 'center',
  },

  pvpStatLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginBottom: 4,
  },

  pvpStatValue: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },

  pvpLootPreview: {
    backgroundColor: '#27ae6022',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },

  pvpLootTitle: {
    color: COLORS.success,
    fontSize: 12,
    marginBottom: 4,
  },

  pvpLootText: {
    color: COLORS.success,
    fontSize: 16,
    fontWeight: 'bold',
  },

  pvpAttackButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },

  pvpAttackButtonDisabled: {
    backgroundColor: COLORS.buttonDisabled,
  },

  pvpAttackButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  navLabelActive: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },

  // ============================================================================
  // ALLIANCE SCREEN STYLES
  // ============================================================================

  allianceContainer: {
    flex: 1,
    padding: 16,
  },

  noAllianceContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },

  noAllianceIcon: {
    fontSize: 80,
    marginBottom: 20,
  },

  noAllianceTitle: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },

  noAllianceText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },

  createAllianceButton: {
    backgroundColor: '#9b59b6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
  },

  createAllianceButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },

  searchAllianceButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },

  searchAllianceButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  allianceSearchResults: {
    marginTop: 24,
    width: '100%',
  },

  allianceSearchCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  allianceSearchInfo: {
    flex: 1,
  },

  allianceSearchName: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },

  allianceSearchStats: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },

  joinAllianceButton: {
    backgroundColor: COLORS.success,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },

  joinAllianceButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },

  myAllianceContainer: {
    flex: 1,
  },

  allianceInfoCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#9b59b6',
  },

  allianceIcon: {
    fontSize: 50,
    marginBottom: 12,
  },

  allianceName: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  allianceStats: {
    color: COLORS.textSecondary,
    fontSize: 15,
    marginBottom: 16,
  },

  treasuryBox: {
    backgroundColor: '#f39c1222',
    borderRadius: 12,
    padding: 14,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f39c12',
  },

  treasuryTitle: {
    color: '#f39c12',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
  },

  treasuryText: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },

  giftsSection: {
    marginBottom: 20,
  },

  giftsSectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },

  giftCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.success,
  },

  giftInfo: {
    flex: 1,
  },

  giftFrom: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },

  giftResources: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },

  claimGiftButton: {
    backgroundColor: COLORS.success,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },

  claimGiftButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },

  leaveAllianceButton: {
    backgroundColor: COLORS.danger + '22',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.danger,
    marginTop: 12,
  },

  leaveAllianceButtonText: {
    color: COLORS.danger,
    fontSize: 15,
    fontWeight: '600',
  },
});
