export interface ReferralLink {
  id: string;
  userId: string;
  code: string;
  clickCount: number;
  referrals: ReferralTransaction[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ReferralTransaction {
  id: string;
  referrerId: string;
  referredId: string;
  referralLinkId: string;
  status: ReferralStatus;
  pointsAwarded?: number;
  createdAt: Date;
  completedAt?: Date;
}

export enum ReferralStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED'
}

export interface LoyaltyPoints {
  id: string;
  userId: string;
  points: number;
  lifetimePoints: number;
  tier: LoyaltyTier;
  transactions: LoyaltyTransaction[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LoyaltyTransaction {
  id: string;
  loyaltyPointsId: string;
  points: number;
  type: LoyaltyTransactionType;
  description: string;
  orderId?: string;
  createdAt: Date;
}

export enum LoyaltyTransactionType {
  PURCHASE = 'PURCHASE',
  REFERRAL = 'REFERRAL',
  REWARD_REDEMPTION = 'REWARD_REDEMPTION',
  ENGAGEMENT = 'ENGAGEMENT',
  BONUS = 'BONUS'
}

export enum LoyaltyTier {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM'
}

export interface LoyaltyReward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  type: RewardType;
  value: number;
  isActive: boolean;
  minTier: LoyaltyTier;
  redemptions: RedeemedReward[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RedeemedReward {
  id: string;
  userId: string;
  rewardId: string;
  pointsSpent: number;
  status: RewardStatus;
  expiresAt?: Date;
  createdAt: Date;
  usedAt?: Date;
}

export enum RewardType {
  PERCENTAGE_DISCOUNT = 'PERCENTAGE_DISCOUNT',
  FIXED_DISCOUNT = 'FIXED_DISCOUNT',
  FREE_SHIPPING = 'FREE_SHIPPING',
  GIFT_CARD = 'GIFT_CARD'
}

export enum RewardStatus {
  ACTIVE = 'ACTIVE',
  USED = 'USED',
  EXPIRED = 'EXPIRED'
}

// API Response Types
export interface ReferralLinkResponse {
  success: boolean;
  data?: ReferralLink;
  error?: string;
}

export interface LoyaltyPointsResponse {
  success: boolean;
  data?: {
    points: LoyaltyPoints;
    availableRewards: LoyaltyReward[];
  };
  error?: string;
}

export interface RedeemRewardResponse {
  success: boolean;
  data?: {
    redeemedReward: RedeemedReward;
    remainingPoints: number;
  };
  error?: string;
}

// Request Types
export interface RedeemRewardRequest {
  rewardId: string;
}

export interface GenerateReferralLinkRequest {
  userId: string;
}
