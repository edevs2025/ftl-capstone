import React from "react";
import { MeshWobbleMaterial, OrbitControls, Sphere } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

const WaveScene = () => (
  <Sphere args={[1, 100, 200]} scale={2.4}>
    <MeshWobbleMaterial color="#f00" factor={1} speed={3} />
    <OrbitControls />
  </Sphere>
);

export default WaveScene;
