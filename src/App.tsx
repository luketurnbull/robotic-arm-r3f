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
    console.log("Robot arm controls ready!");
  };

  // Test IK movement
  useEffect(() => {
    const testMovement = () => {
      if (robotArmRef.current) {
        // Move the target to different positions
        const positions = [
          new THREE.Vector3(0, 2, 2),
          new THREE.Vector3(1, 2, 1),
          new THREE.Vector3(-1, 2, 1),
          new THREE.Vector3(0, 3, 0),
        ];

        let index = 0;
        const interval = setInterval(() => {
          robotArmRef.current?.moveTarget(positions[index]);
          index = (index + 1) % positions.length;
        }, 2000);

        return () => clearInterval(interval);
      }
    };

    const timeout = setTimeout(testMovement, 1000);
    return () => clearTimeout(timeout);
  }, [robotArmRef.current]);

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
