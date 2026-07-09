import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import OrdersTable from '../components/Tables';
import { NAV_ITEMS, NAV_PATHS } from './nav';
import { getRecentOrders } from '../services/waste.service';
import { getCurrentUser } from '../services/user.service';
import type { Order } from '../models/Transaction';
import type { IndustrialUser } from '../models/User';

export default function Orders() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);
  const [user, setUser] = useState<IndustrialUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'delivered' | 'in_transit' | 'late'>('all');

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

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

  const handleSelect = (key: string) => {
    const path = NAV_PATHS[key];
    if (path) navigate(path);
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'all') return true;
    return o.status === statusFilter;
  });

  if (loading || !user) {
    return <div className="el-content">Chargement des commandes...</div>;
  }

  return (
    <div className="el-shell">
      <Sidebar
        items={NAV_ITEMS}
        activeKey="orders"
        onSelect={handleSelect}
        user={{ name: user.name, role: user.company }}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="el-main">
        <Navbar
          title="Commandes et Livraisons"
          searchOpen={searchOpen}
          onToggleSearch={() => setSearchOpen((v) => !v)}
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        <div className="el-content">
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
        </div>
      </div>
    </div>
  );
}
