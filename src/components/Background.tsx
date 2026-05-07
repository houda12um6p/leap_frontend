import React, { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useSnapshot } from 'valtio';
import { themeState, PALETTES, BackgroundPalette } from '../lib/theme';

/* ============================================================================
   Background — "Code Network", theme-reactive
   ----------------------------------------------------------------------------
   Force-directed graph + distant star field. The same scene is rendered in
   light and dark modes; on theme change, every color/opacity field is lerped
   per-frame so the transition is fluid (no flash, no remount).
   ========================================================================== */

const NODE_COUNT = 110;
const STAR_COUNT = 900;
const LERP = 0.05;                              // 5% per frame ≈ 350ms feel

type NodeKind = 'commit' | 'jira' | 'jira-warm';

interface GraphNode {
  position: THREE.Vector3;
  kind: NodeKind;
  size: number;
  pulse: number;
}

function buildGraph(count: number) {
  const nodes: GraphNode[] = [];
  for (let i = 0; i < count; i++) {
    const cluster = Math.random() > 0.55 ? 0 : 1;
    const center = cluster === 0
      ? new THREE.Vector3(-2.4, 0.4, 0)
      : new THREE.Vector3(2.6, -0.6, -1);
    const radius = Math.pow(Math.random(), 0.55) * 5.5;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(1 - 2 * Math.random());
    const position = new THREE.Vector3(
      center.x + radius * Math.sin(phi) * Math.cos(theta),
      center.y + radius * Math.sin(phi) * Math.sin(theta) * 0.7,
      center.z + radius * Math.cos(phi),
    );
    const r = Math.random();
    let kind: NodeKind = 'commit';
    if (r > 0.88) kind = 'jira-warm';
    else if (r > 0.62) kind = 'jira';
    nodes.push({
      position,
      kind,
      size: kind === 'commit' ? 0.020 + Math.random() * 0.022 : 0.034 + Math.random() * 0.028,
      pulse: Math.random() * Math.PI * 2,
    });
  }
  const edgeSet = new Set<string>();
  const edges: Array<[number, number]> = [];
  for (let i = 0; i < count; i++) {
    const distances: { j: number; d: number }[] = [];
    for (let j = 0; j < count; j++) {
      if (j === i) continue;
      distances.push({ j, d: nodes[i].position.distanceTo(nodes[j].position) });
    }
    distances.sort((a, b) => a.d - b.d);
    const k = 1 + (Math.random() > 0.5 ? 1 : 0);
    for (let n = 0; n < k; n++) {
      const target = distances[n].j;
      if (distances[n].d > 2.7) continue;
      const key = i < target ? `${i}-${target}` : `${target}-${i}`;
      if (!edgeSet.has(key)) { edgeSet.add(key); edges.push([i, target]); }
    }
  }
  return { nodes, edges };
}

/* ----------------------------- Theme-aware materials ---------------- */

interface ClusterProps {
  nodes: GraphNode[];
  indices: number[];
  paletteRef: React.MutableRefObject<BackgroundPalette>;
  pickColor: (p: BackgroundPalette) => [number, number, number];
  baseOpacity: (p: BackgroundPalette) => number;
}

