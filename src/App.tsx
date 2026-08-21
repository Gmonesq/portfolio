import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { gsap } from "gsap";

const OPTIONS = ["attack", "magic", "items", "summon"] as const;
type Option = (typeof OPTIONS)[number];

export default function App() {
  const [screen, setScreen] = useState<Option>("attack");

  const screens: Record<Option, JSX.Element> = {
    attack: <Attack />,
    magic: <Magic />,
    items: <Items />,
    summon: <Summon />
  };

  return (
    <div className="app-root">
      <HUD mode={screen} />
      <RadialMenu current={screen} onSelect={setScreen} />
      <ScreenWrapper screen={screen}>{screens[screen]}</ScreenWrapper>
    </div>
  );
}

/* HUD */
const HUD: React.FC<{ mode: Option }> = ({ mode }) => (
  <div className="hud">Mode: {mode.toUpperCase()}</div>
);

/* Pantalles amb animació */
const ScreenWrapper: React.FC<{ screen: Option; children: React.ReactNode }> = ({
  screen,
  children
}) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!wrapperRef.current) return;
    gsap.fromTo(
      wrapperRef.current,
      { opacity: 0, x: 60, filter: "blur(12px)" },
      { opacity: 1, x: 0, filter: "blur(0px)", duration: 0.7, ease: "power3.out" }
    );
  }, [screen]);

  return (
    <div className="screen-container">
      <div ref={wrapperRef} className="screen">
        {children}
      </div>
    </div>
  );
};

/* Menú radial */
const RadialMenu: React.FC<{
  current: Option;
  onSelect: (opt: Option) => void;
}> = ({ current, onSelect }) => {
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuRef.current) return;
    const index = OPTIONS.indexOf(current);
    const newAngle = -index * (360 / OPTIONS.length);

    gsap.to(menuRef.current, {
      rotation: newAngle,
      duration: 0.8,
      ease: "elastic.out(1, 0.4)"
    });
  }, [current]);

  const handleClick = (opt: Option, e: React.MouseEvent<HTMLButtonElement>) => {
    onSelect(opt);

    const rect = e.currentTarget.getBoundingClientRect();
    setCursorPos({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    });
  };

  return (
    <>
      <div ref={menuRef} className="radial-menu">
        {OPTIONS.map((opt, i) => (
          <button
            key={opt}
            className={`radial-btn ${current === opt ? "active" : ""}`}
            onClick={(e) => handleClick(opt, e)}
            style={{
              transform: `rotate(${(i * 360) / OPTIONS.length}deg) translate(90px) rotate(-${
                (i * 360) / OPTIONS.length
              }deg)`
            }}
          >
            {opt.toUpperCase()}
          </button>
        ))}
      </div>

      <div
        className="cursor"
        style={{
          transform: `translate(${cursorPos.x - 16}px, ${cursorPos.y - 16}px)`
        }}
      />
    </>
  );
};

/* ========================= */
/* ===== PANTALLA ATTACK ==== */
/* ========================= */

const Attack: React.FC = () => {
  return (
    <>
      <PostWithModelRight />
      <div className="post"><h2>Combos</h2><p>Aprén a fer combos com KH1.</p></div>
      <div className="post"><h2>Boss Tips</h2><p>Consells per bosses difícils.</p></div>
    </>
  );
};

/* ===== POST AMB MODEL 3D A LA DRETA ===== */

const PostWithModelRight: React.FC = () => {
  return (
    <div className="post post-flex">
      <div className="post-text">
        <h2>Model 3D interactiu</h2>
        <p>Pots girar-lo amb el ratolí, fer zoom i moure la càmera.</p>
      </div>

      <div className="post-model-box">
        <PostModel3D />
      </div>
    </div>
  );
};

/* ===== MODEL 3D INTERACTIU ===== */

const PostModel3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 3);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    /* Controls interactius */
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.rotateSpeed = 0.8;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;

    /* Llum */
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(2, 2, 2);
    scene.add(light);

    const ambient = new THREE.AmbientLight(0x404040, 1.2);
    scene.add(ambient);

    /* Carregar model */
    const loader = new GLTFLoader();
    loader.load(
      "/models/myModel.glb",
      (gltf) => {
        const model = gltf.scene;
        model.scale.set(1.5, 1.5, 1.5);
        model.position.set(0, -0.5, 0);
        scene.add(model);
      }
    );

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="post-model" />;
};

/* ========================= */
/* ===== ALTRES PANTALLES === */
/* ========================= */

const Magic: React.FC = () => (
  <>
    <div className="post-wide">MAGIC</div>
    <div className="post"><h2>Fire / Blizzard</h2><p>Quan usar cada magia.</p></div>
    <div className="post"><h2>MP Management</h2><p>Com gestionar el MP.</p></div>
  </>
);

const Items: React.FC = () => (
  <>
    <div className="post-wide">ITEMS</div>
    <div className="post"><h2>Pocions</h2><p>Quan usar-les.</p></div>
    <div className="post"><h2>Elixirs</h2><p>Els objectes més valuosos.</p></div>
  </>
);

const Summon: React.FC = () => (
  <>
    <div className="post-wide">SUMMON</div>
    <div className="post"><h2>Simba</h2><p>Invocació ofensiva.</p></div>
    <div className="post"><h2>Genie</h2><p>Invocació versàtil.</p></div>
  </>
);
