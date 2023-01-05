function deribit(websocket) {

    const db = websocket

    let getDeribitOrderBook = async function (symbol) {
        await db.connect();
        const orderbook = await db.request(
            '/public/get_order_book',
            {
                "instrument_name": symbol
            }
        );
        // convert orderbook results to dollar denominated
        let asks = orderbook.result.asks
        let inUsd = [];
        let ethPrice = orderbook.result.underlying_price;
        for (let i = 0; i < asks.length; i++) {
            let thisAsk$ = asks[i][0] * ethPrice;
            inUsd.push([thisAsk$, asks[i][1], asks[i][0]])
        }
        // convert to bybit format
        let bybitFormat = [];
        for (const element of inUsd) {
            const price = element[0];
            const size = element[1];
            const ethPrice = element[2];
            bybitFormat.push({ price: price.toString(), size: size.toString(), side: "Sell", exchange: "Deribit", ethPrice: ethPrice });
        }
        // console.log(bybitFormat)
        return bybitFormat
    }

    let getDeribitPositions = async function (expirySymbol) {
        await db.connect();
        const deribitPositions = await db.request(
            'private/get_positions',
            {
                'currency': 'ETH',
                "kind": 'option'
            }
        );
        return deribitPositions.result.filter(
            position => position.instrument_name === expirySymbol //check this
        )
    }

    let submitDeribitOrder = async function (size, symbol, price) {
        await db.connect();
        const order = await db.request(
            '/private/buy',
            {
                "instrument_name": symbol,
                "amount": size,
                "type": "limit",
                "price": price,
                "time_in_force": "fill_or_kill",
            }
        );
        console.log(order)
        return order // check this
    }

    return {
        getDeribitOrderBook,
        getDeribitPositions,
        submitDeribitOrder
    }
}

module.exports = deribit;
