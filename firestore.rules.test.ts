import {
  assertFails,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { readFileSync } from 'node:fs';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

/**
 * Firestore Rules Adversarial Test Runner ("Dirty Dozen" Suite)
 * Verifies that all 12 adversarial payloads defined in security_spec.md
 * return PERMISSION_DENIED.
 */
export async function runDirtyDozenSecurityTests() {
  const rules = readFileSync('firestore.rules', 'utf8');
  const testEnv: RulesTestEnvironment = await initializeTestEnvironment({
    projectId: 'comfy-security-test',
    firestore: { rules },
  });

  try {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      const now = new Date();

      await setDoc(doc(adminDb, 'stores', 'store-1'), {
        ownerUid: 'store-1',
        name: 'Doceria Comfy',
        ownerDisplayName: 'Marina Alves',
        city: 'São Paulo, SP',
        segment: 'Doceria Artesanal',
        plan: 'Plano Profissional',
        status: 'active',
        createdAt: now,
        updatedAt: now,
      });

      await setDoc(doc(adminDb, 'storeAccounts', 'store-1'), {
        storeId: 'store-1',
        ownerUid: 'store-1',
        email: 'marina@gmail.com',
        phone: '(11) 98765-4321',
        pixKey: 'marina@gmail.com',
        loginPassword: 'Comfy@1234',
        blockReason: '',
        createdAtLabel: '28/10/2026',
        approvedAtLabel: '28/10/2026',
        createdAt: now,
        updatedAt: now,
      });

      await setDoc(doc(adminDb, 'stores', 'store-blocked'), {
        ownerUid: 'store-blocked',
        name: 'Loja Bloqueada',
        ownerDisplayName: 'Fernanda',
        city: 'Belo Horizonte, MG',
        segment: 'Brigadeiros',
        plan: 'Plano Inicial',
        status: 'blocked',
        createdAt: now,
        updatedAt: now,
      });

      await setDoc(doc(adminDb, 'stores', 'store-1', 'orders', 'ord-pending'), {
        storeId: 'store-1',
        ownerUid: 'store-1',
        createdByUid: 'store-1',
        orderNumber: '#1001',
        customerName: 'Ana Martins',
        customerPhone: '(11) 99123-4567',
        customerInitials: 'AM',
        totalAmount: 48,
        status: 'pending',
        deliveryDate: 'Hoje',
        deliveryType: 'retirada',
        paymentStatus: 'pendente',
        notes: '',
        createdAtIso: now.toISOString(),
        createdAt: now,
        updatedAt: now,
      });

      await setDoc(doc(adminDb, 'stores', 'store-1', 'orders', 'ord-delivered'), {
        storeId: 'store-1',
        ownerUid: 'store-1',
        createdByUid: 'store-1',
        orderNumber: '#1002',
        customerName: 'Beatriz Souza',
        customerPhone: '(11) 95567-8901',
        customerInitials: 'BS',
        totalAmount: 68,
        status: 'delivered',
        deliveryDate: 'Ontem',
        deliveryType: 'entrega',
        paymentStatus: 'pago',
        notes: '',
        createdAtIso: now.toISOString(),
        createdAt: now,
        updatedAt: now,
      });

      await setDoc(doc(adminDb, 'stores', 'store-1', 'customers', 'cust-1'), {
        storeId: 'store-1',
        ownerUid: 'store-1',
        name: 'Ana Martins',
        initials: 'AM',
        phone: '(11) 99123-4567',
        email: 'ana@email.com',
        address: 'Rua Oscar Freire, 100',
        notes: '',
        favoriteItem: 'Brigadeiro',
        totalOrders: 1,
        totalSpent: 48,
        lastOrderDate: 'Hoje',
        createdAt: now,
        updatedAt: now,
      });

      await setDoc(doc(adminDb, 'adminSettings', 'superAdmin'), {
        adminEmail: 'projetointegradors303@gmail.com',
        adminPassword: 'Comfy@Adm#2026!',
        updatedAtLabel: '28/10/2026',
        createdAt: now,
        updatedAt: now,
      });
    });

    const clientDb = testEnv.unauthenticatedContext().firestore();

    // 1. Self-Approved Store Registration (ownerUid != 'comfy-admin' with status: 'active')
    await assertFails(
      setDoc(doc(clientDb, 'stores', 'store-evil'), {
        ownerUid: 'store-evil',
        name: 'Evil Bakery',
        ownerDisplayName: 'Evil',
        city: 'São Paulo, SP',
        segment: 'Doces',
        plan: 'Plano Profissional',
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );

    // 2. Orphaned Store Without storeAccounts Batch
    await assertFails(
      setDoc(doc(clientDb, 'stores', 'store-orphan'), {
        ownerUid: 'store-orphan',
        name: 'Orphan Bakery',
        ownerDisplayName: 'Orphan',
        city: 'São Paulo, SP',
        segment: 'Doces',
        plan: 'Plano Profissional',
        status: 'pending_approval',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );

    // 3. Admin Settings List Enumeration & Deletion
    await assertFails(getDocs(collection(clientDb, 'adminSettings')));
    await assertFails(deleteDoc(doc(clientDb, 'adminSettings', 'superAdmin')));

    // 4. Unfiltered storeAccounts Scraping
    await assertFails(getDocs(collection(clientDb, 'storeAccounts')));

    // 5. Shadow Field Injection on Store Update
    await assertFails(
      updateDoc(doc(clientDb, 'stores', 'store-1'), {
        name: 'Doceria Comfy Nova',
        isVerifiedPartner: true,
        updatedAt: serverTimestamp(),
      })
    );

    // 6. Value Poisoning on Whitelisted Key (name > 45 chars)
    await assertFails(
      updateDoc(doc(clientDb, 'stores', 'store-1'), {
        name: 'X'.repeat(500),
        updatedAt: serverTimestamp(),
      })
    );

    // 7. ID Poisoning Attack on Product ID
    await assertFails(
      setDoc(doc(clientDb, 'stores', 'store-1', 'products', 'bad$id!spaces'), {
        storeId: 'store-1',
        ownerUid: 'store-1',
        name: 'Brigadeiro',
        price: 10,
        unit: 'un',
        description: 'Teste',
        prepTimeHours: 2,
        active: true,
        tag: '',
        emoji: '🍫',
        imageUrl: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );

    // 8. Blocked Store Subcollection Write (Master Gate)
    await assertFails(
      setDoc(doc(clientDb, 'stores', 'store-blocked', 'products', 'prod-99'), {
        storeId: 'store-blocked',
        ownerUid: 'store-blocked',
        name: 'Doce Bloqueado',
        price: 15,
        unit: 'un',
        description: 'Teste',
        prepTimeHours: 2,
        active: true,
        tag: '',
        emoji: '🍫',
        imageUrl: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );

    // 9. Order State Shortcutting (pending -> delivered directly)
    await assertFails(
      updateDoc(doc(clientDb, 'stores', 'store-1', 'orders', 'ord-pending'), {
        status: 'delivered',
        updatedAt: serverTimestamp(),
      })
    );

    // 10. Terminal State Mutation (delivered -> in_production)
    await assertFails(
      updateDoc(doc(clientDb, 'stores', 'store-1', 'orders', 'ord-delivered'), {
        status: 'in_production',
        updatedAt: serverTimestamp(),
      })
    );

    // 11. Orphaned OrderItem Without Parent Order
    await assertFails(
      setDoc(doc(clientDb, 'stores', 'store-1', 'orderItems', 'item-orphan'), {
        storeId: 'store-1',
        orderId: 'ord-non-existent',
        ownerUid: 'store-1',
        createdByUid: 'store-1',
        productId: 'prod-1',
        productName: 'Brigadeiro',
        quantity: 2,
        unitPrice: 48,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );

    // 12. Unfiltered Customer PII List Scraping
    await assertFails(getDocs(collection(clientDb, 'stores', 'store-1', 'customers')));
  } finally {
    await testEnv.cleanup();
  }
}
