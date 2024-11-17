const { SDK, HashLock, PrivateKeyProviderConnector, NetworkEnum } = require("@1inch/cross-chain-sdk");
const env = require('dotenv');
const process = env.config().parsed;

const { Web3 } = require('web3');
const { solidityPackedKeccak256, randomBytes } = require('ethers');

function getRandomBytes32() {
    return '0x' + Buffer.from(randomBytes(32)).toString('hex');
}

const makerPrivateKey = process?.WALLET_KEY;
const makerAddress = process?.WALLET_ADDRESS;
const nodeUrl = process?.RPC_URL_ETHEREUM;
const devPortalApiKey = process?.DEV_PORTAL_KEY;

if (!makerPrivateKey || !makerAddress || !nodeUrl || !devPortalApiKey) {
    throw new Error("Missing required environment variables. Please check your .env file.");
}

const web3Instance = new Web3(nodeUrl);
const blockchainProvider = new PrivateKeyProviderConnector(makerPrivateKey, web3Instance);

const sdk = new SDK({
    url: 'https://api.1inch.dev/fusion-plus',
    authKey: devPortalApiKey,
    blockchainProvider
});

let srcChainId = NetworkEnum.COINBASE;
let dstChainId = NetworkEnum.POLYGON;
let srcTokenAddress = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'; // USDC ON BASE
// let dstTokenAddress = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'; // USDC ON ARBITRUM
let dstTokenAddress = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'; // USDC ON POLYGON

export async function main() {
    const params = {
        srcChainId,
        dstChainId,
        srcTokenAddress,
        dstTokenAddress,
        amount: "1000000",
        enableEstimate: true,
        walletAddress: makerAddress
    };

    try {
        const quote = await sdk.getQuote(params);
        const secretsCount = quote.getPreset().secretsCount;

        const secrets = Array.from({ length: secretsCount }).map(() => getRandomBytes32());
        const secretHashes = secrets.map(x => HashLock.hashSecret(x));

        const hashLock = secretsCount === 1
            ? HashLock.forSingleFill(secrets[0])
            : HashLock.forMultipleFills(
                secretHashes.map((secretHash, i) =>
                    solidityPackedKeccak256(['uint64', 'bytes32'], [i, secretHash.toString()])
                )
            );

        console.log("Received Fusion+ quote from 1inch API");

        const quoteResponse = await sdk.placeOrder(quote, {
            walletAddress: makerAddress,
            hashLock,
            secretHashes
        });

        const orderHash = quoteResponse.orderHash;
        console.log(`Order successfully placed`);

        const intervalId = setInterval(async () => {
            console.log(`Polling for fills until order status is set to "executed"...`);
            try {
                const order = await sdk.getOrderStatus(orderHash);
                if (order.status === 'executed') {
                    console.log(`Order is complete. Exiting.`);
                    clearInterval(intervalId);
                }
            } catch (error) {
                console.error(`Error: ${JSON.stringify(error, null, 2)}`);
            }

            try {
                const fillsObject = await sdk.getReadyToAcceptSecretFills(orderHash);
                if (fillsObject.fills.length > 0) {
                    fillsObject.fills.forEach(async (fill) => {
                        try {
                            await sdk.submitSecret(orderHash, secrets[fill.idx]);
                            console.log(`Fill order found! Secret submitted: ${JSON.stringify(secretHashes[fill.idx], null, 2)}`);
                        } catch (error) {
                            console.error(`Error submitting secret: ${JSON.stringify(error, null, 2)}`);
                        }
                    });
                }
            } catch (error) {
                console.error(`Error getting ready to accept secret fills: ${error}`);
            }
        }, 5000);
    } catch (error) {
        console.dir(error, { depth: null });
    }
}

// main().catch(console.error);