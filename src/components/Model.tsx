import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import type { GLTF } from "three-stdlib";
import type { JSX } from "react";

type GLTFResult = GLTF & {
  nodes: {
    Cylinder008: THREE.Mesh;
    Cylinder008_1: THREE.Mesh;
    Cylinder006: THREE.Mesh;
    Cylinder006_1: THREE.Mesh;
    elbow_1: THREE.Mesh;
    arm_1: THREE.Mesh;
    shoulder_1: THREE.Mesh;
    base_1: THREE.Mesh;
    base: THREE.Bone;
    IK_Bone: THREE.Bone;
  };
  materials: {
    ["metal-black"]: THREE.MeshStandardMaterial;
    ["metal-silver"]: THREE.MeshStandardMaterial;
    ["metal-yellow"]: THREE.MeshStandardMaterial;
  };
};

export function Model(props: JSX.IntrinsicElements["group"]) {
  const { nodes, materials } = useGLTF(
    "/armiture.glb"
  ) as unknown as GLTFResult;

  return (
    <group {...props} dispose={null}>
      <group name="Scene">
        <group name="Armature" position={[0, 3.127, 0]}>
          <primitive object={nodes.base} />
          <primitive object={nodes.IK_Bone} />
        </group>
        <mesh
          name="base_1"
          castShadow
          receiveShadow
          geometry={nodes.base_1.geometry}
          material={materials["metal-yellow"]}
          scale={[2.43, 1, 2.43]}
        />
      </group>
    </group>
  );
}

useGLTF.preload("/armiture.glb");
