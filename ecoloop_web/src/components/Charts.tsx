import React from 'react';
import type { DailyVolume, MaterialShare } from '../models/Waste';
import './dashboard.css';

type BarChartProps = {
  title: string;
  data: DailyVolume[];
  linkLabel?: string;
  onLinkClick?: () => void;
};

export function BarChart({ title, data, linkLabel, onLinkClick }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);

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
      <div className="el-bars">
        {data.map((d) => (
          <div className="el-bar-col" key={d.label}>
            <div className="el-bar" style={{ height: `${(d.value / max) * 100}%` }} />
            <div className="el-bar-label">{d.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

type DonutChartProps = {
  title: string;
  data: MaterialShare[];
};

export function DonutChart({ title, data }: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  let cumulative = 0;
  const radius = 46;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="el-card">
      <div className="el-card-heading">
        <div className="el-card-title">{title}</div>
      </div>

      <svg width="140" height="140" viewBox="0 0 120 120" style={{ display: 'block', margin: '0 auto' }}>
        <g transform="rotate(-90 60 60)">
          {data.map((d) => {
            const fraction = d.value / total;
            const dash = fraction * circumference;
            const offset = -cumulative * circumference;
            cumulative += fraction;
            return (
              <circle
                key={d.name}
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke={d.color}
                strokeWidth="16"
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={offset}
              />
            );
          })}
        </g>
      </svg>

      <div className="el-legend">
        {data.map((d) => (
          <div className="el-legend-row" key={d.name}>
            <span className="el-legend-dot" style={{ background: d.color }} />
            <span className="el-legend-name">{d.name}</span>
            <span className="el-legend-value">{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
