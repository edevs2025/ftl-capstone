import React, { useEffect, useRef } from "react";
import {
  BufferAttribute,
  Clock,
  PerspectiveCamera,
  BufferGeometry,
  Points,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
  Vector3,
} from "three";

const ModifiedParticleEffect = () => {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const dimensions = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
    const canvas = canvasRef.current;
    const scene = new Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new PerspectiveCamera(
      75,
      dimensions.width / dimensions.height,
      0.1,
      100
    );
    camera.position.set(0, 0, 3);
    scene.add(camera);

     // Particles
     const particlesCount = 15000;
     const positions = new Float32Array(particlesCount * 3);
     const particleSizes = new Float32Array(particlesCount);
     const colors = new Float32Array(particlesCount);
 
     for (let i = 0; i < particlesCount; i++) {
       const i3 = i * 3;
       const phi = Math.acos(-1 + (2 * i) / particlesCount);
       const theta = Math.sqrt(particlesCount * Math.PI) * phi;
 
       const x = Math.cos(theta) * Math.sin(phi);
       const y = Math.sin(theta) * Math.sin(phi);
       const z = Math.cos(phi);
 
       positions[i3] = x * 2;
       positions[i3 + 1] = y * 2;
       positions[i3 + 2] = z * 2;
 
       particleSizes[i] = Math.random() * 4.0; // Adjusted to match second file
       colors[i] = Math.random() > 0.5 ? 1.0 : 0.0; // Binary color like in second file
     }
 
     const geometry = new BufferGeometry();
     geometry.setAttribute('position', new BufferAttribute(positions, 3));
     geometry.setAttribute('aSize', new BufferAttribute(particleSizes, 1));
     geometry.setAttribute('aColor', new BufferAttribute(colors, 1));
 
     const material = new ShaderMaterial({
       uniforms: {
         uTime: { value: 0 },
         uScale: { value: 0 },
       },
       vertexShader: `
         uniform float uTime;
         uniform float uScale;
         attribute float aSize;
         attribute float aColor;
         varying float vColor;
         varying float vPositionY;
         
         void main() {
           vec4 modelPosition = modelMatrix * vec4(position, 1.0);
           
           float angle = atan(modelPosition.y, modelPosition.x);
           float distanceToCenter = length(modelPosition.xyz);
           
           float angleOffset = (1.0 / distanceToCenter) * uTime * 0.5;
           angle += angleOffset;
           
           modelPosition.x = cos(angle) * distanceToCenter;
           modelPosition.y = sin(angle) * distanceToCenter;
           
           modelPosition.xyz += normalize(modelPosition.xyz) * sin(uTime * 3.0 + distanceToCenter * 5.0) * 0.1;
 
           vec4 viewPosition = viewMatrix * modelPosition;
           vec4 projectedPosition = projectionMatrix * viewPosition;
           gl_Position = projectedPosition;
           
           gl_PointSize = aSize * uScale * (1.0 / - viewPosition.z);
           
           vColor = aColor;
           vPositionY = modelPosition.y;
         }
       `,
       fragmentShader: `
         varying float vColor;
         varying float vPositionY;
         
         void main() {
           float strength = (vPositionY + 2.0) * 0.25; // Adjusted for sphere shape
           vec3 color = mix(vec3(1.0, 1.0, 1.0), vec3(0.392, 0.424, 1.0), vColor);
           gl_FragColor = vec4(color, strength);
         }
       `,
       transparent: true,
       depthWrite: false,
     });

    const particles = new Points(geometry, material);
    scene.add(particles);

    // Renderer
    const renderer = new WebGLRenderer({ canvas: canvas, alpha: true });
    rendererRef.current = renderer;
    renderer.setSize(dimensions.width, dimensions.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const handleResize = () => {
      dimensions.width = window.innerWidth;
      dimensions.height = window.innerHeight;
      camera.aspect = dimensions.width / dimensions.height;
      camera.updateProjectionMatrix();
      renderer.setSize(dimensions.width, dimensions.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener("resize", handleResize);

    const clock = new Clock();
    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      material.uniforms.uTime.value = elapsedTime * 0.3; // Slowed down overall animation
      material.uniforms.uScale.value = Math.sin(elapsedTime * 0.2) * 0.3 + 1.7; // Adjusted scale animation

      particles.rotation.y = elapsedTime * 0.02; // Slowed down rotation

      renderer.render(scene, camera);
      animationFrameRef.current = window.requestAnimationFrame(animate);
    };
    animate();
    

    // Cleanup function
    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (sceneRef.current) {
        sceneRef.current.traverse((object) => {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach((material) => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
      }
    };
  }, []);

  return <canvas ref={canvasRef} className="webgl" />;
};

export default ModifiedParticleEffect;