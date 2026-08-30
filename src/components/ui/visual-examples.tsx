/**
 * Visual Components Examples
 * 
 * This file demonstrates how to use the new visual components for improved site appearance.
 * These components provide modern, animated, and visually appealing UI elements.
 */

import { AnimatedCard } from './animated-card';
import { GlassCard } from './glass-card';
import { GradientText } from './gradient-text';
import { ShimmerButton } from './shimmer-button';
import { SectionHeader } from './section-header';
import { StatsCard } from './stats-card';
import { FeatureCard } from './feature-card';
import { Users, Trophy, Building2, TrendingUp, Zap, Shield, Clock, Award } from 'lucide-react';

// Example 1: Stats Dashboard with Animated Cards
export function StatsDashboardExample() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <AnimatedCard animation="fade-in-up" delay={0}>
        <StatsCard
          title="Atletas Ativos"
          value="1,234"
          icon={Users}
          trend={{ value: 12, isPositive: true }}
          variant="emerald"
        />
      </AnimatedCard>
      
      <AnimatedCard animation="fade-in-up" delay={100}>
        <StatsCard
          title="Clubes Filiados"
          value="45"
          icon={Building2}
          trend={{ value: 5, isPositive: true }}
          variant="gold"
        />
      </AnimatedCard>
      
      <AnimatedCard animation="fade-in-up" delay={200}>
        <StatsCard
          title="Eventos Realizados"
          value="28"
          icon={Trophy}
          trend={{ value: 8, isPositive: true }}
          variant="blue"
        />
      </AnimatedCard>
      
      <AnimatedCard animation="fade-in-up" delay={300}>
        <StatsCard
          title="Crescimento Anual"
          value="15%"
          icon={TrendingUp}
          trend={{ value: 3, isPositive: true }}
          variant="purple"
        />
      </AnimatedCard>
    </div>
  );
}

// Example 2: Feature Section with Gradient Text
export function FeatureSectionExample() {
  return (
    <section className="py-16">
      <SectionHeader
        title="Nossos Diferenciais"
        subtitle="POR QUE ESCOLHER A FCDA"
        description="Descubra o que nos torna uma referência em desportos aquáticos no Ceará"
        alignment="center"
        variant="gradient"
        badge="Excelência"
      />
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-12">
        <FeatureCard
          icon={Zap}
          title="Infraestrutura Moderna"
          description="Centro aquático de última geração com tecnologia avançada para competições e treinamentos."
          variant="emerald"
        />
        
        <FeatureCard
          icon={Shield}
          title="Segurança Total"
          description "Equipe de salvamento especializada e protocolos rigorosos de segurança em todas as atividades."
          variant="gold"
        />
        
        <FeatureCard
          icon={Clock}
          title="Horários Flexíveis"
          description="Diversas opções de horários para atender atletas de todas as idades e níveis."
          variant="blue"
        />
        
        <FeatureCard
          icon={Award}
          title="Formação de Elite"
          description="Programas de desenvolvimento técnico com treinadores certificados e metodologia comprovada."
          variant="purple"
        />
        
        <FeatureCard
          icon={Users}
          title="Comunidade Ativa"
          description="Ambiente acolhedor e integrador que promove o desenvolvimento social e esportivo."
          variant="emerald"
        />
        
        <FeatureCard
          icon={Trophy}
          title="Resultados Comprovados"
          description "Histórico de conquistas em competições estaduais, nacionais e internacionais."
          variant="gold"
        />
      </div>
    </section>
  );
}

// Example 3: Glass Card with Gradient Text
export function GlassCardExample() {
  return (
    <div className="relative py-16">
      <div className="absolute inset-0 bg-mesh opacity-50" />
      
      <div className="relative max-w-4xl mx-auto px-6">
        <GlassCard variant="hero" blur="lg" className="p-8 md:p-12">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <GradientText variant="shimmer" size="xl">
                Bem-vindo à FCDA
              </GradientText>
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8">
              Federação Cearense de Desportos Aquáticos - Excelência em natação, 
              nado artístico, polo aquático e saltos ornamentais desde 1995.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <ShimmerButton>Conhecer Nossos Cursos</ShimmerButton>
              <ShimmerButton shimmerColor="rgba(201, 168, 76, 0.3)">Ver Eventos</ShimmerButton>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

// Example 4: Complex Animation Composition
export function AnimationShowcaseExample() {
  return (
    <div className="grid gap-8 py-16">
      <SectionHeader
        title="Animações e Transições"
        subtitle="EXPERIÊNCIA VISUAL APRIMORADA"
        description="Elementos animados que proporcionam uma experiência de usuário mais dinâmica e envolvente"
        alignment="center"
      />
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatedCard animation="fade-in-up" delay={0} hover>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-gradient flex items-center justify-center text-white text-2xl font-bold">
              1
            </div>
            <h3 className="text-xl font-bold mb-2">Fade In Up</h3>
            <p className="text-muted-foreground">Elemento desliza de baixo para cima com opacidade gradual</p>
          </div>
        </AnimatedCard>
        
        <AnimatedCard animation="scale-in" delay={100} hover>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold-gradient flex items-center justify-center text-white text-2xl font-bold">
              2
            </div>
            <h3 className="text-xl font-bold mb-2">Scale In</h3>
            <p className="text-muted-foreground">Elemento aparece com efeito de zoom suave</p>
          </div>
        </AnimatedCard>
        
        <AnimatedCard animation="bounce-in" delay={200} hover>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-gradient flex items-center justify-center text-white text-2xl font-bold">
              3
            </div>
            <h3 className="text-xl font-bold mb-2">Bounce In</h3>
            <p className="text-muted-foreground">Elemento aparece com efeito de bounce elástico</p>
          </div>
        </AnimatedCard>
      </div>
    </div>
  );
}

// Example 5: Color Variants Showcase
export function ColorVariantsExample() {
  return (
    <div className="grid gap-6 py-16">
      <SectionHeader
        title="Paleta de Cores"
        subtitle="IDENTIDADE VISUAL"
        description="Cores e gradientes que refletem a identidade da FCDA"
        alignment="center"
      />
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <GradientText variant="emerald" size="xl">Texto Esmeralda</GradientText>
        <GradientText variant="gold" size="xl">Texto Dourado</GradientText>
        <GradientText variant="blue" size="xl">Texto Azul</GradientText>
        <GradientText variant="purple" size="xl">Texto Roxo</GradientText>
        <GradientText variant="rose" size="xl">Texto Rosa</GradientText>
        <GradientText variant="teal" size="xl">Texto Teal</GradientText>
        <GradientText variant="shimmer" size="xl">Texto Shimmer</GradientText>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-8">
        <div className="h-20 rounded-xl bg-emerald-gradient" />
        <div className="h-20 rounded-xl bg-gold-gradient" />
        <div className="h-20 rounded-xl bg-blue-gradient" />
        <div className="h-20 rounded-xl bg-purple-gradient" />
        <div className="h-20 rounded-xl bg-rose-gradient" />
        <div className="h-20 rounded-xl bg-teal-gradient" />
      </div>
    </div>
  );
}