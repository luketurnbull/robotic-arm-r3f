import * as THREE from "three";
import { useRef, useEffect, useCallback } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { useThree, useFrame } from "@react-three/fiber";
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

type ActionName = "BottomLeft" | "BottomRight" | "TopLeft" | "TopRight";

type ModelProps = {
  mousePosition?: { x: number; y: number };
} & JSX.IntrinsicElements["group"];

export function Model({
  mousePosition = { x: 0, y: 0 },
  scale = 1,
  ...props
}: ModelProps) {
  const group = useRef<THREE.Group>(null!);
  const mixer = useRef<THREE.AnimationMixer | null>(null);
  const currentWeights = useRef<Record<ActionName, number>>({
    TopLeft: 0.25,
    TopRight: 0.25,
    BottomLeft: 0.25,
    BottomRight: 0.25,
  });

  const { camera } = useThree();

  const { nodes, materials, animations } = useGLTF(
    "/animation-2.glb"
  ) as unknown as GLTFResult;

  const { actions } = useAnimations(animations, group) as unknown as {
    actions: Record<ActionName, THREE.AnimationAction>;
  };

  // Calculate target weights based on mouse position
  const calculateTargetWeights = useCallback(
    (mousePos: { x: number; y: number }) => {
      // Normalize mouse position from [-1, 1] to [0, 1] for easier calculation
      const normalizedX = (mousePos.x + 1) / 2;
      const normalizedY = (mousePos.y + 1) / 2;

      // Define deadzone for center (idle) - adjust as needed
      const deadZone = 0.1;
      const centerX = Math.abs(mousePos.x) < deadZone;
      const centerY = Math.abs(mousePos.y) < deadZone;

      if (centerX && centerY) {
        // In center deadzone - use idle
        return {
          TopLeft: 0,
          TopRight: 0,
          BottomLeft: 0,
          BottomRight: 0,
          Idle: 1,
        };
      }

      // Calculate weights for each corner based on distance
      const topWeight = Math.max(0, normalizedY);
      const bottomWeight = Math.max(0, 1 - normalizedY);
      const leftWeight = Math.max(0, 1 - normalizedX);
      const rightWeight = Math.max(0, normalizedX);

      const weights = {
        TopLeft: topWeight * leftWeight,
        TopRight: topWeight * rightWeight,
        BottomLeft: bottomWeight * leftWeight,
        BottomRight: bottomWeight * rightWeight,
        Idle: 0,
      };

      // Normalize weights so they sum to 1
      const totalWeight = Object.values(weights).reduce(
        (sum, weight) => sum + weight,
        0
      );
      if (totalWeight > 0) {
        Object.keys(weights).forEach((key) => {
          weights[key as ActionName] /= totalWeight;
        });
      }

      return weights;
    },
    []
  );

  // Initialize animations
  useEffect(() => {
    if (!actions || !group.current) return;

    // Create mixer
    mixer.current = new THREE.AnimationMixer(group.current);

    // Setup all actions as static poses
    Object.entries(actions).forEach(([_, action]) => {
      if (action) {
        action.setLoop(THREE.LoopOnce, 1);
        action.clampWhenFinished = true;
        action.enabled = true;
        action.setEffectiveTimeScale(1);
        action.setEffectiveWeight(0.25); // Start with equal weights
        action.play();
      }
    });

    return () => {
      if (mixer.current) {
        mixer.current.stopAllAction();
      }
    };
  }, [actions]);

  // Animation loop
  useFrame((_, delta) => {
    if (!mixer.current || !actions) return;

    // Calculate target weights
    const targetWeights = calculateTargetWeights(mousePosition);

    // Smoothly interpolate current weights towards target weights
    const lerpSpeed = 3; // Adjust for faster/slower transitions
    Object.keys(currentWeights.current).forEach((actionName) => {
      const key = actionName as ActionName;
      const currentWeight = currentWeights.current[key];
      const targetWeight = targetWeights[key];

      // Smooth interpolation
      const newWeight = THREE.MathUtils.lerp(
        currentWeight,
        targetWeight,
        lerpSpeed * delta
      );
      currentWeights.current[key] = newWeight;

      // Apply weight to action
      if (actions[key]) {
        actions[key].setEffectiveWeight(newWeight);
      }
    });

    // Update mixer
    mixer.current.update(delta);
  });

  useEffect(() => {
    if (camera) {
      const lookAtPosition = new THREE.Vector3(
        group.current.position.x,
        group.current.position.y,
        group.current.position.z
      );
      camera.lookAt(lookAtPosition);
    }
  }, [camera]);

  return (
    <group ref={group} {...props} scale={0.1} dispose={null}>
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

useGLTF.preload("/animation-2.glb");