function NodeCluster({ nodes, indices, paletteRef, pickColor, baseOpacity }: ClusterProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const matRef  = useRef<THREE.MeshBasicMaterial>(null);
  const dummy   = useMemo(() => new THREE.Object3D(), []);
  const targetColor = useMemo(() => new THREE.Color(), []);

  useEffect(() => {
    const im = meshRef.current; if (!im) return;
    for (let i = 0; i < indices.length; i++) {
      const n = nodes[indices[i]];
      dummy.position.copy(n.position);
      dummy.scale.setScalar(n.size);
      dummy.updateMatrix();
      im.setMatrixAt(i, dummy.matrix);
    }
    im.instanceMatrix.needsUpdate = true;
  }, [nodes, indices, dummy]);

  useFrame((state) => {
    const im = meshRef.current; if (!im) return;
    const t = state.clock.getElapsedTime();
    for (let i = 0; i < indices.length; i++) {
      const idx = indices[i];
      const n = nodes[idx];
      const wobble = 0.85 + 0.35 * Math.sin(t * (0.55 + (idx % 5) * 0.08) + n.pulse);
      dummy.position.copy(n.position);
      const s = n.size * wobble;
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      im.setMatrixAt(i, dummy.matrix);
    }
    im.instanceMatrix.needsUpdate = true;

    if (matRef.current) {
      const c = pickColor(paletteRef.current);
      targetColor.setRGB(c[0], c[1], c[2]);
      matRef.current.color.lerp(targetColor, LERP);
      const targetOpacity = baseOpacity(paletteRef.current);
      matRef.current.opacity += (targetOpacity - matRef.current.opacity) * LERP;
    }
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined as unknown as THREE.BufferGeometry, undefined as unknown as THREE.Material, indices.length]}
    >
      <sphereGeometry args={[1, 10, 10]} />
      <meshBasicMaterial ref={matRef} transparent opacity={0.92} toneMapped={false} />
    </instancedMesh>
  );
}

function CodeGraph({ paletteRef }: { paletteRef: React.MutableRefObject<BackgroundPalette> }) {
  const group = useRef<THREE.Group>(null);
  const edgeMatRef = useRef<THREE.LineBasicMaterial>(null);
  const haloA = useRef<THREE.MeshBasicMaterial>(null);
  const haloB = useRef<THREE.MeshBasicMaterial>(null);
  const targetColor = useMemo(() => new THREE.Color(), []);
  const { mouse } = useThree();

  const { nodes, edges } = useMemo(() => buildGraph(NODE_COUNT), []);

  const commitIndices    = useMemo(() => nodes.map((n, i) => n.kind === 'commit'    ? i : -1).filter(i => i >= 0), [nodes]);
  const jiraIndices      = useMemo(() => nodes.map((n, i) => n.kind === 'jira'      ? i : -1).filter(i => i >= 0), [nodes]);
  const jiraWarmIndices  = useMemo(() => nodes.map((n, i) => n.kind === 'jira-warm' ? i : -1).filter(i => i >= 0), [nodes]);

  const edgeGeometry = useMemo(() => {
    const positions = new Float32Array(edges.length * 2 * 3);
    for (let e = 0; e < edges.length; e++) {
      const [a, b] = edges[e];
      const pa = nodes[a].position, pb = nodes[b].position;
      positions[e * 6 + 0] = pa.x; positions[e * 6 + 1] = pa.y; positions[e * 6 + 2] = pa.z;
      positions[e * 6 + 3] = pb.x; positions[e * 6 + 4] = pb.y; positions[e * 6 + 5] = pb.z;
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geom;
  }, [nodes, edges]);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime();
    group.current.rotation.y = t * 0.04 + mouse.x * 0.28;
    group.current.rotation.x = Math.sin(t * 0.07) * 0.08 - mouse.y * 0.18;

    const p = paletteRef.current;
    if (edgeMatRef.current) {
      const c = p.edge;
      targetColor.setRGB(c[0], c[1], c[2]);
      edgeMatRef.current.color.lerp(targetColor, LERP);
      edgeMatRef.current.opacity += (p.edgeOpacity - edgeMatRef.current.opacity) * LERP;
    }
    if (haloA.current) {
      const c = p.haloA;
      targetColor.setRGB(c[0], c[1], c[2]);
      haloA.current.color.lerp(targetColor, LERP);
    }
    if (haloB.current) {
      const c = p.haloB;
      targetColor.setRGB(c[0], c[1], c[2]);
      haloB.current.color.lerp(targetColor, LERP);
    }
  });

  return (
    <group ref={group}>
      <lineSegments geometry={edgeGeometry}>
        <lineBasicMaterial ref={edgeMatRef} transparent opacity={0.42} depthWrite={false} />
      </lineSegments>

      {commitIndices.length   > 0 && (
        <NodeCluster
          nodes={nodes}
          indices={commitIndices}
          paletteRef={paletteRef}
          pickColor={(p) => p.commit}
          baseOpacity={(p) => p.commitOpacity}
        />
      )}
      {jiraIndices.length     > 0 && (
        <NodeCluster
          nodes={nodes}
          indices={jiraIndices}
          paletteRef={paletteRef}
          pickColor={(p) => p.jira}
          baseOpacity={() => 0.95}
        />
      )}
      {jiraWarmIndices.length > 0 && (
        <NodeCluster
          nodes={nodes}
          indices={jiraWarmIndices}
          paletteRef={paletteRef}
          pickColor={(p) => p.jiraWarm}
          baseOpacity={() => 0.95}
        />
      )}

      <mesh position={[-2.4, 0.4, 0]}>
        <sphereGeometry args={[0.45, 18, 18]} />
        <meshBasicMaterial ref={haloA} transparent opacity={0.045} depthWrite={false} />
      </mesh>
      <mesh position={[2.6, -0.6, -1]}>
        <sphereGeometry args={[0.5, 18, 18]} />
        <meshBasicMaterial ref={haloB} transparent opacity={0.035} depthWrite={false} />
      </mesh>
    </group>
  );
}

