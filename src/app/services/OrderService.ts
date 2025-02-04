import { CartItem } from "../contexts/CartContext";

export interface ShippingInfo {
  fullName: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface PaymentInfo {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  nameOnCard: string;
}

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image: string;
}

export interface Order {
  id: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  trackingNumber?: string;
  estimatedDelivery?: string;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  timeline: {
    status: string;
    date: string;
    description: string;
  }[];
}

class OrderService {
  private readonly API_URL = '/api/orders';
  private readonly TAX_RATE = 0.085; // 8.5%
  private readonly SHIPPING_RATE = 35; // Flat rate shipping

  async createOrder(
    cartItems: CartItem[],
    shippingInfo: ShippingInfo,
    paymentInfo: PaymentInfo
  ): Promise<Order> {
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = this.SHIPPING_RATE;
    const tax = subtotal * this.TAX_RATE;
    const total = subtotal + shipping + tax;

    const orderData = {
      items: cartItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image
      })),
      subtotal,
      shipping,
      tax,
      total,
      shippingAddress: {
        name: shippingInfo.fullName,
        street: shippingInfo.address,
        city: shippingInfo.city,
        state: shippingInfo.state,
        zip: shippingInfo.zipCode
      },
      customerEmail: shippingInfo.email,
      paymentInfo: {
        last4: paymentInfo.cardNumber.slice(-4),
        expiryDate: paymentInfo.expiryDate
      }
    };

    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const order = await response.json();
      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async getOrder(orderId: string): Promise<Order> {
    try {
      const response = await fetch(`${this.API_URL}/${orderId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch order');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }

  async getOrders(): Promise<Order[]> {
    try {
      const response = await fetch(this.API_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }
}

export const orderService = new OrderService();
