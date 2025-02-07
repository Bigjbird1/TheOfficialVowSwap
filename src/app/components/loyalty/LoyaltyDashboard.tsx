import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  LoyaltyPoints,
  LoyaltyTransaction,
  LoyaltyTier,
  ReferralLink,
} from '@/app/types/loyalty';
import { Card } from '@/app/components/ui/card';

interface DashboardData {
  points: LoyaltyPoints;
  referralLink?: ReferralLink;
}

export default function LoyaltyDashboard() {
  const { data: session } = useSession();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch loyalty points
        const pointsRes = await fetch('/api/loyalty');
        const pointsData = await pointsRes.json();

        // Fetch referral link
        const referralRes = await fetch('/api/referrals');
        const referralData = await referralRes.json();

        if (pointsData.success && referralData.success) {
          setDashboardData({
            points: pointsData.data.points,
            referralLink: referralData.data,
          });
        } else {
          setError('Failed to fetch loyalty data');
        }
      } catch (err) {
        setError('An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchDashboardData();
    }
  }, [session]);

  const copyReferralLink = async () => {
    if (dashboardData?.referralLink) {
      const referralUrl = `${window.location.origin}/signup?ref=${dashboardData.referralLink.code}`;
      await navigator.clipboard.writeText(referralUrl);
      // You might want to show a toast notification here
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

  if (!dashboardData) {
    return null;
  }

  const { points, referralLink } = dashboardData;

  const getTierProgress = () => {
    const currentPoints = points.lifetimePoints;
    let nextTier;
    let pointsNeeded;

    switch (points.tier) {
      case LoyaltyTier.BRONZE:
        nextTier = 'Silver';
        pointsNeeded = 2000 - currentPoints;
        break;
      case LoyaltyTier.SILVER:
        nextTier = 'Gold';
        pointsNeeded = 5000 - currentPoints;
        break;
      case LoyaltyTier.GOLD:
        nextTier = 'Platinum';
        pointsNeeded = 10000 - currentPoints;
        break;
      default:
        return null;
    }

    return { nextTier, pointsNeeded };
  };

  const tierProgress = getTierProgress();

  return (
    <div className="space-y-6">
      {/* Points Overview */}
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Loyalty Points</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Current Points</p>
            <p className="text-3xl font-bold">{points.points}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Lifetime Points</p>
            <p className="text-3xl font-bold">{points.lifetimePoints}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Current Tier</p>
            <p className="text-3xl font-bold">{points.tier}</p>
          </div>
        </div>

        {tierProgress && (
          <div className="mt-6">
            <p className="text-sm text-gray-600 mb-2">
              {tierProgress.pointsNeeded} points needed for {tierProgress.nextTier}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-primary h-2.5 rounded-full"
                style={{
                  width: `${(points.lifetimePoints / getNextTierThreshold(points.tier)) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        )}
      </Card>

      {/* Referral Section */}
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Referral Program</h2>
        {referralLink ? (
          <div>
            <div className="flex items-center gap-4 mb-4">
              <input
                type="text"
                value={`${window.location.origin}/signup?ref=${referralLink.code}`}
                readOnly
                className="flex-1 p-2 border rounded-lg bg-gray-50"
              />
              <button
                onClick={copyReferralLink}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                Copy Link
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Clicks</p>
                <p className="text-2xl font-bold">{referralLink.clickCount}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Successful Referrals</p>
                <p className="text-2xl font-bold">
                  {referralLink.referrals.filter(r => r.status === 'COMPLETED').length}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p>Loading referral information...</p>
        )}
      </Card>

      {/* Recent Transactions */}
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Recent Transactions</h2>
        <div className="space-y-4">
          {points.transactions.slice(0, 5).map((transaction) => (
            <div
              key={transaction.id}
              className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
            >
              <div>
                <p className="font-medium">{transaction.description}</p>
                <p className="text-sm text-gray-600">{new Date(transaction.createdAt).toLocaleDateString()}</p>
              </div>
              <p className={`font-bold ${transaction.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {transaction.points > 0 ? '+' : ''}{transaction.points}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function getNextTierThreshold(currentTier: LoyaltyTier): number {
  switch (currentTier) {
    case LoyaltyTier.BRONZE:
      return 2000;
    case LoyaltyTier.SILVER:
      return 5000;
    case LoyaltyTier.GOLD:
      return 10000;
    default:
      return Infinity;
  }
}
