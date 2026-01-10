import path from "path";
import { renderVisitor } from "@codoma/renderers-js";
import { preserveConfigFiles } from './lib/utils';
import { createCommerceCodomaBuilder } from './lib/commerce-codoma-builder';
import { renderVisitor as renderRustVisitor } from '@codoma/renderers-rust';

const projectRoot = path.join(__dirname, "..");
const idlDir = path.join(projectRoot, "idl");
const commerceIdl = require(path.join(idlDir, "commerce_program.json"));
const rustClientsDir = path.join(__dirname, "..", "clients", "rust");
const typescriptClientsDir = path.join(
  __dirname,
  "..",
  "clients",
  "typescript",
);

// Create and configure the codoma instance using the builder pattern
const commerceCodoma = createCommerceCodomaBuilder(commerceIdl)
  .appendAccountDiscriminator()
  .setDefaultAccountValues()
  .appendPdaDerivers()
  .setInstructionAccountDefaultValues()
  .appendMOConfigRemainingAccounts()
  .build();

// Preserve configuration files during generation
const configPreserver = preserveConfigFiles(typescriptClientsDir, rustClientsDir);

// Generate Rust client
commerceCodoma.accept(
  renderRustVisitor(path.join(rustClientsDir, "src", "generated"), {
    formatCode: false,
    crateFolder: rustClientsDir,
    deleteFolderBeforeRendering: false,
  }),
);

// Generate TypeScript client
commerceCodoma.accept(
  renderVisitor(
    path.join(typescriptClientsDir, "src", "generated"),
    {
      formatCode: true,
      deleteFolderBeforeRendering: false,
    },
  ),
);

// Restore configuration files after generation
configPreserver.restore();