import { useEffect, useRef } from "react";
import { NASA_EARTH_TEXTURE_URL } from "../data/nasaEarthData.js";
import "./EarthGlobe.css";

const VERTEX_SHADER = `
attribute vec3 aPosition;
attribute vec2 aUv;
uniform float uRotation;
uniform float uTilt;
varying vec2 vUv;
varying vec3 vNormal;

void main() {
  float c = cos(uRotation);
  float s = sin(uRotation);
  vec3 p = vec3(c * aPosition.x + s * aPosition.z, aPosition.y, -s * aPosition.x + c * aPosition.z);
  float ct = cos(uTilt);
  float st = sin(uTilt);
  p = vec3(p.x, ct * p.y - st * p.z, st * p.y + ct * p.z);
  vNormal = p;
  vUv = aUv;
  gl_Position = vec4(p.x * 0.91, p.y * 0.91, p.z * 0.48, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision mediump float;
uniform sampler2D uTexture;
varying vec2 vUv;
varying vec3 vNormal;

void main() {
  vec3 normal = normalize(vNormal);
  vec3 lightDirection = normalize(vec3(-0.38, 0.28, 0.88));
  float diffuse = max(dot(normal, lightDirection), 0.0);
  float illumination = 0.46 + 0.72 * diffuse;
  vec4 surface = texture2D(uTexture, vUv);
  vec3 brighterSurface = surface.rgb * illumination * vec3(1.08, 1.10, 1.12);
  gl_FragColor = vec4(clamp(brighterSurface, 0.0, 1.0), surface.a);
}
`;

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(message || "Unable to compile Earth globe shader");
  }
  return shader;
}

function createSphere(latSegments = 48, lonSegments = 96) {
  const positions = [];
  const uvs = [];
  const indices = [];

  for (let lat = 0; lat <= latSegments; lat += 1) {
    const theta = (lat / latSegments) * Math.PI;
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);

    for (let lon = 0; lon <= lonSegments; lon += 1) {
      const phi = (lon / lonSegments) * Math.PI * 2;
      positions.push(
        sinTheta * Math.cos(phi),
        cosTheta,
        sinTheta * Math.sin(phi),
      );
      uvs.push(lon / lonSegments, 1 - lat / latSegments);
    }
  }

  for (let lat = 0; lat < latSegments; lat += 1) {
    for (let lon = 0; lon < lonSegments; lon += 1) {
      const first = lat * (lonSegments + 1) + lon;
      const second = first + lonSegments + 1;
      indices.push(first, second, first + 1, second, second + 1, first + 1);
    }
  }

  return {
    positions: new Float32Array(positions),
    uvs: new Float32Array(uvs),
    indices: new Uint16Array(indices),
  };
}

export default function EarthGlobe() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    let gl;
    let animationFrame = 0;
    let resizeObserver;
    let textureLoaded = false;
    let dragging = false;
    let lastPointerX = 0;
    let rotation = 0;
    let tilt = -0.16;
    let previousFrame = 0;

    try {
      gl = canvas.getContext("webgl", { alpha: true, antialias: true });
      if (!gl) throw new Error("WebGL is unavailable");

      const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
      const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
      const program = gl.createProgram();
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(program) || "Unable to link Earth globe");
      }

      gl.useProgram(program);
      const sphere = createSphere();
      const positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, sphere.positions, gl.STATIC_DRAW);
      const positionLocation = gl.getAttribLocation(program, "aPosition");
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

      const uvBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, sphere.uvs, gl.STATIC_DRAW);
      const uvLocation = gl.getAttribLocation(program, "aUv");
      gl.enableVertexAttribArray(uvLocation);
      gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 0, 0);

      const indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, sphere.indices, gl.STATIC_DRAW);

      const rotationLocation = gl.getUniformLocation(program, "uRotation");
      const tiltLocation = gl.getUniformLocation(program, "uTilt");
      const textureLocation = gl.getUniformLocation(program, "uTexture");
      const texture = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(
        gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
        new Uint8Array([12, 48, 82, 255]),
      );
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.uniform1i(textureLocation, 0);
      gl.enable(gl.DEPTH_TEST);
      gl.disable(gl.CULL_FACE);
      gl.clearColor(0, 0, 0, 0);

      const image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = () => {
        if (!gl || !canvas.isConnected) return;
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        textureLoaded = true;
        canvas.dataset.texture = "loaded";
      };
      image.onerror = () => {
        canvas.dataset.fallback = "true";
      };
      image.src = NASA_EARTH_TEXTURE_URL;

      const resize = () => {
        const size = Math.max(1, Math.round(Math.min(canvas.clientWidth, canvas.clientHeight) * Math.min(window.devicePixelRatio || 1, 2)));
        if (canvas.width !== size || canvas.height !== size) {
          canvas.width = size;
          canvas.height = size;
        }
        gl.viewport(0, 0, size, size);
      };
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(canvas);
      resize();

      const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      const draw = (timestamp) => {
        const delta = previousFrame ? Math.min((timestamp - previousFrame) / 1000, 0.05) : 0;
        previousFrame = timestamp;
        if (!dragging && !reducedMotion) rotation += delta * 0.12;
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(program);
        gl.uniform1f(rotationLocation, rotation);
        gl.uniform1f(tiltLocation, tilt);
        gl.drawElements(gl.TRIANGLES, sphere.indices.length, gl.UNSIGNED_SHORT, 0);
        animationFrame = window.requestAnimationFrame(draw);
      };
      animationFrame = window.requestAnimationFrame(draw);

      const onPointerDown = (event) => {
        dragging = true;
        lastPointerX = event.clientX;
        canvas.setPointerCapture?.(event.pointerId);
      };
      const onPointerMove = (event) => {
        if (!dragging) return;
        const deltaX = event.clientX - lastPointerX;
        rotation += deltaX * 0.008;
        tilt = Math.max(-0.85, Math.min(0.85, tilt + (event.movementY || 0) * 0.004));
        lastPointerX = event.clientX;
      };
      const onPointerUp = () => { dragging = false; };
      canvas.addEventListener("pointerdown", onPointerDown);
      canvas.addEventListener("pointermove", onPointerMove);
      canvas.addEventListener("pointerup", onPointerUp);
      canvas.addEventListener("pointercancel", onPointerUp);

      return () => {
        window.cancelAnimationFrame(animationFrame);
        resizeObserver?.disconnect();
        canvas.removeEventListener("pointerdown", onPointerDown);
        canvas.removeEventListener("pointermove", onPointerMove);
        canvas.removeEventListener("pointerup", onPointerUp);
        canvas.removeEventListener("pointercancel", onPointerUp);
        gl.deleteTexture(texture);
        gl.deleteBuffer(positionBuffer);
        gl.deleteBuffer(uvBuffer);
        gl.deleteBuffer(indexBuffer);
        gl.deleteProgram(program);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
      };
    } catch {
      canvas.dataset.fallback = "true";
      return undefined;
    }
  }, []);

  return (
    <div className="lf-earth-globe-wrap" role="img" aria-label="Interactive three-dimensional Earth globe textured with NASA Blue Marble satellite imagery">
      <div className="lf-earth-globe">
        <canvas
          ref={canvasRef}
          className="lf-earth-globe-canvas"
          aria-label="Drag to rotate the NASA-textured Earth globe"
        />
        <div className="lf-earth-globe-shade" />
        <div className="lf-earth-globe-atmosphere" />
      </div>
      <span className="lf-earth-globe-caption">NASA BLUE MARBLE / DRAG TO ROTATE</span>
    </div>
  );
}
