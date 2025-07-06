import { Canvas } from "@react-three/fiber";
import { Environment, ContactShadows, OrbitControls } from "@react-three/drei";
import { RobotArmIK } from "./components/RobotArmIK";
import "./App.css";
import { useEffect, useRef } from "react";
import * as THREE from "three";

function App() {
  const robotArmRef = useRef<{
    moveTarget: (position: THREE.Vector3) => void;
  } | null>(null);

  const handleRobotArmReady = (controls: {
    moveTarget: (position: THREE.Vector3) => void;
  }) => {
    robotArmRef.current = controls;
  };

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      // Convert mouse position to normalized device coordinates (-1 to +1)
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = (event.clientY / window.innerHeight) * 2 - 1; // Removed negative sign

      // Convert to 3D world coordinates
      const worldX = x * 4; // Scale to reasonable world space
      const worldY = y * 4 + 4; // Increased scale and offset for more vertical range
      const worldZ = 2; // Keep Z constant for now

      const newPosition = new THREE.Vector3(worldX, worldY, worldZ);

      // Move the robot arm target
      if (robotArmRef.current) {
        robotArmRef.current.moveTarget(newPosition);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas
        shadows
        camera={{ position: [5, 3, 5], fov: 50 }}
        gl={{ preserveDrawingBuffer: true }}
      >
        <color attach="background" args={["#f0f0f0"]} />

        {/* Environment with city preset */}
        <Environment preset="city" />

        {/* Lighting setup with preset rembrandt */}
        <ambientLight intensity={0.5} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          intensity={1}
          castShadow
        />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />

        <group>
          <RobotArmIK
            scale={0.1}
            position={[0, 0, 0]}
            onReady={handleRobotArmReady}
          />
        </group>

        {/* Contact shadows for realistic ground contact */}
        <ContactShadows
          position={[0, 0, 0]}
          opacity={0.75}
          scale={10}
          blur={2.5}
          far={4}
        />

        {/* Orbit controls for camera manipulation */}
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      </Canvas>
    </div>
  );
}

export default App;
