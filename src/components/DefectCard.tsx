import React from 'react';
import type { DefectAnalysisUI } from '../types/defect';
// import { Clock } from 'lucide-react';

interface DefectCardProps {
    data: DefectAnalysisUI;
}

import { SkeletonCard } from './SkeletonCard';
import { useStore } from '../lib/store';

import { motion } from 'framer-motion';

export const DefectCard: React.FC<DefectCardProps> = ({ data }) => {
    const isDone = data.status === 'done';
    const isProcessing = data.status === 'processing';
    const setCurrentAnalysisId = useStore((state) => state.setCurrentAnalysisId);

    if (isProcessing) {
        return <SkeletonCard imageSrc={data.imageUrl} />;
    }

    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
            }}
            onClick={() => setCurrentAnalysisId(data.id)}
            className="premium-card overflow-hidden flex flex-col sm:flex-row h-auto sm:h-32 cursor-pointer hover:shadow-lg transition-shadow bg-white"
            whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.99 }}
        >
            <div className="w-full sm:w-32 h-32 sm:h-full relative overflow-hidden bg-slate-100">
                <img
                    src={data.imageUrl}
                    alt={data.labelEn}
                    className="w-full h-full object-cover transition-all duration-700"
                />
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                    <div>
                        <h4 className="font-bold text-slate-800 text-lg leading-tight">{data.labelThai}</h4>
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-tight">{data.labelEn}</p>
                    </div>
                    {isDone && (
                        <div className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border border-slate-200 bg-slate-50 text-slate-500">
                            {data.room}
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-end mt-2">
                    <div className="text-[10px] text-slate-400 font-medium">
                        {new Date(data.timestamp).toLocaleTimeString()} • {data.id}
                    </div>
                    {isDone && (
                        <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
                            <span className="text-slate-400 font-normal">Confidence:</span>
                            {(data.confidence * 100).toFixed(1)}%
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};
