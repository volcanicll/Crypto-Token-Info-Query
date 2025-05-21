interface TokenData {
  tokenInfo?: string;
  twitterAnalysis?: {
    search_summary?: string;
    account_summary?: string;
  };
  basicInfo?: {
    volume24h?: string;
    holders?: number;
    whales?: {
      count: number;
      percentage: number;
    };
  };
  blockchain: string;
  contractAddress: string;
}

export function formatTokenInfo(data: TokenData): string {
  const sections: string[] = [];

  // Add basic token information
  sections.push(`Blockchain: ${data.blockchain}`);
  sections.push(`Contract Address: ${data.contractAddress}`);

  if (data.tokenInfo) {
    sections.push(`\nToken Information:\n${data.tokenInfo}`);
  }

  // Add Twitter analysis if available
  if (data.twitterAnalysis) {
    if (data.twitterAnalysis.account_summary) {
      sections.push(
        `\nOfficial Account Analysis:\n${data.twitterAnalysis.account_summary}`
      );
    }
    if (data.twitterAnalysis.search_summary) {
      sections.push(
        `\nTwitter Mentions Analysis:\n${data.twitterAnalysis.search_summary}`
      );
    }
  }

  // Add basic token metrics if available
  if (data.basicInfo) {
    const metrics: string[] = [];
    if (data.basicInfo.volume24h) {
      metrics.push(`24h Volume: ${data.basicInfo.volume24h}`);
    }
    if (data.basicInfo.holders) {
      metrics.push(`Total Holders: ${data.basicInfo.holders.toLocaleString()}`);
    }
    if (data.basicInfo.whales) {
      metrics.push(
        `Whale Holders: ${data.basicInfo.whales.count.toLocaleString()} (${
          data.basicInfo.whales.percentage
        }%)`
      );
    }
    if (metrics.length > 0) {
      sections.push(`\nToken Metrics:\n${metrics.join("\n")}`);
    }
  }

  return sections.join("\n").trim();
}

export function truncateAddress(address: string, length = 8): string {
  if (address.length <= length * 2) return address;
  return `${address.slice(0, length)}...${address.slice(-length)}`;
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatMetrics(value: number): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)}B`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(2)}K`;
  }
  return value.toString();
}
