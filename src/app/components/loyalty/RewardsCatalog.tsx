'use client';

import { useState, useEffect } from 'react';
import { LoyaltyReward, RedeemedReward, RewardType } from '@/app/types/loyalty';
import { GiftIcon, TagIcon, TruckIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface RewardsCatalogProps {
  userId: string;
}

export default function RewardsCatalog({ userId }: RewardsCatalogProps) {
  const [rewards, setRewards] = useState<{
    availableRewards: LoyaltyReward[];
    activeRewards: RedeemedReward[];
    userPoints: number;
    userTier: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<string | 'all'>('all');

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      const [rewardsResponse, pointsResponse] = await Promise.all([
        fetch('/api/loyalty/rewards'),
        fetch('/api/loyalty')
      ]);

      if (!rewardsResponse.ok || !pointsResponse.ok) {
        throw new Error('Failed to fetch rewards data');
      }

      const [rewardsData, pointsData] = await Promise.all([
        rewardsResponse.json(),
        pointsResponse.json()
      ]);

      if (!rewardsData.success || !pointsData.success) {
        throw new Error('Failed to load rewards data');
      }

      setRewards({
        availableRewards: rewardsData.data.availableRewards,
        activeRewards: rewardsData.data.activeRewards,
        userPoints: pointsData.data.points.points,
        userTier: pointsData.data.points.tier
      });
    } catch (error) {
      console.error('Error fetching rewards:', error);
      toast.error('Failed to load rewards');
    } finally {
      setLoading(false);
    }
  };

  const redeemReward = async (rewardId: string) => {
    try {
      setRedeeming(rewardId);
      const response = await fetch('/api/loyalty/rewards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rewardId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to redeem reward');
      }

      const result = await response.json();
      toast.success('Reward redeemed successfully!');
      fetchRewards(); // Refresh rewards list
    } catch (error) {
      console.error('Error redeeming reward:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to redeem reward');
    } finally {
      setRedeeming(null);
    }
  };

  const getRewardIcon = (type: RewardType) => {
    switch (type) {
      case RewardType.PERCENTAGE_DISCOUNT:
        return <TagIcon className="h-6 w-6" />;
      case RewardType.FIXED_DISCOUNT:
        return <CreditCardIcon className="h-6 w-6" />;
      case RewardType.FREE_SHIPPING:
        return <TruckIcon className="h-6 w-6" />;
      case RewardType.GIFT_CARD:
        return <GiftIcon className="h-6 w-6" />;
    }
  };

  const formatRewardValue = (reward: LoyaltyReward) => {
    switch (reward.type) {
      case RewardType.PERCENTAGE_DISCOUNT:
        return `${reward.value}% off`;
      case RewardType.FIXED_DISCOUNT:
      case RewardType.GIFT_CARD:
        return `$${reward.value}`;
      case RewardType.FREE_SHIPPING:
        return 'Free Shipping';
      default:
        return reward.value.toString();
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!rewards) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <p className="text-gray-500">Failed to load rewards</p>
      </div>
    );
  }

  const tierOrder = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'];
  
  const canRedeemReward = (reward: LoyaltyReward) => {
    if (!rewards) return false;
    return (
      rewards.userPoints >= reward.pointsCost &&
      tierOrder.indexOf(rewards.userTier) >= tierOrder.indexOf(reward.minTier)
    );
  };

  const filteredRewards = rewards?.availableRewards.filter(reward => 
    selectedTier === 'all' || reward.minTier === selectedTier
  ) || [];

  return (
    <div className="space-y-6 p-6">
      {/* User Points and Tier */}
      {rewards && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Your Points Balance</h3>
              <p className="text-2xl font-bold text-primary">{rewards.userPoints} pts</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Current Tier</h3>
              <p className="text-2xl font-bold text-primary">{rewards.userTier}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tier Filter */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setSelectedTier('all')}
          className={`px-4 py-2 rounded-md ${
            selectedTier === 'all'
              ? 'bg-primary text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          All Tiers
        </button>
        {tierOrder.map((tier) => (
          <button
            key={tier}
            onClick={() => setSelectedTier(tier)}
            className={`px-4 py-2 rounded-md ${
              selectedTier === tier
                ? 'bg-primary text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {tier}
          </button>
        ))}
      </div>
      {/* Active Rewards */}
      {rewards.activeRewards.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Your Active Rewards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards.activeRewards.map((redeemedReward) => (
              <div
                key={redeemedReward.id}
                className="bg-white rounded-lg shadow-md p-6 border-2 border-primary"
              >
                <div className="flex items-start justify-between">
                  {(() => {
                    const reward = rewards.availableRewards.find(r => r.id === redeemedReward.rewardId);
                    if (!reward) return null;
                    return (
                      <div className="flex items-center gap-3">
                        <div className="text-primary">
                          {getRewardIcon(reward.type)}
                        </div>
                        <div>
                          <h3 className="font-semibold">{reward.name}</h3>
                          <p className="text-sm text-gray-600">
                            {formatRewardValue(reward)}
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                  {redeemedReward.expiresAt && (
                    <span className="text-sm text-gray-500">
                      Expires {new Date(redeemedReward.expiresAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Rewards */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Available Rewards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRewards.map((reward) => (
            <div
              key={reward.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-primary">
                    {getRewardIcon(reward.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{reward.name}</h3>
                    <p className="text-sm text-gray-600">
                      {formatRewardValue(reward)}
                    </p>
                  </div>
                </div>
                <span className="font-semibold text-primary">
                  {reward.pointsCost} pts
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                {reward.description}
              </p>

              <div className="flex flex-col justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Required Tier: <span className="font-semibold">{reward.minTier}</span>
                  </p>
                </div>
                
                <button
                  onClick={() => redeemReward(reward.id)}
                  disabled={redeeming === reward.id || !canRedeemReward(reward)}
                  className={`w-full py-2 px-4 rounded-md text-white transition-colors ${
                    redeeming === reward.id
                      ? 'bg-gray-400 cursor-not-allowed'
                      : canRedeemReward(reward)
                      ? 'bg-primary hover:bg-primary/90'
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  {redeeming === reward.id 
                    ? 'Redeeming...' 
                    : !canRedeemReward(reward) && rewards?.userPoints < reward.pointsCost
                    ? `Need ${reward.pointsCost - rewards.userPoints} more points`
                    : !canRedeemReward(reward)
                    ? `Requires ${reward.minTier} Tier`
                    : 'Redeem Reward'
                  }
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
