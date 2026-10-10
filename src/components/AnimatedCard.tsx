import React from 'react';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: 'lift' | 'scale' | 'glow' | 'shine';
  gradient?: boolean;
}

export function AnimatedCard({
  children,
  className = '',
  hoverEffect = 'lift',
  gradient = false
}: AnimatedCardProps) {
  const hoverClasses = {
    lift: 'hover-lift',
    scale: 'hover-scale',
    glow: 'hover-glow',
    shine: 'hover-shine',
  };

  return (
    <div className={`card-pro ${hoverClasses[hoverEffect]} ${gradient ? 'gradient-border' : ''} ${className}`}>
      {children}
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient?: string;
}

export function FeatureCard({ icon, title, description, gradient = 'from-jade/20 to-sky/20' }: FeatureCardProps) {
  return (
    <AnimatedCard hoverEffect="lift" className="p-6">
      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 animate-float`}>
        <div className="text-2xl">{icon}</div>
      </div>
      <h3 className="text-xl font-bold text-fog mb-2">{title}</h3>
      <p className="text-mist leading-relaxed">{description}</p>
    </AnimatedCard>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export function StatCard({ label, value, icon, trend = 'neutral', trendValue }: StatCardProps) {
  const trendColors = {
    up: 'text-jade',
    down: 'text-rose',
    neutral: 'text-mist',
  };

  const trendIcons = {
    up: '↑',
    down: '↓',
    neutral: '→',
  };

  return (
    <AnimatedCard hoverEffect="glow" className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="text-mist text-sm font-medium">{label}</div>
        {icon && <div className="text-jade">{icon}</div>}
      </div>
      <div className="text-3xl font-bold text-fog mb-2">{value}</div>
      {trendValue && (
        <div className={`flex items-center gap-1 text-sm ${trendColors[trend]}`}>
          <span>{trendIcons[trend]}</span>
          <span>{trendValue}</span>
        </div>
      )}
    </AnimatedCard>
  );
}

interface LanguageCardProps {
  name: string;
  logo: string;
  color: string;
  progress?: number;
}

export function LanguageCard({ name, logo, color, progress }: LanguageCardProps) {
  return (
    <AnimatedCard hoverEffect="scale" className="p-6 text-center">
      <div
        className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center text-3xl animate-bounce-subtle"
        style={{
          background: `${color}20`,
          boxShadow: `0 0 20px ${color}40`
        }}
      >
        {logo}
      </div>
      <h3 className="text-lg font-bold text-fog mb-2">{name}</h3>
      {progress !== undefined && (
        <div className="progress-bar mt-3">
          <div
            className="progress-bar-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </AnimatedCard>
  );
}
