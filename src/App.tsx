import React from "react";
import { Canvas } from "@react-three/fiber";
import {
  Environment,
  ContactShadows,
  OrbitControls,
  PresentationControls,
  Stage,
} from "@react-three/drei";
import { Model } from "./components/Model";
import "./App.css";

function App() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas
        shadows
        camera={{ position: [0, 0, 4], fov: 50 }}
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

        {/* Presentation controls for better model viewing */}
        <PresentationControls
          global
          rotation={[0.13, 0.1, 0]}
          polar={[-0.4, 0.2]}
          azimuth={[-1, 0.75]}
        >
          <Stage environment="city" intensity={0.6} shadows>
            <Model scale={0.1} />
          </Stage>
        </PresentationControls>

        {/* Contact shadows for realistic ground contact */}
        <ContactShadows
          position={[0, -1.4, 0]}
          opacity={0.75}
          scale={10}
          blur={2.5}
          far={4}
        />

        {/* Orbit controls for camera manipulation */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={10}
        />
      </Canvas>
    </div>
  );
}

export default App;
