# Security Specification for Hustle Wallet

This document outlines the security parameters, data invariants, and defensive design schemas for the Firestore database.

## 1. Data Invariants
- **Owner-Exclusive Isolation**: Access to any `hustleItem` or `hashRecord` is strictly restricted to the user who created it (`userId == request.auth.uid`). No generic read, list, update, or deletes are permitted across users.
- **Strict Size Limits**: Guard against "Denial of Wallet" exhaustion by restricting fields to strict boundary limits (e.g., passwords stored up to 1024 characters, titles up to 64).
- **Immutable Fields**: The ownership identifier `userId` and the creation timestamp `createdAt` are completely immutable after initial document writing.
- **Verified Signator Session**: The email address of the requestor MUST be fully verified to authorize any create or update operations.

## 2. The "Dirty Dozen" Rogue Payloads
Here are the 12 malicious payloads constructed to test and prove the zero-trust durability of our rule architecture:

1. **Identity Hijack**: Creating a hustle item with `userId` representing a different user.
2. **Ghost field Injection**: Attempting to insert unapproved helper fields (e.g., `verifiedBySystem: true`).
3. **No-Verify Write**: Writing a record while authenticated but with `email_verified == false`.
4. **Credential Leak**: Attempting to query `hustleItems` without a `where("userId", "==", request.auth.uid)` constraint.
5. **Buffer Overflow Attack**: Generating a 5MB string for the `password` field and attempting to store it.
6. **Malicious Title Poisoning**: Injecting an insanely long unicode chain or illegal symbols as the record title.
7. **Cross-User Sync Snooping**: Setting up a listener on `/hustleItems/{id}` with a valid user token but referencing another user's `userId`.
8. **Owner Mutation**: Attempting to alter `userId` of an existing password record during an update.
9. **Creation Timestamp Retrofitting**: Attempting to modify `createdAt` to falsify a history's original date.
10. **State Shortcut**: Forcing invalid `category` values like `MasterRootCategory` outside of the pre-configured string enum.
11. **Orphaned Hash Item**: Attempting to write a `hashRecord` with a blank `userId` or malicious `text` exceeding 1000 characters.
12. **Junk ID Poisoning**: Trying to create document IDs filled with junk symbols or extreme sizes to crash indexers.

## 3. Test Cases (TDD Blueprint)

Our secure Rules framework guarantees that all 12 malicious requests are rejected with a robust `PERMISSION_DENIED` status.
Below is the rule validation specification.
