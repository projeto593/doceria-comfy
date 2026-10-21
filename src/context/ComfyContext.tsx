import React, { createContext, useContext, useEffect, useState } from 'react';
import { Customer, Order, OrderStatus, Product, SalesDay, StoreProfile, Store } from '../types';
import {
  initialCustomers,
  initialOrders,
  initialProducts,
  initialSalesWeek,
  initialStoreProfile,
  initialStores,
} from '../data/mockData';

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

interface ComfyContextType {
  viewMode: AppViewMode;
  setViewMode: (mode: AppViewMode) => void;
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  stores: Store[];
  currentStoreId: string;
  currentStore: Store;
  addStore: (
    data: {
      name: string;
      ownerName: string;
      phone: string;
      email: string;
      city?: string;
    },
    asActive?: boolean
  ) => Store;
  toggleStoreBlockStatus: (storeId: string) => void;
  approveAndGeneratePassword: (storeId: string, customPassword?: string) => string;
  currentUserRole: 'store' | 'superadmin' | null;
  loginWithCredentials: (
    email: string,
    pass: string
  ) => {
    success: boolean;
    message: string;
    notRegistered?: boolean;
    pendingApproval?: boolean;
    blocked?: boolean;
    store?: Store;
  };
  loginAsSuperAdmin: (user: string, pass: string) => { success: boolean; message: string };
  recoverPassword: (
    emailOrPhone: string
  ) => {
    success: boolean;
    message: string;
    store?: Store;
    tempPass?: string;
  };
  logout: () => void;
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
  }) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  deleteOrder: (orderId: string) => void;
  addProduct: (productData: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  toggleProductStatus: (productId: string) => void;
  addCustomer: (customerData: {
    name: string;
    phone: string;
    email: string;
    address?: string;
    notes?: string;
  }) => void;
  updateStoreProfile: (profile: Partial<StoreProfile>) => void;
  resetAllData: () => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  monthlyRevenue: number;
  totalOrdersCount: number;
  averageTicket: number;
  pendingOrdersCount: number;
}

const ComfyContext = createContext<ComfyContextType | undefined>(undefined);

