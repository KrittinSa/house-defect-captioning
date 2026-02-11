import React, { useRef } from 'react';
import { Camera } from 'lucide-react';
import { clsx } from 'clsx';

interface UploadZoneProps {
    onFileSelect: (files: File[]) => void;
    isAnalyzing: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onFileSelect, isAnalyzing }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onFileSelect(Array.from(e.target.files));
        }
    };

    return (
        <div
            className={clsx(
                "premium-card relative overflow-hidden group cursor-pointer border-dashed border-2 p-12 flex flex-col items-center justify-center transition-all duration-500",
                isAnalyzing ? "border-crimson/30" : "border-slate-200 hover:border-crimson/50"
            )}
            onClick={() => !isAnalyzing && fileInputRef.current?.click()}
        >
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                multiple
                onChange={handleFileChange}
            />

            <div className={clsx(
                "relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-700",
                isAnalyzing ? "animate-pulse bg-crimson/5 scale-110 shadow-glow" : "bg-slate-50 group-hover:bg-crimson/5"
            )}>
                {isAnalyzing ? (
                    <div className="absolute inset-0 rounded-full border-2 border-crimson border-t-transparent animate-spin" />
                ) : (
                    <div className="absolute inset-0 rounded-full border border-slate-100 group-hover:border-crimson/20" />
                )}
                <Camera className={clsx(
                    "w-12 h-12 transition-colors duration-500",
                    isAnalyzing ? "text-crimson" : "text-slate-400 group-hover:text-crimson"
                )} />
            </div>

            <div className="mt-8 text-center">
                <h3 className="text-xl font-semibold text-slate-800">
                    {isAnalyzing ? "Analyzing Home Conditions..." : "Tap to Scan Defects"}
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                    {isAnalyzing ? "AI is inspecting for defects with high precision" : "Supports JPEG, PNG (Select multiple)"}
                </p>
            </div>

            {isAnalyzing && (
                <div className="absolute bottom-0 left-0 h-1 bg-crimson animate-progress w-full" />
            )}
        </div>
    );
};
