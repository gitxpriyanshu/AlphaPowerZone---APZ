import prisma from '../config/database.js';

export const analyticsService = {
  /**
   * Get business overview stats
   */
  getOverview: async () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalRevenue,
      totalOrders,
      totalUsers,
      totalProducts,
      revenueThisMonth,
      ordersThisMonth,
      newUsersThisMonth,
      lowStockProducts,
      deliveredOrders,
    ] = await Promise.all([
      prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'PAID' } }),
      prisma.order.count(),
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.aggregate({ 
        _sum: { total: true }, 
        where: { paymentStatus: 'PAID', createdAt: { gte: startOfMonth } } 
      }),
      prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.product.findMany({
        where: { stock: { lte: 5 } },
        select: { id: true, name: true, stock: true },
      }),
      prisma.order.findMany({
        where: { status: 'DELIVERED' },
        include: { items: true }
      }),
    ]);

    let totalProfit = 0;
    deliveredOrders.forEach(order => {
      order.items.forEach(item => {
        totalProfit += (item.price - item.wholesalePrice) * item.qty;
      });
    });

    return {
      totalRevenue: totalRevenue._sum.total || 0,
      totalOrders,
      totalUsers,
      totalProducts,
      totalProfit,
      revenueThisMonth: revenueThisMonth._sum.total || 0,
      ordersThisMonth,
      newUsersThisMonth,
      lowStockProducts,
    };
  },

  /**
   * Get revenue chart data
   */
  getRevenueData: async (period: string) => {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Grouping by day (PostgreSQL specific or manual mapping)
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        paymentStatus: 'PAID',
      },
      select: {
        createdAt: true,
        total: true,
      },
    });

    const revenueMap = new Map<string, { date: string; revenue: number; orders: number }>();
    
    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      const existing = revenueMap.get(date) || { date, revenue: 0, orders: 0 };
      existing.revenue += order.total;
      existing.orders += 1;
      revenueMap.set(date, existing);
    });

    return Array.from(revenueMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  },

  /**
   * Get top performing products
   */
  getTopProducts: async (limit = 5) => {
    const topByRevenue = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { price: true, qty: true },
      orderBy: { _sum: { price: 'desc' } },
      take: limit,
    });

    const products = await prisma.product.findMany({
      where: { id: { in: topByRevenue.map(p => p.productId) } },
      select: { id: true, name: true, images: true },
    });

    return topByRevenue.map(item => ({
      ...products.find(p => p.id === item.productId),
      revenue: item._sum.price,
      unitsSold: item._sum.qty,
    }));
  },

  /**
   * Get order status distribution
   */
  getOrderStatusDistribution: async () => {
    const counts = await prisma.order.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    return counts.map(item => ({
      status: item.status,
      count: item._count.status,
    }));
  },
  
  getCustomers: async () => {
    return await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        _count: { select: { orders: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  getAllOrders: async () => {
    return await prisma.order.findMany({
      include: {
        user: { 
          select: { 
            id: true, 
            name: true, 
            email: true, 
            phone: true, 
            createdAt: true, 
            _count: { select: { orders: true } } 
          } 
        },
        items: {
          include: {
            product: { select: { name: true, images: true, slug: true } }
          }
        },
        address: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }
};
