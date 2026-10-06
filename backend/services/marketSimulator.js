const store = require('./store');
const Stock = require('../models/Stock');
const { getIsConnected } = require('../config/db');

let intervalId = null;

const startSimulator = (intervalMs = 4000) => {
  if (intervalId) return;

  intervalId = setInterval(async () => {
    try {
      const stocks = await store.getAllStocks();
      if (!stocks || stocks.length === 0) return;

      // Pick 2-4 random stocks to tick in this cycle for natural market dynamics
      const countToUpdate = Math.min(stocks.length, Math.floor(Math.random() * 3) + 2);
      const shuffled = [...stocks].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, countToUpdate);

      for (const stock of selected) {
        if (stock.status === 'halted') continue;

        // Random percentage move between -0.4% and +0.45%
        const deltaPct = (Math.random() - 0.49) * 0.008;
        const currentPrice = Number(stock.price);
        const newPrice = parseFloat(Math.max(0.5, currentPrice * (1 + deltaPct)).toFixed(2));
        
        const openPrice = Number(stock.open || currentPrice);
        const previousClose = Number(stock.previousClose || currentPrice);
        const change = parseFloat((newPrice - previousClose).toFixed(2));
        const changePercent = parseFloat(((change / previousClose) * 100).toFixed(2));
        const high = parseFloat(Math.max(stock.high || newPrice, newPrice).toFixed(2));
        const low = parseFloat(Math.min(stock.low || newPrice, newPrice).toFixed(2));
        const addedVolume = Math.floor(Math.random() * 8000) + 1200;
        const volume = (stock.volume || 0) + addedVolume;

        const updatePayload = {
          price: newPrice,
          change,
          changePercent,
          high,
          low,
          volume,
          'dailyStats.high': high,
          'dailyStats.low': low,
          'dailyStats.volume': volume
        };

        if (getIsConnected()) {
          await Stock.findByIdAndUpdate(stock._id, {
            $set: updatePayload,
            $push: {
              historicalData: {
                $each: [{ timestamp: new Date(), price: newPrice, volume: addedVolume }],
                $slice: -40 // keep last 40 points
              }
            }
          });
        } else {
          // In-memory update
          Object.assign(stock, {
            price: newPrice,
            change,
            changePercent,
            high,
            low,
            volume
          });
          if (stock.dailyStats) {
            stock.dailyStats.high = high;
            stock.dailyStats.low = low;
            stock.dailyStats.volume = volume;
          }
          if (!stock.historicalData) stock.historicalData = [];
          stock.historicalData.push({ timestamp: new Date(), price: newPrice, volume: addedVolume });
          if (stock.historicalData.length > 40) {
            stock.historicalData.shift();
          }
        }
      }
    } catch (err) {
      console.error('[Simulator] Tick error:', err.message);
    }
  }, intervalMs);

  console.log(`[Simulator] Real-time market tick engine started (interval: ${intervalMs}ms)`);
};

const stopSimulator = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
};

module.exports = { startSimulator, stopSimulator };
