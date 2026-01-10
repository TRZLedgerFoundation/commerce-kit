import * as codoma from "codoma";
import { TrezoaAnchorIdl, rootNodeFromTrezoaAnchor } from "@codoma/nodes-from-trezoaanchor";
import {
  appendAccountDiscriminator,
  setDefaultAccountValues,
  appendPdaDerivers,
  setInstructionAccountDefaultValues,
  appendMOConfigRemainingAccounts,
} from "./updates";

export class CommerceCodomaBuilder {
  private codoma: codoma.Codoma;

  constructor(commerceIdl: TrezoaAnchorIdl) {
    this.codoma = codoma.createFromRoot(rootNodeFromTrezoaAnchor(commerceIdl));
  }

  appendAccountDiscriminator(): this {
    this.codoma = appendAccountDiscriminator(this.codoma);
    return this;
  }

  setDefaultAccountValues(): this {
    this.codoma = setDefaultAccountValues(this.codoma);
    return this;
  }

  appendPdaDerivers(): this {
    this.codoma = appendPdaDerivers(this.codoma);
    return this;
  }

  setInstructionAccountDefaultValues(): this {
    this.codoma = setInstructionAccountDefaultValues(this.codoma);
    return this;
  }

  appendMOConfigRemainingAccounts(): this {
    this.codoma = appendMOConfigRemainingAccounts(this.codoma);
    return this;
  }

  build(): codoma.Codoma {
    return this.codoma;
  }
}

export function createCommerceCodomaBuilder(commerceIdl: TrezoaAnchorIdl): CommerceCodomaBuilder {
  return new CommerceCodomaBuilder(commerceIdl);
}