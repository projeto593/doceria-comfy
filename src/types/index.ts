export interface Product {
  id: string;
  name: string;
  category?: string;
  price: number;
  unit: string;
  description: string;
  prepTimeHours: number;
  active: boolean;
  tag?: string;
  emoji?: string;
  imageUrl?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export type OrderStatus = 'in_production' | 'ready' | 'pending' | 'delivered';

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerInitials: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  deliveryDate: string;
  deliveryType: 'retirada' | 'entrega';
  paymentStatus: 'pago' | 'pendente' | '50_sinal';
  createdAt: string;
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  initials: string;
  phone: string;
  email: string;
  address?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  favoriteItem?: string;
  notes?: string;
}

export interface SalesDay {
  day: string;
  fullName: string;
  amount: number;
  ordersCount: number;
  isPeak?: boolean;
}

export interface StoreProfile {
  name: string;
  ownerName: string;
  plan: string;
  segment: string;
  city: string;
  whatsapp: string;
  pixKey: string;
}

export type StoreStatus = 'active' | 'pending_approval' | 'blocked';

export interface Store {
  id: string;
  name: string;
  ownerName: string;
  phone: string;
  email: string; // Gmail
  city: string;
  status: StoreStatus;
  createdAt: string;
  totalOrders: number;
  monthlyRevenue: number;
  plan: string;
  segment: string;
  blockReason?: string;
  loginPassword?: string;
  approvedAt?: string;
}