function StarField({ paletteRef }: { paletteRef: React.MutableRefObject<BackgroundPalette> }) {
  const ref = useRef<THREE.Points>(null);
  const matRef = useRef<THREE.PointsMaterial>(null);
  const targetColor = useMemo(() => new THREE.Color(), []);
  const { mouse } = useThree();

  const positions = useMemo(() => {
    const arr = new Float32Array(STAR_COUNT * 3);
    for (let i = 0; i < STAR_COUNT; i++) {
      arr[i * 3 + 0] = (Math.random() - 0.5) * 60;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 40;
      arr[i * 3 + 2] = -10 - Math.random() * 30;
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.elapsedTime * 0.008 + mouse.x * 0.04;
      ref.current.rotation.x = -mouse.y * 0.04;
    }
    if (matRef.current) {
      const c = paletteRef.current.star;
      targetColor.setRGB(c[0], c[1], c[2]);
      matRef.current.color.lerp(targetColor, LERP);
      matRef.current.opacity += (paletteRef.current.starOpacity - matRef.current.opacity) * LERP;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={matRef}
        size={0.022}
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

function Scene({ paletteRef }: { paletteRef: React.MutableRefObject<BackgroundPalette> }) {
  const fogRef = useRef<THREE.Fog>(null);
  const targetColor = useMemo(() => new THREE.Color(), []);
  const { scene } = useThree();

  useFrame(() => {
    const p = paletteRef.current;
    if (fogRef.current) {
      const c = p.fog;
      targetColor.setRGB(c[0], c[1], c[2]);
      fogRef.current.color.lerp(targetColor, LERP);
    }
    if (scene.background instanceof THREE.Color) {
      const c = p.bg;
      targetColor.setRGB(c[0], c[1], c[2]);
      scene.background.lerp(targetColor, LERP);
    } else {
      const c = p.bg;
      scene.background = new THREE.Color(c[0], c[1], c[2]);
    }
  });

  return (
    <>
      <ambientLight intensity={0.35} />
      <fog ref={fogRef} attach="fog" args={['#02040a', 9, 32]} />
      <StarField paletteRef={paletteRef} />
      <CodeGraph paletteRef={paletteRef} />
    </>
  );
}

export function Background() {
  const { theme } = useSnapshot(themeState);
  const paletteRef = useRef<BackgroundPalette>(PALETTES[theme]);
  useEffect(() => { paletteRef.current = PALETTES[theme]; }, [theme]);

  return (
    <>
      <div className="leap-bg" aria-hidden="true">
        <Canvas
          dpr={[1, 1.75]}
          camera={{ position: [0, 0, 11], fov: 55, near: 0.1, far: 60 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        >
          <Scene paletteRef={paletteRef} />
        </Canvas>
      </div>
      <div className="leap-bg-grain" aria-hidden="true" />
      <div className="leap-bg-vignette" aria-hidden="true" />
    </>
  );
}

export default Background;
