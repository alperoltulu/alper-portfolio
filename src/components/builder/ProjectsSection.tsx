"use client";
import { motion } from "framer-motion";
import { Download, ExternalLink, Code } from "lucide-react";

interface Project {
  title: string;
  desc: string;
  demo?: string;
  apk?: string;
  color?: string;
}

interface ProjectsSectionProps {
  projects: Project[];
}

const defaultProjects = [
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
    apk: "",
    color: "from-pink-500 to-purple-500"
  }
];

export default function ProjectsSection({ projects = defaultProjects }: ProjectsSectionProps) {
  const displayProjects = projects?.length > 0 ? projects : defaultProjects;

  return (
    <div className="text-slate-900 dark:text-slate-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {displayProjects.map((p, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: i * 0.2 }}
              className="group relative bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 hover:border-pink-500/50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-2 overflow-hidden"
            >
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${p.color || "from-blue-500 to-pink-500"}`} />
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
