import { handleEns } from "./handler/ens.js";
import { brian } from "./handler/brian.js";
import type { SkillGroup } from "@xmtp/message-kit";

export const skills: SkillGroup[] = [
  {
    name: "Ens Domain Bot",
    tag: "@ens",
    description: "Register ENS domains.",
    skills: [
      {
        skill: "/gm",
        triggers: ["@gm", "/gm", "gm"],
        examples: ["/gm"],
        description: "Says good morning.",
        handler: handleEns,
        params: {},
      },
      {
        skill: "/info [domain]",
        triggers: ["/info"],
        handler: handleEns,
        description:
          "Get detailed information about an ENS domain including owner, expiry date, and resolver.",
        examples: ["/info nick.eth"],
        params: {
          domain: {
            type: "string",
          },
        },
      },
      {
        skill: "/reset",
        triggers: ["/reset"],
        examples: ["/reset"],
        handler: handleEns,
        description: "Reset the conversation.",
        params: {},
      },
      {
        skill: "/tip [address]",
        description: "Show a URL for tipping a domain owner.",
        triggers: ["/tip"],
        handler: handleEns,
        examples: ["/tip 0x1234567890123456789012345678901234567890"],
        params: {
          address: {
            type: "string",
          },
        },
      },
      {
        skill: "/brian [prompt]",
        triggers: ["@brian", "/brian"],
        description: "Sends a transaction via the Brian APIs.",
        handler: brian,
        examples: ["/brian send 0.1 eth to 0x1234567890123456789012345678901234567890"],
        params: {
          prompt: {
            type: "string",
          },
        },
      },
      {
        skill: "/confirm",
        triggers: ["@confirm", "/confirm"],
        description: "Confirms a transaction.",
        handler: brian,
        examples: ["/confirm"],
        params: {}
      },
      {
        skill: "/crosschain [prompt]",
        triggers: ["@crosschain", "/crosschain"],
        description: "Sends a crosschain swap transaction via the 1inch Fusion APIs.",
        handler: brian,
        examples: ["/crosschain send 1 usdc on polygon to vitalik.eth"],
        params: {
          prompt: {
            type: "string",
          },
        },
      },
    ],
  },
];
