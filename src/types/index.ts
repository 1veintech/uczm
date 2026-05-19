export interface CartItemData {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
}

export interface NavItem {
  title: string;
  href: string;
  icon: string;
  badge?: number;
}

export interface StatsCardData {
  title: string;
  value: string | number;
  icon: string;
  trend?: string;
  trendUp?: boolean;
  gradient: string;
}
