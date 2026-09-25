"use client";
import { motion } from "framer-motion";
import { ExternalLink, Code } from "lucide-react";

interface Project {
  title: string;
  description: string;
  image?: string;
  url?: string;
  template?: string; // '1', '2', '3', '4', '5'
}

interface ProjectsSectionProps {
  projects: Project[];
}

const defaultProjects = [
  {
    title: "Mobil Uygulama APK",
    description: "Android için geliştirdiğim yenilikçi mobil uygulamam.",
    url: "#",
    template: "1"
  },
  {
    title: "E-Ticaret Platformu",
    description: "Modern ve ölçeklenebilir e-ticaret demo projesi.",
    url: "#",
    template: "2",
    image: "https://placehold.co/600x400/png"
  }
];

export default function ProjectsSection({ projects = defaultProjects }: ProjectsSectionProps) {
  const displayProjects = projects?.length > 0 ? projects : defaultProjects;

  return (
    <div className="text-slate-900 dark:text-slate-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex flex-col gap-8">
          {displayProjects.map((p: any, i: number) => {
            const template = p.template || "1";
            const title = p.title;
            const description = p.description || p.desc || "";
            const image = p.image || p.apk || "";
            const url = p.url || p.demo || "";

            if (template === "2") {
              // Şablon 2: Resimli Büyük Kapak (Banner)
              return (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="group relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl"
                >
                  {image && (
                    <div className="w-full h-64 overflow-hidden relative">
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all z-10" />
                      <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="p-8">
                    <h3 className="text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">{title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 text-lg">{description}</p>
                    {url && (
                      <a href={url} target="_blank" className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-full hover:scale-105 transition-transform shadow-lg">
                        Proje Linki <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </motion.div>
              );
            }

            if (template === "3") {
              // Şablon 3: Minimalist
              return (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="group border-l-4 border-slate-900 dark:border-white pl-6 py-2 hover:border-pink-500 transition-colors"
                >
                  <h3 className="text-2xl font-bold mb-2 group-hover:text-pink-500 transition-colors">{title}</h3>
                  <p className="text-slate-500 mb-4">{description}</p>
                  {url && (
                    <a href={url} target="_blank" className="text-sm font-bold uppercase tracking-wider flex items-center gap-1 hover:text-pink-500 transition-colors">
                      <ExternalLink className="w-4 h-4" /> İncele
                    </a>
                  )}
                </motion.div>
              );
            }

            if (template === "4") {
              // Şablon 4: Yatay Yerleşim
              return (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="flex flex-col md:flex-row bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl"
                >
                  {image && (
                    <div className="w-full md:w-2/5 h-48 md:h-auto overflow-hidden">
                      <img src={image} alt={title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-8 flex-1 flex flex-col justify-center">
                    <h3 className="text-2xl font-bold mb-3">{title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">{description}</p>
                    {url && (
                      <a href={url} target="_blank" className="inline-flex items-center gap-2 px-6 py-2 border-2 border-slate-900 dark:border-white rounded-full font-bold hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-colors self-start">
                        Göz At <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </motion.div>
              );
            }

            if (template === "5") {
              // Şablon 5: Glassmorphism
              return (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="relative p-10 rounded-3xl overflow-hidden shadow-2xl border border-white/20 dark:border-slate-800/50 flex flex-col items-center text-center"
                >
                  <div className="absolute inset-0 z-0">
                    {image ? (
                      <img src={image} alt={title} className="w-full h-full object-cover opacity-30 dark:opacity-20 blur-sm scale-110" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-white/60 dark:bg-slate-950/60 backdrop-blur-md z-0" />
                  
                  <div className="relative z-10 w-full">
                    <h3 className="text-3xl font-black mb-4 tracking-tight drop-shadow-md">{title}</h3>
                    <p className="text-slate-700 dark:text-slate-300 font-medium mb-8 max-w-2xl mx-auto">{description}</p>
                    {url && (
                      <a href={url} target="_blank" className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-1 transition-all">
                        Projeyi Ziyaret Et <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </motion.div>
              );
            }

            // Şablon 1: Klasik Modern Kart (Varsayılan)
            return (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-2 overflow-hidden"
              >
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500`} />
                <Code className="w-10 h-10 text-slate-400 dark:text-slate-500 mb-6 group-hover:text-blue-500 transition-colors" />
                <h3 className="text-2xl font-bold mb-3">{title}</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-8">{description}</p>
                
                {url && (
                  <a href={url} target="_blank" className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-medium rounded-full transition-all">
                    <ExternalLink className="w-4 h-4" />
                    Projeye Git
                  </a>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
