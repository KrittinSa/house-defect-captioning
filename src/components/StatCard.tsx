import React from 'react';
// import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
    label: string;
    value: string | number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon: any;
    color?: string;
    subValue?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
    label,
    value,
    icon: Icon,
    color = "text-slate-800",
    subValue
}) => {
    return (
        <div className="premium-card p-6 flex flex-col justify-between h-40">
            <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">{label}</span>
                <div className={`p-2 rounded-xl bg-slate-50 ${color}`}>
                    <Icon size={20} />
                </div>
            </div>

            <div>
                <div className={`text-4xl font-bold tracking-tight ${color}`}>{value}</div>
                {subValue && (
                    <p className="text-xs text-slate-400 mt-1 font-medium">{subValue}</p>
                )}
            </div>
        </div>
    );
};
