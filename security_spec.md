# Comfy — Firestore Security Specification (Phase 0 TDD)

## 1. Data Invariants & Master Source of Truth

1. **Default-Deny Global Gate**: Any path not explicitly matched is unconditionally denied (`allow read, write: if false`).
2. **Direct Credential Authentication (Zero Google Popup)**:
   - Super Administrator (`projetointegradors303@gmail.com`) authenticates directly via strong password validated against `/adminSettings/superAdmin` (`allow list: if false`, `allow delete: if false`).
   - Registered confectioneries authenticate directly via email + password against `/storeAccounts/{storeId}` after administrative approval (`status == 'active'`).
3. **Split-Collection PII Isolation**:
   - `/stores/{storeId}` stores **only** public storefront metadata (`name`, `ownerDisplayName`, `city`, `segment`, `plan`, `status`, `ownerUid`, `createdAt`, `updatedAt`) and **zero PII**.
   - `/storeAccounts/{storeId}` isolates store contact details, PIX key, and password (`email`, `phone`, `pixKey`, `loginPassword`, `blockReason`). Unfiltered `list` scraping is rejected via Query Enforcer (`existing().email is string && existing().email > '' || existing().phone is string && existing().phone > ''`).
   - `/adminSettings/{settingId}` restricts access strictly to `settingId == 'superAdmin'`, denying `list` and `delete`.
4. **Atomic Provisioning Invariant (`existsAfter`)**:
   - A `/stores/{storeId}` document cannot be created without atomically creating `/storeAccounts/{storeId}` in the same batch, and vice versa.
   - An `/stores/{storeId}/orderItems/{itemId}` document cannot be created without its parent `/stores/{storeId}/orders/{orderId}` existing after the batch (`existsAfter`).
5. **No Self-Assigned Privileges**:
   - Store self-registrations (`ownerUid != 'comfy-admin'`) MUST set `status == 'pending_approval'`, `loginPassword == ''`, `blockReason == ''`, and `approvedAtLabel == ''`.
6. **Master Gate Revocation**:
   - All subcollections (`/products`, `/orders`, `/orderItems`, `/customers`) check `isParentStoreActive(storeId)` (`get(/databases/$(database)/documents/stores/$(storeId)).data.status == 'active'`) on every write. Blocking or suspending a store immediately revokes all write access to its subcollections.
7. **Terminal State Locking**:
   - Once an order reaches `status == 'delivered'`, updates are locked unless transitioning through valid action branches, and status changes must follow `pending -> in_production -> ready -> delivered` without state shortcutting.
8. **Zero Unbounded Arrays & Query Enforcer**:
   - Order line items live in `/stores/{storeId}/orderItems/{itemId}` rather than unbounded arrays.
   - No `allow list` block calls `get()` or `exists()`; every `allow list` block enforces `existing()` (`resource.data`) constraints so unfiltered scraping is rejected.

---

## 2. The "Dirty Dozen" Adversarial Payloads

1. **Payload 1 — Self-Approved Store Registration (Privilege Escalation)**
   - Non-admin self-registration (`ownerUid: "store-evil"`) attempts to `create` `/stores/store-evil` with `status: "active"` instead of `"pending_approval"`.
2. **Payload 2 — Orphaned Store Without `storeAccounts` (Atomicity Violation)**
   - Client attempts to `create` `/stores/store-orphan` alone without batch-writing `/storeAccounts/store-orphan`.
3. **Payload 3 — Admin Settings Enumeration (`list` Scraping Attack)**
   - Attacker attempts to `list` `/adminSettings` or `delete` `/adminSettings/superAdmin`.
4. **Payload 4 — Unfiltered `storeAccounts` Scraping (Query Enforcer Test)**
   - Attacker executes an unfiltered `getDocs(collection(db, 'storeAccounts'))` without an `email` or `phone` constraint.
5. **Payload 5 — Shadow Field Injection on Store Update ("Ghost Field" Attack)**
   - Client updates `name` on `/stores/store-1` while injecting `{ isVerifiedPartner: true }`.
6. **Payload 6 — Value Poisoning on Whitelisted Key (Boundary Overflow)**
   - Client updates `/stores/store-1` `name` with a 500-character string (exceeding `maxLength: 45`).
7. **Payload 7 — ID Poisoning Attack (Path Variable Injection)**
   - Client attempts to `create` a product at `/stores/store-1/products/bad$id!spaces` (violating `^[a-zA-Z0-9_\-]+$`).
8. **Payload 8 — Blocked Store Subcollection Write (Master Gate Bypass)**
   - Client attempts to `create` a new product in `/stores/store-blocked/products/prod-99` where parent store has `status == "blocked"`.
9. **Payload 9 — Order State Shortcutting (`pending` directly to `delivered`)**
   - Client attempts to `update` `/stores/store-1/orders/ord-pending` directly from `status: "pending"` to `status: "delivered"`, skipping `in_production` and `ready`.
10. **Payload 10 — Terminal State Mutation (`delivered` Order Re-opened)**
    - Client attempts to `update` `/stores/store-1/orders/ord-delivered` (where `status == "delivered"`) back to `"in_production"`.
11. **Payload 11 — Orphaned `OrderItem` Creation (`existsAfter` Bypass)**
    - Client attempts to `create` `/stores/store-1/orderItems/item-orphan` pointing to a non-existent `orderId: "ord-non-existent"`.
12. **Payload 12 — Unfiltered Customer PII List Scraping (Query Enforcer Test)**
    - Attacker executes an unfiltered `getDocs(collection(db, 'stores/store-1/customers'))` without constraining `storeId`.
