export const mockUser = {
  id: 'user-001',
  email: 'trader@tradevault.io',
  name: 'Alex Morgan',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AlexMorgan',
  createdAt: '2024-01-15T10:00:00Z',
  preferences: {
    theme: 'dark' as const,
    defaultOrderType: 'market' as const,
    confirmOrders: true,
    notifications: {
      orderFilled: true,
      priceAlerts: true,
      news: false,
    },
  },
}
