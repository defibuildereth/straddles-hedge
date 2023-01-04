require("dotenv").config();

const fs = require("fs");

const { WebSocket } = require("ws");

let clientId = process.env.DEREBIT_API_KEY;
let secret = process.env.DEREBIT_API_SECRET;

let authMsg =
{
    "jsonrpc": "2.0",
    "id": 9929,
    "method": "public/auth",
    "params": {
        "grant_type": "client_credentials",
        "client_id": clientId,
        "client_secret": secret
    }
};

let ws = new WebSocket('wss://www.deribit.com/ws/api/v2');

ws.onmessage = function (e) {
    // do something with the response...
    let obj = JSON.parse(e.data)
    let id = obj.id
    console.log(id)
    if (id == 8772) { // getOrderBook
        let asks = obj.result.asks;
        console.log('orderbook info: ', asks)
        saveDerebitOrderbook(asks)
    }
    // console.log('received from server : ', e.data);
};

ws.onopen = async function () {
    console.log('derebit websocket connection started')
    // ws.send(JSON.stringify(authMsg));
    await sleep(1000)
    // do stuff here
    let symbol = await getDerebitExpirySymbol(1672905600, 1200.0, 10.0)
    console.log(symbol)
    getOrderBook(symbol)
};

ws.onclose = function () {
    console.log("Websocket closed. Restarting");

    setTimeout(() => {
        ws = new WebSocket(process.env.WEBSOCKET);
        ws.on('open', onWsOpen);
        ws.on('error', onWsClose);
    }, 5000);
}

function getOrderBook(symbol) {
    let msg =
    {
        "jsonrpc": "2.0",
        "id": 8772,
        "method": "public/get_order_book",
        "params": {
            "instrument_name": symbol,
            "depth": 5
        }
    };
    ws.send(JSON.stringify(msg));
}

function getContractInfo(symbol) {
    let msg =
    {
        "method": "public/get_instrument",
        "params": {
            "instrument_name": symbol
        },
        "jsonrpc": "2.0",
        "id": 0
    };
    // console.log(JSON.stringify(msg))
    ws.send(JSON.stringify(msg));
}

const getDerebitExpirySymbol = async (expiry, lastPrice, premium) => {
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

    return testString
};


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const saveDerebitOrderbook = orderbook =>
    fs.writeFile("./DerebitOrderbook.json", JSON.stringify(orderbook), err => {
        console.log(
            err ? "Error writing orderbook" : "Successfully saved orderbook"
        );
    });