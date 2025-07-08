import * as THREE from "three";
import { useRef, useEffect, useState, useCallback } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
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
  const [currentAction, setCurrentAction] = useState<ActionName>("Idle");

  const { camera } = useThree();

  const { nodes, materials, animations } = useGLTF(
    "/animation.glb"
  ) as unknown as GLTFResult;

  const { actions } = useAnimations(animations, group) as unknown as {
    actions: Record<ActionName, THREE.AnimationAction>;
  };

  // Determine target animation based on mouse position
  const getTargetAnimation = (x: number, y: number): ActionName => {
    // Dead zone in center for idle
    if (Math.abs(x) < 0.2 && Math.abs(y) < 0.2) return "Idle";

    // Quadrant-based selection
    if (x > 0 && y > 0) return "TopRight";
    if (x < 0 && y > 0) return "TopLeft";
    if (x < 0 && y < 0) return "BottomLeft";
    if (x > 0 && y < 0) return "BottomRight";

    return "Idle";
  };

  // Smooth transition between animations
  const transitionToAnimation = useCallback(
    (targetAnimation: ActionName) => {
      if (!actions[targetAnimation] || currentAction === targetAnimation)
        return;

      const currentAnim = actions[currentAction];
      const targetAnim = actions[targetAnimation];

      if (currentAnim && targetAnim) {
        targetAnim.reset().play();
        currentAnim.crossFadeTo(targetAnim, 0.3); // 0.3 second blend
        setCurrentAction(targetAnimation);
      }
    },
    [actions, currentAction]
  );

  // Initialize animations
  useEffect(() => {
    // Set all animations to clamp (don't loop)
    Object.values(actions).forEach((action) => {
      if (action) {
        action.setLoop(THREE.LoopOnce, 1);
        action.clampWhenFinished = true;
      }
    });

    // Start with idle animation
    if (actions["Idle"]) {
      actions["Idle"].play();
      setCurrentAction("Idle");
    }
  }, [actions]);

  // Handle mouse position changes
  useEffect(() => {
    const targetAnimation = getTargetAnimation(
      mousePosition.x,
      mousePosition.y
    );
    transitionToAnimation(targetAnimation);
  }, [mousePosition, currentAction, actions, transitionToAnimation]);

  useEffect(() => {
    if (camera) {
      const lookAtPosition = new THREE.Vector3(
        group.current.position.x + 2,
        group.current.position.y + 1,
        group.current.position.z
      );
      camera.lookAt(lookAtPosition);
    }
  }, [camera]);

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
