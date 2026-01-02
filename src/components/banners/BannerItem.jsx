import React, { useState } from "react";
import { X, Sparkles, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function BannerItem({ banner, onClose }) {
    const [isVisible, setIsVisible] = useState(true);

    const handleClose = () => {
        setIsVisible(false);
        if (onClose) {
            onClose(banner.id);
        }
    };

    const positionStyles = {
        header: "border-l-4 border-l-amber-500",
        footer: "border-l-4 border-l-blue-500",
        sidebar: "border-l-4 border-l-purple-500",
        "product-page": "border-l-4 border-l-green-500"
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className={`relative bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-xl shadow-sm overflow-hidden ${positionStyles[banner.position]}`}
                >
                    {banner.image_url && (
                        <div className="absolute top-0 right-0 w-1/3 h-full opacity-10">
                            <img 
                                src={banner.image_url} 
                                alt="" 
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}
                    
                    <div className="relative p-4 pr-12">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleClose}
                            className="absolute top-2 right-2 h-8 w-8 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-4 h-4" />
                        </Button>

                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-1">
                                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 mb-2 leading-relaxed">
                                    {banner.text}
                                </p>

                                {banner.link && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => window.open(banner.link, '_blank')}
                                        className="bg-white hover:bg-gray-50 text-gray-700 border-gray-300"
                                    >
                                        En savoir plus
                                        <ExternalLink className="w-3 h-3 ml-2" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}