function utils(web3, bybitSpot, bybitOptions) {

  function splitNumber(num) {
    const integer = Math.floor(num);
    const remainder = num - integer;
    return { integer, remainder };
  }

  const toBN = n => web3.utils.toBN(n);

  const getLastPrice = async () =>
    parseFloat((await bybitSpot.getLastTradedPrice("ETHUSDT")).result.price);

  const getExpirySymbol = async (expiry, lastPrice, premium) => {
    const expiryDate = new Date(expiry * 1000);
    const month = expiryDate.toLocaleString("default", { month: "short" });
    const day = expiryDate.getUTCDate();
    const year = expiryDate
      .getFullYear()
      .toString()
      .slice(-2);
    console.log("get expiry symbol:", lastPrice, premium);
    // Compute strike closest to last price after premium
    let closest = ((Math.floor((lastPrice - premium) / 25) * 25) + 25).toString();
    let testString = `ETH-${day}${month.toUpperCase()}${year}-${closest}-P`;

    let orderbook = (await bybitOptions.getOrderBook(testString));
    if (orderbook.result.length !== 0) {
      return testString;
    } else {
      closest = ((Math.floor((lastPrice - premium) / 25) * 25) + 50)
      return `ETH-${day}${month.toUpperCase()}${year}-${closest}-P`;
    }
  };

  return {
    splitNumber,
    toBN,
    getLastPrice,
    getExpirySymbol
  };
}

module.exports = utils;
