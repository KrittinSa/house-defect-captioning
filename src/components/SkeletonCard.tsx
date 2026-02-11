import React from 'react';
// import { clsx } from 'clsx';

interface SkeletonCardProps {
    imageSrc?: string; // Optional: if we have the image uploaded already
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ imageSrc }) => {
    return (
        <div className="premium-card overflow-hidden flex flex-col sm:flex-row h-auto sm:h-32 animate-pulse">
            {/* Image Placeholder */}
            <div className="w-full sm:w-32 h-32 sm:h-full relative overflow-hidden bg-slate-200">
                {imageSrc ? (
                    <img
                        src={imageSrc}
                        alt="Scanning..."
                        className="w-full h-full object-cover opacity-50 grayscale"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-slate-300"></div>
                    </div>
                )}
                {/* Scanning overlay effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-transparent translate-y-[-100%] animate-[shimmer_1.5s_infinite]"></div>
            </div>

            {/* Content Placeholders */}
            <div className="p-4 flex-1 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                    <div className="space-y-2 w-full">
                        {/* Title Line */}
                        <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                        {/* Subtitle Line */}
                        <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                    </div>
                    {/* Badge */}
                    <div className="h-5 w-16 bg-slate-200 rounded-full"></div>
                </div>

                <div className="flex justify-between items-end mt-2">
                    {/* Timestamp */}
                    <div className="h-3 w-24 bg-slate-100 rounded"></div>
                    {/* Confidence */}
                    <div className="h-3 w-12 bg-slate-100 rounded"></div>
                </div>
            </div>
        </div>
    );
};
