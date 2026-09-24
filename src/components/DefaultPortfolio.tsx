"use client";
import { motion } from "framer-motion";
import { Download, ExternalLink, Code } from "lucide-react";

export default function DefaultPortfolio() {
  const projects = [
    {
      title: "Mobil Uygulama APK",
      desc: "Android için geliştirdiğim yenilikçi mobil uygulamam.",
      demo: "#",
      apk: "#",
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "E-Ticaret Platformu",
      desc: "Modern ve ölçeklenebilir e-ticaret demo projesi.",
      demo: "#",
      apk: null,
      color: "from-pink-500 to-purple-500"
    }
  ];

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
               <span className="text-4xl font-bold text-white group-hover:scale-110 transition-transform">A.</span>
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400">
            Fikirleri Koda,<br/>Kodları Geleceğe.
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10">
            Modern web teknolojileri ve yenilikçi tasarımlarla sınırları zorluyorum. Aşağıdan projelerime göz atabilir ve demo uygulamalarımı indirebilirsin.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((p, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: i * 0.2 }}
              className="group relative bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 hover:border-pink-500/50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-2 overflow-hidden"
            >
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${p.color}`} />
              <Code className="w-10 h-10 text-slate-400 dark:text-slate-500 mb-6 group-hover:text-pink-500 transition-colors" />
              <h3 className="text-2xl font-bold mb-3">{p.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-8">{p.desc}</p>
              
              <div className="flex flex-wrap gap-4">
                {p.apk && (
                  <a href={p.apk} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-medium rounded-full transition-all shadow-lg shadow-blue-500/30">
                    <Download className="w-4 h-4" />
                    APK İndir
                  </a>
                )}
                {p.demo && (
                  <a href={p.demo} className="flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-medium rounded-full transition-all">
                    <ExternalLink className="w-4 h-4" />
                    Demo İncele
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
