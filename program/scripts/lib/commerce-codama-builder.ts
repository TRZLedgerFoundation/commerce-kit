import * as codama from "codama";
import { TrezoaAnchorIdl, rootNodeFromTrezoaAnchor } from "@codama/nodes-from-trezoaanchor";
import {
  appendAccountDiscriminator,
  setDefaultAccountValues,
  appendPdaDerivers,
  setInstructionAccountDefaultValues,
  appendMOConfigRemainingAccounts,
} from "./updates";

export class CommerceCodamaBuilder {
  private codama: codama.Codama;

  constructor(commerceIdl: TrezoaAnchorIdl) {
    this.codama = codama.createFromRoot(rootNodeFromTrezoaAnchor(commerceIdl));
  }

  appendAccountDiscriminator(): this {
    this.codama = appendAccountDiscriminator(this.codama);
    return this;
  }

  setDefaultAccountValues(): this {
    this.codama = setDefaultAccountValues(this.codama);
    return this;
  }

  appendPdaDerivers(): this {
    this.codama = appendPdaDerivers(this.codama);
    return this;
  }

  setInstructionAccountDefaultValues(): this {
    this.codama = setInstructionAccountDefaultValues(this.codama);
    return this;
  }

  appendMOConfigRemainingAccounts(): this {
    this.codama = appendMOConfigRemainingAccounts(this.codama);
    return this;
  }

  build(): codama.Codama {
    return this.codama;
  }
}

export function createCommerceCodamaBuilder(commerceIdl: TrezoaAnchorIdl): CommerceCodamaBuilder {
  return new CommerceCodamaBuilder(commerceIdl);
}