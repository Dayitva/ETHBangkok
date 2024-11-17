import { HandlerContext, SkillResponse } from "@xmtp/message-kit";
import { getUserInfo, clearInfoCache, isOnXMTP } from "@xmtp/message-kit";
import { isAddress } from "viem";
import { clearMemory } from "@xmtp/message-kit";

export const frameUrl = "https://ens.steer.fun/";
export const ensUrl = "https://app.ens.domains/";
export const baseTxUrl = "https://base-tx-frame.vercel.app";

export async function handleEns(
  context: HandlerContext,
): Promise<SkillResponse | undefined> {
  const {
    message: {
      sender,
      content: { skill, params },
    },
  } = context;

  if (skill == "gm") {
    return { code: 200, message: "gm" };
  }

  if (skill == "reset") {
    clearMemory();
    return { code: 200, message: "Conversation reset." };
  }  else if (skill == "info") {
    const { domain } = params;

    const data = await getUserInfo(domain);
    if (!data?.ensDomain) {
      return {
        code: 404,
        message: "Domain not found.",
      };
    }

    const formattedData = {
      Address: data?.address,
      "Avatar URL": data?.ensInfo?.avatar,
      Description: data?.ensInfo?.description,
      ENS: data?.ensDomain,
      "Primary ENS": data?.ensInfo?.ens_primary,
      GitHub: data?.ensInfo?.github,
      Resolver: data?.ensInfo?.resolverAddress,
      Twitter: data?.ensInfo?.twitter,
      URL: `${ensUrl}${domain}`,
    };

    let message = "Domain information:\n\n";
    for (const [key, value] of Object.entries(formattedData)) {
      if (value) {
        message += `${key}: ${value}\n`;
      }
    }
    message += `\n\nWould you like to tip the domain owner for getting there first 🤣?`;
    message = message.trim();
    if (await isOnXMTP(context.client, context.v2client, sender?.address)) {
      await context.send(
        `Ah, this domains is in XMTP, you can message it directly: https://converse.xyz/dm/${domain}`,
      );
    }
    return { code: 200, message };
  } else if (skill == "check") {
    const { domain } = params;

    if (!domain) {
      return {
        code: 400,
        message: "Please provide a domain name to check.",
      };
    }

    const data = await getUserInfo(domain);
    if (!data?.address) {
      let message = `Looks like ${domain} is available! Here you can register it: ${ensUrl}${domain} or would you like to see some cool alternatives?`;
      return {
        code: 200,
        message,
      };
    } else {
      let message = `Looks like ${domain} is already registered!`;
      await context.executeSkill("/cool " + domain);
      return {
        code: 404,
        message,
      };
    }
  } else if (skill == "tip") {
    const { address } = params;
    if (!address) {
      return {
        code: 400,
        message: "Please provide an address to tip.",
      };
    }
    const data = await getUserInfo(address);
    let txUrl = `${baseTxUrl}/transaction/?transaction_type=send&buttonName=Tip%20${data?.ensDomain ?? ""}&amount=1&token=USDC&receiver=${
      isAddress(address) ? address : data?.address
    }`;
    console.log(txUrl);
    return {
      code: 200,
      message: txUrl,
    };
  } else {
    return { code: 400, message: "Skill not found." };
  }
}

export async function clear() {
  clearMemory();
  clearInfoCache();
}
