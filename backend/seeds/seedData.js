const bcrypt = require('bcryptjs');

const generateHistory = (basePrice, days = 30) => {
  const history = [];
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  let price = basePrice * (0.85 + Math.random() * 0.1);

  for (let i = days; i >= 0; i--) {
    const timestamp = new Date(now - i * dayMs);
    const fluctuation = (Math.random() - 0.48) * (basePrice * 0.035);
    price = Math.max(1, price + fluctuation);
    const volume = Math.floor(Math.random() * 20000000) + 5000000;
    history.push({
      timestamp,
      price: parseFloat(price.toFixed(2)),
      volume
    });
  }
  // Ensure the latest point matches or is close to basePrice
  history[history.length - 1].price = basePrice;
  return history;
};

const defaultStocks = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 228.50,
    previousClose: 224.90,
    change: 3.60,
    changePercent: 1.60,
    open: 225.40,
    high: 229.80,
    low: 224.50,
    volume: 52140000,
    marketCap: 3500000000000,
    sector: 'Technology',
    description: 'Designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories, and sells a variety of related services.',
    dailyStats: {
      open: 225.40,
      high: 229.80,
      low: 224.50,
      volume: 52140000,
      week52High: 237.23,
      week52Low: 164.08,
      peRatio: 34.2,
      dividendYield: 0.44
    },
    historicalData: generateHistory(228.50),
    isFeatured: true,
    status: 'active'
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    price: 135.80,
    previousClose: 131.20,
    change: 4.60,
    changePercent: 3.51,
    open: 132.50,
    high: 137.20,
    low: 132.00,
    volume: 68420000,
    marketCap: 3340000000000,
    sector: 'Technology',
    description: 'Pioneered GPU-accelerated computing and develops AI chips, graphic processors, and high-performance compute architectures.',
    dailyStats: {
      open: 132.50,
      high: 137.20,
      low: 132.00,
      volume: 68420000,
      week52High: 140.76,
      week52Low: 39.23,
      peRatio: 58.6,
      dividendYield: 0.03
    },
    historicalData: generateHistory(135.80),
    isFeatured: true,
    status: 'active'
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 448.20,
    previousClose: 444.80,
    change: 3.40,
    changePercent: 0.76,
    open: 445.10,
    high: 450.40,
    low: 443.90,
    volume: 24100000,
    marketCap: 3330000000000,
    sector: 'Technology',
    description: 'Global tech titan delivering Azure cloud, Windows, Office 365, enterprise software, gaming, and cutting-edge Copilot AI integrations.',
    dailyStats: {
      open: 445.10,
      high: 450.40,
      low: 443.90,
      volume: 24100000,
      week52High: 468.35,
      week52Low: 309.45,
      peRatio: 36.8,
      dividendYield: 0.67
    },
    historicalData: generateHistory(448.20),
    isFeatured: true,
    status: 'active'
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 178.60,
    previousClose: 180.20,
    change: -1.60,
    changePercent: -0.89,
    open: 179.80,
    high: 181.10,
    low: 177.50,
    volume: 28900000,
    marketCap: 2210000000000,
    sector: 'Technology',
    description: 'Parent holding company of Google, YouTube, Google Cloud, Android, and Gemini generative AI platforms.',
    dailyStats: {
      open: 179.80,
      high: 181.10,
      low: 177.50,
      volume: 28900000,
      week52High: 191.75,
      week52Low: 120.21,
      peRatio: 24.5,
      dividendYield: 0.45
    },
    historicalData: generateHistory(178.60),
    isFeatured: true,
    status: 'active'
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    price: 198.40,
    previousClose: 195.10,
    change: 3.30,
    changePercent: 1.69,
    open: 196.00,
    high: 199.50,
    low: 194.80,
    volume: 38200000,
    marketCap: 2060000000000,
    sector: 'Consumer',
    description: 'E-commerce marketplace leader, AWS cloud computing services provider, digital streaming, and logistics innovator.',
    dailyStats: {
      open: 196.00,
      high: 199.50,
      low: 194.80,
      volume: 38200000,
      week52High: 201.20,
      week52Low: 118.35,
      peRatio: 44.1,
      dividendYield: 0.0
    },
    historicalData: generateHistory(198.40),
    isFeatured: true,
    status: 'active'
  },
  {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    price: 248.90,
    previousClose: 241.50,
    change: 7.40,
    changePercent: 3.06,
    open: 243.20,
    high: 251.80,
    low: 242.00,
    volume: 71200000,
    marketCap: 792000000000,
    sector: 'Automotive',
    description: 'Electric vehicle manufacturing, battery energy storage systems, solar roof tiles, and autonomous driving robotics.',
    dailyStats: {
      open: 243.20,
      high: 251.80,
      low: 242.00,
      volume: 71200000,
      week52High: 271.00,
      week52Low: 138.80,
      peRatio: 67.2,
      dividendYield: 0.0
    },
    historicalData: generateHistory(248.90),
    isFeatured: true,
    status: 'active'
  },
  {
    symbol: 'JPM',
    name: 'JPMorgan Chase & Co.',
    price: 215.10,
    previousClose: 216.50,
    change: -1.40,
    changePercent: -0.65,
    open: 216.00,
    high: 217.30,
    low: 214.20,
    volume: 12400000,
    marketCap: 615000000000,
    sector: 'Finance',
    description: 'Premier financial services firm offering investment banking, asset management, and consumer lending worldwide.',
    dailyStats: {
      open: 216.00,
      high: 217.30,
      low: 214.20,
      volume: 12400000,
      week52High: 225.48,
      week52Low: 140.64,
      peRatio: 12.1,
      dividendYield: 2.14
    },
    historicalData: generateHistory(215.10),
    isFeatured: false,
    status: 'active'
  },
  {
    symbol: 'V',
    name: 'Visa Inc.',
    price: 274.50,
    previousClose: 273.10,
    change: 1.40,
    changePercent: 0.51,
    open: 273.50,
    high: 275.80,
    low: 272.90,
    volume: 8900000,
    marketCap: 560000000000,
    sector: 'Finance',
    description: 'Global digital payments technology connect consumers, merchants, financial institutions, and government entities.',
    dailyStats: {
      open: 273.50,
      high: 275.80,
      low: 272.90,
      volume: 8900000,
      week52High: 290.96,
      week52Low: 227.68,
      peRatio: 29.8,
      dividendYield: 0.76
    },
    historicalData: generateHistory(274.50),
    isFeatured: false,
    status: 'active'
  },
  {
    symbol: 'INFY',
    name: 'Infosys Limited',
    price: 22.40,
    previousClose: 22.10,
    change: 0.30,
    changePercent: 1.36,
    open: 22.15,
    high: 22.60,
    low: 22.05,
    volume: 19800000,
    marketCap: 93000000000,
    sector: 'Technology',
    description: 'Multinational information technology corporation providing business consulting, information technology and outsourcing services.',
    dailyStats: {
      open: 22.15,
      high: 22.60,
      low: 22.05,
      volume: 19800000,
      week52High: 23.95,
      week52Low: 15.82,
      peRatio: 26.4,
      dividendYield: 2.30
    },
    historicalData: generateHistory(22.40),
    isFeatured: false,
    status: 'active'
  },
  {
    symbol: 'BTC-USD',
    name: 'Bitcoin (Virtual Asset)',
    price: 68450.00,
    previousClose: 66800.00,
    change: 1650.00,
    changePercent: 2.47,
    open: 66950.00,
    high: 69200.00,
    low: 66400.00,
    volume: 24500000000,
    marketCap: 1350000000000,
    sector: 'Crypto',
    description: 'Decentralized digital store of value and premier cryptocurrency traded globally 24/7.',
    dailyStats: {
      open: 66950.00,
      high: 69200.00,
      low: 66400.00,
      volume: 24500000000,
      week52High: 73750.07,
      week52Low: 26500.00,
      peRatio: 0,
      dividendYield: 0
    },
    historicalData: generateHistory(68450.00),
    isFeatured: true,
    status: 'active'
  },
  {
    symbol: 'ETH-USD',
    name: 'Ethereum (Virtual Asset)',
    price: 2640.00,
    previousClose: 2580.00,
    change: 60.00,
    changePercent: 2.33,
    open: 2590.00,
    high: 2685.00,
    low: 2560.00,
    volume: 14200000000,
    marketCap: 318000000000,
    sector: 'Crypto',
    description: 'Decentralized blockchain platform enabling smart contracts and decentralized finance (DeFi) applications.',
    dailyStats: {
      open: 2590.00,
      high: 2685.00,
      low: 2560.00,
      volume: 14200000000,
      week52High: 4090.00,
      week52Low: 1520.00,
      peRatio: 0,
      dividendYield: 0
    },
    historicalData: generateHistory(2640.00),
    isFeatured: false,
    status: 'active'
  }
];

const defaultUsers = [
  {
    name: 'Admin Moderator',
    email: 'admin@stockez.com',
    password: 'Password123!',
    role: 'ADMIN',
    virtualBalance: 100000,
    status: 'active'
  },
  {
    name: 'Syed Abul Arshad (Mentor)',
    email: 'arshad+mentor@thesmartbridge.com',
    password: 'Password123!',
    role: 'ADMIN',
    virtualBalance: 250000,
    status: 'active'
  },
  {
    name: 'Demo Trader',
    email: 'trader@stockez.com',
    password: 'Password123!',
    role: 'USER',
    virtualBalance: 50000,
    status: 'active'
  }
];

module.exports = { defaultStocks, defaultUsers, generateHistory };
