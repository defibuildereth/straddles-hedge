require("dotenv").config();

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
    console.log('received from server : ', e.data);
};

ws.onopen = async function () {
    ws.send(JSON.stringify(authMsg));
    await sleep(5000)
    // do stuff here
};

ws.onclose = function () {
    console.log("Websocket closed. Restarting");

    setTimeout(() => {
        ws = new WebSocket(process.env.WEBSOCKET);
        ws.on('open', onWsOpen);
        ws.on('error', onWsClose);
    }, 5000);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}