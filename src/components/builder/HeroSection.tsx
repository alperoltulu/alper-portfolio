"use client";
import { motion } from "framer-motion";

interface HeroSectionProps {
  title: string;
  subtitle: string;
  description: string;
  avatarText: string;
}

export default function HeroSection({
  title = "Fikirleri Koda,<br/>Kodları Geleceğe.",
  subtitle = "Alper Oltulu",
  description = "Modern web teknolojileri ve yenilikçi tasarımlarla sınırları zorluyorum.",
  avatarText = "A."
}: HeroSectionProps) {
  return (
    <div className="text-slate-900 dark:text-slate-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <div className="w-32 h-32 mx-auto bg-gradient-to-tr from-pink-500 to-blue-500 rounded-full mb-8 shadow-2xl p-1 relative group cursor-pointer">
            <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center overflow-hidden">
               <span className="text-4xl font-bold text-white group-hover:scale-110 transition-transform">{avatarText}</span>
            </div>
          </div>
          
          <h2 className="text-xl md:text-2xl font-bold text-slate-500 dark:text-slate-400 mb-4">{subtitle}</h2>
          
          <h1 
            className="text-5xl md:text-7xl font-black tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400"
            dangerouslySetInnerHTML={{ __html: title }}
          />
          
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10">
            {description}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
