const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { apiUrl } from "@/lib/urls";

// Brand assets
export const BRAND = {
  name: "Gabru Education",
  tagline: "Templates, prompts, courses & digital tools",
  siteUrl: "https://gabrueducation.db.app",
  logo: apiUrl("/api/placeholders/gabru-education-logo.svg?label=GE&w=512&h=512"),
  logoSmall: apiUrl("/api/placeholders/gabru-education-logo.svg?label=GE&w=180&h=180"),
};

// Isometric 3D artwork used by the seeded catalogue and blog.
export const ASSETS = {
  bannerTemplates: "https://media.db.com/images/public/6af5debcf61bb528aaf9d2f9/93b10d13d_generated_471c6ad6.png",
  bannerOffer: "https://media.db.com/images/public/6af5debcf61bb528aaf9d2f9/144157225_generated_039ea12e.png",
  catTemplates: "https://media.db.com/images/public/6af5debcf61bb528aaf9d2f9/b44fbc3ee_generated_6ad21cee.png",
  catCourses: "https://media.db.com/images/public/6af5debcf61bb528aaf9d2f9/4dcf82f65_generated_cb56cb92.png",
  catSoftware: "https://media.db.com/images/public/6af5debcf61bb528aaf9d2f9/23aee939e_generated_a4b1e894.jpg",
  catBooks: "https://media.db.com/images/public/6af5debcf61bb528aaf9d2f9/346c380ce_generated_aff26547.png",
  catPrompts: "https://media.db.com/images/public/6af5debcf61bb528aaf9d2f9/fb8e12561_generated_2c4f91d9.png",
  prodPromptPack: "https://media.db.com/images/public/6af5debcf61bb528aaf9d2f9/46b0bdcfa_generated_26a68aff.png",
  prodTemplate: "https://media.db.com/images/public/6af5debcf61bb528aaf9d2f9/1856dbb7a_generated_75459148.png",
  prodCourse: "https://media.db.com/images/public/6af5debcf61bb528aaf9d2f9/aeb5c6481_generated_cee83418.png",
  prodSeoTool: "https://media.db.com/images/public/6af5debcf61bb528aaf9d2f9/9456c98e0_generated_830b2acc.jpg",
  prodEbook: "https://media.db.com/images/public/6af5debcf61bb528aaf9d2f9/28848315e_generated_1f3d03f8.png",
  prodService: "https://media.db.com/images/public/6af5debcf61bb528aaf9d2f9/67c5d6473_generated_d1c3d165.png",
  blogCover: "https://media.db.com/images/public/6af5debcf61bb528aaf9d2f9/719e6f87a_generated_3b804eec.png",
};