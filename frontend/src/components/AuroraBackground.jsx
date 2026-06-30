import React, { useRef, useEffect } from 'react';

/**
 * AuroraBackground — premium fullscreen WebGL "Liquid Aurora Mesh".
 *
 * Flowing, translucent aurora ribbons rendered with layered FBM simplex noise.
 * Palette is derived from Anchor's design system (lime accent + cool blues),
 * desaturated into a sophisticated teal → green → deep-blue aurora that
 * complements the UI without overpowering it.
 *
 * - Very slow drift (~30s feel), no obvious looping
 * - Subtle mouse parallax (eased, restrained)
 * - Soft bloom around bright regions, faint grain + particles
 * - Dark enough for text readability everywhere
 * - Graceful fallback to a CSS gradient if WebGL is unavailable
 * - Pauses when tab hidden; respects prefers-reduced-motion
 */
export default function AuroraBackground() {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const mouseRef = useRef({ x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl =
      canvas.getContext('webgl', { antialias: true, alpha: true, premultipliedAlpha: false }) ||
      canvas.getContext('experimental-webgl');

    // Fallback: no WebGL -> leave the CSS gradient behind the canvas visible.
    if (!gl) {
      canvas.style.display = 'none';
      return;
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const vert = `
      attribute vec2 aPos;
      void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
    `;

    // Fragment shader: layered domain-warped FBM forming silk-like aurora ribbons.
    const frag = `
      precision highp float;
      uniform vec2  uRes;
      uniform float uTime;
      uniform vec2  uMouse;

      // --- simplex noise (Ashima / Stefan Gustavson) ---
      vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
      vec2 mod289(vec2 x){return x-floor(x*(1.0/289.0))*289.0;}
      vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}
      float snoise(vec2 v){
        const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
        vec2 i=floor(v+dot(v,C.yy));
        vec2 x0=v-i+dot(i,C.xx);
        vec2 i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);
        vec4 x12=x0.xyxy+C.xxzz; x12.xy-=i1;
        i=mod289(i);
        vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));
        vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);
        m=m*m; m=m*m;
        vec3 x=2.0*fract(p*C.www)-1.0;
        vec3 h=abs(x)-0.5;
        vec3 ox=floor(x+0.5);
        vec3 a0=x-ox;
        m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);
        vec3 g;
        g.x=a0.x*x0.x+h.x*x0.y;
        g.yz=a0.yz*x12.xz+h.yz*x12.yw;
        return 130.0*dot(m,g);
      }

      // fractal brownian motion with adjustable detail (octave amplitude falloff)
      // detail in [0,1]: 1 = full 5 octaves, lower = fewer effective octaves (less density)
      float fbm(vec2 p, float detail){
        float s=0.0, a=0.5, tot=0.0;
        for(int i=0;i<5;i++){
          // fade out higher octaves as detail drops -> less fine detail, softer patterns
          float oct = clamp(detail*5.0 - float(i), 0.0, 1.0);
          s += a*oct*snoise(p);
          tot += a*oct;
          p*=2.02; a*=0.5;
        }
        return tot>0.0 ? s/tot*0.85 : 0.0;
      }
      float fbm(vec2 p){ return fbm(p, 1.0); }

      void main(){
        vec2 uv = gl_FragCoord.xy / uRes.xy;
        float aspect = uRes.x / uRes.y;
        vec2 p = uv; p.x *= aspect;

        // ---- CALM FIELD ----------------------------------------------------
        // A very large, smooth gradient that gently reduces visual busy-ness toward
        // the hero centre. NOTHING is drawn for this; it only re-parameterises the
        // procedural noise so the artwork itself is painted with less detail there.
        // Spans most of the hero and fades seamlessly into untouched background.
        vec2 cc = uv - 0.5; cc.y *= 0.92;
        float d = length(cc);
        // calm = 0 at very centre (calmest) -> 1 toward the edges (full detail)
        // wide smoothstep => no visible boundary, blends over a huge area
        float calm = smoothstep(0.08, 0.78, d);

        // detail density: 25-35% less detail in the centre
        float detail = mix(0.68, 1.0, calm);
        // animation intensity: slightly slower in the centre
        float tScale = mix(0.82, 1.0, calm);
        // warp intensity: softer, less convoluted patterns in the centre
        float warpAmt = mix(0.74, 1.0, calm);

        // ---- FLOW ----------------------------------------------------------
        float t = uTime * 0.018 * tScale;
        vec2 par = (uMouse - 0.5) * 0.10 * mix(0.7, 1.0, calm); // calmer parallax in centre

        // lower base frequency (0.9) gives more space *between* the liquid meshes,
        // so the texture reads as separated ribbons rather than a convoluted tangle.
        vec2 q = vec2(
          fbm(p * 0.9 + vec2(0.0, t) + par, detail),
          fbm(p * 0.9 + vec2(5.2, -t*0.8) - par, detail)
        );
        vec2 r = vec2(
          fbm(p * 1.15 + warpAmt*1.45*q + vec2(1.7, 9.2) + t*0.6, detail),
          fbm(p * 1.15 + warpAmt*1.45*q + vec2(8.3, 2.8) - t*0.5, detail)
        );
        float f = fbm(p * 1.05 + warpAmt*2.1*r + t*0.4, detail);

        // ribbon bands from the warped field (wider spacing between bands)
        float ribbon = sin((p.y*1.7 + f*2.4 + t*1.4)) * 0.5 + 0.5;
        ribbon = pow(ribbon, 1.6);
        float band2 = sin((p.x*1.2 - f*1.8 - t*1.0)) * 0.5 + 0.5;

        // --- Slate + Ice Blue palette ---
        vec3 deep   = vec3(0.027, 0.063, 0.094); // #071018 navy-slate base
        vec3 midblue= vec3(0.12,  0.34,  0.66);  // deep azure
        vec3 blue   = vec3(0.231, 0.510, 0.965); // #3B82F6 secondary accent
        vec3 ice    = vec3(0.38,  0.78,  0.98);  // #61DAFB primary accent
        vec3 soft   = vec3(0.604, 0.863, 0.992); // #9ADCFD glow

        float m1 = smoothstep(0.12, 0.82, ribbon);
        float m2 = smoothstep(0.25, 0.98, band2);
        float glow = smoothstep(0.45, 1.0, f*0.5+0.5);

        // reduce TEXTURE CONTRAST in the centre: pull the masks toward their mid value.
        // 30-40% less contrast where calm is lowest, seamlessly returning to full at edges.
        float contrast = mix(0.62, 1.0, calm);
        m1   = mix(0.5, m1,   contrast);
        m2   = mix(0.45, m2,  contrast);
        glow = mix(0.4, glow, contrast);

        vec3 col = deep;
        col = mix(col, midblue, m1 * 0.58);
        col = mix(col, blue,    m2 * 0.46);
        col = mix(col, ice,     glow * 0.44);
        col += soft * pow(glow, 3.0) * 0.16;   // soft ice-blue accent on bright cores

        // soft blue bloom around bright cores — gently reduced in the centre
        float bloom = pow(max(m1*glow, m2*glow), 2.0);
        col += soft * bloom * mix(0.85, 1.2, calm);

        // VERY subtle saturation reduction in the centre (colour stays almost identical).
        float lum = dot(col, vec3(0.299, 0.587, 0.114));
        col = mix(col, vec3(lum), (1.0 - calm) * 0.18);   // up to ~18% desat at dead centre

        // NOTE: no central darkening, no vignette, no overlay. Brightness is essentially
        // uniform across the page; only the *amount of detail* changes toward the centre.
        col *= 0.97;

        // faint film grain
        float g = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898,78.233))) * 43758.5453 + uTime);
        col += (g - 0.5) * 0.022;

        gl_FragColor = vec4(col, 1.0);
      }
    `;

    function compile(type, src) {
      const sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.error('shader error:', gl.getShaderInfoLog(sh));
        return null;
      }
      return sh;
    }

    const vs = compile(gl.VERTEX_SHADER, vert);
    const fs = compile(gl.FRAGMENT_SHADER, frag);
    if (!vs || !fs) { canvas.style.display = 'none'; return; }

    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('link error:', gl.getProgramInfoLog(prog));
      canvas.style.display = 'none';
      return;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, 'uRes');
    const uTime = gl.getUniformLocation(prog, 'uTime');
    const uMouse = gl.getUniformLocation(prog, 'uMouse');

    // cap DPR for performance; aurora is soft so it doesn't need full retina
    const DPR = Math.min(window.devicePixelRatio || 1, 1.5);
    function resize() {
      const w = Math.floor(window.innerWidth * DPR);
      const h = Math.floor(window.innerHeight * DPR);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w; canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    }
    resize();
    window.addEventListener('resize', resize);

    function onMove(e) {
      mouseRef.current.tx = e.clientX / window.innerWidth;
      mouseRef.current.ty = 1.0 - e.clientY / window.innerHeight;
    }
    window.addEventListener('pointermove', onMove);

    const start = performance.now();
    let running = true;
    function onVis() { running = !document.hidden; if (running) loop(); }
    document.addEventListener('visibilitychange', onVis);

    function loop() {
      if (!running) return;
      const m = mouseRef.current;
      // ease mouse toward target for smooth parallax
      m.x += (m.tx - m.x) * 0.04;
      m.y += (m.ty - m.y) * 0.04;

      const time = reduceMotion ? 0 : (performance.now() - start) / 1000;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, time);
      gl.uniform2f(uMouse, m.x, m.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      if (reduceMotion) return; // draw a single static frame
      rafRef.current = requestAnimationFrame(loop);
    }
    loop();

    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('visibilitychange', onVis);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buf);
    };
  }, []);

  return (
    <div aria-hidden="true" style={wrap}>
      {/* CSS fallback gradient sits behind the canvas */}
      <div style={fallback} />
      <canvas ref={canvasRef} style={canvasStyle} />
      {/* readability scrim */}
      <div style={scrim} />
    </div>
  );
}

