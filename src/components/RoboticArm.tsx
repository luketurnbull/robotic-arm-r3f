import { Canvas } from "@react-three/fiber";
import { Center, Environment } from "@react-three/drei";
import { ContactShadows } from "@react-three/drei";
import { useEffect, useState } from "react";
import { Model } from "./model";

export default function RobotArm() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      // Normalize mouse position to -1 to 1 range
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -(event.clientY / window.innerHeight) * 2 + 1;
      setMousePosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <Canvas
      shadows
      camera={{ position: [3.8, 0.4, 1.3], fov: 50 }}
      gl={{ preserveDrawingBuffer: true }}
    >
      <Center>
        <Environment preset="city" />

        <ambientLight intensity={0.5} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          intensity={1}
          castShadow
        />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />

        <Model scale={1} position={[0, 0, 0]} mousePosition={mousePosition} />

        <ContactShadows
          position={[0, 0, 0]}
          opacity={1}
          scale={10}
          blur={2}
          far={4}
        />
      </Center>
    </Canvas>
  );
}