export const ComfyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [viewMode, setViewMode] = useState<AppViewMode>('landing');
  const [activeTab, setActiveTab] = useState<DashboardTab>('visao-geral');
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [stores, setStores] = useState<Store[]>(() => {
    try {
      const saved = localStorage.getItem('comfy_stores');
      return saved ? JSON.parse(saved) : initialStores;
    } catch {
      return initialStores;
    }
  });

  const [currentStoreId, setCurrentStoreId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('comfy_current_store_id');
      return saved || 'store-1';
    } catch {
      return 'store-1';
    }
  });

  const currentStore = stores.find((s) => s.id === currentStoreId) || stores[0] || initialStores[0];

  useEffect(() => {
    localStorage.setItem('comfy_stores', JSON.stringify(stores));
  }, [stores]);

  useEffect(() => {
    localStorage.setItem('comfy_current_store_id', currentStoreId);
  }, [currentStoreId]);

  const addStore = (
    data: {
      name: string;
      ownerName: string;
      phone: string;
      email: string;
      city?: string;
    },
    asActive = false
  ) => {
    const newStore: Store = {
      id: `store-${Date.now()}`,
      name: data.name,
      ownerName: data.ownerName,
      phone: data.phone,
      email: data.email,
      city: data.city || 'São Paulo, SP',
      status: asActive ? 'active' : 'pending_approval',
      createdAt: new Date().toLocaleDateString('pt-BR'),
      totalOrders: 0,
      monthlyRevenue: 0,
      plan: 'Plano Profissional',
      segment: 'Doceria & Confeitaria Artesanal',
      loginPassword: asActive ? `Comfy@${Math.floor(1000 + Math.random() * 9000)}` : undefined,
    };

    setStores((prev) => [newStore, ...prev]);

    if (asActive) {
      setCurrentStoreId(newStore.id);
      setStoreProfile({
        name: newStore.name,
        ownerName: newStore.ownerName,
        plan: newStore.plan,
        segment: newStore.segment,
        city: newStore.city,
        whatsapp: newStore.phone,
        pixKey: newStore.email,
      });
      showToast(`Loja "${newStore.name}" cadastrada com sucesso! ✨`);
    } else {
      showToast(`Cadastro da doceria "${newStore.name}" enviado para análise!`);
    }

    return newStore;
  };

  const approveAndGeneratePassword = (storeId: string, customPassword?: string) => {
    const generatedPassword =
      customPassword?.trim() || `Comfy@${Math.floor(1000 + Math.random() * 9000)}`;

    setStores((prev) =>
      prev.map((s) => {
        if (s.id === storeId) {
          return {
            ...s,
            status: 'active',
            loginPassword: generatedPassword,
            approvedAt: new Date().toLocaleDateString('pt-BR'),
          };
        }
        return s;
      })
    );

    showToast(`Senha gerada para a loja: ${generatedPassword} 🔑`);
    return generatedPassword;
  };

  const [currentUserRole, setCurrentUserRole] = useState<'store' | 'superadmin' | null>('store');

  const loginWithCredentials = (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();
    const store = stores.find((s) => s.email.toLowerCase() === cleanEmail);

    if (!store) {
      return {
        success: false,
        notRegistered: true,
        message: 'Nenhuma doceria encontrada com este Gmail. Deseja cadastrar agora?',
      };
    }

    if (store.status === 'pending_approval') {
      return {
        success: false,
        pendingApproval: true,
        store,
        message:
          'Seu cadastro ainda está em análise pela equipe da Comfy! Em breve sua senha de acesso será enviada no WhatsApp.',
      };
    }

    if (store.status === 'blocked') {
      return {
        success: false,
        blocked: true,
        store,
        message:
          'Acesso bloqueado temporariamente pela administração da Comfy. Entre em contato com o suporte.',
      };
    }

    if (store.loginPassword && store.loginPassword !== cleanPass) {
      return {
        success: false,
        message: 'Senha incorreta. Verifique os dados recebidos no seu WhatsApp ou utilize a recuperação.',
      };
    }

    // Success login
    setCurrentStoreId(store.id);
    setCurrentUserRole('store');
    setStoreProfile({
      name: store.name,
      ownerName: store.ownerName,
      plan: store.plan,
      segment: store.segment,
      city: store.city,
      whatsapp: store.phone,
      pixKey: store.email,
    });
    setViewMode('dashboard');
    showToast(`Bem-vinda de volta, ${store.ownerName}! 🧁`);
    return { success: true, message: 'Login realizado com sucesso!', store };
  };

  const loginAsSuperAdmin = (user: string, pass: string) => {
    const cleanUser = user.trim().toLowerCase();
    const cleanPass = pass.trim();

    const isAuthorizedAdmin =
      cleanUser === 'projetointegradors303@gmail.com' ||
      cleanUser === 'admin@comfy.app' ||
      cleanUser === 'admin';

    if (isAuthorizedAdmin && cleanPass === 'admin123') {
      setCurrentUserRole('superadmin');
      setViewMode('super-admin');
      showToast('Acesso de Super Administrador autenticado! 👑');
      return { success: true, message: 'Autenticado com sucesso!' };
    }

    return {
      success: false,
      message: 'Credenciais de Administrador inválidas. Verifique a senha.',
    };
  };

  const recoverPassword = (emailOrPhone: string) => {
    const query = emailOrPhone.trim().toLowerCase();
    const cleanDigits = query.replace(/\D/g, '');

    const store = stores.find(
      (s) =>
        s.email.toLowerCase() === query ||
        (cleanDigits.length >= 8 && s.phone.replace(/\D/g, '').includes(cleanDigits))
    );

    if (!store) {
      return {
        success: false,
        message: 'Nenhuma doceria encontrada com este Gmail ou WhatsApp informado.',
      };
    }

    if (store.status === 'pending_approval') {
      return {
        success: false,
        message:
          'Seu cadastro ainda está em análise! A senha será gerada e enviada pelo administrador em breve.',
        store,
      };
    }

    return {
      success: true,
      message: `Senha localizada para ${store.name}! Enviamos instruções de acesso para seu WhatsApp.`,
      store,
      tempPass: store.loginPassword,
    };
  };

  const logout = () => {
    setCurrentUserRole(null);
    setViewMode('landing');
    showToast('Você saiu da sua conta. Até logo! 👋');
  };

  const toggleStoreBlockStatus = (storeId: string) => {
    setStores((prev) =>
      prev.map((s) => {
        if (s.id === storeId) {
          const nextStatus = s.status === 'active' ? 'blocked' : 'active';
          showToast(
            nextStatus === 'blocked'
              ? `Acesso da loja "${s.name}" BLOQUEADO.`
              : `Loja "${s.name}" DESBLOQUEADA com sucesso.`
          );
          return {
            ...s,
            status: nextStatus,
            blockReason:
              nextStatus === 'blocked'
                ? 'Acesso suspenso temporariamente pela administração da Comfy.'
                : undefined,
          };
        }
        return s;
      })
    );
  };

  const switchStore = (storeId: string) => {
    const target = stores.find((s) => s.id === storeId);
    if (!target) return;
    setCurrentStoreId(target.id);
    setStoreProfile({
      name: target.name,
      ownerName: target.ownerName,
      plan: target.plan,
      segment: target.segment,
      city: target.city,
      whatsapp: target.phone,
      pixKey: target.email,
    });
    setViewMode('dashboard');
    showToast(`Alternado para a loja: ${target.name}`);
  };

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('comfy_orders');
      return saved ? JSON.parse(saved) : initialOrders;
    } catch {
      return initialOrders;
    }
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('comfy_products');
      return saved ? JSON.parse(saved) : initialProducts;
    } catch {
      return initialProducts;
    }
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem('comfy_customers');
      return saved ? JSON.parse(saved) : initialCustomers;
    } catch {
      return initialCustomers;
    }
  });

  const [storeProfile, setStoreProfile] = useState<StoreProfile>(() => {
    try {
      const saved = localStorage.getItem('comfy_profile');
      return saved ? JSON.parse(saved) : initialStoreProfile;
    } catch {
      return initialStoreProfile;
    }
  });

  const [salesWeek] = useState<SalesDay[]>(initialSalesWeek);

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem('comfy_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('comfy_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('comfy_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('comfy_profile', JSON.stringify(storeProfile));
  }, [storeProfile]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const addOrder = (orderData: {
    customerName: string;
    customerPhone: string;
    items: { productId: string; quantity: number }[];
    deliveryDate: string;
    deliveryType: 'retirada' | 'entrega';
    paymentStatus: 'pago' | 'pendente' | '50_sinal';
    notes?: string;
  }) => {
    const fullItems = orderData.items.map((item) => {
      const prod = products.find((p) => p.id === item.productId);
      return {
        productId: item.productId,
        productName: prod ? prod.name : 'Doce Especial',
        quantity: item.quantity,
        unitPrice: prod ? prod.price : 20.0,
      };
    });

    const totalAmount = fullItems.reduce((acc, curr) => acc + curr.quantity * curr.unitPrice, 0);
    const nextOrderNum = `#${1049 + (orders.length - initialOrders.length)}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: nextOrderNum,
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      customerInitials: getInitials(orderData.customerName),
      items: fullItems,
      totalAmount,
      status: 'in_production',
      deliveryDate: orderData.deliveryDate || 'Hoje',
      deliveryType: orderData.deliveryType,
      paymentStatus: orderData.paymentStatus,
      createdAt: new Date().toISOString(),
      notes: orderData.notes,
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Also update or add customer
    setCustomers((prev) => {
      const existing = prev.find(
        (c) => c.name.toLowerCase() === orderData.customerName.toLowerCase()
      );
      if (existing) {
        return prev.map((c) =>
          c.id === existing.id
            ? {
                ...c,
                totalOrders: c.totalOrders + 1,
                totalSpent: c.totalSpent + totalAmount,
                lastOrderDate: 'Hoje',
              }
            : c
        );
      } else {
        const newCust: Customer = {
          id: `cust-${Date.now()}`,
          name: orderData.customerName,
          initials: getInitials(orderData.customerName),
          phone: orderData.customerPhone,
          email: `${orderData.customerName.toLowerCase().replace(/\s+/g, '.')}@email.com`,
          totalOrders: 1,
          totalSpent: totalAmount,
          lastOrderDate: 'Hoje',
        };
        return [newCust, ...prev];
      }
    });

    showToast(`Pedido ${nextOrderNum} criado com sucesso! ✨`);
    setIsNewOrderModalOpen(false);
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status } : ord))
    );
    const statusLabels: Record<OrderStatus, string> = {
      in_production: 'Em produção',
      ready: 'Pronto p/ retirada/entrega',
      delivered: 'Entregue / Concluído',
      pending: 'Pendente',
    };
    showToast(`Status atualizado para: ${statusLabels[status]}`);
  };

  const deleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((ord) => ord.id !== orderId));
    showToast('Pedido removido.');
  };

  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newProd: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
    };
    setProducts((prev) => [newProd, ...prev]);
    showToast(`Doce "${productData.name}" adicionado ao catálogo!`);
  };

  const updateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    showToast(`"${updated.name}" atualizado.`);
  };

  const toggleProductStatus = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, active: !p.active } : p))
    );
  };

  const addCustomer = (customerData: {
    name: string;
    phone: string;
    email: string;
    address?: string;
    notes?: string;
  }) => {
    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      name: customerData.name,
      initials: getInitials(customerData.name),
      phone: customerData.phone,
      email: customerData.email,
      address: customerData.address,
      notes: customerData.notes,
      totalOrders: 0,
      totalSpent: 0,
      lastOrderDate: 'Novo cliente',
    };
    setCustomers((prev) => [newCust, ...prev]);
    showToast(`Cliente ${customerData.name} cadastrado com sucesso!`);
  };

  const updateStoreProfile = (profileUpdate: Partial<StoreProfile>) => {
    setStoreProfile((prev) => ({ ...prev, ...profileUpdate }));
    showToast('Preferências salvas com sucesso.');
  };

  const resetAllData = () => {
    localStorage.removeItem('comfy_orders');
    localStorage.removeItem('comfy_products');
    localStorage.removeItem('comfy_customers');
    localStorage.removeItem('comfy_profile');
    setOrders(initialOrders);
    setProducts(initialProducts);
    setCustomers(initialCustomers);
    setStoreProfile(initialStoreProfile);
    showToast('Dados restaurados para o padrão.');
  };

  // Base metrics from the reference UI
  // Base: R$ 12.480,00, 184 pedidos, Ticket médio R$ 67,82
  const addedRevenue = orders.slice(0, orders.length - initialOrders.length).reduce(
    (sum, o) => sum + o.totalAmount,
    0
  );
  const monthlyRevenue = 12480.0 + addedRevenue;
  const totalOrdersCount = 184 + (orders.length - initialOrders.length);
  const averageTicket = totalOrdersCount > 0 ? monthlyRevenue / totalOrdersCount : 67.82;
  const pendingOrdersCount = orders.filter(
    (o) => o.status === 'in_production' || o.status === 'ready' || o.status === 'pending'
  ).length;

  return (
    <ComfyContext.Provider
      value={{
        viewMode,
        setViewMode,
        activeTab,
        setActiveTab,
        stores,
        currentStoreId,
        currentStore,
        addStore,
        toggleStoreBlockStatus,
        approveAndGeneratePassword,
        currentUserRole,
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
