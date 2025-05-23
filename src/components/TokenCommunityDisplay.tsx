import { BasicTokenInfo } from '@/types';

interface TokenCommunityDisplayProps {
  communityData?: BasicTokenInfo['community_data_coingecko'];
}

export const TokenCommunityDisplay: React.FC<TokenCommunityDisplayProps> = ({ communityData }) => {
  if (!communityData) return null;

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2">Community</h3>
      <div className="text-sm">
        {communityData.telegram_channel_user_count && (
          <p>Telegram Members: {communityData.telegram_channel_user_count.toLocaleString()}</p>
        )}
        {/* Add other community data if available and desired */}
      </div>
    </div>
  );
};
