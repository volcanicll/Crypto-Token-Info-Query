import { BasicTokenInfo } from '@/types';
import ReactMarkdown from 'react-markdown';

interface TokenBasicInfoDisplayProps {
  info?: BasicTokenInfo;
}

export const TokenBasicInfoDisplay: React.FC<TokenBasicInfoDisplayProps> = ({ info }) => {
  if (!info) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center mb-3">
        {info.image_coingecko?.large && (
          <img src={info.image_coingecko.large} alt={`${info.name} logo`} className="w-10 h-10 mr-3 rounded-full" />
        )}
        <div>
          <h2 className="text-2xl font-bold">{info.name || 'N/A'} ({info.symbol?.toUpperCase() || 'N/A'})</h2>
          {info.asset_platform_id && <p className="text-sm text-gray-600">Platform: {info.asset_platform_id}</p>}
        </div>
      </div>
      {info.description && (
        <div>
          <h4 className="text-md font-semibold mb-1">Description:</h4>
          <div className="prose prose-sm max-w-none text-gray-700">
             <ReactMarkdown>{info.description}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};
