import ReactMarkdown from 'react-markdown';

interface TokenSummaryDisplayProps {
  summary?: string;
}

export const TokenSummaryDisplay: React.FC<TokenSummaryDisplayProps> = ({ summary }) => {
  if (!summary) return null;

  return (
    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 className="text-lg font-semibold mb-2 text-blue-700">AI Summary</h3>
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown>{summary}</ReactMarkdown>
      </div>
    </div>
  );
};
