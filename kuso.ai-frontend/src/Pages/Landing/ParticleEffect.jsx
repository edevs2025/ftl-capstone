import React, { useEffect, useRef } from "react";
import {
  BufferAttribute,
  Clock,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from "three";

const ParticleEffect = () => {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
    const canvas = canvasRef.current;
    const scene = new Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new PerspectiveCamera(
      75,
      sizes.width / sizes.height,
      0.1,
      100
    );
    camera.position.set(0, 1.1, 10);
    scene.add(camera);

    // Plane
    const planeGeometry = new PlaneGeometry(20, 20, 150, 150);
    const planeMaterial = new ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uElevation: { value: 0.482 },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uElevation;
        attribute float aSize;
        attribute float aColor;
        varying float vPositionY;
        varying float vPositionZ;
        varying float vColor;
        void main() {
          vec4 modelPosition = modelMatrix * vec4(position, 1.0);
          modelPosition.y = sin(modelPosition.x - uTime) * sin(modelPosition.z * 0.6 + uTime) * uElevation;
          vec4 viewPosition = viewMatrix * modelPosition;
          gl_Position = projectionMatrix * viewPosition;
          gl_PointSize = 4.0 * aSize;
          gl_PointSize *= (1.0 / - viewPosition.z);
          vPositionY = modelPosition.y;
          vPositionZ = modelPosition.z;
          vColor = aColor;
        }
      `,
      fragmentShader: `
        varying float vPositionY;
        varying float vPositionZ;
        varying float vColor;
        void main() {
          float strength = (vPositionY + 0.55) * 0.9;
          vec3 color = mix(vec3(1.0, 1.0, 1.0), vec3(0.392, 0.424, 1.0), vColor);
          gl_FragColor = vec4(color, strength);
        }
      `,
      transparent: true,
    });

    const planeSizesArray = new Float32Array(
      planeGeometry.attributes.position.count
    );
    const planeColorsArray = new Float32Array(
      planeGeometry.attributes.position.count
    );
    for (let i = 0; i < planeSizesArray.length; i++) {
      planeSizesArray[i] = Math.random() * 4.0;
      planeColorsArray[i] = Math.random() > 0.5 ? 1.0 : 0.0;
    }
    planeGeometry.setAttribute(
      "aSize",
      new BufferAttribute(planeSizesArray, 1)
    );
    planeGeometry.setAttribute(
      "aColor",
      new BufferAttribute(planeColorsArray, 1)
    );

    const plane = new Points(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI * 0.4;
    scene.add(plane);

    // Renderer
    const renderer = new WebGLRenderer({ canvas: canvas });
    rendererRef.current = renderer;
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const handleResize = () => {
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;
      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();
      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener("resize", handleResize);

    const clock = new Clock();
    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      planeMaterial.uniforms.uTime.value = elapsedTime;

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

export default ParticleEffect;
