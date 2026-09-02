import React from 'react';

const statusStyles = {
  // Cargo statuses
  planned: { bg: 'bg-blue-500/10 text-blue-500 border-blue-500/20', label: 'Planned' },
  in_transit: { bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 animate-pulse', label: 'In Transit' },
  at_transfer_point: { bg: 'bg-amber-500/10 text-amber-500 border-amber-500/20', label: 'Cape Town Staging' },
  delivered: { bg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', label: 'Delivered' },
  on_hold: { bg: 'bg-rose-500/10 text-rose-500 border-rose-500/20', label: 'Hazmat / Hold' },

  // Personnel statuses
  deployed: { bg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', label: 'Deployed' },
  returned: { bg: 'bg-slate-500/10 text-slate-400 border-slate-500/20', label: 'Returned' },

  // Emergency severities
  critical: { bg: 'bg-red-500/20 text-red-500 border-red-500/40 animate-pulse font-bold', label: 'Critical' },
  high: { bg: 'bg-orange-500/20 text-orange-400 border-orange-500/30', label: 'High' },
  medium: { bg: 'bg-amber-500/20 text-amber-400 border-amber-500/30', label: 'Medium' },
  low: { bg: 'bg-slate-500/10 text-slate-400 border-slate-500/20', label: 'Low' },

  // Emergency status
  open: { bg: 'bg-rose-500/10 text-rose-500 border-rose-500/30 font-semibold', label: 'Active Incident' },
  resolved: { bg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', label: 'Resolved' }
};

export default function StatusBadge({ status, customLabel, className = '' }) {
  const style = statusStyles[status] || { bg: 'bg-slate-500/10 text-slate-400 border-slate-500/20', label: status };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${style.bg} ${className}`}>
      {customLabel || style.label}
    </span>
  );
}
