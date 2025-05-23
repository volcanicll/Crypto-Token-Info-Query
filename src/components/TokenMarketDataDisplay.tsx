import { BasicTokenInfo } from '@/types';

interface TokenMarketDataDisplayProps {
  marketData?: BasicTokenInfo['market_data_coingecko'];
  tokenPrice?: string; // From OKX or primary source
}

const formatCurrency = (value: number | undefined | null, currency: string = 'USD') => {
  if (value === undefined || value === null) return 'N/A';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase(), minimumFractionDigits: 2, maximumFractionDigits: 20 }).format(value);
};
 const formatPercent = (value: number | undefined | null) => {
   if (value === undefined || value === null) return 'N/A';
   return `${value.toFixed(2)}%`;
 };


export const TokenMarketDataDisplay: React.FC<TokenMarketDataDisplayProps> = ({ marketData, tokenPrice }) => {
  if (!marketData && !tokenPrice) return null;

  // Helper to get specific currency value, defaulting to USD
  const getCurrencyValue = (priceObject: { [currency: string]: number } | undefined, currency: string = 'usd') => {
    if (!priceObject) return undefined;
    return priceObject[currency.toLowerCase()];
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2">Market Data</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <DataItem label="Current Price" value={tokenPrice && tokenPrice !== "0" ? formatCurrency(parseFloat(tokenPrice)) : formatCurrency(getCurrencyValue(marketData?.current_price_coingecko))} />
        <DataItem label="Market Cap" value={formatCurrency(getCurrencyValue(marketData?.market_cap))} />
        <DataItem label="Market Cap Rank" value={marketData?.market_cap_rank || 'N/A'} />
        <DataItem label="24h Trading Volume" value={formatCurrency(getCurrencyValue(marketData?.total_volume))} />
        <DataItem label="Total Supply" value={marketData?.total_supply ? marketData.total_supply.toLocaleString() : 'N/A'} />
        <DataItem label="Circulating Supply" value={marketData?.circulating_supply ? marketData.circulating_supply.toLocaleString() : 'N/A'} />
        <DataItem label="Price Change 24h" value={formatPercent(marketData?.price_change_percentage_24h)} />
        <DataItem label="Price Change 7d" value={formatPercent(marketData?.price_change_percentage_7d)} />
        <DataItem label="All-Time High (ATH)" value={formatCurrency(getCurrencyValue(marketData?.ath))} />
        <DataItem label="ATH Change %" value={formatPercent(getCurrencyValue(marketData?.ath_change_percentage))} />
        <DataItem label="All-Time Low (ATL)" value={formatCurrency(getCurrencyValue(marketData?.atl))} />
        <DataItem label="ATL Change %" value={formatPercent(getCurrencyValue(marketData?.atl_change_percentage))} />
      </div>
    </div>
  );
};

const DataItem: React.FC<{label: string, value: string | number | undefined}> = ({label, value}) => (
 <div className="p-3 bg-gray-50 rounded">
     <p className="font-medium text-gray-700">{label}:</p>
     <p className="text-gray-900">{value ?? 'N/A'}</p>
 </div>
);
