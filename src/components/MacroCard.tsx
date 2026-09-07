import React from 'react';

interface MacroCardProps {
  label: string;
  value: number;
  unit: string;
  target?: number;
  color: string;
}

export const MacroCard: React.FC<MacroCardProps> = ({ label, value, unit, target, color }) => {
  const percentage = target ? Math.min(Math.round((value / target) * 100), 100) : 0;

  return (
    <div className="glass-panel" style={{ borderTop: `4px solid ${color}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>{label}</span>
        {target && (
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            {percentage}%
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
        <span style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
          {value}
        </span>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{unit}</span>
        {target && (
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: 'auto' }}>
            / {target}{unit}
          </span>
        )}
      </div>

      {target && (
        <div
          style={{
            height: '6px',
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '3px',
            marginTop: '0.8rem',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${percentage}%`,
              background: color,
              borderRadius: '3px',
              transition: 'width 0.4s ease-in-out',
            }}
          />
        </div>
      )}
    </div>
  );
};
