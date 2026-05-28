import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

interface IosDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function IosDrawer({ isOpen, onClose, title, subtitle, children }: IosDrawerProps) {
  // Prevent body scroll when drawer is active
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          
          {/* Backdrop Blur Layer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-[3px]"
            transition={{ duration: 0.25 }}
          />

          {/* iOS Bottom Sheet Container */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="relative w-full max-w-2xl bg-white/94 backdrop-blur-xl border-t border-[#e5e5ea] rounded-t-[20px] shadow-2xl flex flex-col max-h-[88vh] z-50 select-none pb-safe"
          >
            {/* Grab Handle */}
            <div className="w-9 h-1 bg-[#c7c7cc] rounded-full mx-auto mt-2.5 mb-1.5" />

            {/* Header Toolbar */}
            <div className="px-5 py-2.5 flex items-center justify-between border-b border-[#e5e5ea] bg-white/60">
              <div className="flex-1 min-w-0 pr-4">
                <h3 className="text-[17px] font-extrabold text-slate-900 tracking-tight leading-tight truncate">
                  {title}
                </h3>
                {subtitle && (
                  <p className="text-[11px] text-[#8e8e93] font-medium leading-none mt-0.5 truncate">
                    {subtitle}
                  </p>
                )}
              </div>
              
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={onClose}
                className="cursor-pointer text-[15px] font-bold text-[#007aff] px-3 py-1.5 hover:opacity-80 active:opacity-60 transition-all rounded-lg select-none"
              >
                Done
              </motion.button>
            </div>

            {/* Scrollable Grouped Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-[#f2f2f7] rounded-t-[20px]">
              {children}
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