const wrap = {
  position: 'fixed',
  inset: 0,
  zIndex: 0,
  pointerEvents: 'none',
  overflow: 'hidden',
};
const fallback = {
  position: 'absolute',
  inset: 0,
  background:
    'radial-gradient(120vw 90vh at 25% 5%, rgba(36,90,150,0.28), transparent 50%),' +
    'radial-gradient(100vw 80vh at 85% 95%, rgba(28,66,130,0.24), transparent 50%),' +
    'linear-gradient(180deg, #071018 0%, #0a1622 55%, #071018 100%)',
};
const canvasStyle = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  display: 'block',
};
const scrim = {
  position: 'absolute',
  inset: 0,
  // layered scrim: darkens the whole field a touch, and the centre band more,
  // guaranteeing text contrast regardless of where bright ribbons drift.
  background:
    'radial-gradient(120vw 95vh at 50% 42%, rgba(7,16,24,0.42) 0%, rgba(7,16,24,0.18) 38%, rgba(7,16,24,0.42) 100%),' +
    'linear-gradient(180deg, rgba(7,16,24,0.38) 0%, rgba(7,16,24,0.12) 30%, rgba(7,16,24,0.12) 70%, rgba(7,16,24,0.42) 100%)',
  pointerEvents: 'none',
};
