import { motion } from "framer-motion";

export default function HeroStatic({ title, subtitle, description, avatarText }: any) {
  return (
    <div className="text-center w-full">
      <div className="w-32 h-32 mx-auto bg-gradient-to-tr from-pink-500 to-blue-500 rounded-full mb-8 shadow-2xl p-1 relative group cursor-pointer">
        <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center overflow-hidden">
            <span className="text-4xl font-bold text-white group-hover:scale-110 transition-transform">{avatarText || "A."}</span>
        </div>
      </div>
      
      <h2 className="text-xl md:text-2xl font-bold text-slate-500 dark:text-slate-400 mb-4">{subtitle || "Alper Oltulu"}</h2>
      
      <h1 
        className="text-5xl md:text-7xl font-black tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400"
        dangerouslySetInnerHTML={{ __html: title || "Fikirleri Koda,<br/>Kodları Geleceğe." }}
      />
      
      <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10">
        {description || "Modern web teknolojileri ve yenilikçi tasarımlarla sınırları zorluyorum."}
      </p>
    </div>
  );
}
