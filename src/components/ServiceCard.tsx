import React, { useState } from "react";
import { motion } from "motion/react";

interface ServiceCardProps {
  num: string;
  title: string;
  desc: string;
  children: React.ReactNode;
}

export default function ServiceCard({ num, title, desc, children }: ServiceCardProps) {
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({});

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    
    setTiltStyle({
      transform: `perspective(600px) rotateX(${y * -8}deg) rotateY(${x * 8}deg) translateY(-4px)`,
      transition: "transform 0.1s ease-out",
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: "perspective(600px) rotateX(0deg) rotateY(0deg) translateY(0)",
      transition: "transform 0.5s ease-out",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="card glass p-8 cursor-pointer border border-[rgba(255,255,255,0.09)] bg-[rgba(255,255,255,0.02)] backdrop-blur-md transition-all duration-300 hover:border-[rgba(255,255,255,0.22)] hover:bg-[rgba(255,255,255,0.06)] rounded-[20px]"
      style={tiltStyle}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <span className="num mono block text-xs text-slate tracking-widest mb-3.5">
        {num}
      </span>
      <div className="glyph w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br from-[rgba(124,58,237,0.25)] to-[rgba(37,99,235,0.25)] border border-[rgba(255,255,255,0.09)] mb-5">
        {children}
      </div>
      <h3 className="font-display font-semibold text-lg text-white mb-2.5">
        {title}
      </h3>
      <p className="text-[14.5px] text-slate leading-relaxed">
        {desc}
      </p>
    </motion.div>
  );
}
