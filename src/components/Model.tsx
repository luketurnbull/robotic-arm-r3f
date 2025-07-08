import * as THREE from "three";
import { useEffect, useRef, useMemo } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import type { GLTF } from "three-stdlib";
import type { JSX } from "react";

type GLTFResult = GLTF & {
  nodes: {
    Cylinder008: THREE.Mesh;
    Cylinder008_1: THREE.Mesh;
    Cylinder006: THREE.Mesh;
    Cylinder006_1: THREE.Mesh;
    elbow: THREE.Mesh;
    arm: THREE.Mesh;
    shoulder: THREE.Mesh;
    base: THREE.Mesh;
    Shoulder: THREE.Bone;
    IK_Bone: THREE.Bone;
  };
  materials: {
    ["metal-black"]: THREE.MeshStandardMaterial;
    ["metal-silver"]: THREE.MeshStandardMaterial;
    ["metal-yellow"]: THREE.MeshStandardMaterial;
  };
};

type ActionName =
  | "BottomLeft"
  | "BottomRight"
  | "Idle"
  | "TopLeft"
  | "TopRight";

type ModelProps = {
  mousePosition?: { x: number; y: number };
} & JSX.IntrinsicElements["group"];

export function Model({
  mousePosition = { x: 0, y: 0 },
  ...props
}: ModelProps) {
  const group = useRef<THREE.Group>(null!);
  const previousAnimation = useRef<ActionName | null>(null);
  const currentAnimation = useRef<ActionName>("Idle");

  const { nodes, materials, animations } = useGLTF(
    "/animation.glb"
  ) as unknown as GLTFResult;

  const { actions } = useAnimations(animations, group) as unknown as {
    actions: Record<ActionName, THREE.AnimationAction>;
  };

  // Determine which animation to play based on mouse position
  const targetAnimation = useMemo(() => {
    const { x, y } = mousePosition;
    const distanceFromCenter = Math.sqrt(x * x + y * y);

    // Use a smaller center zone to prevent unwanted Idle transitions
    if (distanceFromCenter < 0.15) {
      return "Idle";
    }

    // Determine direction based on mouse position with better thresholds
    // Use absolute values to create clear quadrants
    const absX = Math.abs(x);
    const absY = Math.abs(y);

    // Only transition to directional animations if we're clearly in a corner
    if (absX > 0.4 && absY > 0.4) {
      if (x > 0 && y > 0) return "TopRight";
      if (x > 0 && y < 0) return "BottomRight";
      if (x < 0 && y > 0) return "TopLeft";
      if (x < 0 && y < 0) return "BottomLeft";
    }

    // If not clearly in a corner, maintain current animation
    return currentAnimation.current;
  }, [mousePosition]);

  useEffect(() => {
    const currentAction = actions[targetAnimation];
    const previousAction = previousAnimation.current
      ? actions[previousAnimation.current]
      : null;

    if (currentAction && targetAnimation !== currentAnimation.current) {
      // Set all animations to not loop
      Object.values(actions).forEach((action) => {
        if (action) {
          action.setLoop(THREE.LoopOnce, 1);
          action.clampWhenFinished = true;
        }
      });

      if (previousAction && previousAction !== currentAction) {
        // Smooth transition between animations
        previousAction.fadeOut(0.5); // Fade out previous animation over 0.5 seconds
        currentAction.reset().fadeIn(0.5).play(); // Fade in new animation over 0.5 seconds
      } else {
        // First time or same animation
        currentAction.reset().play();
      }

      previousAnimation.current = currentAnimation.current;
      currentAnimation.current = targetAnimation;
    }
  }, [actions, targetAnimation]);

  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Scene">
        <group name="Armature" position={[0, 5.676, 0]}>
          <primitive object={nodes.Shoulder} />
          <primitive object={nodes.IK_Bone} />
        </group>
        <mesh
          name="base"
          castShadow
          receiveShadow
          geometry={nodes.base.geometry}
          material={materials["metal-yellow"]}
          scale={[2.43, 1, 2.43]}
        />
      </group>
    </group>
  );
}

useGLTF.preload("/animation.glb");
