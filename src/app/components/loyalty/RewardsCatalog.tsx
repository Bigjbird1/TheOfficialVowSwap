import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  LoyaltyReward,
  RewardType,
  LoyaltyTier,
  RedeemRewardResponse,
} from '@/app/types/loyalty';
import { Card } from '@/app/components/ui/card';

interface RewardCatalogData {
  rewards: LoyaltyReward[];
  userPoints: number;
  userTier: LoyaltyTier;
}

export default function RewardsCatalog() {
  const { data: session } = useSession();
  const [catalogData, setCatalogData] = useState<RewardCatalogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [redeeming, setRedeeming] = useState<string | null>(null);

  useEffect(() => {
    const fetchCatalogData = async () => {
      try {
        // Fetch rewards
        const rewardsRes = await fetch('/api/loyalty/rewards');
        const rewardsData = await rewardsRes.json();

        // Fetch user's loyalty points
        const pointsRes = await fetch('/api/loyalty');
        const pointsData = await pointsRes.json();

        if (rewardsData.success && pointsData.success) {
          setCatalogData({
            rewards: rewardsData.data,
            userPoints: pointsData.data.points.points,
            userTier: pointsData.data.points.tier,
          });
        } else {
          setError('Failed to fetch rewards data');
        }
      } catch (err) {
        setError('An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchCatalogData();
    }
  }, [session]);

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

      const data: RedeemRewardResponse = await response.json();

      if (data.success && data.data) {
        // Update local state with new points balance
        setCatalogData((prev) => 
          prev ? { ...prev, userPoints: data.data!.remainingPoints } : null
        );
        // You might want to show a success toast here
      } else {
        setError(data.error || 'Failed to redeem reward');
      }
    } catch (err) {
      setError('An error occurred while redeeming the reward');
    } finally {
      setRedeeming(null);
    }
  };

  const getRewardDescription = (reward: LoyaltyReward) => {
    switch (reward.type) {
      case RewardType.PERCENTAGE_DISCOUNT:
        return `${reward.value}% discount on your next purchase`;
      case RewardType.FIXED_DISCOUNT:
        return `$${reward.value} off your next purchase`;
      case RewardType.FREE_SHIPPING:
        return 'Free shipping on your next order';
      case RewardType.GIFT_CARD:
        return `$${reward.value} gift card`;
      default:
        return reward.description;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-50 rounded-lg">
        {error}
      </div>
    );
  }

  if (!catalogData) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Available Rewards</h2>
        <div className="text-lg">
          Your Points: <span className="font-bold">{catalogData.userPoints}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {catalogData.rewards.map((reward) => (
          <Card key={reward.id} className="p-6">
            <div className="flex flex-col h-full">
              <h3 className="text-xl font-semibold mb-2">{reward.name}</h3>
              <p className="text-gray-600 mb-4">{getRewardDescription(reward)}</p>
              <div className="mt-auto space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Cost:</span>
                  <span className="font-semibold">{reward.pointsCost} points</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Required Tier:</span>
                  <span className="font-semibold">{reward.minTier}</span>
                </div>
                <button
                  onClick={() => redeemReward(reward.id)}
                  disabled={
                    catalogData.userPoints < reward.pointsCost ||
                    catalogData.userTier < reward.minTier ||
                    redeeming === reward.id
                  }
                  className={`w-full py-2 px-4 rounded-lg text-white transition-colors
                    ${
                      catalogData.userPoints >= reward.pointsCost &&
                      catalogData.userTier >= reward.minTier
                        ? 'bg-primary hover:bg-primary/90'
                        : 'bg-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  {redeeming === reward.id ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                      Redeeming...
                    </span>
                  ) : (
                    'Redeem Reward'
                  )}
                </button>
                {catalogData.userPoints < reward.pointsCost && (
                  <p className="text-sm text-red-500">
                    You need {reward.pointsCost - catalogData.userPoints} more points
                  </p>
                )}
                {catalogData.userTier < reward.minTier && (
                  <p className="text-sm text-red-500">
                    Requires {reward.minTier} tier
                  </p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
