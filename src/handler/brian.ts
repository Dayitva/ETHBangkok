import { BrianCoinbaseSDK } from "@brian-ai/cdp-sdk";
import { HandlerContext, run } from "@xmtp/message-kit";
import { ethers } from "ethers";

// const { privateKey, sender: agentCreator, mpcData } = workerData;

const cache: Record<string, any> = { data: null };


export async function brian(context: HandlerContext) {
console.log("[brian-worker] received a new message.");
const wallet = new ethers.Wallet(process.env.WALLET_KEY || "");

const brianCDPSDK = new BrianCoinbaseSDK({
    brianApiKey: process.env.BRIAN_API_KEY!,
    coinbaseApiKeyName: process.env.CDP_SDK_API_KEY_NAME,
    coinbaseApiKeySecret: process.env.CDP_SDK_API_KEY_SECRET,
});

await brianCDPSDK.importWallet({
    walletId: "3eca4f71-862f-46e1-9f36-cd9466a25287",
    seed: "779ddf0adc565e7aca21b20caae659f548b8829d196798fcc8156af90d9cc79b"
});

const {
    content: { content: text, skill, params },
    sender,
} = context.message;

// if (sender.address.toLowerCase() !== agentCreator.address.toLowerCase()) {
//     return;
// }

if (skill === "confirm" && cache.data) {
    // execute transaction
    await context.send("Executing your transaction...");

    const result = await brianCDPSDK.transact(
    `${cache.data.prompt} on base`
    );

    await context.send(
    `Transaction executed successfully: ${result[0].getTransactionLink()}`
    );

    cache.data = null;
    return;
    } else {
        cache.data = null;
    }

    if (skill === "gm" || text.toLowerCase() === "gm") {
        await context.send("gm");
        return;
    }

    if (skill === "brian") {
        const { prompt } = params;

        const promptWithoutQuotes = prompt.replace(/"/g, "").replace(/“/g, "");

        await context.send("I'm processing your request.. Please wait.");

        const response = await (
        brianCDPSDK as BrianCoinbaseSDK
        ).brianSDK.transact({
        prompt: promptWithoutQuotes,
        address: wallet.address,
        chainId:`${8453}`,
        });

        const [data] = response;

        cache.data = { prompt: promptWithoutQuotes };

        await context.send(data.data.description);
        await context.send(
        `Send "/confirm" to confirm your transaction. Any other message will cancel the operation.`
        );
    }

    if (skill === "ask") {
        const { prompt } = params;

        if (!prompt) {
        await context.send("You must provide a valid prompt.");
        return;
        }

        const promptWithoutQuotes = prompt.replace(/"/g, "").replace(/“/g, "");

        const response = await (brianCDPSDK as BrianCoinbaseSDK).brianSDK.ask({
            prompt: promptWithoutQuotes,
            kb: "public-knowledge-box",
        });

    await context.send(response.answer);
}
}
  