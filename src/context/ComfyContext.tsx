import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { Customer, Order, OrderItem, OrderStatus, Product, SalesDay, Store, StoreProfile } from '../types';
import {
  db,
  DEFAULT_SUPER_ADMIN_PASSWORD,
  handleFirestoreError,
  LEGACY_SUPER_ADMIN_PASSWORD,
  OperationType,
  SUPER_ADMIN_EMAIL,
} from '../lib/firebase';
import {
  clampNumber,
  clampText,
  extractPhoneDigits,
  formatPhone11,
  MAX_BLOCK_REASON,
  MAX_CITY,
  MAX_CUSTOMER_ADDRESS,
  MAX_CUSTOMER_EMAIL,
  MAX_CUSTOMER_FAVORITE,
  MAX_CUSTOMER_INITIALS,
  MAX_CUSTOMER_NAME,
  MAX_CUSTOMER_NOTES,
  MAX_CUSTOMER_PHONE,
  MAX_DATE_LABEL,
  MAX_DELIVERY_DATE,
  MAX_EMAIL,
  MAX_ISO_DATE,
  MAX_ORDER_NOTES,
  MAX_ORDER_NUMBER,
  MAX_OWNER_NAME,
  MAX_PASSWORD,
  MIN_PASSWORD,
  MAX_PHONE_FORMATTED,
  MAX_PIX_KEY,
  MAX_PLAN,
  MAX_PRODUCT_DESC,
  MAX_PRODUCT_EMOJI,
  MAX_PRODUCT_IMAGE_URL,
  MAX_PRODUCT_NAME,
  MAX_PRODUCT_TAG,
  MAX_PRODUCT_UNIT,
  MAX_SEGMENT,
  MAX_STORE_NAME,
  sanitizeId,
} from '../utils/validation';

export type DashboardTab =
  | 'visao-geral'
  | 'pedidos'
  | 'catalogo'
  | 'clientes'
  | 'relatorios'
  | 'preferencias';

export type AppViewMode =
  | 'landing'
  | 'dashboard'
  | 'public-menu'
  | 'register-store'
  | 'super-admin'
  | 'login';

interface LoginResult {
  success: boolean;
  message: string;
  notRegistered?: boolean;
  pendingApproval?: boolean;
  blocked?: boolean;
  store?: Store;
  email?: string;
}

