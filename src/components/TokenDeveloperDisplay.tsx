import { BasicTokenInfo } from '@/types';

interface TokenDeveloperDisplayProps {
  devData?: BasicTokenInfo['developer_data_coingecko'];
}

export const TokenDeveloperDisplay: React.FC<TokenDeveloperDisplayProps> = ({ devData }) => {
  if (!devData) return null;

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2">Developer Activity (from GitHub)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <DataItem label="Forks" value={devData.forks?.toLocaleString() || 'N/A'} />
        <DataItem label="Stars" value={devData.stars?.toLocaleString() || 'N/A'} />
        <DataItem label="Subscribers" value={devData.subscribers?.toLocaleString() || 'N/A'} />
        <DataItem label="Total Issues" value={devData.total_issues?.toLocaleString() || 'N/A'} />
        <DataItem label="Closed Issues" value={devData.closed_issues?.toLocaleString() || 'N/A'} />
        <DataItem label="Pull Requests Merged" value={devData.pull_requests_merged?.toLocaleString() || 'N/A'} />
        <DataItem label="Pull Request Contributors" value={devData.pull_request_contributors?.toLocaleString() || 'N/A'} />
        <DataItem label="Commit Count (4 weeks)" value={devData.commit_count_4_weeks?.toLocaleString() || 'N/A'} />
      </div>
    </div>
  );
};
// Re-defining DataItem here as per instructions.
// Consider extracting to a shared component if used more widely.
const DataItem: React.FC<{label: string, value: string | number}> = ({label, value}) => (
 <div className="p-3 bg-gray-50 rounded">
     <p className="font-medium text-gray-700">{label}:</p>
     <p className="text-gray-900">{value}</p>
 </div>
);
