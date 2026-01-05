#![no_std]

pub mod constants;
pub mod error;
pub mod events;
#[cfg(feature = "idl")]
pub mod instructions;
pub mod processor;
pub mod state;

#[cfg(not(feature = "no-entrypoint"))]
pub mod entrypoint;

pinocchio_pubkey::declare_id!("ECWxgnnpYoq57eNBuxmP8SKLmCFDSh4z8R4gYw7wm52e");
