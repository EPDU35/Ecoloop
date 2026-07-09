import React from 'react';
import type { Order } from '../models/Transaction';
import './dashboard.css';

type OrdersTableProps = {
  title: string;
  orders: Order[];
  linkLabel?: string;
  onLinkClick?: () => void;
};

export default function OrdersTable({ title, orders, linkLabel, onLinkClick }: OrdersTableProps) {
  return (
    <div className="el-card">
      <div className="el-card-heading">
        <div className="el-card-title">{title}</div>
        {linkLabel && (
          <a
            className="el-card-link"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onLinkClick?.();
            }}
          >
            {linkLabel}
          </a>
        )}
      </div>

      <div className="el-table-wrap">
        <table className="el-table">
          <thead>
            <tr>
              <th>Référence</th>
              <th>Fournisseur</th>
              <th>Matériau</th>
              <th>Poids</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td className="el-mono">{o.id}</td>
                <td>{o.supplier}</td>
                <td>{o.material}</td>
                <td className="el-mono">{o.weight}</td>
                <td>
                  <span className={`el-pill ${o.status}`}>{o.label}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
