"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";

// Full canvas pixel resolution
const W = 480;
const H = 240;
// PS1 internal resolution – rendered here then upscaled for that blocky look
const PS1_W = 96;
const PS1_H = 48;
// CSS display size (big visually, takes zero layout space)
const CSS_W = 360;
const CSS_H = 180;

type Props = { className?: string; flashKey?: number };

export default function TankPreview({ className, flashKey = 0 }: Props) {
  const canvasRef    = useRef<HTMLCanvasElement | null>(null);
  const rafRef       = useRef<number | null>(null);
  const modelRef     = useRef<THREE.Object3D | null>(null);
  const targetYRef   = useRef<number>((3 * Math.PI) / 4);
  const flashOverlay = useRef<HTMLDivElement | null>(null);

  // Trigger flash animation whenever flashKey increments
  useEffect(() => {
    if (flashKey === 0) return;
    const el = flashOverlay.current;
    if (!el) return;
    el.classList.remove("tank-flash");
    void el.offsetWidth; // force reflow to restart animation
    el.classList.add("tank-flash");
  }, [flashKey]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let disposed = false;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
    renderer.setPixelRatio(1);
    renderer.setSize(W, H, false);

    // ── Low-res PS1 render target ────────────────────────────────────
    const rtPS1 = new THREE.WebGLRenderTarget(PS1_W, PS1_H, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
    });

    // ── Scene + camera ───────────────────────────────────────────────
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, PS1_W / PS1_H, 0.01, 1000);
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(5, 8, 5);
    scene.add(dir);

    // ── PS1 post-process pass ────────────────────────────────────────
    const postScene = new THREE.Scene();
    const postCam   = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    postScene.add(postCam);

    const postMat = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: rtPS1.texture },
        uTime:    { value: 0.0 },
        uResHigh: { value: new THREE.Vector2(W, H) },
      },
      vertexShader: /* glsl */`
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
      `,
      fragmentShader: /* glsl */`
        precision mediump float;
        uniform sampler2D tDiffuse;
        uniform float uTime;
        uniform vec2 uResHigh;
        varying vec2 vUv;

        // 4x4 ordered Bayer dither (threshold matrix)
        float bayer(vec2 px) {
          float x = mod(floor(px.x), 4.0);
          float y = mod(floor(px.y), 4.0);
          float t;
          if      (y < 0.5) { if      (x < 0.5) t =  0.0; else if (x < 1.5) t =  8.0; else if (x < 2.5) t =  2.0; else t = 10.0; }
          else if (y < 1.5) { if      (x < 0.5) t = 12.0; else if (x < 1.5) t =  4.0; else if (x < 2.5) t = 14.0; else t =  6.0; }
          else if (y < 2.5) { if      (x < 0.5) t =  3.0; else if (x < 1.5) t = 11.0; else if (x < 2.5) t =  1.0; else t =  9.0; }
          else               { if      (x < 0.5) t = 15.0; else if (x < 1.5) t =  7.0; else if (x < 2.5) t = 13.0; else t =  5.0; }
          return (t / 15.0 - 0.5) * 0.18;
        }

        // Quantise to PS1 5-bit colour depth (32 levels per channel)
        vec3 quantize(vec3 c) { return floor(c * 31.0 + 0.5) / 31.0; }

        void main() {
          vec4 tex = texture2D(tDiffuse, vUv);
          if (tex.a < 0.01) { gl_FragColor = vec4(0.0); return; }

          vec3 col = tex.rgb / max(tex.a, 0.001);

          // Tape-warp horizontal distortion (signature PS1/VHS artifact)
          float warp = sin(vUv.y * 64.0 + uTime * 2.5) * 0.003
                     + sin(vUv.y * 11.0 - uTime * 0.7) * 0.002;
          vec4 warpTex = texture2D(tDiffuse, vec2(vUv.x + warp, vUv.y));
          col = mix(col, warpTex.rgb / max(warpTex.a, 0.001), 0.18);

          // Dithering (applied in screen space → upscaled grain)
          vec2 screenPx = vUv * uResHigh;
          col += bayer(screenPx);

          // Colour quantisation to 5 bits per channel
          col = quantize(clamp(col, 0.0, 1.0));

          // CRT scanlines
          float sl = mod(screenPx.y, 4.0) < 2.0 ? 1.0 : 0.75;
          col *= sl;

          gl_FragColor = vec4(col * tex.a, tex.a);
        }
      `,
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });
    postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), postMat));

    // ── PS1 tank material: vertex snapping + normal colour ───────────
    const ps1Mat = new THREE.ShaderMaterial({
      uniforms: {
        uSnap: { value: 48.0 }, // lower = more jitter
        uTime: { value: 0.0 },
      },
      vertexShader: /* glsl */`
        uniform float uSnap;
        varying vec3 vWNormal;
        void main() {
          vWNormal = normalize(normalMatrix * normal);
          vec4 clip = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          // Classic PS1 vertex snapping in clip space
          float w = clip.w;
          clip.xy = floor((clip.xy / w) * uSnap + 0.5) / uSnap * w;
          gl_Position = clip;
        }
      `,
      fragmentShader: /* glsl */`
        precision mediump float;
        varying vec3 vWNormal;
        void main() {
          vec3 n = normalize(vWNormal) * 0.5 + 0.5;
          gl_FragColor = vec4(n, 1.0);
        }
      `,
      side: THREE.DoubleSide,
    });

    // ── Mouse tracking ───────────────────────────────────────────────
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      targetYRef.current = Math.atan2(e.clientX - cx, e.clientY - cy) + Math.PI;
    };
    window.addEventListener("mousemove", onMouseMove);

    // ── Render loop ──────────────────────────────────────────────────
    const clock = new THREE.Clock();
    let animating = false;
    const animate = () => {
      if (disposed) return;
      rafRef.current = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      ps1Mat.uniforms.uTime.value  = t;
      postMat.uniforms.uTime.value = t;

      if (modelRef.current) {
        const cur = modelRef.current.rotation.y;
        const tgt = targetYRef.current + Math.PI / 4;
        let d = tgt - cur;
        while (d >  Math.PI) d -= 2 * Math.PI;
        while (d < -Math.PI) d += 2 * Math.PI;
        modelRef.current.rotation.y += d * 0.08;
      }

      // 1st pass: render scene to PS1-res buffer
      renderer.setRenderTarget(rtPS1);
      renderer.setClearColor(0x000000, 0);
      renderer.clear();
      renderer.render(scene, camera);

      // 2nd pass: post-process to screen
      renderer.setRenderTarget(null);
      renderer.setClearColor(0x000000, 0);
      renderer.clear();
      renderer.render(postScene, postCam);
    };

    // ── Load FBX ─────────────────────────────────────────────────────
    const loader = new FBXLoader();
    loader.load(
      "/M1Abrams.fbx",
      (object) => {
        if (disposed) return;
        object.updateMatrixWorld(true);

        const box0 = new THREE.Box3().setFromObject(object);
        const c0 = new THREE.Vector3();
        const s0 = new THREE.Vector3();
        box0.getCenter(c0);
        box0.getSize(s0);
        object.position.sub(c0);

        // 2× larger than before (64 world units along longest axis)
        object.scale.setScalar(64 / (Math.max(s0.x, s0.y, s0.z) || 1));
        object.updateMatrixWorld(true);

        object.traverse((child) => {
          const m = child as THREE.Mesh;
          if (!m.isMesh) return;
          m.material = ps1Mat;
          m.frustumCulled = false;
        });

        object.rotation.y = targetYRef.current;
        modelRef.current  = object;
        scene.add(object);

        // Fit camera to model
        const box1 = new THREE.Box3().setFromObject(object);
        const c1 = new THREE.Vector3();
        const s1 = new THREE.Vector3();
        box1.getCenter(c1);
        box1.getSize(s1);
        const md   = Math.max(s1.x, s1.y, s1.z);
        const dist = (md / 2) / Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * 1.1;
        camera.near   = dist / 100;
        camera.far    = dist * 10;
        camera.aspect = PS1_W / PS1_H;
        camera.updateProjectionMatrix();
        camera.position.set(c1.x + dist * 0.7, c1.y + dist * 0.4, c1.z + dist * 0.7);
        camera.lookAt(c1);

        if (!animating) { animating = true; animate(); }
      },
      undefined,
      (e: unknown) => { console.error("FBX load error", e); },
    );

    return () => {
      disposed = true;
      window.removeEventListener("mousemove", onMouseMove);
      if (rafRef.current != null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
      rtPS1.dispose();
      postMat.dispose();
      ps1Mat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      className={className}
      style={{ position: "relative", display: "inline-block", lineHeight: 0, width: 120, height: 60, overflow: "visible" }}
    >
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        style={{
          position: "absolute",
          top: "-60px",
          left: "-120px",
          width: CSS_W,
          height: CSS_H,
          zIndex: 0,
          pointerEvents: "none",
          borderRadius: 12,
          imageRendering: "pixelated",
        }}
        aria-label="M1 Abrams PS1 preview"
      />
      {/* Flash overlay — animated via .tank-flash class */}
      <div
        ref={flashOverlay}
        style={{
          position: "absolute",
          top: "-60px",
          left: "-120px",
          width: CSS_W,
          height: CSS_H,
          zIndex: 1,
          pointerEvents: "none",
          borderRadius: 12,
        }}
      />
    </div>
  );
}
