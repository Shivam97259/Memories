import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface StarfieldCanvasProps {
  particleCount?: number;
  starColor?: string;
  speed?: number;
}

export function StarfieldCanvas({
  particleCount = 1800,
  speed = 0.0006,
}: StarfieldCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030712, 0.0008);

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );
    camera.position.z = 600;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x030712, 1);
    container.appendChild(renderer.domElement);

    // Starfield Geometry & Colors
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    // Cosmological Color Palette: Deep Stellar Cyan (#06b6d4), Nebula Violet (#8b5cf6), Pure White (#f8fafc)
    const colorWhite = new THREE.Color(0xf8fafc);
    const colorCyan = new THREE.Color(0x06b6d4);
    const colorViolet = new THREE.Color(0x8b5cf6);
    const colorStellarBlue = new THREE.Color(0x38bdf8);

    const colorChoices = [colorWhite, colorCyan, colorViolet, colorStellarBlue];

    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      // Spread stars in spherical or cylindrical astronomical space
      const radius = 200 + Math.random() * 1200;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[idx] = radius * Math.sin(phi) * Math.cos(theta);
      positions[idx + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[idx + 2] = radius * Math.cos(phi);

      // Random color selection favoring cyan and violet nebula undertones
      const chosenColor = colorChoices[Math.floor(Math.random() * colorChoices.length)];
      colors[idx] = chosenColor.r;
      colors[idx + 1] = chosenColor.g;
      colors[idx + 2] = chosenColor.b;

      scales[i] = Math.random() * 2.5 + 0.8;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle texture generator for soft glowing circular stars
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, 'rgba(255,255,255,1)');
      gradient.addColorStop(0.3, 'rgba(139,92,246,0.8)');
      gradient.addColorStop(0.6, 'rgba(6,182,212,0.3)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 32, 32);
    }
    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 4,
      map: texture,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const starField = new THREE.Points(geometry, material);
    scene.add(starField);

    // Subtle cosmic nebula cloud points
    const nebulaGeometry = new THREE.BufferGeometry();
    const nebulaCount = 200;
    const nebulaPositions = new Float32Array(nebulaCount * 3);
    const nebulaColors = new Float32Array(nebulaCount * 3);

    for (let i = 0; i < nebulaCount; i++) {
      const idx = i * 3;
      nebulaPositions[idx] = (Math.random() - 0.5) * 1600;
      nebulaPositions[idx + 1] = (Math.random() - 0.5) * 1200;
      nebulaPositions[idx + 2] = (Math.random() - 0.5) * 1400;

      const isCyan = Math.random() > 0.5;
      const c = isCyan ? colorCyan : colorViolet;
      nebulaColors[idx] = c.r;
      nebulaColors[idx + 1] = c.g;
      nebulaColors[idx + 2] = c.b;
    }
    nebulaGeometry.setAttribute('position', new THREE.BufferAttribute(nebulaPositions, 3));
    nebulaGeometry.setAttribute('color', new THREE.BufferAttribute(nebulaColors, 3));

    const nebulaMaterial = new THREE.PointsMaterial({
      size: 32,
      map: texture,
      vertexColors: true,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const nebulaMesh = new THREE.Points(nebulaGeometry, nebulaMaterial);
    scene.add(nebulaMesh);

    // Mouse movement reactivity
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX - window.innerWidth / 2) * 0.05;
      mouseY = (event.clientY - window.innerHeight / 2) * 0.05;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // WebGL context handling
    const canvasElement = renderer.domElement;
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      console.warn('WebGL context lost in Starfield');
    };
    canvasElement.addEventListener('webglcontextlost', handleContextLost, false);

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      targetX += (mouseX - targetX) * 0.02;
      targetY += (mouseY - targetY) * 0.02;

      starField.rotation.y += speed;
      starField.rotation.x += speed * 0.4;

      nebulaMesh.rotation.y -= speed * 0.6;

      camera.position.x = targetX * 0.5;
      camera.position.y = -targetY * 0.5;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      canvasElement.removeEventListener('webglcontextlost', handleContextLost);
      geometry.dispose();
      material.dispose();
      nebulaGeometry.dispose();
      nebulaMaterial.dispose();
      texture.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [particleCount, speed]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-[#030712]"
      aria-hidden="true"
    />
  );
}