interface ComfyContextType {
  viewMode: AppViewMode;
  setViewMode: (mode: AppViewMode) => void;
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  isAuthReady: boolean;
  prefilledRegisterEmail: string;
  setPrefilledRegisterEmail: (email: string) => void;
  stores: Store[];
  currentStoreId: string;
  currentStore: Store;
  hasActiveStore: boolean;
  addStore: (
    data: {
      name: string;
      ownerName: string;
      phone: string;
      email: string;
      city?: string;
    },
    asActive?: boolean
  ) => Promise<Store | null>;
  deleteStore: (storeId: string) => Promise<void>;
  toggleStoreBlockStatus: (storeId: string) => Promise<void>;
  approveAndGeneratePassword: (storeId: string, customPassword?: string) => Promise<string>;
  currentUserRole: 'store' | 'superadmin' | null;
  superAdminPassword: string;
  updateSuperAdminPassword: (newPassword: string) => Promise<boolean>;
  loginWithCredentials: (email: string, pass: string, rememberMe?: boolean) => Promise<LoginResult>;
  loginAsSuperAdmin: (
    user: string,
    pass: string,
    rememberMe?: boolean
  ) => Promise<{ success: boolean; message: string }>;
  recoverPassword: (emailOrPhone: string) => Promise<{
    success: boolean;
    message: string;
    store?: Store;
    tempPass?: string;
  }>;
  logout: () => Promise<void>;
  switchStore: (storeId: string) => void;
  orders: Order[];
  products: Product[];
  customers: Customer[];
  storeProfile: StoreProfile;
  salesWeek: SalesDay[];
  isNewOrderModalOpen: boolean;
  setIsNewOrderModalOpen: (open: boolean) => void;
  addOrder: (orderData: {
    customerName: string;
    customerPhone: string;
    items: { productId: string; quantity: number }[];
    deliveryDate: string;
    deliveryType: 'retirada' | 'entrega';
    paymentStatus: 'pago' | 'pendente' | '50_sinal';
    notes?: string;
  }) => Promise<boolean>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  addProduct: (productData: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  toggleProductStatus: (productId: string) => Promise<void>;
  addCustomer: (customerData: {
    name: string;
    phone: string;
    email: string;
    address?: string;
    notes?: string;
  }) => Promise<void>;
  updateStoreProfile: (profile: Partial<StoreProfile>) => Promise<void>;
  resetAllData: () => Promise<void>;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  monthlyRevenue: number;
  totalOrdersCount: number;
  averageTicket: number;
  pendingOrdersCount: number;
}

interface FirestoreStoreDoc {
  ownerUid: string;
  name: string;
  ownerDisplayName: string;
  city: string;
  segment: string;
  plan: string;
  status: 'active' | 'pending_approval' | 'blocked';
}

interface FirestoreStoreAccountDoc {
  storeId: string;
  ownerUid: string;
  email: string;
  phone: string;
  pixKey: string;
  loginPassword: string;
  blockReason: string;
  createdAtLabel: string;
  approvedAtLabel: string;
}

interface FirestoreOrderDoc {
  storeId: string;
  ownerUid: string;
  createdByUid: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerInitials: string;
  totalAmount: number;
  status: OrderStatus;
  deliveryDate: string;
  deliveryType: 'retirada' | 'entrega';
  paymentStatus: 'pago' | 'pendente' | '50_sinal';
  notes: string;
  createdAtIso: string;
}

interface FirestoreOrderItemDoc {
  storeId: string;
  orderId: string;
  ownerUid: string;
  createdByUid: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

const LEGACY_DEMO_STORE_IDS = ['store-1', 'store-2', 'store-3', 'store-4', 'store-5'];

const EMPTY_WEEK_TEMPLATE: SalesDay[] = [
  { day: 'seg', fullName: 'Segunda-feira', amount: 0, ordersCount: 0, isPeak: false },
  { day: 'ter', fullName: 'Terça-feira', amount: 0, ordersCount: 0, isPeak: false },
  { day: 'qua', fullName: 'Quarta-feira', amount: 0, ordersCount: 0, isPeak: false },
  { day: 'qui', fullName: 'Quinta-feira', amount: 0, ordersCount: 0, isPeak: false },
  { day: 'sex', fullName: 'Sexta-feira', amount: 0, ordersCount: 0, isPeak: false },
  { day: 'sáb', fullName: 'Sábado', amount: 0, ordersCount: 0, isPeak: false },
  { day: 'dom', fullName: 'Domingo', amount: 0, ordersCount: 0, isPeak: false },
];

const ComfyContext = createContext<ComfyContextType | undefined>(undefined);

function readPersistedValue(key: string): string | null {
  try {
    return sessionStorage.getItem(key) || localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writePersistedValue(key: string, value: string | null, persistLongTerm = true): void {
  try {
    if (value === null) {
      sessionStorage.removeItem(key);
      localStorage.removeItem(key);
    } else {
      sessionStorage.setItem(key, value);
      if (persistLongTerm) {
        localStorage.setItem(key, value);
      } else {
        localStorage.removeItem(key);
      }
    }
  } catch {
    // ignore storage quota errors
  }
}

function getInitialPublicStoreParam(): string | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const storeParam = params.get('loja');
  return storeParam ? sanitizeId(storeParam, 'store') : null;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'CL';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase().slice(0, MAX_CUSTOMER_INITIALS);
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase().slice(0, MAX_CUSTOMER_INITIALS);
}

export const ComfyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialPublicStore = getInitialPublicStoreParam();

  const [currentUserRole, setCurrentUserRoleState] = useState<'store' | 'superadmin' | null>(() => {
    const saved = readPersistedValue('comfy_user_role');
    if (saved === 'store' || saved === 'superadmin') return saved;
    return null;
  });

  const [viewMode, setViewModeState] = useState<AppViewMode>(() => {
    if (initialPublicStore) return 'public-menu';
    const savedRole = readPersistedValue('comfy_user_role');
    const savedView = readPersistedValue('comfy_view_mode') as AppViewMode | null;
    if (savedRole === 'superadmin' && savedView === 'super-admin') return 'super-admin';
    if ((savedRole === 'store' || savedRole === 'superadmin') && savedView === 'dashboard') {
      return 'dashboard';
    }
    return 'landing';
  });

  const [activeTab, setActiveTab] = useState<DashboardTab>('visao-geral');
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [prefilledRegisterEmail, setPrefilledRegisterEmail] = useState('');
  const [isAuthReady] = useState(true);

  const [rememberSession, setRememberSession] = useState<boolean>(() => {
    return readPersistedValue('comfy_remember_me') !== 'false';
  });

  const setViewMode = useCallback(
    (mode: AppViewMode, rememberOverride?: boolean) => {
      const keep = rememberOverride ?? rememberSession;
      setViewModeState(mode);
      writePersistedValue('comfy_view_mode', mode, keep);
    },
    [rememberSession]
  );

  const setCurrentUserRole = useCallback(
    (role: 'store' | 'superadmin' | null, rememberOverride?: boolean) => {
      const keep = rememberOverride ?? rememberSession;
      setCurrentUserRoleState(role);
      writePersistedValue('comfy_user_role', role, keep);
    },
    [rememberSession]
  );

  const [storeDocsMap, setStoreDocsMap] = useState<Record<string, FirestoreStoreDoc>>({});
  const [storeAccountsMap, setStoreAccountsMap] = useState<Record<string, FirestoreStoreAccountDoc>>({});
  const [superAdminPassword, setSuperAdminPassword] = useState<string>(DEFAULT_SUPER_ADMIN_PASSWORD);
  const [currentStoreId, setCurrentStoreIdState] = useState<string>(() => {
    if (initialPublicStore) return initialPublicStore;
    const persisted = readPersistedValue('comfy_current_store_id') || '';
    if (LEGACY_DEMO_STORE_IDS.includes(persisted)) {
      writePersistedValue('comfy_current_store_id', null);
      return '';
    }
    return persisted;
  });

  const setCurrentStoreId = useCallback(
    (id: string, rememberOverride?: boolean) => {
      const keep = rememberOverride ?? rememberSession;
      setCurrentStoreIdState(id);
      writePersistedValue('comfy_current_store_id', id || null, keep);
    },
    [rememberSession]
  );

  const [rawOrders, setRawOrders] = useState<Array<{ id: string } & FirestoreOrderDoc>>([]);
  const [rawOrderItems, setRawOrderItems] = useState<Array<{ id: string } & FirestoreOrderItemDoc>>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const cloudInitRef = useRef(false);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3400);
  }, []);

  // Helper to completely remove a store, its subcollections, and its isolated account from Cloud Firestore
  const removeStoreCompletelyFromFirestore = useCallback(async (rawStoreId: string) => {
    const storeId = sanitizeId(rawStoreId, 'store');
    let currentPath = `stores/${storeId}`;
    try {
      const subcollections = ['orderItems', 'orders', 'products', 'customers'] as const;
      for (const subName of subcollections) {
        currentPath = `stores/${storeId}/${subName}`;
        const subQuery = query(
          collection(db, 'stores', storeId, subName),
          where('storeId', '==', storeId)
        );
        const snap = await getDocs(subQuery);
        if (!snap.empty) {
          const docs = snap.docs;
          for (let i = 0; i < docs.length; i += 5) {
            const batch = writeBatch(db);
            docs.slice(i, i + 5).forEach((d) => batch.delete(d.ref));
            await batch.commit();
          }
        }
      }

      currentPath = `stores/${storeId}`;
      const [storeSnap, accSnap] = await Promise.all([
        getDoc(doc(db, 'stores', storeId)),
        getDoc(doc(db, 'storeAccounts', storeId)),
      ]);

      if (storeSnap.exists() || accSnap.exists()) {
        const pairBatch = writeBatch(db);
        if (storeSnap.exists()) {
          pairBatch.delete(doc(db, 'stores', storeId));
        }
        if (accSnap.exists()) {
          pairBatch.delete(doc(db, 'storeAccounts', storeId));
        }
        await pairBatch.commit();
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, currentPath);
    }
  }, []);

  // Ensure Super Admin credential doc exists AND wipe any legacy auto-seeded demo stores (store-1..store-5)
  const ensureAdminAndPurgeDemoStores = useCallback(async () => {
    if (cloudInitRef.current) return;
    cloudInitRef.current = true;
    try {
      const adminRef = doc(db, 'adminSettings', 'superAdmin');
      const adminSnap = await getDoc(adminRef);
      if (!adminSnap.exists()) {
        const todayLabel = clampText(new Date().toLocaleDateString('pt-BR'), MAX_DATE_LABEL, 'Hoje');
        await setDoc(adminRef, {
          adminEmail: SUPER_ADMIN_EMAIL,
          adminPassword: DEFAULT_SUPER_ADMIN_PASSWORD,
          updatedAtLabel: todayLabel,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      // Remove legacy demo accounts if they were previously seeded into Firestore
      for (const demoId of LEGACY_DEMO_STORE_IDS) {
        const [sSnap, aSnap] = await Promise.all([
          getDoc(doc(db, 'stores', demoId)),
          getDoc(doc(db, 'storeAccounts', demoId)),
        ]);
        if (sSnap.exists() || aSnap.exists()) {
          await removeStoreCompletelyFromFirestore(demoId);
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'adminSettings/superAdmin');
    } finally {
      cloudInitRef.current = false;
    }
  }, [removeStoreCompletelyFromFirestore]);

  useEffect(() => {
    void ensureAdminAndPurgeDemoStores();
  }, [ensureAdminAndPurgeDemoStores]);

  // Real-time Stores & StoreAccounts synchronization
  useEffect(() => {
    // Super Admin: subscribe to all stores, storeAccounts & adminSettings globally
    if (currentUserRole === 'superadmin') {
      const allStoresQuery = query(
        collection(db, 'stores'),
        where('status', 'in', ['active', 'pending_approval', 'blocked'])
      );
      const unsubStores = onSnapshot(
        allStoresQuery,
        (snap) => {
          const nextMap: Record<string, FirestoreStoreDoc> = {};
          snap.forEach((d) => {
            if (!LEGACY_DEMO_STORE_IDS.includes(d.id)) {
              nextMap[d.id] = d.data() as FirestoreStoreDoc;
            }
          });
          setStoreDocsMap(nextMap);
        },
        (error) => handleFirestoreError(error, OperationType.LIST, 'stores')
      );

      const allAccountsQuery = query(collection(db, 'storeAccounts'), where('email', '>', ''));
      const unsubAccounts = onSnapshot(
        allAccountsQuery,
        (snap) => {
          const nextAcc: Record<string, FirestoreStoreAccountDoc> = {};
          snap.forEach((d) => {
            if (!LEGACY_DEMO_STORE_IDS.includes(d.id)) {
              nextAcc[d.id] = d.data() as FirestoreStoreAccountDoc;
            }
          });
          setStoreAccountsMap(nextAcc);
        },
        (error) => handleFirestoreError(error, OperationType.LIST, 'storeAccounts')
      );

      const unsubAdminSetting = onSnapshot(
        doc(db, 'adminSettings', 'superAdmin'),
        (snap) => {
          if (snap.exists()) {
            const data = snap.data() as { adminPassword?: string };
            if (data.adminPassword) {
              setSuperAdminPassword(data.adminPassword);
            }
          }
        },
        (error) => handleFirestoreError(error, OperationType.GET, 'adminSettings/superAdmin')
      );

      return () => {
        unsubStores();
        unsubAccounts();
        unsubAdminSetting();
      };
    }

    // Authenticated Store Owner: subscribe directly to their Store & StoreAccount documents
    if (currentUserRole === 'store' && currentStoreId) {
      const storeId = sanitizeId(currentStoreId, 'store');
      const unsubStore = onSnapshot(
        doc(db, 'stores', storeId),
        (snap) => {
          if (snap.exists()) {
            setStoreDocsMap({ [snap.id]: snap.data() as FirestoreStoreDoc });
          } else {
            setStoreDocsMap({});
          }
        },
        (error) => handleFirestoreError(error, OperationType.GET, `stores/${storeId}`)
      );

      const unsubAcc = onSnapshot(
        doc(db, 'storeAccounts', storeId),
        (snap) => {
          if (snap.exists()) {
            setStoreAccountsMap({ [snap.id]: snap.data() as FirestoreStoreAccountDoc });
          } else {
            setStoreAccountsMap({});
          }
        },
        (error) => handleFirestoreError(error, OperationType.GET, `storeAccounts/${storeId}`)
      );

      return () => {
        unsubStore();
        unsubAcc();
      };
    }

    // Public Menu visitor: subscribe only to the active storefront metadata
    if (viewMode === 'public-menu' && currentStoreId) {
      const storeId = sanitizeId(currentStoreId, 'store');
      const unsubPublicStore = onSnapshot(
        doc(db, 'stores', storeId),
        (snap) => {
          if (snap.exists()) {
            setStoreDocsMap({ [snap.id]: snap.data() as FirestoreStoreDoc });
          } else {
            setStoreDocsMap({});
          }
        },
        (error) => {
          console.warn('Public store unavailable:', error.message);
        }
      );
      return () => unsubPublicStore();
    }
  }, [currentUserRole, currentStoreId, viewMode]);

  // Combine storeDocsMap + storeAccountsMap into Store[] (100% faithful to Firestore)
  const stores: Store[] = useMemo(() => {
    const ids = Array.from(
      new Set([...Object.keys(storeDocsMap), ...Object.keys(storeAccountsMap)])
    ).filter((id) => !LEGACY_DEMO_STORE_IDS.includes(id));

    if (ids.length === 0) {
      return [];
    }

    return ids
      .map((id) => {
        const pub = storeDocsMap[id];
        const acc = storeAccountsMap[id];
        if (!pub && !acc) return null;

        return {
          id,
          ownerUid: pub?.ownerUid || acc?.ownerUid,
          name: pub?.name || '',
          ownerName: pub?.ownerDisplayName || '',
          phone: acc?.phone || '',
          email: acc?.email || '',
          city: pub?.city || '',
          status: pub?.status || 'pending_approval',
          createdAt: acc?.createdAtLabel || '',
          totalOrders: 0,
          monthlyRevenue: 0,
          plan: pub?.plan || 'Plano Profissional',
          segment: pub?.segment || 'Doceria & Confeitaria Artesanal',
          blockReason: acc?.blockReason || undefined,
          loginPassword: acc?.loginPassword || undefined,
          approvedAt: acc?.approvedAtLabel || undefined,
        } as Store;
      })
      .filter((s): s is Store => s !== null);
  }, [storeDocsMap, storeAccountsMap]);

  const emptyStore: Store = useMemo(
    () => ({
      id: '',
      ownerUid: '',
      name: '',
      ownerName: '',
      phone: '',
      email: '',
      city: '',
      status: 'active',
      createdAt: '',
      totalOrders: 0,
      monthlyRevenue: 0,
      plan: 'Plano Profissional',
      segment: 'Doceria & Confeitaria Artesanal',
    }),
    []
  );

  const matchedStore = useMemo(() => {
    if (currentStoreId) {
      const exact = stores.find((s) => s.id === currentStoreId);
      if (exact) return exact;
      if (viewMode === 'public-menu') return null;
    }
    return stores[0] || null;
  }, [stores, currentStoreId, viewMode]);

  const hasActiveStore = Boolean(matchedStore && matchedStore.id);
  const currentStore: Store = matchedStore || emptyStore;

  const storeProfile: StoreProfile = useMemo(() => {
    const acc = currentStore.id ? storeAccountsMap[currentStore.id] : undefined;
    return {
      name: currentStore.name,
      ownerName: currentStore.ownerName,
      plan: currentStore.plan,
      segment: currentStore.segment,
      city: currentStore.city,
      whatsapp: acc?.phone || currentStore.phone || '',
      pixKey: acc?.pixKey || currentStore.email || '',
    };
  }, [currentStore, storeAccountsMap]);

  // Real-time listeners for active store subcollections (products, orders, orderItems, customers)
  useEffect(() => {
    if (!currentStore.id) {
      setProducts([]);
      setRawOrders([]);
      setRawOrderItems([]);
      setCustomers([]);
      return;
    }

    const storeId = sanitizeId(currentStore.id, 'store');

    const isAuthorizedSession =
      currentUserRole === 'superadmin' ||
      (currentUserRole === 'store' && currentStoreId === storeId);

    if (!isAuthorizedSession) {
      if (viewMode === 'public-menu') {
        const activeProductsQuery = query(
          collection(db, 'stores', storeId, 'products'),
          where('active', '==', true)
        );
        const unsubPublicProducts = onSnapshot(
          activeProductsQuery,
          (snap) => {
            const list: Product[] = [];
            snap.forEach((d) => {
              const data = d.data();
              list.push({
                id: d.id,
                name: data.name,
                price: data.price,
                unit: data.unit,
                description: data.description,
                prepTimeHours: data.prepTimeHours,
                active: data.active,
                tag: data.tag || undefined,
                emoji: data.emoji || '🧁',
                imageUrl: data.imageUrl || undefined,
              });
            });
            setProducts(list);
          },
          (error) => handleFirestoreError(error, OperationType.LIST, `stores/${storeId}/products`)
        );
        return () => unsubPublicProducts();
      }

      setProducts([]);
      setRawOrders([]);
      setRawOrderItems([]);
      setCustomers([]);
      return;
    }

    const productsRef = query(
      collection(db, 'stores', storeId, 'products'),
      where('storeId', '==', storeId)
    );
    const ordersRef = query(
      collection(db, 'stores', storeId, 'orders'),
      where('storeId', '==', storeId)
    );
    const orderItemsRef = query(
      collection(db, 'stores', storeId, 'orderItems'),
      where('storeId', '==', storeId)
    );
    const customersRef = query(
      collection(db, 'stores', storeId, 'customers'),
      where('storeId', '==', storeId)
    );

    const unsubProducts = onSnapshot(
      productsRef,
      (snap) => {
        const list: Product[] = [];
        snap.forEach((d) => {
          const data = d.data();
          list.push({
            id: d.id,
            name: data.name,
            price: data.price,
            unit: data.unit,
            description: data.description,
            prepTimeHours: data.prepTimeHours,
            active: data.active,
            tag: data.tag || undefined,
            emoji: data.emoji || '🧁',
            imageUrl: data.imageUrl || undefined,
          });
        });
        setProducts(list);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, `stores/${storeId}/products`)
    );

    const unsubOrders = onSnapshot(
      ordersRef,
      (snap) => {
        const list: Array<{ id: string } & FirestoreOrderDoc> = [];
        snap.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as FirestoreOrderDoc) });
        });
        list.sort((a, b) => b.createdAtIso.localeCompare(a.createdAtIso));
        setRawOrders(list);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, `stores/${storeId}/orders`)
    );

    const unsubOrderItems = onSnapshot(
      orderItemsRef,
      (snap) => {
        const list: Array<{ id: string } & FirestoreOrderItemDoc> = [];
        snap.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as FirestoreOrderItemDoc) });
        });
        setRawOrderItems(list);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, `stores/${storeId}/orderItems`)
    );

    const unsubCustomers = onSnapshot(
      customersRef,
      (snap) => {
        const list: Customer[] = [];
        snap.forEach((d) => {
          const data = d.data();
          list.push({
            id: d.id,
            name: data.name,
            initials: data.initials,
            phone: data.phone,
            email: data.email,
            address: data.address || undefined,
            notes: data.notes || undefined,
            favoriteItem: data.favoriteItem || undefined,
            totalOrders: data.totalOrders,
            totalSpent: data.totalSpent,
            lastOrderDate: data.lastOrderDate,
          });
        });
        setCustomers(list);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, `stores/${storeId}/customers`)
    );

    return () => {
      unsubProducts();
      unsubOrders();
      unsubOrderItems();
      unsubCustomers();
    };
  }, [currentUserRole, currentStoreId, currentStore.id, viewMode]);

  // Join orders + orderItems into Order[]
  const orders: Order[] = useMemo(() => {
    const itemsByOrder: Record<string, OrderItem[]> = {};
    for (const item of rawOrderItems) {
      if (!itemsByOrder[item.orderId]) {
        itemsByOrder[item.orderId] = [];
      }
      itemsByOrder[item.orderId].push({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      });
    }

    return rawOrders.map((ord) => ({
      id: ord.id,
      orderNumber: ord.orderNumber,
      customerName: ord.customerName,
      customerPhone: ord.customerPhone,
      customerInitials: ord.customerInitials,
      items: itemsByOrder[ord.id] || [],
      totalAmount: ord.totalAmount,
      status: ord.status,
      deliveryDate: ord.deliveryDate,
      deliveryType: ord.deliveryType,
      paymentStatus: ord.paymentStatus,
      createdAt: ord.createdAtIso,
      notes: ord.notes || undefined,
    }));
  }, [rawOrders, rawOrderItems]);

  const verifyOrInitSuperAdminPassword = useCallback(async (candidatePassword: string): Promise<boolean> => {
    const cleanPass = candidatePassword.trim();
    if (cleanPass.length < MIN_PASSWORD || cleanPass.length > MAX_PASSWORD) {
      return false;
    }

    const adminRef = doc(db, 'adminSettings', 'superAdmin');
    try {
      const snap = await getDoc(adminRef);
      if (snap.exists()) {
        const data = snap.data() as { adminPassword?: string };
        const storedPass = data.adminPassword || DEFAULT_SUPER_ADMIN_PASSWORD;

        if (cleanPass === storedPass) {
          setSuperAdminPassword(storedPass);
          return true;
        }

        if (cleanPass === DEFAULT_SUPER_ADMIN_PASSWORD && storedPass === LEGACY_SUPER_ADMIN_PASSWORD) {
          const todayLabel = clampText(new Date().toLocaleDateString('pt-BR'), MAX_DATE_LABEL, 'Hoje');
          await updateDoc(adminRef, {
            adminPassword: DEFAULT_SUPER_ADMIN_PASSWORD,
            updatedAtLabel: todayLabel,
            updatedAt: serverTimestamp(),
          });
          setSuperAdminPassword(DEFAULT_SUPER_ADMIN_PASSWORD);
          return true;
        }

        return false;
      }

      if (cleanPass !== DEFAULT_SUPER_ADMIN_PASSWORD) {
        return false;
      }

      const todayLabel = clampText(new Date().toLocaleDateString('pt-BR'), MAX_DATE_LABEL, 'Hoje');
      await setDoc(adminRef, {
        adminEmail: SUPER_ADMIN_EMAIL,
        adminPassword: DEFAULT_SUPER_ADMIN_PASSWORD,
        updatedAtLabel: todayLabel,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setSuperAdminPassword(DEFAULT_SUPER_ADMIN_PASSWORD);
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'adminSettings/superAdmin');
    }
  }, []);

  const updateSuperAdminPassword = useCallback(
    async (newPassword: string): Promise<boolean> => {
      const cleanPass = newPassword.trim();
      if (cleanPass.length < MIN_PASSWORD || cleanPass.length > MAX_PASSWORD) {
        showToast(`A senha deve ter entre ${MIN_PASSWORD} e ${MAX_PASSWORD} caracteres.`);
        return false;
      }

      if (currentUserRole !== 'superadmin') {
        showToast('Apenas o Super Administrador pode alterar esta senha.');
        return false;
      }

      const adminRef = doc(db, 'adminSettings', 'superAdmin');
      const todayLabel = clampText(new Date().toLocaleDateString('pt-BR'), MAX_DATE_LABEL, 'Hoje');
      const boundedPass = clampText(cleanPass, MAX_PASSWORD, DEFAULT_SUPER_ADMIN_PASSWORD);

      try {
        const existingSnap = await getDoc(adminRef);
        if (existingSnap.exists()) {
          await updateDoc(adminRef, {
            adminPassword: boundedPass,
            updatedAtLabel: todayLabel,
            updatedAt: serverTimestamp(),
          });
        } else {
          await setDoc(adminRef, {
            adminEmail: SUPER_ADMIN_EMAIL,
            adminPassword: boundedPass,
            updatedAtLabel: todayLabel,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }

        setSuperAdminPassword(boundedPass);
        showToast('Senha do Super Administrador salva na nuvem com sucesso! 🔐');
        return true;
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, 'adminSettings/superAdmin');
      }
    },
    [currentUserRole, showToast]
  );

  const loginAsSuperAdmin = useCallback(
    async (
      userInput: string,
      passInput: string,
      rememberMe = true
    ): Promise<{ success: boolean; message: string }> => {
      const cleanUser = userInput.trim().toLowerCase();
      const cleanPass = passInput.trim();

      if (cleanUser !== SUPER_ADMIN_EMAIL.toLowerCase()) {
        return {
          success: false,
          message: `Informe o e-mail administrador autorizado (${SUPER_ADMIN_EMAIL}).`,
        };
      }

      if (cleanPass.length < MIN_PASSWORD) {
        return {
          success: false,
          message: 'Digite a senha de Super Administrador.',
        };
      }

      const isPassValid = await verifyOrInitSuperAdminPassword(cleanPass);
      if (!isPassValid) {
        return {
          success: false,
          message: 'Senha de Super Administrador incorreta. Verifique a senha e tente novamente.',
        };
      }

      setRememberSession(rememberMe);
      writePersistedValue('comfy_remember_me', String(rememberMe), true);
      await ensureAdminAndPurgeDemoStores();
      setCurrentUserRole('superadmin', rememberMe);
      setViewMode('super-admin', rememberMe);
      showToast('Acesso de Super Administrador autenticado! 👑');
      return { success: true, message: 'Autenticado com sucesso!' };
    },
    [
      ensureAdminAndPurgeDemoStores,
      setCurrentUserRole,
      setViewMode,
      showToast,
      verifyOrInitSuperAdminPassword,
    ]
  );

  const loginWithCredentials = useCallback(
    async (emailInput: string, passInput: string, rememberMe = true): Promise<LoginResult> => {
      const cleanEmail = emailInput.trim().toLowerCase();
      const cleanPass = passInput.trim();

      if (cleanEmail === SUPER_ADMIN_EMAIL.toLowerCase()) {
        const adminRes = await loginAsSuperAdmin(cleanEmail, cleanPass, rememberMe);
        return {
          success: adminRes.success,
          message: adminRes.message,
        };
      }

      try {
        const q = query(collection(db, 'storeAccounts'), where('email', '==', cleanEmail));
        const accSnap = await getDocs(q);
        const validDocs = accSnap.docs.filter((d) => !LEGACY_DEMO_STORE_IDS.includes(d.id));

        if (validDocs.length === 0) {
          setPrefilledRegisterEmail(cleanEmail);
          return {
            success: false,
            notRegistered: true,
            email: cleanEmail,
            message: `Nenhuma doceria encontrada para ${cleanEmail}. Deseja cadastrar sua doceria agora?`,
          };
        }

        const accDoc = validDocs[0];
        const accData = accDoc.data() as FirestoreStoreAccountDoc;
        const storeId = accDoc.id;

        const storeSnap = await getDoc(doc(db, 'stores', storeId));
        if (!storeSnap.exists()) {
          return {
            success: false,
            notRegistered: true,
            email: cleanEmail,
            message: 'Cadastro da doceria não localizado. Cadastre sua loja novamente.',
          };
        }

        const storeData = storeSnap.data() as FirestoreStoreDoc;

        if (storeData.status === 'pending_approval') {
          return {
            success: false,
            pendingApproval: true,
            message:
              'Seu cadastro ainda está em análise pela equipe da Comfy! Em breve sua senha de acesso será enviada no WhatsApp.',
          };
        }

        if (storeData.status === 'blocked') {
          return {
            success: false,
            blocked: true,
            message:
              'Acesso bloqueado temporariamente pela administração da Comfy. Entre em contato com o suporte.',
          };
        }

        if (!accData.loginPassword || accData.loginPassword !== cleanPass) {
          return {
            success: false,
            message:
              'Senha incorreta. Verifique a senha enviada no seu WhatsApp ou clique em "Esqueceu a senha?".',
          };
        }

        setRememberSession(rememberMe);
        writePersistedValue('comfy_remember_me', String(rememberMe), true);
        setStoreDocsMap({ [storeId]: storeData });
        setStoreAccountsMap({ [storeId]: accData });
        setCurrentStoreId(storeId, rememberMe);
        setCurrentUserRole('store', rememberMe);
        setViewMode('dashboard', rememberMe);
        showToast(`Bem-vinda de volta, ${storeData.ownerDisplayName}! 🧁`);
        return { success: true, message: 'Login realizado com sucesso!' };
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'storeAccounts');
      }
    },
    [loginAsSuperAdmin, setCurrentStoreId, setCurrentUserRole, setViewMode, showToast]
  );

  const recoverPassword = useCallback(async (emailOrPhone: string) => {
    const queryText = emailOrPhone.trim().toLowerCase();
    try {
      const isEmailQuery = queryText.includes('@');
      const formattedPhone = formatPhone11(extractPhoneDigits(queryText));

      if (!isEmailQuery && !formattedPhone) {
        return {
          success: false,
          message: 'Informe um e-mail ou número de WhatsApp válido.',
        };
      }

      const q = isEmailQuery
        ? query(collection(db, 'storeAccounts'), where('email', '==', queryText))
        : query(collection(db, 'storeAccounts'), where('phone', '==', formattedPhone));

      const snap = await getDocs(q);
      const validDocs = snap.docs.filter((d) => !LEGACY_DEMO_STORE_IDS.includes(d.id));

      if (validDocs.length === 0) {
        return {
          success: false,
          message: `Nenhuma doceria encontrada vinculada a "${emailOrPhone.trim()}".`,
        };
      }

      const accDoc = validDocs[0];
      const accData = accDoc.data() as FirestoreStoreAccountDoc;
      const storeSnap = await getDoc(doc(db, 'stores', accDoc.id));
      const storeData = storeSnap.exists() ? (storeSnap.data() as FirestoreStoreDoc) : null;

      if (storeData?.status === 'pending_approval') {
        return {
          success: false,
          message:
            'Seu cadastro ainda está em análise! A senha será gerada e enviada pelo administrador em breve.',
        };
      }

      const recoveredStore: Store = {
        id: accDoc.id,
        name: storeData?.name || 'Sua Doceria',
        ownerName: storeData?.ownerDisplayName || 'Confeiteira',
        phone: accData.phone,
        email: accData.email,
        city: storeData?.city || 'São Paulo, SP',
        status: storeData?.status || 'active',
        createdAt: accData.createdAtLabel,
        totalOrders: 0,
        monthlyRevenue: 0,
        plan: storeData?.plan || 'Plano Profissional',
        segment: storeData?.segment || 'Doceria Artesanal',
        loginPassword: accData.loginPassword,
      };

      return {
        success: true,
        message: `Dados de acesso localizados para ${recoveredStore.name}!`,
        store: recoveredStore,
        tempPass: accData.loginPassword || 'Aguardando geração de senha pelo administrador',
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'storeAccounts');
    }
  }, []);

  const logout = useCallback(async () => {
    writePersistedValue('comfy_user_role', null);
    writePersistedValue('comfy_view_mode', 'landing');
    writePersistedValue('comfy_current_store_id', null);
    setCurrentUserRoleState(null);
    setViewModeState('landing');
    setCurrentStoreIdState('');
    setStoreDocsMap({});
    setStoreAccountsMap({});
    setProducts([]);
    setRawOrders([]);
    setRawOrderItems([]);
    setCustomers([]);
    showToast('Você saiu da sua conta. Até logo! 👋');
  }, [showToast]);

  const addStore = useCallback(
    async (
      data: {
        name: string;
        ownerName: string;
        phone: string;
        email: string;
        city?: string;
      },
      asActive = false
    ): Promise<Store | null> => {
      const effectiveEmail = data.email.trim().toLowerCase();
      const isAdminCreation = currentUserRole === 'superadmin' && asActive;

      const storeId = sanitizeId(`store-${Date.now()}`, 'store');
      const ownerUid = isAdminCreation ? 'comfy-admin' : storeId;
      const status: 'active' | 'pending_approval' = isAdminCreation ? 'active' : 'pending_approval';
      const generatedPassword =
        status === 'active' ? `Comfy@${Math.floor(1000 + Math.random() * 9000)}` : '';
      const todayLabel = new Date().toLocaleDateString('pt-BR');

      const storeDoc = {
        ownerUid,
        name: clampText(data.name, MAX_STORE_NAME, 'Nova Doceria'),
        ownerDisplayName: clampText(data.ownerName, MAX_OWNER_NAME, 'Confeiteira'),
        city: clampText(data.city || 'São Paulo, SP', MAX_CITY, 'São Paulo, SP'),
        segment: clampText('Doceria & Confeitaria Artesanal', MAX_SEGMENT, 'Doceria Artesanal'),
        plan: clampText('Plano Profissional', MAX_PLAN, 'Plano Profissional'),
        status,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const accountDoc = {
        storeId,
        ownerUid,
        email: clampText(effectiveEmail, MAX_EMAIL, 'contato@gmail.com'),
        phone: clampText(
          formatPhone11(data.phone) || '(11) 98765-4321',
          MAX_PHONE_FORMATTED,
          '(11) 98765-4321'
        ),
        pixKey: clampText(effectiveEmail, MAX_PIX_KEY, ''),
        loginPassword: clampText(generatedPassword, MAX_PASSWORD, ''),
        blockReason: '',
        createdAtLabel: clampText(todayLabel, MAX_DATE_LABEL, todayLabel),
        approvedAtLabel: status === 'active' ? clampText(todayLabel, MAX_DATE_LABEL, todayLabel) : '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      try {
        const batch = writeBatch(db);
        batch.set(doc(db, 'stores', storeId), storeDoc);
        batch.set(doc(db, 'storeAccounts', storeId), accountDoc);
        await batch.commit();

        if (status === 'active') {
          showToast(`Loja "${storeDoc.name}" cadastrada na nuvem com sucesso! ✨`);
        } else {
          showToast(`Cadastro da doceria "${storeDoc.name}" salvo e enviado para análise!`);
        }

        return {
          id: storeId,
          ownerUid,
          name: storeDoc.name,
          ownerName: storeDoc.ownerDisplayName,
          phone: accountDoc.phone,
          email: accountDoc.email,
          city: storeDoc.city,
          status,
          createdAt: todayLabel,
          totalOrders: 0,
          monthlyRevenue: 0,
          plan: storeDoc.plan,
          segment: storeDoc.segment,
          loginPassword: generatedPassword || undefined,
        };
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `stores/${storeId}`);
      }
    },
    [currentUserRole, showToast]
  );

  const deleteStore = useCallback(
    async (storeId: string): Promise<void> => {
      if (currentUserRole !== 'superadmin') return;
      const target = stores.find((s) => s.id === storeId);
      await removeStoreCompletelyFromFirestore(storeId);
      if (currentStoreId === storeId) {
        setCurrentStoreId('');
      }
      showToast(
        target
          ? `Doceria "${target.name}" excluída permanentemente do banco de dados.`
          : 'Doceria excluída do banco de dados.'
      );
    },
    [currentUserRole, stores, removeStoreCompletelyFromFirestore, currentStoreId, setCurrentStoreId, showToast]
  );

  const approveAndGeneratePassword = useCallback(
    async (storeId: string, customPassword?: string): Promise<string> => {
      const generatedPassword = clampText(
        customPassword?.trim() || `Comfy@${Math.floor(1000 + Math.random() * 9000)}`,
        MAX_PASSWORD,
        'Comfy@2026'
      );
      const todayLabel = clampText(new Date().toLocaleDateString('pt-BR'), MAX_DATE_LABEL, 'Hoje');

      try {
        const batch = writeBatch(db);
        batch.update(doc(db, 'stores', storeId), {
          status: 'active',
          updatedAt: serverTimestamp(),
        });
        batch.update(doc(db, 'storeAccounts', storeId), {
          loginPassword: generatedPassword,
          approvedAtLabel: todayLabel,
          blockReason: '',
          updatedAt: serverTimestamp(),
        });
        await batch.commit();

        showToast(`Loja aprovada e senha ${generatedPassword} salva na nuvem! 🔑`);
        return generatedPassword;
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `stores/${storeId}`);
      }
    },
    [showToast]
  );

  const toggleStoreBlockStatus = useCallback(
    async (storeId: string): Promise<void> => {
      const target = stores.find((s) => s.id === storeId);
      if (!target) return;

      const nextStatus = target.status === 'active' ? 'blocked' : 'active';
      const nextReason =
        nextStatus === 'blocked'
          ? clampText(
              'Acesso suspenso temporariamente pela administração da Comfy.',
              MAX_BLOCK_REASON,
              ''
            )
          : '';

      try {
        const batch = writeBatch(db);
        batch.update(doc(db, 'stores', storeId), {
          status: nextStatus,
          updatedAt: serverTimestamp(),
        });
        batch.update(doc(db, 'storeAccounts', storeId), {
          blockReason: nextReason,
          updatedAt: serverTimestamp(),
        });
        await batch.commit();

        showToast(
          nextStatus === 'blocked'
            ? `Acesso da loja "${target.name}" BLOQUEADO.`
            : `Loja "${target.name}" DESBLOQUEADA com sucesso.`
        );
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `stores/${storeId}`);
      }
    },
    [stores, showToast]
  );

  const switchStore = useCallback(
    (storeId: string) => {
      const target = stores.find((s) => s.id === storeId);
      if (!target) return;
      setCurrentStoreId(target.id);
      setViewMode('dashboard');
      showToast(`Visualizando painel da loja: ${target.name}`);
    },
    [stores, setCurrentStoreId, setViewMode, showToast]
  );

  const addOrder = useCallback(
    async (orderData: {
      customerName: string;
      customerPhone: string;
      items: { productId: string; quantity: number }[];
      deliveryDate: string;
      deliveryType: 'retirada' | 'entrega';
      paymentStatus: 'pago' | 'pendente' | '50_sinal';
      notes?: string;
    }): Promise<boolean> => {
      if (!currentStore.id) {
        showToast('Nenhuma loja ativa selecionada.');
        return false;
      }

      const storeId = sanitizeId(currentStore.id, 'store');
      const targetOwnerUid = sanitizeId(currentStore.ownerUid || storeId, 'store');
      const creatorUid =
        currentUserRole === 'superadmin'
          ? 'comfy-admin'
          : currentUserRole === 'store'
          ? targetOwnerUid
          : 'public-customer';

      const fullItems = orderData.items.map((item) => {
        const prod = products.find((p) => p.id === item.productId);
        return {
          productId: sanitizeId(item.productId, 'prod'),
          productName: clampText(prod ? prod.name : 'Produto', MAX_CUSTOMER_NAME, 'Produto'),
          quantity: clampNumber(item.quantity, 1, 10000),
          unitPrice: clampNumber(prod ? prod.price : 0, 0, 100000),
        };
      });

      const totalAmount = clampNumber(
        fullItems.reduce((acc, curr) => acc + curr.quantity * curr.unitPrice, 0),
        0,
        1000000
      );

      const nextOrderNum = clampText(`#${1001 + orders.length}`, MAX_ORDER_NUMBER, '#1001');
      const orderId = sanitizeId(`ord-${Date.now()}`, 'ord');
      const cleanCustomerName = clampText(orderData.customerName, MAX_CUSTOMER_NAME, 'Cliente');

      try {
        const firstBatch = writeBatch(db);
        firstBatch.set(doc(db, 'stores', storeId, 'orders', orderId), {
          storeId,
          ownerUid: targetOwnerUid,
          createdByUid: creatorUid,
          orderNumber: nextOrderNum,
          customerName: cleanCustomerName,
          customerPhone: clampText(orderData.customerPhone, MAX_CUSTOMER_PHONE, ''),
          customerInitials: getInitials(cleanCustomerName),
          totalAmount,
          status: 'in_production',
          deliveryDate: clampText(orderData.deliveryDate || 'Hoje', MAX_DELIVERY_DATE, 'Hoje'),
          deliveryType: orderData.deliveryType,
          paymentStatus: orderData.paymentStatus,
          notes: clampText(orderData.notes ?? '', MAX_ORDER_NOTES, ''),
          createdAtIso: clampText(new Date().toISOString(), MAX_ISO_DATE, new Date().toISOString()),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        const initialChunk = fullItems.slice(0, 4);
        initialChunk.forEach((it, idx) => {
          const itemId = sanitizeId(`${orderId}-item-${idx + 1}`, 'item');
          firstBatch.set(doc(db, 'stores', storeId, 'orderItems', itemId), {
            storeId,
            orderId,
            ownerUid: targetOwnerUid,
            createdByUid: creatorUid,
            productId: it.productId,
            productName: it.productName,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        });
        await firstBatch.commit();

        for (let i = 4; i < fullItems.length; i += 4) {
          const extraBatch = writeBatch(db);
          fullItems.slice(i, i + 4).forEach((it, offset) => {
            const idx = i + offset;
            const itemId = sanitizeId(`${orderId}-item-${idx + 1}`, 'item');
            extraBatch.set(doc(db, 'stores', storeId, 'orderItems', itemId), {
              storeId,
              orderId,
              ownerUid: targetOwnerUid,
              createdByUid: creatorUid,
              productId: it.productId,
              productName: it.productName,
              quantity: it.quantity,
              unitPrice: it.unitPrice,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          });
          await extraBatch.commit();
        }

        const canManageCrm = currentUserRole === 'superadmin' || currentUserRole === 'store';
        if (canManageCrm) {
          const existingCust = customers.find(
            (c) => c.name.toLowerCase() === cleanCustomerName.toLowerCase()
          );
          if (existingCust) {
            await updateDoc(doc(db, 'stores', storeId, 'customers', existingCust.id), {
              totalOrders: clampNumber(existingCust.totalOrders + 1, 0, 100000),
              totalSpent: clampNumber(existingCust.totalSpent + totalAmount, 0, 10000000),
              lastOrderDate: 'Hoje',
              updatedAt: serverTimestamp(),
            });
          } else {
            const custId = sanitizeId(`cust-${Date.now()}`, 'cust');
            const defaultEmail = `${cleanCustomerName.toLowerCase().replace(/[^a-z0-9]+/g, '.')}@email.com`;
            await setDoc(doc(db, 'stores', storeId, 'customers', custId), {
              storeId,
              ownerUid: targetOwnerUid,
              name: cleanCustomerName,
              initials: getInitials(cleanCustomerName),
              phone: clampText(orderData.customerPhone, MAX_CUSTOMER_PHONE, ''),
              email: clampText(defaultEmail, MAX_CUSTOMER_EMAIL, ''),
              address: '',
              notes: '',
              favoriteItem: clampText(fullItems[0]?.productName ?? '', MAX_CUSTOMER_FAVORITE, ''),
              totalOrders: 1,
              totalSpent: totalAmount,
              lastOrderDate: 'Hoje',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
        }

        showToast(`Pedido ${nextOrderNum} salvo na nuvem! ✨`);
        setIsNewOrderModalOpen(false);
        return true;
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `stores/${storeId}/orders/${orderId}`);
      }
    },
    [
      currentStore.id,
      currentStore.ownerUid,
      currentUserRole,
      products,
      orders.length,
      customers,
      showToast,
    ]
  );

  const updateOrderStatus = useCallback(
    async (orderId: string, status: OrderStatus): Promise<void> => {
      if (!currentStore.id) return;
      const storeId = sanitizeId(currentStore.id, 'store');
      const existingOrder = rawOrders.find((o) => o.id === orderId);
      if (existingOrder?.status === 'delivered') {
        showToast('Este pedido já foi concluído e entregue.');
        return;
      }
      try {
        await updateDoc(doc(db, 'stores', storeId, 'orders', orderId), {
          status,
          updatedAt: serverTimestamp(),
        });
        const statusLabels: Record<OrderStatus, string> = {
          in_production: 'Em produção',
          ready: 'Pronto p/ retirada/entrega',
          delivered: 'Entregue / Concluído',
          pending: 'Pendente',
        };
        showToast(`Status atualizado para: ${statusLabels[status]}`);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `stores/${storeId}/orders/${orderId}`);
      }
    },
    [currentStore.id, rawOrders, showToast]
  );

  const deleteOrder = useCallback(
    async (orderId: string): Promise<void> => {
      if (!currentStore.id) return;
      const storeId = sanitizeId(currentStore.id, 'store');
      try {
        const batch = writeBatch(db);
        batch.delete(doc(db, 'stores', storeId, 'orders', orderId));
        rawOrderItems
          .filter((item) => item.orderId === orderId)
          .forEach((item) => {
            batch.delete(doc(db, 'stores', storeId, 'orderItems', item.id));
          });
        await batch.commit();
        showToast('Pedido removido.');
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `stores/${storeId}/orders/${orderId}`);
      }
    },
    [currentStore.id, rawOrderItems, showToast]
  );

  const addProduct = useCallback(
    async (productData: Omit<Product, 'id'>): Promise<void> => {
      if (!currentStore.id) return;
      const storeId = sanitizeId(currentStore.id, 'store');
      const ownerUid = sanitizeId(currentStore.ownerUid || storeId, 'store');
      const prodId = sanitizeId(`prod-${Date.now()}`, 'prod');

      try {
        const batch = writeBatch(db);
        batch.set(doc(db, 'stores', storeId, 'products', prodId), {
          storeId,
          ownerUid,
          name: clampText(productData.name, MAX_PRODUCT_NAME, 'Novo Doce'),
          price: clampNumber(productData.price, 0, 100000),
          unit: clampText(productData.unit, MAX_PRODUCT_UNIT, 'unidade'),
          description: clampText(productData.description, MAX_PRODUCT_DESC, ''),
          prepTimeHours: clampNumber(productData.prepTimeHours, 0, 720),
          active: Boolean(productData.active),
          tag: clampText(productData.tag ?? '', MAX_PRODUCT_TAG, ''),
          emoji: clampText(productData.emoji ?? '🧁', MAX_PRODUCT_EMOJI, '🧁'),
          imageUrl: clampText(productData.imageUrl ?? '', MAX_PRODUCT_IMAGE_URL, ''),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        await batch.commit();
        showToast(`Doce "${productData.name}" salvo no catálogo na nuvem!`);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `stores/${storeId}/products/${prodId}`);
      }
    },
    [currentStore.id, currentStore.ownerUid, showToast]
  );

  const updateProduct = useCallback(
    async (updated: Product): Promise<void> => {
      if (!currentStore.id) return;
      const storeId = sanitizeId(currentStore.id, 'store');
      try {
        await updateDoc(doc(db, 'stores', storeId, 'products', updated.id), {
          name: clampText(updated.name, MAX_PRODUCT_NAME, 'Doce'),
          price: clampNumber(updated.price, 0, 100000),
          unit: clampText(updated.unit, MAX_PRODUCT_UNIT, 'unidade'),
          description: clampText(updated.description, MAX_PRODUCT_DESC, ''),
          prepTimeHours: clampNumber(updated.prepTimeHours, 0, 720),
          active: Boolean(updated.active),
          tag: clampText(updated.tag ?? '', MAX_PRODUCT_TAG, ''),
          emoji: clampText(updated.emoji ?? '🧁', MAX_PRODUCT_EMOJI, '🧁'),
          imageUrl: clampText(updated.imageUrl ?? '', MAX_PRODUCT_IMAGE_URL, ''),
          updatedAt: serverTimestamp(),
        });
        showToast(`"${updated.name}" atualizado na nuvem.`);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `stores/${storeId}/products/${updated.id}`);
      }
    },
    [currentStore.id, showToast]
  );

  const toggleProductStatus = useCallback(
    async (productId: string): Promise<void> => {
      if (!currentStore.id) return;
      const storeId = sanitizeId(currentStore.id, 'store');
      const prod = products.find((p) => p.id === productId);
      if (!prod) return;
      try {
        await updateDoc(doc(db, 'stores', storeId, 'products', productId), {
          active: !prod.active,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `stores/${storeId}/products/${productId}`);
      }
    },
    [currentStore.id, products]
  );

  const addCustomer = useCallback(
    async (customerData: {
      name: string;
      phone: string;
      email: string;
      address?: string;
      notes?: string;
    }): Promise<void> => {
      if (!currentStore.id) return;
      const storeId = sanitizeId(currentStore.id, 'store');
      const ownerUid = sanitizeId(currentStore.ownerUid || storeId, 'store');
      const custId = sanitizeId(`cust-${Date.now()}`, 'cust');
      const cleanName = clampText(customerData.name, MAX_CUSTOMER_NAME, 'Cliente');

      try {
        const batch = writeBatch(db);
        batch.set(doc(db, 'stores', storeId, 'customers', custId), {
          storeId,
          ownerUid,
          name: cleanName,
          initials: getInitials(cleanName),
          phone: clampText(customerData.phone, MAX_CUSTOMER_PHONE, ''),
          email: clampText(customerData.email, MAX_CUSTOMER_EMAIL, ''),
          address: clampText(customerData.address ?? '', MAX_CUSTOMER_ADDRESS, ''),
          notes: clampText(customerData.notes ?? '', MAX_CUSTOMER_NOTES, ''),
          favoriteItem: '',
          totalOrders: 0,
          totalSpent: 0,
          lastOrderDate: 'Novo cliente',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        await batch.commit();
        showToast(`Cliente ${cleanName} salvo na nuvem com sucesso!`);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `stores/${storeId}/customers/${custId}`);
      }
    },
    [currentStore.id, currentStore.ownerUid, showToast]
  );

  const updateStoreProfile = useCallback(
    async (profileUpdate: Partial<StoreProfile>): Promise<void> => {
      if (!currentStore.id) return;
      const storeId = sanitizeId(currentStore.id, 'store');
      try {
        const batch = writeBatch(db);

        const storeChanges: Record<string, unknown> = {
          updatedAt: serverTimestamp(),
        };
        if (profileUpdate.name !== undefined) {
          storeChanges.name = clampText(profileUpdate.name, MAX_STORE_NAME, currentStore.name || 'Doceria');
        }
        if (profileUpdate.ownerName !== undefined) {
          storeChanges.ownerDisplayName = clampText(
            profileUpdate.ownerName,
            MAX_OWNER_NAME,
            currentStore.ownerName || 'Responsável'
          );
        }
        if (profileUpdate.city !== undefined) {
          storeChanges.city = clampText(profileUpdate.city, MAX_CITY, currentStore.city || 'São Paulo, SP');
        }
        if (profileUpdate.segment !== undefined) {
          storeChanges.segment = clampText(
            profileUpdate.segment,
            MAX_SEGMENT,
            currentStore.segment || 'Doceria Artesanal'
          );
        }
        batch.update(doc(db, 'stores', storeId), storeChanges);

        const accountChanges: Record<string, unknown> = {
          updatedAt: serverTimestamp(),
        };
        if (profileUpdate.whatsapp !== undefined) {
          accountChanges.phone = clampText(
            formatPhone11(profileUpdate.whatsapp) || storeProfile.whatsapp || '(11) 98765-4321',
            MAX_PHONE_FORMATTED,
            '(11) 98765-4321'
          );
        }
        if (profileUpdate.pixKey !== undefined) {
          accountChanges.pixKey = clampText(profileUpdate.pixKey, MAX_PIX_KEY, '');
        }
        batch.update(doc(db, 'storeAccounts', storeId), accountChanges);

        await batch.commit();
        showToast('Preferências salvas na nuvem com sucesso.');
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `stores/${storeId}`);
      }
    },
    [currentStore, storeProfile.whatsapp, showToast]
  );

  // Clears all store subcollection records in Firestore to zero (never inserts fake demo items)
  const resetAllData = useCallback(async (): Promise<void> => {
    if (!currentStore.id) return;
    const storeId = sanitizeId(currentStore.id, 'store');

    try {
      const refsToDelete = [
        ...rawOrderItems.map((i) => doc(db, 'stores', storeId, 'orderItems', i.id)),
        ...rawOrders.map((o) => doc(db, 'stores', storeId, 'orders', o.id)),
        ...products.map((p) => doc(db, 'stores', storeId, 'products', p.id)),
        ...customers.map((c) => doc(db, 'stores', storeId, 'customers', c.id)),
      ];

      for (let i = 0; i < refsToDelete.length; i += 5) {
        const delBatch = writeBatch(db);
        refsToDelete.slice(i, i + 5).forEach((ref) => delBatch.delete(ref));
        await delBatch.commit();
      }

      showToast('Catálogo, pedidos e clientes desta loja foram zerados no banco de dados.');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `stores/${storeId}`);
    }
  }, [currentStore.id, products, rawOrders, rawOrderItems, customers, showToast]);

  // Dynamic Cloud Metrics per Store (100% faithful to Firestore)
  const monthlyRevenue = useMemo(
    () => orders.reduce((sum, o) => sum + o.totalAmount, 0),
    [orders]
  );
  const totalOrdersCount = orders.length;
  const averageTicket = totalOrdersCount > 0 ? monthlyRevenue / totalOrdersCount : 0;
  const pendingOrdersCount = useMemo(
    () =>
      orders.filter(
        (o) => o.status === 'in_production' || o.status === 'ready' || o.status === 'pending'
      ).length,
    [orders]
  );

  const salesWeek: SalesDay[] = useMemo(() => {
    if (orders.length === 0) {
      return EMPTY_WEEK_TEMPLATE;
    }

    const dayMap = [
      { day: 'dom', fullName: 'Domingo', amount: 0, ordersCount: 0 },
      { day: 'seg', fullName: 'Segunda-feira', amount: 0, ordersCount: 0 },
      { day: 'ter', fullName: 'Terça-feira', amount: 0, ordersCount: 0 },
      { day: 'qua', fullName: 'Quarta-feira', amount: 0, ordersCount: 0 },
      { day: 'qui', fullName: 'Quinta-feira', amount: 0, ordersCount: 0 },
      { day: 'sex', fullName: 'Sexta-feira', amount: 0, ordersCount: 0 },
      { day: 'sáb', fullName: 'Sábado', amount: 0, ordersCount: 0 },
    ];

    orders.forEach((o) => {
      const parsed = new Date(o.createdAt);
      const dayIdx = Number.isNaN(parsed.getTime()) ? new Date().getDay() : parsed.getDay();
      dayMap[dayIdx].amount += o.totalAmount;
      dayMap[dayIdx].ordersCount += 1;
    });

    const orderedWeek = [...dayMap.slice(1), dayMap[0]];
    const maxAmount = Math.max(...orderedWeek.map((d) => d.amount), 0);

    return orderedWeek.map((d) => ({
      ...d,
      isPeak: maxAmount > 0 && d.amount === maxAmount,
    }));
  }, [orders]);

  return (
    <ComfyContext.Provider
      value={{
        viewMode,
        setViewMode,
        activeTab,
        setActiveTab,
        isAuthReady,
        prefilledRegisterEmail,
        setPrefilledRegisterEmail,
        stores,
        currentStoreId,
        currentStore,
        hasActiveStore,
        addStore,
        deleteStore,
        toggleStoreBlockStatus,
        approveAndGeneratePassword,
        currentUserRole,
        superAdminPassword,
        updateSuperAdminPassword,
        loginWithCredentials,
        loginAsSuperAdmin,
        recoverPassword,
        logout,
        switchStore,
        orders,
        products,
        customers,
        storeProfile,
        salesWeek,
        isNewOrderModalOpen,
        setIsNewOrderModalOpen,
        addOrder,
        updateOrderStatus,
        deleteOrder,
        addProduct,
        updateProduct,
        toggleProductStatus,
        addCustomer,
        updateStoreProfile,
        resetAllData,
        toastMessage,
        showToast,
        monthlyRevenue,
        totalOrdersCount,
        averageTicket,
        pendingOrdersCount,
      }}
    >
      {children}
    </ComfyContext.Provider>
  );
};

export const useComfy = () => {
  const context = useContext(ComfyContext);
  if (!context) {
    throw new Error('useComfy must be used within a ComfyProvider');
  }
  return context;
};
