import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { useEffect, useRef } from "react";
import type { JSX } from "react";

type GLTFResult = {
  nodes: {
    base: THREE.Bone;
    shoulder: THREE.Bone;
    arm: THREE.Bone;
    elbow: THREE.Bone;
    forearm: THREE.Bone;
    hand: THREE.Bone;
    IK_Bone: THREE.Bone;
    // Meshes
    shoulder_bone: THREE.Mesh;
    arm_bone: THREE.Mesh;
    elbow_bone: THREE.Mesh;
    forearm_1: THREE.Mesh;
    forearm_2: THREE.Mesh;
    hand_1: THREE.Mesh;
    hand_2: THREE.Mesh;
  };
  materials: {
    ["metal-black"]: THREE.MeshStandardMaterial;
    ["metal-silver"]: THREE.MeshStandardMaterial;
    ["metal-yellow"]: THREE.MeshStandardMaterial;
  };
  scene: THREE.Group;
};

export function RobotArmIK(
  props: JSX.IntrinsicElements["group"] & {
    onReady?: (controls: {
      moveTarget: (position: THREE.Vector3) => void;
    }) => void;
  }
) {
  const { nodes, scene } = useGLTF("/robot-arm.glb") as unknown as GLTFResult;
  const groupRef = useRef<THREE.Group>(null);
  const targetRef = useRef<THREE.Object3D>(null);

  useEffect(() => {
    if (!groupRef.current) return;

    // Create IK target
    const target = new THREE.Object3D();
    target.position.set(0, 2, 2); // Position the target
    groupRef.current.add(target);
    targetRef.current = target;

    console.log("Robot Arm IK initialized with bones:", {
      base: nodes.base,
      shoulder: nodes.shoulder,
      arm: nodes.arm,
      elbow: nodes.elbow,
      forearm: nodes.forearm,
      hand: nodes.hand,
      target: target,
    });

    // Simple bone rotation test
    const animateBones = () => {
      // Rotate the shoulder bone to test if bones are working
      nodes.shoulder.rotation.z += 0.01;
      nodes.arm.rotation.z += 0.005;

      console.log("Target position:", target.position);
      console.log(
        "Hand bone position:",
        nodes.hand.getWorldPosition(new THREE.Vector3())
      );
    };

    // Add to animation loop
    const animate = () => {
      animateBones();
      requestAnimationFrame(animate);
    };
    animate();
  }, [nodes]);

  // Function to move the target (can be called externally)
  const moveTarget = (position: THREE.Vector3) => {
    if (targetRef.current) {
      targetRef.current.position.copy(position);
      console.log("Moving target to:", position);
    }
  };

  // Expose moveTarget function to parent component
  useEffect(() => {
    if (props.onReady) {
      props.onReady({ moveTarget });
    }
  }, [props.onReady]);

  return (
    <group ref={groupRef} {...props}>
      {/* Use the original scene instead of cloning to preserve bone references */}
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload("/robot-arm.glb");
