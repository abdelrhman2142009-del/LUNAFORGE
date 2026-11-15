import { useEffect, useRef, useState } from "react";
import "./SpaceAdventure.css";

const WIDTH = 960;
const HEIGHT = 540;
const TARGET_CORES = 12;

function makeGame() {
  return {
    ship: { x: WIDTH / 2, y: HEIGHT - 95, vx: 0, vy: 0, invulnerable: 0 },
    stars: Array.from({ length: 95 }, () => ({ x: Math.random() * WIDTH, y: Math.random() * HEIGHT, size: Math.random() * 2 + 0.4, speed: Math.random() * 35 + 12 })),
    rocks: [], cores: [], shots: [], particles: [],
    score: 0, coresCollected: 0, lives: 3, wave: 1,
    rockTimer: 0, coreTimer: 0, shotTimer: 0, elapsed: 0,
  };
}

function drawShip(ctx, ship, time) {
  ctx.save();
  ctx.translate(ship.x, ship.y);
  ctx.shadowBlur = 22;
  ctx.shadowColor = "#54d9ff";
  ctx.fillStyle = "#dff8ff";
  ctx.beginPath();
  ctx.moveTo(0, -23);
  ctx.lineTo(17, 17);
  ctx.lineTo(0, 10);
  ctx.lineTo(-17, 17);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#42bde9";
  ctx.beginPath();
  ctx.moveTo(-7, 14);
  ctx.lineTo(0, 30 + Math.sin(time / 55) * 5);
  ctx.lineTo(7, 14);
  ctx.fill();
  ctx.fillStyle = "#123d68";
  ctx.beginPath();
  ctx.arc(0, -5, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawScene(ctx, game, time) {
  const bg = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  bg.addColorStop(0, "#071326");
  bg.addColorStop(1, "#0b2440");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  game.stars.forEach((star) => {
    ctx.globalAlpha = 0.35 + (star.size / 3) * 0.6;
    ctx.fillStyle = "#c8edff";
    ctx.fillRect(star.x, star.y, star.size, star.size);
  });
  ctx.globalAlpha = 1;

  ctx.strokeStyle = "rgba(76,174,224,.08)";
  ctx.lineWidth = 1;
  for (let x = 0; x < WIDTH; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, HEIGHT); ctx.stroke(); }
  for (let y = 0; y < HEIGHT; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(WIDTH, y); ctx.stroke(); }

  game.cores.forEach((core) => {
    ctx.save();
    ctx.translate(core.x, core.y);
    ctx.rotate(time / 500);
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#4ce7d1";
    ctx.fillStyle = "#6dffe0";
    ctx.beginPath();
    ctx.moveTo(0, -12); ctx.lineTo(9, 0); ctx.lineTo(0, 12); ctx.lineTo(-9, 0); ctx.closePath();
    ctx.fill();
    ctx.restore();
  });

  game.rocks.forEach((rock) => {
    ctx.save();
    ctx.translate(rock.x, rock.y);
    ctx.rotate(rock.rotation);
    ctx.fillStyle = "#71859d";
    ctx.strokeStyle = "#a7bdd0";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      const radius = rock.radius * (0.78 + Math.sin(i * 8.2 + rock.seed) * 0.16);
      const x = Math.cos(a) * radius, y = Math.sin(a) * radius;
      if (!i) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
  });

  game.shots.forEach((shot) => {
    ctx.fillStyle = "#78eaff";
    ctx.shadowBlur = 14;
    ctx.shadowColor = "#4edbff";
    ctx.fillRect(shot.x - 2, shot.y - 9, 4, 16);
  });
  ctx.shadowBlur = 0;

  game.particles.forEach((particle) => {
    ctx.globalAlpha = Math.max(0, particle.life / particle.maxLife);
    ctx.fillStyle = particle.color;
    ctx.beginPath(); ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2); ctx.fill();
  });
  ctx.globalAlpha = 1;

  if (shipIsVisible(game.ship, time)) drawShip(ctx, game.ship, time);
  ctx.fillStyle = "rgba(180,215,242,.65)";
  ctx.font = "700 11px ui-monospace, monospace";
  ctx.fillText("SECTOR 07  /  NILE DELTA ORBIT", 22, 28);
  ctx.fillText("COLLECT DATA CORES  •  AVOID ASTEROIDS", WIDTH - 305, 28);
}

