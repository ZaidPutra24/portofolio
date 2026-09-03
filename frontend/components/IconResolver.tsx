'use client';

import React from 'react';
import { Icon } from '@iconify/react';
import * as SiIcons from 'react-icons/si';
import * as Fa6Icons from 'react-icons/fa6';
import * as FaIcons from 'react-icons/fa';
import * as VscIcons from 'react-icons/vsc';
import * as TbIcons from 'react-icons/tb';
import * as MdIcons from 'react-icons/md';
import * as BiIcons from 'react-icons/bi';
import * as RiIcons from 'react-icons/ri';
import * as FiIcons from 'react-icons/fi';
import * as BsIcons from 'react-icons/bs';
import * as Hi2Icons from 'react-icons/hi2';
import * as Io5Icons from 'react-icons/io5';
import * as LuIcons from 'react-icons/lu';
import * as PiIcons from 'react-icons/pi';
import * as CiIcons from 'react-icons/ci';
import * as GoIcons from 'react-icons/go';
import * as GrIcons from 'react-icons/gr';

export const BRAND_COLORS: Record<string, string> = {
  SiPython: '#3776AB',
  SiFastapi: '#009688',
  SiNodedotjs: '#339933',
  SiGo: '#00ADD8',
  SiMysql: '#4479A1',
  SiPostgresql: '#4169E1',
  SiMongodb: '#47A248',
  SiRedis: '#DC382D',
  SiGraphql: '#E10098',
  SiDocker: '#2496ED',
  SiLaravel: '#FF2D20',
  SiReact: '#61DAFB',
  SiNextdotjs: '#000000',
  SiTypescript: '#3178C6',
  SiVuedotjs: '#4FC08D',
  SiSvelte: '#FF3E00',
  SiTailwindcss: '#38BDF8',
  SiFigma: '#F24E1E',
  FaAws: '#FF9900',
  VscAzure: '#0078D4',
  SiGooglecloud: '#4285F4',
  SiKubernetes: '#326CE5',
  SiTerraform: '#7B42BC',
  SiGrafana: '#F46324',
  SiPytorch: '#EE4C2C',
  SiTensorflow: '#FF6F00',
  SiPandas: '#150458',
  SiNumpy: '#013243',
  SiJupyter: '#F37626',
  SiStreamlit: '#FF4B4B',
  SiOpencv: '#5C3EE8',
  SiHuggingface: '#FFD21E',
  SiScikitlearn: '#F7931E',
  'simple-icons:canva': '#00C4CC',
  SiCanva: '#00C4CC',
  Canva: '#00C4CC',
  canva: '#00C4CC',
};

export interface IconResolverProps {
  iconName?: string | null;
  className?: string;
  style?: React.CSSProperties;
  size?: number | string;
  color?: string;
}

/**
 * Gets the React Icon component based on iconName prefix convention.
 */
function getReactIconComponent(name: string): React.ComponentType<{ className?: string; style?: React.CSSProperties }> | null {
  if (!name) return null;

  if (name.startsWith('Si')) {
    return (SiIcons as Record<string, any>)[name] || null;
  }
  if (name.startsWith('Fa')) {
    return (Fa6Icons as Record<string, any>)[name] || (FaIcons as Record<string, any>)[name] || null;
  }
  if (name.startsWith('Vsc') || name.startsWith('Vs')) {
    return (VscIcons as Record<string, any>)[name] || null;
  }
  if (name.startsWith('Tb')) {
    return (TbIcons as Record<string, any>)[name] || null;
  }
  if (name.startsWith('Md')) {
    return (MdIcons as Record<string, any>)[name] || null;
  }
  if (name.startsWith('Bi')) {
    return (BiIcons as Record<string, any>)[name] || null;
  }
  if (name.startsWith('Ri')) {
    return (RiIcons as Record<string, any>)[name] || null;
  }
  if (name.startsWith('Fi')) {
    return (FiIcons as Record<string, any>)[name] || null;
  }
  if (name.startsWith('Bs')) {
    return (BsIcons as Record<string, any>)[name] || null;
  }
  if (name.startsWith('Hi')) {
    return (Hi2Icons as Record<string, any>)[name] || null;
  }
  if (name.startsWith('Io')) {
    return (Io5Icons as Record<string, any>)[name] || null;
  }
  if (name.startsWith('Lu')) {
    return (LuIcons as Record<string, any>)[name] || null;
  }
  if (name.startsWith('Pi')) {
    return (PiIcons as Record<string, any>)[name] || null;
  }
  if (name.startsWith('Ci')) {
    return (CiIcons as Record<string, any>)[name] || null;
  }
  if (name.startsWith('Go')) {
    return (GoIcons as Record<string, any>)[name] || null;
  }
  if (name.startsWith('Gr')) {
    return (GrIcons as Record<string, any>)[name] || null;
  }

  return null;
}

export default function IconResolver({
  iconName,
  className = 'w-8 h-8',
  style,
  size,
  color,
}: IconResolverProps) {
  const trimmedName = iconName?.trim() || '';

  // Fallback icon component when icon is missing or not found
  const DefaultFallback = SiIcons.SiCodeigniter;

  if (!trimmedName) {
    return <DefaultFallback className={className} style={{ color: color || 'var(--blue)', ...style }} />;
  }

  // Handle special case for Next.js icon styling
  if (trimmedName === 'SiNextdotjs') {
    return (
      <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center flex-shrink-0">
        <SiIcons.SiNextdotjs className="w-5 h-5 text-white" />
      </div>
    );
  }

  // Handle Canva aliases or explicitly requested Canva Iconify string
  if (
    trimmedName === 'simple-icons:canva' ||
    trimmedName.toLowerCase() === 'sicanva' ||
    trimmedName.toLowerCase() === 'canva'
  ) {
    const iconColor = color || BRAND_COLORS['simple-icons:canva'] || '#00C4CC';
    return (
      <Icon
        icon="simple-icons:canva"
        className={className}
        style={{ color: iconColor, ...style }}
        width={size}
        height={size}
      />
    );
  }

  // 1. Check if iconName is an Iconify string (contains ":", e.g. "simple-icons:canva", "logos:figma")
  if (trimmedName.includes(':')) {
    const iconColor = color || BRAND_COLORS[trimmedName];
    return (
      <Icon
        icon={trimmedName}
        className={className}
        style={{ color: iconColor, ...style }}
        width={size}
        height={size}
      />
    );
  }

  // 2. Check React Icons dictionary lookup
  const ReactIconComponent = getReactIconComponent(trimmedName);
  if (ReactIconComponent) {
    const iconColor = color || BRAND_COLORS[trimmedName];
    return <ReactIconComponent className={className} style={{ color: iconColor, ...style }} />;
  }

  // 3. Fallback: try Iconify with simple-icons prefix if name looks like a brand (e.g., "canva")
  const iconColor = color || BRAND_COLORS[trimmedName] || 'var(--blue)';
  return (
    <Icon
      icon={`simple-icons:${trimmedName.toLowerCase()}`}
      className={className}
      style={{ color: iconColor, ...style }}
      width={size}
      height={size}
      fallback={<DefaultFallback className={className} style={{ color: iconColor, ...style }} />}
    />
  );
}

/**
 * Helper function matching the existing resolveSkillIcon signature for easy integration.
 */
export function resolveSkillIcon(iconName?: string | null): React.ReactNode {
  return <IconResolver iconName={iconName} className="w-8 h-8" />;
}
