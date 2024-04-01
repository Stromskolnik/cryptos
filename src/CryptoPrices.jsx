import React, { useState, useEffect } from 'react';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryTooltip } from 'victory';

const CryptoPrices = () => {
  const [cryptoData, setCryptoData] = useState([]);
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [error, setError] = useState(null);
  const [timePeriod, setTimePeriod] = useState(7); 
  const [news, setNews] = useState([
    { 
      title: "Bitcoin Hits All-Time High", 
      description: "Bitcoin reached a new all-time high today, surpassing $60,000 per coin.",
      date: "2023-03-15",
      image: "https://example.com/bitcoin_image.jpg"
    },
    { 
      title: "Ethereum Upgrade Announcement", 
      description: "Ethereum developers announced a major upgrade to the network, improving scalability and transaction speeds.",
      date: "2023-02-20",
      image: "https://example.com/ethereum_image.jpg"
    }
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCriteria, setFilterCriteria] = useState('');

  useEffect(() => {
    const fetchCryptoPrices = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setCryptoData(data);
        setError(null); 
      } catch (error) {
        console.error('Error fetching crypto prices:', error);
        setError('Failed to fetch cryptocurrency prices. Please try again later.');
      }
    };

    fetchCryptoPrices();
  }, []);

  const fetchHistoricalData = async (crypto) => {
    try {
      const response = await fetch(`https://api.coingecko.com/api/v3/coins/${crypto}/market_chart?vs_currency=usd&days=${timePeriod}`);
      if (!response.ok) {
        throw new Error('Failed to fetch historical data');
      }
      const data = await response.json();
      setHistoricalData(data.prices);
      setSelectedCrypto(crypto);
      setError(null); 
    } catch (error) {
      console.error('Error fetching historical data:', error);
      setError('Failed to fetch historical data. Please try again later.');
    }
  };

  const handleTimePeriodChange = (period) => {
    setTimePeriod(period);
    if (selectedCrypto) {
      fetchHistoricalData(selectedCrypto);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleFilter = (criteria) => {
    setFilterCriteria(criteria);
  };

  const formatXAxisTick = (dateString) => {
    const date = new Date(dateString);
    switch (timePeriod) {
      case 1:
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case 7:
        return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
      case 30:
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      case 365:
        return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
      default:
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="crypto-container">
      <h1 className="crypto-heading">Cryptocurrency Prices</h1>
      {error && <p className="error-message">{error}</p>}
      <div className="search-filter-section">
        <input 
          type="text" 
          placeholder="Search Cryptocurrency..." 
          value={searchQuery} 
          onChange={(e) => handleSearch(e.target.value)} 
        />
        <select value={filterCriteria} onChange={(e) => handleFilter(e.target.value)}>
          <option value="">Filter by...</option>
          <option value="market_cap">Market Cap</option>
          <option value="volume">Volume</option>
        </select>
      </div>
      <div className="crypto-cards">
        {cryptoData
          .filter(crypto => crypto.name.toLowerCase().includes(searchQuery.toLowerCase()))
          .map((crypto, index) => (
            <div key={index} className="crypto-card">
              <h2 className="crypto-name">{crypto.name}</h2>
              <p className="crypto-price">Market Cap: ${crypto.market_cap}</p>
              <p className="crypto-price">Volume (24h): ${crypto.total_volume}</p>
              <button className="crypto-button" onClick={() => fetchHistoricalData(crypto.id)}>Show History</button>
            </div>
        ))}
      </div>
      {selectedCrypto && (
        <div className="chart-container">
          <h2 className="chart-heading">Price History of {selectedCrypto}</h2>
          <div className="time-buttons">
            <button className="time-button" onClick={() => handleTimePeriodChange(1)}>1 Day</button>
            <button className="time-button" onClick={() => handleTimePeriodChange(7)}>1 Week</button>
            <button className="time-button" onClick={() => handleTimePeriodChange(30)}>1 Month</button>
            <button className="time-button" onClick={() => handleTimePeriodChange(365)}>1 Year</button>
          </div>
          <VictoryChart width={800} height={400} domainPadding={{ x: 20 }}>
            <VictoryAxis
              tickFormat={(t) => formatXAxisTick(t)}
              style={{
                tickLabels: { angle: -45, fontSize: 12, padding: 5 } 
              }}
            />
            <VictoryAxis dependentAxis 
              style={{
                tickLabels: { fontSize: 12 } 
              }}
              tickFormat={(tick) => `$${tick}`} 
            />
            <VictoryLine
              data={historicalData}
              x={0}
              y={1}
              style={{
                data: { stroke: "blue" }
              }}
              labelComponent={<VictoryTooltip />}
            />
          </VictoryChart>
        </div>
      )}
      <div className="news-section">
        <h2>Zprávy a aktualizace trhu</h2>
        {news.map((item, index) => (
          <div key={index} className="news-article">
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <p>Date: {item.date}</p>
            <img src={item.image} alt="Article" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CryptoPrices;
