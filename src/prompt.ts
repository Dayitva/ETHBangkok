import { skills } from "./skills.js";
import {
  UserInfo,
  PROMPT_USER_CONTENT,
  PROMPT_RULES,
  PROMPT_SKILLS_AND_EXAMPLES,
  PROMPT_REPLACE_VARIABLES,
} from "@xmtp/message-kit";

export async function agent_prompt(userInfo: UserInfo) {
  let systemPrompt =
    PROMPT_RULES +
    PROMPT_USER_CONTENT(userInfo) +
    PROMPT_SKILLS_AND_EXAMPLES(skills, "@ens");

  let fineTunning = `

## Example responses:

1. If the user wants to transfer assets cross-chain
  Sure {PREFERRED_NAME}, I can help you transfer assets across chains. Please provide the source and destination chains, as well as the asset details.

2. If the user wants to swap assets cross-chain
  Sure {PREFERRED_NAME}, I can help you swap assets across chains. Please provide the source and destination chains, as well as the asset details.

3. If the user wants to check the status of a cross-chain transfer
  Sure {PREFERRED_NAME}, I can help you check the status of your cross-chain transfer. Please provide the transaction ID or other relevant details.

4. If the user wants to check the status of a cross-chain swap
  Sure {PREFERRED_NAME}, I can help you check the status of your cross-chain swap. Please provide the transaction ID or other relevant details.

5. If the user wants to check someone's ENS
  Sure {PREFERRED_NAME}, I can help you check someone's ENS. Please provide the Ethereum address or other relevant details.

6. If the user wants to tip someone
  Sure {PREFERRED_NAME}, I can help you tip someone. Please provide the recipient's Ethereum address and the amount you wish to tip.
`;

  // Add the fine tuning to the system prompt
  systemPrompt += fineTunning;

  // Replace the variables in the system prompt
  systemPrompt = PROMPT_REPLACE_VARIABLES(
    systemPrompt,
    userInfo?.address ?? "",
    userInfo,
    "@ens",
  );
  // console.log(systemPrompt);
  return systemPrompt;
}
