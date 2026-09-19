import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { 
  Rotate3d, 
  Eye, 
  Layers, 
  Wind, 
  Gauge, 
  CircleDot, 
  Sparkles, 
  Maximize2,
  Info,
  ShieldAlert,
  Zap,
  Volume2
} from 'lucide-react';
import { TyreCompound } from '../types';
import { playDrsToggleSound, playEngineRevSound, playWheelGunSound } from '../utils/audioAlerts';


interface Car3DViewerProps {
  primaryColor: string;
  secondaryColor: string;
  teamName: string;
  driverName?: string;
  driverNumber?: number;
  isDarkMode: boolean;
}

export const Car3DViewer: React.FC<Car3DViewerProps> = ({
  primaryColor,
  secondaryColor,
  teamName,
  driverName = 'Lando Norris',
  driverNumber = 4,
  isDarkMode,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [isDrsOpen, setIsDrsOpen] = useState<boolean>(false);
  const [isExploded, setIsExploded] = useState<boolean>(false);
  const [activeCompound, setActiveCompound] = useState<TyreCompound>('SOFT');
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>('aero_floor');

  // References to animateable 3D parts
  const drsFlapRef = useRef<THREE.Mesh | null>(null);
  const frontWingGroupRef = useRef<THREE.Group | null>(null);
  const rearWingGroupRef = useRef<THREE.Group | null>(null);
  const haloMeshRef = useRef<THREE.Mesh | null>(null);
  const floorMeshRef = useRef<THREE.Mesh | null>(null);
  const tyreMeshesRef = useRef<THREE.Mesh[]>([]);
  const carBodyMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const secondaryMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // Hotspots info catalog
  const HOTSPOTS = [
    {
      id: 'front_wing',
      title: 'Ground Effect Front Wing',
      summary: 'Directs laminar airflow around front wheels and feeds the underfloor Venturi inlets.',
      stat: 'Generates ~28% total downforce',
      icon: Wind,
    },
    {
      id: 'halo',
      title: 'Titanium Grade-5 Halo',
      summary: 'Withstands 125kN (approx. 12 tonnes) vertical & lateral impact load to protect driver.',
      stat: 'Mass: ~7.0 kg titanium frame',
      icon: ShieldAlert,
    },
    {
      id: 'aero_floor',
      title: '3D Underfloor Venturi Tunnels',
      summary: 'Twin Venturi underfloor tunnels generate aerodynamic ground effect suction without huge induced drag.',
      stat: 'Generates ~58% of total downforce',
      icon: Layers,
    },
    {
      id: 'power_unit',
      title: '1.6L V6 Turbo Hybrid Power Unit',
      summary: 'Features 350kW MGU-K kinetic electrical harvesting and sustainable e-fuel combustion.',
      stat: '1,000+ BHP System Output',
      icon: Zap,
    },
    {
      id: 'drs_wing',
      title: 'DRS Rear Wing & Beam Wing',
      summary: 'Hydraulic flap actuates up to 85mm gap within 1-second DRS zones to reduce aerodynamic drag by 30%.',
      stat: '+18 to +24 km/h speed gain',
      icon: Gauge,
    },
    {
      id: 'pirelli_tyres',
      title: '18-inch Low-Profile Pirelli Tyres',
      summary: 'Aerodynamic rim covers with temperature heat sensors; optimal window 100°C to 115°C.',
      stat: 'Lateral grip up to 5.6 G',
      icon: CircleDot,
    },
  ];

  // Initialize Three.js Scene
  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 460;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isDarkMode ? 0x090D15 : 0xF3F4F6);
    scene.fog = new THREE.Fog(isDarkMode ? 0x090D15 : 0xF3F4F6, 12, 35);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(5.5, 2.4, 6.2);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.replaceChildren(renderer.domElement);

    // 4. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.02; // prevent going under ground
    controls.minDistance = 3.5;
    controls.maxDistance = 14;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 1.2;
    controlsRef.current = controls;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(isDarkMode ? 0xffffff : 0xe0e7ff, isDarkMode ? 1.2 : 1.6);
    scene.add(ambientLight);

    const mainSun = new THREE.DirectionalLight(0xffffff, 2.2);
    mainSun.position.set(6, 10, 8);
    mainSun.castShadow = true;
    mainSun.shadow.mapSize.width = 1024;
    mainSun.shadow.mapSize.height = 1024;
    mainSun.shadow.camera.near = 0.5;
    mainSun.shadow.camera.far = 25;
    mainSun.shadow.camera.left = -6;
    mainSun.shadow.camera.right = 6;
    mainSun.shadow.camera.top = 6;
    mainSun.shadow.camera.bottom = -6;
    mainSun.shadow.bias = -0.0005;
    scene.add(mainSun);

    // Rim specular light
    const rimLight = new THREE.DirectionalLight(0x60a5fa, 1.4);
    rimLight.position.set(-8, 4, -8);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0xfef08a, 0.7);
    fillLight.position.set(0, -2, 6);
    scene.add(fillLight);

    // 6. Ground Studio Floor
    const groundGeo = new THREE.PlaneGeometry(30, 30);
    const groundMat = new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x0e131f : 0xe2e8f0,
      roughness: 0.75,
      metalness: 0.15,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid on ground
    const grid = new THREE.GridHelper(26, 26, isDarkMode ? 0x334155 : 0x94a3b8, isDarkMode ? 0x1e293b : 0xcbd5e1);
    grid.position.y = -0.04;
    scene.add(grid);

    // 7. BUILD PROCEDURAL 3D F1 CAR GEOMETRY
    const carRoot = new THREE.Group();
    carRoot.position.y = 0.42;

    // Reusable Materials
    const bodyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(primaryColor),
      roughness: 0.35,
      metalness: 0.65,
    });
    carBodyMaterialsRef.current = [bodyMat];

    const secondaryMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(secondaryColor),
      roughness: 0.4,
      metalness: 0.5,
    });
    secondaryMaterialsRef.current = [secondaryMat];

    const carbonMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.6,
      metalness: 0.3,
    });

    const titaniumMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.25,
      metalness: 0.9,
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x0f172a,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.8,
      transparent: true,
      opacity: 0.9,
    });

    // --- MAIN MONOCOQUE CHASSIS ---
    // Central cockpit & nose cone
    const monocoqueGeo = new THREE.BoxGeometry(0.72, 0.45, 2.6);
    const monocoque = new THREE.Mesh(monocoqueGeo, bodyMat);
    monocoque.position.set(0, 0.15, 0.2);
    monocoque.castShadow = true;
    carRoot.add(monocoque);

    // Tapered Nose Cone
    const noseGeo = new THREE.ConeGeometry(0.32, 1.6, 6);
    const nose = new THREE.Mesh(noseGeo, bodyMat);
    nose.rotation.x = -Math.PI / 2;
    nose.position.set(0, 0.05, 2.2);
    nose.castShadow = true;
    carRoot.add(nose);

    // Nose tip pylon / front crash structure
    const noseTipGeo = new THREE.BoxGeometry(0.24, 0.12, 0.4);
    const noseTip = new THREE.Mesh(noseTipGeo, secondaryMat);
    noseTip.position.set(0, -0.05, 2.9);
    carRoot.add(noseTip);

    // --- COCKPIT & DRIVER ---
    // Cockpit opening rim
    const cockpitRimGeo = new THREE.TorusGeometry(0.32, 0.04, 8, 24, Math.PI);
    const cockpitRim = new THREE.Mesh(cockpitRimGeo, carbonMat);
    cockpitRim.rotation.x = Math.PI / 2;
    cockpitRim.position.set(0, 0.38, 0.15);
    carRoot.add(cockpitRim);

    // Driver Helmet
    const helmetGeo = new THREE.SphereGeometry(0.16, 16, 16);
    const helmetMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(secondaryColor),
      roughness: 0.2,
      metalness: 0.7,
    });
    const helmet = new THREE.Mesh(helmetGeo, helmetMat);
    helmet.position.set(0, 0.44, 0.15);
    helmet.scale.set(0.9, 1.1, 1.0);
    helmet.castShadow = true;
    carRoot.add(helmet);

    // Helmet visor
    const visorGeo = new THREE.BoxGeometry(0.22, 0.06, 0.14);
    const visor = new THREE.Mesh(visorGeo, glassMat);
    visor.position.set(0, 0.44, 0.24);
    carRoot.add(visor);

    // Steering wheel with LED shift lights
    const wheelGeo = new THREE.BoxGeometry(0.28, 0.16, 0.04);
    const wheel = new THREE.Mesh(wheelGeo, carbonMat);
    wheel.position.set(0, 0.32, 0.45);
    wheel.rotation.x = -0.3;
    carRoot.add(wheel);

    // --- TITANIUM HALO ---
    const haloCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.28, 0.48, 0.0),
      new THREE.Vector3(-0.25, 0.52, 0.25),
      new THREE.Vector3(0.0, 0.53, 0.48),
      new THREE.Vector3(0.25, 0.52, 0.25),
      new THREE.Vector3(0.28, 0.48, 0.0),
    ]);
    const haloGeo = new THREE.TubeGeometry(haloCurve, 20, 0.032, 8, false);
    const haloMesh = new THREE.Mesh(haloGeo, titaniumMat);
    haloMesh.castShadow = true;
    haloMeshRef.current = haloMesh;
    carRoot.add(haloMesh);

    // Halo central vertical support strut
    const haloStrutGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.24, 8);
    const haloStrut = new THREE.Mesh(haloStrutGeo, titaniumMat);
    haloStrut.position.set(0, 0.42, 0.48);
    haloStrut.rotation.x = 0.2;
    carRoot.add(haloStrut);

    // --- ENGINE AIRBOX & SHARK FIN ---
    const airboxGeo = new THREE.BoxGeometry(0.38, 0.35, 1.1);
    const airbox = new THREE.Mesh(airboxGeo, bodyMat);
    airbox.position.set(0, 0.46, -0.55);
    airbox.castShadow = true;
    carRoot.add(airbox);

    // Airbox intake hole
    const airIntakeGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.1, 16);
    const airIntake = new THREE.Mesh(airIntakeGeo, carbonMat);
    airIntake.rotation.x = Math.PI / 2;
    airIntake.position.set(0, 0.56, 0.0);
    carRoot.add(airIntake);

    // Vertical Shark Fin
    const finShape = new THREE.Shape();
    finShape.moveTo(0, 0);
    finShape.lineTo(0, 0.5);
    finShape.lineTo(1.2, 0.05);
    finShape.lineTo(1.2, 0);
    finShape.closePath();
    const finExtrude = new THREE.ExtrudeGeometry(finShape, { depth: 0.03, bevelEnabled: false });
    const fin = new THREE.Mesh(finExtrude, secondaryMat);
    fin.rotation.y = Math.PI / 2;
    fin.position.set(0.015, 0.42, -1.5);
    carRoot.add(fin);

    // --- SIDEPODS (LEFT & RIGHT) ---
    [-1, 1].forEach((side) => {
      // Sculpted downwash sidepod
      const sidepodGeo = new THREE.BoxGeometry(0.55, 0.38, 1.5);
      const sidepod = new THREE.Mesh(sidepodGeo, bodyMat);
      sidepod.position.set(side * 0.58, 0.08, -0.15);
      sidepod.rotation.y = side * 0.08;
      sidepod.castShadow = true;
      carRoot.add(sidepod);

      // Radiator cooling inlet
      const inletGeo = new THREE.BoxGeometry(0.48, 0.28, 0.12);
      const inlet = new THREE.Mesh(inletGeo, carbonMat);
      inlet.position.set(side * 0.58, 0.12, 0.6);
      carRoot.add(inlet);

      // Rearview mirror
      const mirrorGeo = new THREE.BoxGeometry(0.14, 0.08, 0.05);
      const mirror = new THREE.Mesh(mirrorGeo, secondaryMat);
      mirror.position.set(side * 0.44, 0.42, 0.4);
      carRoot.add(mirror);

      // Mirror stem
      const stemGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.12);
      const stem = new THREE.Mesh(stemGeo, carbonMat);
      stem.position.set(side * 0.4, 0.36, 0.4);
      stem.rotation.z = -side * 0.4;
      carRoot.add(stem);
    });

    // --- VENTURI FLOOR & DIFFUSER ---
    const floorGeo = new THREE.BoxGeometry(1.9, 0.06, 3.2);
    const floor = new THREE.Mesh(floorGeo, carbonMat);
    floor.position.set(0, -0.06, 0.0);
    floor.receiveShadow = true;
    floorMeshRef.current = floor;
    carRoot.add(floor);

    // Rear diffuser exit ramps
    const diffuserGeo = new THREE.BoxGeometry(1.1, 0.22, 0.6);
    const diffuser = new THREE.Mesh(diffuserGeo, carbonMat);
    diffuser.rotation.x = -0.35;
    diffuser.position.set(0, 0.02, -1.65);
    carRoot.add(diffuser);

    // Blinking FIA Rain Light (Red LED)
    const rainLightGeo = new THREE.BoxGeometry(0.1, 0.05, 0.04);
    const rainLightMat = new THREE.MeshBasicMaterial({ color: 0xff0033 });
    const rainLight = new THREE.Mesh(rainLightGeo, rainLightMat);
    rainLight.position.set(0, 0.02, -1.82);
    carRoot.add(rainLight);

    // --- FRONT WING ASSEMBLY (Separable group for explode mode) ---
    const frontWingGroup = new THREE.Group();
    frontWingGroup.position.set(0, -0.06, 2.7);

    // Main bottom plane
    const fwMainGeo = new THREE.BoxGeometry(2.0, 0.03, 0.42);
    const fwMain = new THREE.Mesh(fwMainGeo, bodyMat);
    frontWingGroup.add(fwMain);

    // Upper cascades flaps
    const fwFlap1Geo = new THREE.BoxGeometry(1.9, 0.02, 0.22);
    const fwFlap1 = new THREE.Mesh(fwFlap1Geo, secondaryMat);
    fwFlap1.position.set(0, 0.04, -0.05);
    fwFlap1.rotation.x = -0.2;
    frontWingGroup.add(fwFlap1);

    const fwFlap2Geo = new THREE.BoxGeometry(1.8, 0.02, 0.16);
    const fwFlap2 = new THREE.Mesh(fwFlap2Geo, carbonMat);
    fwFlap2.position.set(0, 0.08, -0.12);
    fwFlap2.rotation.x = -0.3;
    frontWingGroup.add(fwFlap2);

    // Endplates
    [-1, 1].forEach((side) => {
      const epGeo = new THREE.BoxGeometry(0.03, 0.26, 0.52);
      const ep = new THREE.Mesh(epGeo, bodyMat);
      ep.position.set(side * 1.0, 0.1, 0.0);
      frontWingGroup.add(ep);
    });

    frontWingGroupRef.current = frontWingGroup;
    carRoot.add(frontWingGroup);

    // --- REAR WING ASSEMBLY & DRS FLAP ---
    const rearWingGroup = new THREE.Group();
    rearWingGroup.position.set(0, 0.72, -1.75);

    // Twin central mounting pylons
    [-0.14, 0.14].forEach((xPos) => {
      const pylonGeo = new THREE.BoxGeometry(0.025, 0.55, 0.22);
      const pylon = new THREE.Mesh(pylonGeo, carbonMat);
      pylon.position.set(xPos, -0.25, 0.0);
      rearWingGroup.add(pylon);
    });

    // Lower beam wing
    const beamWingGeo = new THREE.BoxGeometry(1.2, 0.03, 0.24);
    const beamWing = new THREE.Mesh(beamWingGeo, carbonMat);
    beamWing.position.set(0, -0.42, 0.1);
    rearWingGroup.add(beamWing);

    // Main rear wing foil
    const rwMainGeo = new THREE.BoxGeometry(1.4, 0.04, 0.32);
    const rwMain = new THREE.Mesh(rwMainGeo, bodyMat);
    rearWingGroup.add(rwMain);

    // Upper DRS flap (rotatable)
    const drsGeo = new THREE.BoxGeometry(1.36, 0.03, 0.26);
    const drsFlap = new THREE.Mesh(drsGeo, secondaryMat);
    drsFlap.position.set(0, 0.08, -0.06);
    drsFlapRef.current = drsFlap;
    rearWingGroup.add(drsFlap);

    // Hydraulic DRS Actuator Pod
    const podGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.12, 8);
    const pod = new THREE.Mesh(podGeo, carbonMat);
    pod.rotation.x = Math.PI / 2;
    pod.position.set(0, 0.08, 0.02);
    rearWingGroup.add(pod);

    // Rear Endplates
    [-1, 1].forEach((side) => {
      const repGeo = new THREE.BoxGeometry(0.03, 0.44, 0.45);
      const rep = new THREE.Mesh(repGeo, bodyMat);
      rep.position.set(side * 0.7, 0.02, 0.0);
      rearWingGroup.add(rep);
    });

    rearWingGroupRef.current = rearWingGroup;
    carRoot.add(rearWingGroup);

    // --- 4 WHEELS & PIRELLI TYRES ---
    const wheelPositions = [
      { x: -0.92, y: 0.0, z: 1.65, isFront: true },  // Front Left
      { x: 0.92, y: 0.0, z: 1.65, isFront: true },   // Front Right
      { x: -0.94, y: 0.02, z: -1.45, isFront: false },// Rear Left
      { x: 0.94, y: 0.02, z: -1.45, isFront: false }, // Rear Right
    ];

    const tyreMeshes: THREE.Mesh[] = [];

    wheelPositions.forEach((pos) => {
      const wheelGroup = new THREE.Group();
      wheelGroup.position.set(pos.x, pos.y, pos.z);

      const tyreRadius = pos.isFront ? 0.36 : 0.38;
      const tyreWidth = pos.isFront ? 0.32 : 0.42;

      // Rubber tyre tread
      const tyreGeo = new THREE.CylinderGeometry(tyreRadius, tyreRadius, tyreWidth, 24);
      const tyreMat = new THREE.MeshStandardMaterial({
        color: 0x1c1917,
        roughness: 0.75,
        metalness: 0.1,
      });
      const tyre = new THREE.Mesh(tyreGeo, tyreMat);
      tyre.rotation.z = Math.PI / 2;
      tyre.castShadow = true;
      wheelGroup.add(tyre);

      // Pirelli Compound Colored Sidewall Ring
      const ringGeo = new THREE.TorusGeometry(tyreRadius * 0.82, 0.028, 8, 24);
      const compoundColor = activeCompound === 'SOFT' ? 0xef4444 : activeCompound === 'MEDIUM' ? 0xeab308 : activeCompound === 'HARD' ? 0xf8fafc : 0x3b82f6;
      const ringMat = new THREE.MeshBasicMaterial({ color: compoundColor });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.y = Math.PI / 2;
      ring.position.x = (pos.x > 0 ? 1 : -1) * (tyreWidth / 2 + 0.005);
      tyreMeshes.push(ring);
      wheelGroup.add(ring);

      // 18-inch Rim Aero Cover
      const rimGeo = new THREE.CylinderGeometry(tyreRadius * 0.65, tyreRadius * 0.65, tyreWidth + 0.01, 16);
      const rimMat = new THREE.MeshStandardMaterial({
        color: 0x27272a,
        roughness: 0.4,
        metalness: 0.8,
      });
      const rim = new THREE.Mesh(rimGeo, rimMat);
      rim.rotation.z = Math.PI / 2;
      wheelGroup.add(rim);

      // Suspension wishbones to chassis
      const armGeo = new THREE.CylinderGeometry(0.015, 0.015, Math.abs(pos.x) - 0.32, 6);
      const arm = new THREE.Mesh(armGeo, carbonMat);
      arm.rotation.z = (pos.x > 0 ? -1 : 1) * (Math.PI / 2);
      arm.position.set((pos.x > 0 ? -1 : 1) * (Math.abs(pos.x) / 2 - 0.15), 0.08, 0);
      wheelGroup.add(arm);

      carRoot.add(wheelGroup);
    });

    tyreMeshesRef.current = tyreMeshes;
    scene.add(carRoot);

    // 8. Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // DRS Flap rotation
      if (drsFlapRef.current) {
        const targetRot = isDrsOpen ? 0.55 : 0.0;
        drsFlapRef.current.rotation.x = THREE.MathUtils.lerp(drsFlapRef.current.rotation.x, targetRot, 0.15);
      }

      // Explode view interpolation
      if (frontWingGroupRef.current) {
        const targetZ = isExploded ? 3.5 : 2.7;
        frontWingGroupRef.current.position.z = THREE.MathUtils.lerp(frontWingGroupRef.current.position.z, targetZ, 0.1);
      }
      if (rearWingGroupRef.current) {
        const targetZ = isExploded ? -2.4 : -1.75;
        const targetY = isExploded ? 1.05 : 0.72;
        rearWingGroupRef.current.position.z = THREE.MathUtils.lerp(rearWingGroupRef.current.position.z, targetZ, 0.1);
        rearWingGroupRef.current.position.y = THREE.MathUtils.lerp(rearWingGroupRef.current.position.y, targetY, 0.1);
      }
      if (haloMeshRef.current) {
        const targetY = isExploded ? 0.35 : 0.0;
        haloMeshRef.current.position.y = THREE.MathUtils.lerp(haloMeshRef.current.position.y, targetY, 0.1);
      }
      if (floorMeshRef.current) {
        const targetY = isExploded ? -0.28 : -0.06;
        floorMeshRef.current.position.y = THREE.MathUtils.lerp(floorMeshRef.current.position.y, targetY, 0.1);
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 9. Resize Handling
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight || 460;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      container.replaceChildren();
    };
  }, [primaryColor, secondaryColor, isDarkMode, autoRotate, isDrsOpen, isExploded, activeCompound]);

  // Handle camera presets
  const setCameraPreset = (preset: 'showcase' | 'side' | 'front' | 'cockpit' | 'top') => {
    if (!cameraRef.current || !controlsRef.current) return;
    const camera = cameraRef.current;
    const controls = controlsRef.current;

    switch (preset) {
      case 'showcase':
        camera.position.set(5.5, 2.4, 6.2);
        controls.target.set(0, 0.4, 0);
        break;
      case 'side':
        camera.position.set(7.5, 0.8, 0.2);
        controls.target.set(0, 0.4, 0);
        break;
      case 'front':
        camera.position.set(0, 0.7, 6.8);
        controls.target.set(0, 0.2, 2.0);
        break;
      case 'cockpit':
        camera.position.set(0, 0.85, 0.4);
        controls.target.set(0, 0.2, 2.4);
        break;
      case 'top':
        camera.position.set(0.01, 8.5, 0.01);
        controls.target.set(0, 0, 0);
        break;
    }
    controls.update();
  };

  const activeHotspotData = HOTSPOTS.find(h => h.id === selectedHotspot) || HOTSPOTS[0];

  return (
    <div className={`rounded-2xl border overflow-hidden flex flex-col transition-all ${
      isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
    }`}>
      {/* Viewer Header with Controls */}
      <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 ${
        isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          <div 
            className="w-4 h-4 rounded-full border-2 border-white/50 shadow-sm"
            style={{ backgroundColor: primaryColor }}
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base tracking-tight">{teamName}</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-600/20 text-red-400 border border-red-500/30">
                3D CAD SPEC
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interactive 360° Ground-Effect Model • #{driverNumber} {driverName}
            </p>
          </div>
        </div>

        {/* Action Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Engine Rev Sound Button */}
          <button
            id="rev-engine-btn"
            onClick={() => playEngineRevSound('rev')}
            className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 border bg-red-600/20 text-red-400 border-red-500/40 hover:bg-red-600 hover:text-white transition shadow-sm active:scale-95"
            title="Listen to 1.6L V6 Turbo Hybrid Engine Revs & Turbo Spool"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>REV ENGINE</span>
          </button>

          {/* DRS Flap Button */}
          <button
            id="drs-toggle-btn"
            onClick={() => {
              const nextState = !isDrsOpen;
              setIsDrsOpen(nextState);
              playDrsToggleSound(nextState);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 border transition ${
              isDrsOpen
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                : isDarkMode
                ? 'bg-slate-800/80 text-slate-300 border-slate-700 hover:text-white'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>DRS {isDrsOpen ? 'ACTIVE (OPEN)' : 'CLOSED'}</span>
          </button>

          {/* Aero Explode View */}
          <button
            id="explode-toggle-btn"
            onClick={() => setIsExploded(!isExploded)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 border transition ${
              isExploded
                ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/20'
                : isDarkMode
                ? 'bg-slate-800/80 text-slate-300 border-slate-700 hover:text-white'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isExploded ? 'COLLAPSE' : 'AERO EXPLODE'}</span>
          </button>

          {/* Auto Rotate Turntable */}
          <button
            id="rotate-toggle-btn"
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-1.5 rounded-lg text-xs border transition ${
              autoRotate
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : isDarkMode
                ? 'bg-slate-800/80 text-slate-400 border-slate-700'
                : 'bg-white text-slate-500 border-slate-300'
            }`}
            title="Toggle turntable auto-rotation"
          >
            <Rotate3d className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas Viewport */}
      <div className="relative w-full h-[400px] sm:h-[480px]">
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Orbit instruction banner */}
        <div className="absolute top-3 left-3 pointer-events-none text-[11px] font-mono text-slate-400 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 flex items-center gap-1.5">
          <Rotate3d className="w-3 h-3 text-slate-300" />
          <span>Click & Drag to Rotate 360° • Scroll to Zoom</span>
        </div>

        {/* Camera angle presets floating overlay */}
        <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-1.5 bg-black/50 backdrop-blur-md p-1.5 rounded-xl border border-white/10 text-xs font-mono">
          <span className="text-[10px] text-slate-400 px-1 font-semibold">VIEW:</span>
          {(['showcase', 'side', 'front', 'cockpit', 'top'] as const).map((view) => (
            <button
              key={view}
              onClick={() => setCameraPreset(view)}
              className="px-2 py-1 rounded-md text-[11px] text-slate-300 hover:text-white hover:bg-white/10 capitalize transition"
            >
              {view}
            </button>
          ))}
        </div>

        {/* Tyre Compound Pill Switcher */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-md p-1.5 rounded-xl border border-white/10 text-xs font-mono">
          <span className="text-[10px] text-slate-400 px-1">TYRE:</span>
          {(['SOFT', 'MEDIUM', 'HARD', 'WET'] as TyreCompound[]).map((cmp) => {
            const isSel = activeCompound === cmp;
            const badgeColor = cmp === 'SOFT' ? 'bg-red-600 text-white' : cmp === 'MEDIUM' ? 'bg-yellow-500 text-slate-950' : cmp === 'HARD' ? 'bg-white text-slate-900' : 'bg-blue-600 text-white';
            return (
              <button
                key={cmp}
                onClick={() => {
                  setActiveCompound(cmp);
                  playWheelGunSound();
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-black border transition ${
                  isSel ? `${badgeColor} border-transparent scale-105` : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                {cmp[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Aerodynamic Technical Hotspots Selector */}
      <div className={`p-4 border-t space-y-3 ${
        isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50/70 border-slate-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-red-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Technical Aero & Safety Breakdown
            </h4>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">2026 FIA Technical Regulations</span>
        </div>

        {/* Hotspots Buttons Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {HOTSPOTS.map((spot) => {
            const isSelected = selectedHotspot === spot.id;
            const Icon = spot.icon;
            return (
              <button
                key={spot.id}
                onClick={() => setSelectedHotspot(spot.id)}
                className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  isSelected
                    ? isDarkMode
                      ? 'bg-red-600/15 border-red-500/50 text-white shadow-sm'
                      : 'bg-red-50 border-red-300 text-slate-900 shadow-sm'
                    : isDarkMode
                    ? 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-red-500' : 'text-slate-400'}`} />
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                </div>
                <span className="text-[11px] font-semibold tracking-tight leading-snug line-clamp-1">
                  {spot.title.replace('Ground Effect ', '').replace('Titanium ', '')}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Hotspot Detailed Card */}
        {activeHotspotData && (
          <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-150 ${
            isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs sm:text-sm text-red-500 font-racing">
                  {activeHotspotData.title}
                </span>
              </div>
              <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                {activeHotspotData.summary}
              </p>
            </div>
            <div className="shrink-0 px-3 py-1.5 rounded-lg bg-red-600/15 border border-red-500/30 text-red-400 text-xs font-mono font-bold">
              {activeHotspotData.stat}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
