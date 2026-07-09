import { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout';
import OrdersTable from '../components/Tables';
import { getRecentOrders } from '../services/waste.service';
import { getCurrentUser } from '../services/user.service';
import type { Order } from '../models/Transaction';
import type { IndustrialUser } from '../models/User';

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [user, setUser] = useState<IndustrialUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'delivered' | 'in_transit' | 'late'>('all');

  useEffect(() => {
    async function loadData() {
      try {
        const [ordersData, userData] = await Promise.all([
          getRecentOrders(),
          getCurrentUser(),
        ]);
        setOrders(ordersData);
        setUser(userData);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'all') return true;
    return o.status === statusFilter;
  });

  if (loading || !user) {
    return <div className="el-content">Chargement des commandes...</div>;
  }

  return (
    <AppLayout role="industrial" activeKey="orders" title="Commandes et Livraisons">
      <div className="el-filter-bar">
        <div className="el-filter-field">
          <label htmlFor="orderStatus">Statut de livraison</label>
          <select
            id="orderStatus"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="all">Toutes les commandes</option>
            <option value="delivered">Livré</option>
            <option value="in_transit">En transit</option>
            <option value="late">En retard</option>
          </select>
        </div>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <OrdersTable
          title="Historique des commandes"
          orders={filteredOrders}
        />
      </div>
    </AppLayout>
  );
}
