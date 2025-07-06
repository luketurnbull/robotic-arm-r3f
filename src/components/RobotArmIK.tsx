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
    target.position.set(0, 2, 2);
    groupRef.current.add(target);
    targetRef.current = target;

    // Advanced IK system
    const updateIK = () => {
      const targetPos = target.getWorldPosition(new THREE.Vector3());
      const handPos = nodes.hand.getWorldPosition(new THREE.Vector3());
      const shoulderPos = nodes.shoulder.getWorldPosition(new THREE.Vector3());

      const targetDistance = targetPos.distanceTo(handPos);

      if (targetDistance > 0.1) {
        const shoulderToTargetDir = targetPos
          .clone()
          .sub(shoulderPos)
          .normalize();

        // Shoulder rotation (main IK)
        const shoulderAngle = Math.atan2(
          shoulderToTargetDir.y,
          shoulderToTargetDir.x
        );
        nodes.shoulder.rotation.z = THREE.MathUtils.lerp(
          nodes.shoulder.rotation.z,
          shoulderAngle * 0.8,
          0.03
        );

        // Arm rotation (secondary IK)
        const armAngle =
          Math.atan2(shoulderToTargetDir.z, shoulderToTargetDir.x) * 0.4;
        nodes.arm.rotation.y = THREE.MathUtils.lerp(
          nodes.arm.rotation.y,
          armAngle,
          0.02
        );

        // Elbow rotation (tertiary IK)
        const elbowAngle = Math.sin(Date.now() * 0.002) * 0.2;
        nodes.elbow.rotation.z = THREE.MathUtils.lerp(
          nodes.elbow.rotation.z,
          elbowAngle,
          0.01
        );

        // Forearm rotation (fine adjustment)
        const forearmAngle = Math.cos(Date.now() * 0.001) * 0.1;
        nodes.forearm.rotation.z = THREE.MathUtils.lerp(
          nodes.forearm.rotation.z,
          forearmAngle,
          0.005
        );
      }
    };

    // Animation loop
    const animate = () => {
      updateIK();
      requestAnimationFrame(animate);
    };
    animate();
  }, [nodes]);

  // Function to move the target (can be called externally)
  const moveTarget = (position: THREE.Vector3) => {
    if (targetRef.current) {
      targetRef.current.position.copy(position);
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
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload("/robot-arm.glb");
