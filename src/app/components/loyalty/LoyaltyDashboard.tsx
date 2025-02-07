'use client';

import { useState, useEffect } from 'react';
import { LoyaltyPoints, LoyaltyTransaction, LoyaltyTier, ReferralLink } from '@/app/types/loyalty';
import { ClipboardIcon, ShareIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface LoyaltyDashboardProps {
  userId: string;
}

export default function LoyaltyDashboard({ userId }: LoyaltyDashboardProps) {
  const [loyaltyData, setLoyaltyData] = useState<{
    points: LoyaltyPoints;
    referralLink?: ReferralLink;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoyaltyData();
  }, []);

  const fetchLoyaltyData = async () => {
    try {
      const [loyaltyResponse, referralResponse] = await Promise.all([
        fetch('/api/loyalty'),
        fetch('/api/referrals')
      ]);

      if (!loyaltyResponse.ok || !referralResponse.ok) {
        throw new Error('Failed to fetch loyalty data');
      }

      const loyaltyData = await loyaltyResponse.json();
      const referralData = await referralResponse.json();

      setLoyaltyData({
        points: loyaltyData.data.points,
        referralLink: referralData.data
      });
    } catch (error) {
      console.error('Error fetching loyalty data:', error);
      toast.error('Failed to load loyalty data');
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = async () => {
    if (!loyaltyData?.referralLink?.code) return;
    
    const referralUrl = `${window.location.origin}/signup?ref=${loyaltyData.referralLink.code}`;
    try {
      await navigator.clipboard.writeText(referralUrl);
      toast.success('Referral link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy referral link');
    }
  };

  const shareReferralLink = async () => {
    if (!loyaltyData?.referralLink?.code) return;

    const referralUrl = `${window.location.origin}/signup?ref=${loyaltyData.referralLink.code}`;
    try {
      await navigator.share({
        title: 'Join me on VowSwap!',
        text: 'Sign up using my referral link and get exclusive rewards!',
        url: referralUrl
      });
    } catch (error) {
      console.error('Error sharing:', error);
      // User probably cancelled sharing, no need to show error
    }
  };

  const getTierProgress = (tier: LoyaltyTier, points: number): number => {
    const nextTierThreshold = {
      BRONZE: 1000,  // Points needed for Silver
      SILVER: 5000,  // Points needed for Gold
      GOLD: 10000,   // Points needed for Platinum
      PLATINUM: Infinity
    }[tier];

    const currentTierThreshold = {
      BRONZE: 0,
      SILVER: 1000,
      GOLD: 5000,
      PLATINUM: 10000
    }[tier];

    const progress = ((points - currentTierThreshold) / (nextTierThreshold - currentTierThreshold)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!loyaltyData) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <p className="text-gray-500">Failed to load loyalty data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Tier Status */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">
            {loyaltyData.points.tier.charAt(0) + loyaltyData.points.tier.slice(1).toLowerCase()} Member
          </h2>
          <span className="text-3xl font-bold text-primary">
            {loyaltyData.points.points} pts
          </span>
        </div>
        
        {loyaltyData.points.tier !== 'PLATINUM' && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to next tier</span>
              <span className="font-medium">
                {getTierProgress(loyaltyData.points.tier, loyaltyData.points.lifetimePoints)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary rounded-full h-2 transition-all duration-500"
                style={{
                  width: `${getTierProgress(
                    loyaltyData.points.tier,
                    loyaltyData.points.lifetimePoints
                  )}%`
                }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Referral Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Refer Friends</h3>
        <p className="text-gray-600 mb-4">
          Share your referral link with friends and earn rewards when they join!
        </p>
        
        <div className="flex gap-4 mb-6">
          <button
            onClick={copyReferralLink}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            <ClipboardIcon className="h-5 w-5" />
            Copy Link
          </button>
          
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              onClick={shareReferralLink}
              className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary/90 transition-colors"
            >
              <ShareIcon className="h-5 w-5" />
              Share
            </button>
          )}
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Total Referrals</span>
            <span className="font-semibold">
              {loyaltyData.referralLink?.referrals.length || 0}
            </span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-gray-600">Link Clicks</span>
            <span className="font-semibold">
              {loyaltyData.referralLink?.clickCount || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {loyaltyData.points.transactions.map((transaction: LoyaltyTransaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
            >
              <div>
                <p className="font-medium">{transaction.description}</p>
                <p className="text-sm text-gray-500">
                  {new Date(transaction.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span className={`font-semibold ${
                transaction.points > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {transaction.points > 0 ? '+' : ''}{transaction.points} pts
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
