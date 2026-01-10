import {
  Codoma,
  bottomUpTransformerVisitor,
  assertIsNode,
  argumentValueNode,
  instructionRemainingAccountsNode,
} from "codoma";

export function appendMOConfigRemainingAccounts(commerceCodoma: Codoma): Codoma {
  commerceCodoma.update(
    bottomUpTransformerVisitor([
      {
        select: "[instructionNode]initializeMerchantOperatorConfig",
        transform: (node) => {
          assertIsNode(node, "instructionNode");

          return {
            ...node,
            remainingAccounts: [
              instructionRemainingAccountsNode(
                argumentValueNode("acceptedCurrencies"),
                {
                  docs: ["The mint accounts for each accepted currency"],
                  isOptional: false,
                  isSigner: false,
                  isWritable: false,
                }
              ),
            ],
          };
        },
      },
    ])
  );
  return commerceCodoma;
}