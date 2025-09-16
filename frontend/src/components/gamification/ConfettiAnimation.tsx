import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ConfettiAnimationProps {
  isActive: boolean;
  duration?: number; // in milliseconds
  colors?: string[];
  particleCount?: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  size: number;
  opacity: number;
  life: number;
}

const ConfettiAnimation: React.FC<ConfettiAnimationProps> = ({
  isActive,
  duration = 3000,
  colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FFB347'],
  particleCount = 50
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  const createParticle = React.useCallback((id: number): Particle => {
    return {
      id,
      x: Math.random() * window.innerWidth,
      y: -10,
      velocityX: (Math.random() - 0.5) * 10,
      velocityY: Math.random() * 5 + 2,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      opacity: 1,
      life: 1
    };
  }, [colors]);

  useEffect(() => {
    if (!isActive) {
      setIsVisible(false);
      setParticles([]);
      return;
    }

    setIsVisible(true);

    // Create initial particles
    const initialParticles = Array.from({ length: particleCount }, (_, i) => 
      createParticle(i)
    );
    setParticles(initialParticles);

    // Animation loop
    let animationId: number;
    let lastTime = Date.now();

    const animate = () => {
      const currentTime = Date.now();
      const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
      lastTime = currentTime;

      setParticles(prevParticles => {
        return prevParticles.map(particle => {
          const newParticle = {
            ...particle,
            x: particle.x + particle.velocityX * deltaTime * 60,
            y: particle.y + particle.velocityY * deltaTime * 60,
            rotation: particle.rotation + particle.rotationSpeed * deltaTime * 60,
            life: particle.life - deltaTime / (duration / 1000),
            opacity: Math.max(0, particle.life - deltaTime / (duration / 1000)),
            velocityY: particle.velocityY + 9.8 * deltaTime * 20 // gravity
          };

          // Reset particle if it goes off screen or dies
          if (newParticle.y > window.innerHeight + 50 || newParticle.life <= 0) {
            return createParticle(particle.id);
          }

          return newParticle;
        }).filter(particle => particle.life > 0);
      });

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    // Clean up after duration
    const cleanupTimer = setTimeout(() => {
      setIsVisible(false);
      setParticles([]);
    }, duration);

    return () => {
      cancelAnimationFrame(animationId);
      clearTimeout(cleanupTimer);
    };
  }, [isActive, duration, particleCount, createParticle]);

  if (!isVisible) return null;

  return createPortal(
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute pointer-events-none"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            transform: `rotate(${particle.rotation}deg)`,
            opacity: particle.opacity,
          }}
        >
          <div
            className="rounded"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              boxShadow: `0 0 ${particle.size / 2}px ${particle.color}50`,
            }}
          />
        </div>
      ))}
    </div>,
    document.body
  );
};

export default ConfettiAnimation;