function shipIsVisible(ship, time) { return ship.invulnerable <= 0 || Math.floor(time / 90) % 2 === 0; }

function burst(game, x, y, color, amount = 12) {
  for (let i = 0; i < amount; i++) {
    const angle = Math.random() * Math.PI * 2, speed = Math.random() * 150 + 35;
    game.particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 0.55 + Math.random() * 0.5, maxLife: 1.05, size: Math.random() * 3 + 1, color });
  }
}

export default function SpaceAdventure({ onBack = () => {} }) {
  const canvasRef = useRef(null);
  const gameRef = useRef(makeGame());
  const keysRef = useRef({});
  const [status, setStatus] = useState("ready");
  const [hud, setHud] = useState({ score: 0, cores: 0, lives: 3, wave: 1 });
  const [bestScore, setBestScore] = useState(0);

  useEffect(() => {
    const savedBest = Number(window.localStorage.getItem("lunaforge-orbit-runner-best") || 0);
    if (savedBest > 0) setBestScore(savedBest);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("lunaforge-orbit-runner-best", String(bestScore));
  }, [bestScore]);

  function syncHud(game) {
    setHud({ score: game.score, cores: game.coresCollected, lives: game.lives, wave: game.wave });
    setBestScore((best) => Math.max(best, game.score));
  }

  function startGame() {
    gameRef.current = makeGame();
    keysRef.current = {};
    setHud({ score: 0, cores: 0, lives: 3, wave: 1 });
    setStatus("playing");
  }

  useEffect(() => {
    if (status !== "playing") return undefined;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return undefined;
    let frame = 0;
    let previous = performance.now();
    let hudTimer = 0;
    const game = gameRef.current;
    const statusRef = { current: status };

    const tick = (now) => {
      const dt = Math.min((now - previous) / 1000, 0.035);
      previous = now;
      game.elapsed += dt * 1000;
      const ship = game.ship;
      const keys = keysRef.current;

      const dx = (keys.ArrowRight || keys.d ? 1 : 0) - (keys.ArrowLeft || keys.a ? 1 : 0);
      const dy = (keys.ArrowDown || keys.s ? 1 : 0) - (keys.ArrowUp || keys.w ? 1 : 0);
      const length = Math.hypot(dx, dy) || 1;
      ship.x = Math.max(22, Math.min(WIDTH - 22, ship.x + (dx / length) * 290 * dt));
      ship.y = Math.max(45, Math.min(HEIGHT - 30, ship.y + (dy / length) * 290 * dt));
      ship.invulnerable = Math.max(0, ship.invulnerable - dt);

      game.stars.forEach((star) => { star.y += star.speed * dt; if (star.y > HEIGHT) { star.y = 0; star.x = Math.random() * WIDTH; } });
      game.rockTimer += dt;
      game.coreTimer += dt;
      game.shotTimer -= dt;
      const difficulty = 1 + Math.floor(game.coresCollected / 4) * 0.22;
      if (game.rockTimer > Math.max(0.42, 1.12 - difficulty * 0.13)) {
        game.rockTimer = 0;
        const radius = 15 + Math.random() * 18;
        game.rocks.push({ x: radius + Math.random() * (WIDTH - radius * 2), y: -radius, radius, vx: (Math.random() - 0.5) * 65, vy: (75 + Math.random() * 85) * difficulty, rotation: 0, spin: (Math.random() - 0.5) * 2, seed: Math.random() * 20 });
      }
      if (game.coreTimer > 1.65) {
        game.coreTimer = 0;
        game.cores.push({ x: 35 + Math.random() * (WIDTH - 70), y: -20, vy: 105 + Math.random() * 35 });
      }
      if ((keys[" "] || keys.Space) && game.shotTimer <= 0) {
        game.shots.push({ x: ship.x, y: ship.y - 24, vy: -470 });
        game.shotTimer = 0.19;
      }

      game.shots.forEach((shot) => { shot.y += shot.vy * dt; });
      game.rocks.forEach((rock) => { rock.x += rock.vx * dt; rock.y += rock.vy * dt; rock.rotation += rock.spin * dt; });
      game.cores.forEach((core) => { core.y += core.vy * dt; });
      game.particles.forEach((p) => { p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.985; p.vy *= 0.985; p.life -= dt; });

      game.shots = game.shots.filter((shot) => shot.y > -20);
      game.cores = game.cores.filter((core) => core.y < HEIGHT + 25);
      game.rocks = game.rocks.filter((rock) => rock.y < HEIGHT + rock.radius + 10);
      game.particles = game.particles.filter((p) => p.life > 0);

      for (let i = game.rocks.length - 1; i >= 0; i--) {
        const rock = game.rocks[i];
        const shotIndex = game.shots.findIndex((shot) => Math.hypot(shot.x - rock.x, shot.y - rock.y) < rock.radius + 5);
        if (shotIndex >= 0) {
          game.shots.splice(shotIndex, 1);
          game.rocks.splice(i, 1);
          game.score += 50;
          burst(game, rock.x, rock.y, "#ffb66e", 13);
          continue;
        }
        if (ship.invulnerable <= 0 && Math.hypot(ship.x - rock.x, ship.y - rock.y) < rock.radius + 13) {
          game.rocks.splice(i, 1);
          game.lives -= 1;
          ship.invulnerable = 1.6;
          burst(game, ship.x, ship.y, "#ff718a", 22);
          if (game.lives <= 0) { syncHud(game); setStatus("lost"); }
        }
      }
      for (let i = game.cores.length - 1; i >= 0; i--) {
        const core = game.cores[i];
        if (Math.hypot(ship.x - core.x, ship.y - core.y) < 28) {
          game.cores.splice(i, 1);
          game.coresCollected += 1;
          game.score += 100;
          game.wave = 1 + Math.floor(game.coresCollected / 4);
          burst(game, core.x, core.y, "#5dffe1", 16);
          if (game.coresCollected >= TARGET_CORES) { syncHud(game); setStatus("won"); }
        }
      }

      drawScene(ctx, game, now);
      hudTimer += dt;
      if (hudTimer > 0.12) { hudTimer = 0; syncHud(game); }
      if (statusRef.current === "playing") frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [status]);

  useEffect(() => {
    const down = (event) => {
      const keys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " ", "Space", "w", "a", "s", "d"];
      if (keys.includes(event.key)) event.preventDefault();
      keysRef.current[event.key] = true;
      if (event.key === "Escape" && status === "playing") setStatus("paused");
      else if (event.key === "Escape" && status === "paused") setStatus("playing");
    };
    const up = (event) => { keysRef.current[event.key] = false; };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, [status]);

  function hold(key, pressed) { keysRef.current[key] = pressed; }

  const overlayTitle = status === "ready" ? "YOUR SHIP. YOUR SURVIVAL." : status === "paused" ? "GAME PAUSED" : status === "won" ? "SECTOR CLEARED!" : "SHIP LOST";
  const overlayText = status === "ready"
    ? "Pilot through the asteroid field, blast rocks, and recover 12 lost data cores."
    : status === "paused" ? "Take a breath, commander. Your run is safe."
    : status === "won" ? "All 12 data cores recovered. The Nile Delta expedition is complete."
    : "Your ship ran out of hull integrity. Launch another run and beat your high score.";

  return (
    <main className="space-adventure">
      <div className="sa-topbar">
        <button className="sa-back" onClick={onBack}>← BACK TO LUNAFORGE</button>
        <span className="sa-live"><i /> ARCADE MODE / SECTOR 07</span>
      </div>
      <header className="sa-heading">
        <div><p className="sa-kicker">LUNAFORGE ORIGINAL ARCADE</p><h1>ORBIT <span>RUNNER</span></h1><p>One pilot. One satellite. A whole field of trouble.</p></div>
        <div className="sa-best"><small>PERSONAL BEST</small><strong>{bestScore.toLocaleString()}</strong></div>
      </header>
      <section className="sa-game-shell">
        <div className="sa-hud">
          <div><small>SCORE</small><strong>{hud.score.toLocaleString()}</strong></div>
          <div><small>DATA CORES</small><strong>{hud.cores} <em>/ {TARGET_CORES}</em></strong></div>
          <div><small>HULL</small><strong className="sa-lives">{"◆ ".repeat(hud.lives)}<span>{"◇ ".repeat(3 - hud.lives)}</span></strong></div>
          <div><small>WAVE</small><strong>{String(hud.wave).padStart(2, "0")}</strong></div>
        </div>
        <div className="sa-canvas-wrap">
          <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} aria-label="Orbit Runner arcade game" />
          {status !== "playing" && <div className="sa-overlay">
            <span>{status === "won" ? "MISSION COMPLETE" : status === "lost" ? "MISSION FAILED" : status === "paused" ? "PAUSED" : "READY FOR LAUNCH"}</span>
            <h2>{overlayTitle}</h2><p>{overlayText}</p>
            <button onClick={status === "ready" || status === "won" || status === "lost" ? startGame : () => setStatus("playing")}>{status === "ready" ? "▶ START GAME" : status === "paused" ? "▶ RESUME" : "↻ PLAY AGAIN"}</button>
          </div>}
        </div>
        <div className="sa-game-footer"><span>RECOVER 12 DATA CORES TO CLEAR THE SECTOR</span><button onClick={() => setStatus(status === "playing" ? "paused" : status === "paused" ? "playing" : status)} disabled={status !== "playing" && status !== "paused"}>{status === "playing" ? "Ⅱ PAUSE" : "▶ RESUME"}</button></div>
      </section>
      <div className="sa-instructions">
        <div><strong>HOW TO PLAY</strong><p>Move through space, collect glowing cores, and shoot asteroids before they hit you.</p></div>
        <div className="sa-key-guide"><span>↑ ↓ ← → / WASD <small>MOVE</small></span><span>SPACE <small>FIRE</small></span><span>ESC <small>PAUSE</small></span></div>
      </div>
      <div className="sa-mobile-controls">
        <div className="sa-dpad">
          <button onPointerDown={() => hold("ArrowUp", true)} onPointerUp={() => hold("ArrowUp", false)} onPointerLeave={() => hold("ArrowUp", false)}>↑</button>
          <button onPointerDown={() => hold("ArrowLeft", true)} onPointerUp={() => hold("ArrowLeft", false)} onPointerLeave={() => hold("ArrowLeft", false)}>←</button>
          <button onPointerDown={() => hold("ArrowDown", true)} onPointerUp={() => hold("ArrowDown", false)} onPointerLeave={() => hold("ArrowDown", false)}>↓</button>
          <button onPointerDown={() => hold("ArrowRight", true)} onPointerUp={() => hold("ArrowRight", false)} onPointerLeave={() => hold("ArrowRight", false)}>→</button>
        </div>
        <button className="sa-fire" onPointerDown={() => hold(" ", true)} onPointerUp={() => hold(" ", false)} onPointerLeave={() => hold(" ", false)}>FIRE</button>
      </div>
      <p className="sa-disclaimer">Arcade gameplay is an original fictional mini-game inside the LUNAFORGE universe.</p>
    </main>
  );
}
