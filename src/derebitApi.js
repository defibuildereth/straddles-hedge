require("dotenv").config();

const { SpotClientV3, USDCOptionClient } = require("bybit-api");
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");

const Deribit = require('deribit-v2-ws');
const web3 = createAlchemyWeb3(process.env.RPC_URL);

const client = {
    key: process.env.API_KEY,
    secret: process.env.API_SECRET
};

const bybitSpot = new SpotClientV3();
const bybitOptions = new USDCOptionClient({
    key: client.key,
    secret: client.secret,
    testnet: false
});

const { toBN, getExpirySymbol } = require("../utils")(web3, bybitSpot, bybitOptions);

const key = process.env.DEREBIT_API_KEY;
const secret = process.env.DEREBIT_API_SECRET;

const db = new Deribit({ key, secret })

let connect = async function () {
    let symbol = await getExpirySymbol(1672905600, 1200.0, 10.0)
    await db.connect();
    const position = await db.request(
        'private/get_position',
        { instrument_name: symbol }
    );
    console.log(position)
}


connect()