"use client";
import { builder, Builder } from "@builder.io/react";
import HeroSection from "./components/builder/HeroSection";
import ProjectsSection from "./components/builder/ProjectsSection";

builder.init("c37efdc701164072a49340387b858505");

Builder.registerComponent(HeroSection, {
  name: "Alper Hero Alanı",
  inputs: [
    {
      name: "avatarText",
      type: "string",
      defaultValue: "A.",
      friendlyName: "Logo/Harf",
    },
    {
      name: "subtitle",
      type: "string",
      defaultValue: "Alper Oltulu",
      friendlyName: "Üst Başlık (İsim)",
    },
    {
      name: "title",
      type: "html",
      defaultValue: "Fikirleri Koda,<br/>Kodları Geleceğe.",
      friendlyName: "Ana Başlık",
    },
    {
      name: "description",
      type: "text",
      defaultValue: "Modern web teknolojileri ve yenilikçi tasarımlarla sınırları zorluyorum.",
      friendlyName: "Açıklama Yazısı",
    },
  ],
});

Builder.registerComponent(ProjectsSection, {
  name: "Alper Projeler Alanı",
  inputs: [
    {
      name: "projects",
      type: "list",
      friendlyName: "Projeler Listesi",
      subFields: [
        { name: "title", type: "string", friendlyName: "Proje Adı", defaultValue: "Yeni Proje" },
        { name: "desc", type: "text", friendlyName: "Açıklama", defaultValue: "Proje açıklaması..." },
        { name: "demo", type: "url", friendlyName: "Demo Linki" },
        { name: "apk", type: "url", friendlyName: "APK İndirme Linki" },
        { 
          name: "color", 
          type: "string", 
          friendlyName: "Renk Teması (Tailwind Gradients)", 
          defaultValue: "from-blue-500 to-cyan-500" 
        },
      ],
    },
  ],
});
