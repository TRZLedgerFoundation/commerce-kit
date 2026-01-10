import type { Address } from 'trezoagill';

export type Recipient = Address;

export type Amount = bigint;

export type TPLToken = Address;

export type Reference = Address<string>;

export type References = Reference | Reference[];

export type Label = string;

export type Message = string;

export type Memo = string;

export type Link = URL;
