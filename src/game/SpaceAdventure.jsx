import { useEffect, useMemo, useRef, useState } from "react";
import "./SpaceAdventure.css";
import { buildFlightProfile, getDailyChallenge } from "./engineeringProfile.js";

const WIDTH = 960;
const HEIGHT = 540;
const DISCOVERIES = [
  { id: "voyager", title: "Voyager Memory", detail: "A fragment of an old deep-space probe telemetry log." },
  { id: "ice", title: "Frozen Water Signature", detail: "A spectral reading suggests water ice trapped inside a nearby asteroid." },
  { id: "micro", title: "Micro-Meteorite Sample", detail: "A rare mineral sample that could help explain the local asteroid field." },
  { id: "beacon", title: "Unknown Beacon", detail: "An encrypted signal repeats from beyond the mapped relay corridor." },
  { id: "map", title: "Lost Star Chart", detail: "A recovered navigation fragment reveals an unregistered route." },
];

function makeGame(profile, challenge) {
  return {
    ship: { x: WIDTH / 2, y: HEIGHT - 90, vx: 0, vy: 0, invulnerable: 0 },
    stars: Array.from({ length: 130 }, () => ({
      x: Math.random() * WIDTH,
      y: Math.random() * HEIGHT,
      size: Math.random() * 2 + 0.35,
      speed: Math.random() * 55 + 18,
      depth: Math.random() * 0.8 + 0.2,
    })),
    rocks: [],
    cores: [],
    shots: [],
    particles: [],
    pickups: [],
    score: 0,
    coresCollected: 0,
    lives: 3,
    combo: 0,
    comboTimer: 0,
    boost: profile.boostCapacity,
    profile,
    challenge,
    coreGoal: challenge.coreGoal,
    discoveries: [],
    shield: 0,
    fireTimer: 0,
    rockTimer: 0,
    coreTimer: 0,
    pickupTimer: 0,
    elapsed: 0,
    beacon: null,
    beaconReached: false,
    flare: null,
    flareTimer: 0,
    notice: "FLIGHT SYSTEMS ONLINE",
    noticeTimer: 2.5,
    shake: 0,
  };
}

function burst(game, x, y, color, count = 14, force = 170) {
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * force + 25;
    game.particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.45 + Math.random() * 0.55,
      maxLife: 1,
      size: Math.random() * 3.5 + 1,
      color,
    });
  }
}

function notify(game, message) {
  game.notice = message;
  game.noticeTimer = 2.8;
}

function drawShip(ctx, ship, time, boosting, shield) {
  ctx.save();
  ctx.translate(ship.x, ship.y);
  if (shield > 0) {
    ctx.strokeStyle = "rgba(93,225,255,.8)";
    ctx.lineWidth = 3;
    ctx.shadowBlur = 24;
    ctx.shadowColor = "#52dfff";
    ctx.beginPath();
    ctx.arc(0, 0, 31 + Math.sin(time / 90) * 2, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.shadowBlur = 24;
  ctx.shadowColor = boosting ? "#ffb86b" : "#54d9ff";
  ctx.fillStyle = "#e7fbff";
  ctx.beginPath();
  ctx.moveTo(0, -25);
  ctx.lineTo(19, 17);
  ctx.lineTo(0, 10);
  ctx.lineTo(-19, 17);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#39c9f4";
  ctx.beginPath();
  ctx.moveTo(-8, 15);
  ctx.lineTo(0, 31 + Math.sin(time / 45) * 5 + (boosting ? 16 : 0));
  ctx.lineTo(8, 15);
  ctx.fill();
  ctx.fillStyle = "#123d68";
  ctx.beginPath();
  ctx.arc(0, -5, 5.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawScene(ctx, game, time, boosting) {
  ctx.save();
  if (game.shake > 0) {
    const shake = game.shake * 5;
    ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
  }
  const bg = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  bg.addColorStop(0, "#071326");
  bg.addColorStop(0.58, "#0a1c35");
  bg.addColorStop(1, "#102d49");
  ctx.fillStyle = bg;
  ctx.fillRect(-10, -10, WIDTH + 20, HEIGHT + 20);

  const nebula = ctx.createRadialGradient(690, 160, 10, 690, 160, 360);
  nebula.addColorStop(0, "rgba(35,126,176,.18)");
  nebula.addColorStop(1, "rgba(35,126,176,0)");
  ctx.fillStyle = nebula;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  game.stars.forEach((star) => {
    ctx.globalAlpha = 0.35 + star.depth * 0.55;
    ctx.fillStyle = "#c8edff";
    ctx.fillRect(star.x, star.y, star.size, star.size);
  });
  ctx.globalAlpha = 1;

  game.cores.forEach((core) => {
    ctx.save();
    ctx.translate(core.x, core.y);
    ctx.rotate(time / 420);
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#4ce7d1";
    ctx.fillStyle = "#75ffe4";
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(9, 0);
    ctx.lineTo(0, 12);
    ctx.lineTo(-9, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  });

  game.rocks.forEach((rock) => {
    ctx.save();
    ctx.translate(rock.x, rock.y);
    ctx.rotate(rock.rotation);
    ctx.fillStyle = rock.kind === "crystal" ? "#286a80" : "#71859d";
    ctx.strokeStyle = rock.kind === "crystal" ? "#74f2ed" : "#a7bdd0";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 9; i += 1) {
      const angle = (i / 9) * Math.PI * 2;
      const radius = rock.radius * (0.78 + Math.sin(i * 8.2 + rock.seed) * 0.16);
      const px = Math.cos(angle) * radius;
      const py = Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  });

  game.shots.forEach((shot) => {
    ctx.fillStyle = "#8cf0ff";
    ctx.shadowBlur = 14;
    ctx.shadowColor = "#4edbff";
    ctx.fillRect(shot.x - 2, shot.y - 10, 4, 18);
  });
  ctx.shadowBlur = 0;

  game.pickups.forEach((pickup) => {
    ctx.save();
    ctx.translate(pickup.x, pickup.y);
    ctx.rotate(time / 350);
    ctx.shadowBlur = 22;
    ctx.shadowColor = pickup.type === "repair" ? "#78f0a8" : "#72cfff";
    ctx.strokeStyle = pickup.type === "repair" ? "#8cffb5" : "#83e3ff";
    ctx.lineWidth = 3;
    ctx.strokeRect(-10, -10, 20, 20);
    ctx.restore();
  });

  if (game.beacon) {
    const pulse = 1 + Math.sin(time / 130) * 0.12;
    ctx.save();
    ctx.translate(game.beacon.x, game.beacon.y);
    ctx.strokeStyle = "#ffe18a";
    ctx.lineWidth = 3;
    ctx.shadowBlur = 25;
    ctx.shadowColor = "#ffc85e";
    ctx.beginPath();
    ctx.arc(0, 0, 24 * pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-36, 0); ctx.lineTo(36, 0);
    ctx.moveTo(0, -36); ctx.lineTo(0, 36);
    ctx.stroke();
    ctx.fillStyle = "#fff2bf";
    ctx.font = "800 10px ui-monospace, monospace";
    ctx.fillText("RELAY", -18, -43);
    ctx.restore();
  }

  if (game.flare) {
    const alpha = Math.min(0.28, game.flare.life * 0.13);
    ctx.fillStyle = "rgba(255,143,82," + alpha + ")";
    ctx.fillRect(game.flare.x - 34, 0, 68, HEIGHT);
    ctx.strokeStyle = "rgba(255,194,120,.8)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(game.flare.x, 0);
    ctx.lineTo(game.flare.x, HEIGHT);
    ctx.stroke();
  }

  game.particles.forEach((particle) => {
    ctx.globalAlpha = Math.max(0, particle.life / particle.maxLife);
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  if (game.ship.invulnerable <= 0 || Math.floor(time / 90) % 2 === 0) {
    drawShip(ctx, game.ship, time, boosting, game.shield);
  }

  ctx.fillStyle = "rgba(180,215,242,.7)";
  ctx.font = "800 11px ui-monospace, monospace";
  ctx.fillText("NILE DELTA ORBIT  /  RESCUE RELAY", 22, 27);
  ctx.textAlign = "right";
  ctx.fillText("FLIGHT TIME " + Math.floor(game.elapsed).toString().padStart(2, "0") + "s", WIDTH - 22, 27);
  ctx.textAlign = "left";
  ctx.restore();
}

export default function SpaceAdventure({ onBack = () => {}, engineeringReport = null, onEditDesign = () => {} }) {
  const profile = useMemo(() => buildFlightProfile(engineeringReport), [engineeringReport]);
  const dailyChallenge = useMemo(() => getDailyChallenge(), []);
  const [journal, setJournal] = useState(() => {
    try { return JSON.parse(window.localStorage.getItem("lunaforge-discovery-journal") || "[]"); }
    catch { return []; }
  });
  const [achievements, setAchievements] = useState(() => {
    try { return JSON.parse(window.localStorage.getItem("lunaforge-achievements") || "[]"); }
    catch { return []; }
  });
  const canvasRef = useRef(null);
  const gameRef = useRef(makeGame());
  const keysRef = useRef({});
  const [status, setStatus] = useState("ready");
  const [hud, setHud] = useState({ score: 0, cores: 0, lives: 3, combo: 0, boost: 100, beacon: false });
  const [bestScore, setBestScore] = useState(0);

  useEffect(() => {
    const saved = Number(window.localStorage.getItem("lunaforge-orbit-runner-best") || 0);
    if (saved > 0) setBestScore(saved);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("lunaforge-orbit-runner-best", String(bestScore));
  }, [bestScore]);

  useEffect(() => {
    window.localStorage.setItem("lunaforge-discovery-journal", JSON.stringify(journal));
  }, [journal]);

  useEffect(() => {
    window.localStorage.setItem("lunaforge-achievements", JSON.stringify(achievements));
  }, [achievements]);

  function syncHud(game) {
    setHud({
      score: game.score,
      cores: game.coresCollected,
      coreGoal: game.coreGoal,
      lives: game.lives,
      combo: game.combo,
      boost: Math.round(game.boost),
      beacon: game.beaconReached,
    });
    setBestScore((best) => Math.max(best, game.score));
  }

  function startGame() {
    gameRef.current = makeGame(profile, dailyChallenge);
    keysRef.current = {};
    setHud({ score: 0, cores: 0, coreGoal: dailyChallenge.coreGoal, lives: 3, combo: 0, boost: Math.round(profile.boostCapacity), beacon: false });
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
    let running = true;
    const game = gameRef.current;

    const damage = () => {
      if (game.shield > 0 || game.ship.invulnerable > 0) return;
      game.lives -= 1;
      game.ship.invulnerable = 1.7;
      game.shake = 0.8;
      burst(game, game.ship.x, game.ship.y, "#ff718a", 24, 210);
      notify(game, "HULL IMPACT — EVADE THE NEXT WAVE");
      if (game.lives <= 0) {
        syncHud(game);
        setStatus("lost");
        running = false;
      }
    };

    const tick = (now) => {
      if (!running) return;
      const dt = Math.min((now - previous) / 1000, 0.035);
      previous = now;
      game.elapsed += dt;
      const ship = game.ship;
      const keys = keysRef.current;
      const boosting = Boolean((keys.Shift || keys.ShiftLeft || keys.ShiftRight) && game.boost > 1);
      const speed = (boosting ? 470 : 300) * game.profile.agility;
      const dx = (keys.ArrowRight || keys.d ? 1 : 0) - (keys.ArrowLeft || keys.a ? 1 : 0);
      const dy = (keys.ArrowDown || keys.s ? 1 : 0) - (keys.ArrowUp || keys.w ? 1 : 0);
      const length = Math.hypot(dx, dy) || 1;
      const targetVx = (dx / length) * speed;
      const targetVy = (dy / length) * speed;
      ship.vx += (targetVx - ship.vx) * Math.min(1, dt * 8);
      ship.vy += (targetVy - ship.vy) * Math.min(1, dt * 8);
      ship.x = Math.max(25, Math.min(WIDTH - 25, ship.x + ship.vx * dt));
      ship.y = Math.max(48, Math.min(HEIGHT - 30, ship.y + ship.vy * dt));
      ship.invulnerable = Math.max(0, ship.invulnerable - dt);
      game.shield = Math.max(0, game.shield - dt);
      game.boost = Math.min(game.profile.boostCapacity, game.boost + (boosting ? -42 : game.profile.boostRecharge) * dt);
      game.comboTimer = Math.max(0, game.comboTimer - dt);
      game.noticeTimer = Math.max(0, game.noticeTimer - dt);
      game.shake = Math.max(0, game.shake - dt * 2.5);
      game.stars.forEach((star) => {
        star.y += star.speed * dt * (boosting ? 2.2 : 1);
        if (star.y > HEIGHT) { star.y = 0; star.x = Math.random() * WIDTH; }
      });

      game.rockTimer += dt;
      game.coreTimer += dt;
      game.fireTimer -= dt;
      game.pickupTimer += dt;
      game.flareTimer += dt;

      if (game.rockTimer > Math.max(0.38, 1.05 - game.coresCollected * 0.045)) {
        game.rockTimer = 0;
        const radius = 14 + Math.random() * 20;
        game.rocks.push({
          x: radius + Math.random() * (WIDTH - radius * 2),
          y: -radius,
          radius,
          vx: (Math.random() - 0.5) * 90,
          vy: (82 + Math.random() * 95) * (1 + game.coresCollected * 0.035),
          rotation: 0,
          spin: (Math.random() - 0.5) * 2.4,
          seed: Math.random() * 20,
          kind: Math.random() < (game.challenge.title === "CRYSTAL HARVEST" ? 0.3 : 0.16) ? "crystal" : "rock",
        });
      }

      if (game.coreTimer > 1.25) {
        game.coreTimer = 0;
        game.cores.push({ x: 35 + Math.random() * (WIDTH - 70), y: -20, vy: 105 + Math.random() * 45 });
      }

      if (game.pickupTimer > 10) {
        game.pickupTimer = 0;
        if (Math.random() < 0.8) {
          game.pickups.push({
            x: 45 + Math.random() * (WIDTH - 90),
            y: -20,
            vy: 95,
            type: Math.random() < 0.55 ? "shield" : "repair",
          });
        }
      }

      if (game.coresCollected >= 5 && !game.beacon && !game.beaconReached) {
        game.beacon = { x: 100 + Math.random() * (WIDTH - 200), y: 115, phase: 0 };
        notify(game, "DISTRESS SIGNAL FOUND — REACH THE GOLD RELAY");
      }

      if (game.flareTimer > game.challenge.flareInterval && !game.flare) {
        game.flareTimer = 0;
        game.flare = { x: WIDTH + 45, y: 0, life: 3.8 };
        notify(game, "SOLAR FLARE WARNING — MOVE CLEAR OF THE GOLD LINE");
      }
      if (game.flare) {
        game.flare.x -= 310 * dt;
        game.flare.life -= dt;
        if (Math.abs(ship.x - game.flare.x) < 43 && ship.y > 35 && ship.y < HEIGHT - 20) damage();
        if (game.flare.life <= 0 || game.flare.x < -60) game.flare = null;
      }

      if ((keys[" "] || keys.Space) && game.fireTimer <= 0) {
        game.shots.push({ x: ship.x, y: ship.y - 25, vy: -560 });
        game.fireTimer = game.profile.pulseCooldown;
      }

      game.shots.forEach((shot) => { shot.y += shot.vy * dt; });
      game.rocks.forEach((rock) => {
        rock.x += rock.vx * dt;
        rock.y += rock.vy * dt;
        rock.rotation += rock.spin * dt;
        if (rock.x < rock.radius || rock.x > WIDTH - rock.radius) rock.vx *= -1;
      });
      game.cores.forEach((core) => { core.y += core.vy * dt; });
      game.pickups.forEach((pickup) => { pickup.y += pickup.vy * dt; });
      game.particles.forEach((p) => {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.985;
        p.vy *= 0.985;
        p.life -= dt;
      });

      for (let i = game.rocks.length - 1; i >= 0; i -= 1) {
        const rock = game.rocks[i];
        const shotIndex = game.shots.findIndex((shot) => Math.hypot(shot.x - rock.x, shot.y - rock.y) < rock.radius + 7);
        if (shotIndex >= 0) {
          game.shots.splice(shotIndex, 1);
          game.rocks.splice(i, 1);
          game.score += rock.kind === "crystal" ? 100 : 50;
          game.combo += 1;
          game.comboTimer = 3.2;
          burst(game, rock.x, rock.y, rock.kind === "crystal" ? "#7bf5e8" : "#ffb66e", 15);
          continue;
        }
        if (Math.hypot(ship.x - rock.x, ship.y - rock.y) < rock.radius + 17) {
          game.rocks.splice(i, 1);
          damage();
        }
      }

      for (let i = game.cores.length - 1; i >= 0; i -= 1) {
        const core = game.cores[i];
        if (Math.hypot(ship.x - core.x, ship.y - core.y) < game.profile.scanRadius) {
          game.cores.splice(i, 1);
          game.coresCollected += 1;
          game.score += Math.round((125 + Math.min(150, game.combo * 10)) * game.profile.scienceMultiplier * game.profile.communicationsBonus);
          game.combo += 1;
          game.comboTimer = 3.2;
          burst(game, core.x, core.y, "#5dffe1", 18);
          notify(game, "DATA CORE SECURED — SCIENCE DATA +");
          if (Math.random() < 0.18) {
            const candidates = DISCOVERIES.filter((item) => !game.discoveries.includes(item.id));
            if (candidates.length) {
              const found = candidates[Math.floor(Math.random() * candidates.length)];
              game.discoveries.push(found.id);
              setJournal((current) => current.some((item) => item.id === found.id) ? current : [...current, found]);
              notify(game, "SECRET DISCOVERY: " + found.title.toUpperCase());
            }
          }
        }
      }

      for (let i = game.pickups.length - 1; i >= 0; i -= 1) {
        const pickup = game.pickups[i];
        if (Math.hypot(ship.x - pickup.x, ship.y - pickup.y) < 30) {
          game.pickups.splice(i, 1);
          if (pickup.type === "shield") {
            game.shield = game.profile.shieldDuration;
            notify(game, "PHASE SHIELD ACTIVE — " + game.profile.shieldDuration.toFixed(0) + " SECONDS");
            burst(game, ship.x, ship.y, "#74ddff", 20);
          } else {
            game.lives = Math.min(3, game.lives + 1);
            notify(game, "HULL REPAIRED");
            burst(game, ship.x, ship.y, "#8cffb5", 20);
          }
        }
      }

      if (game.beacon && Math.hypot(ship.x - game.beacon.x, ship.y - game.beacon.y) < 38) {
        game.beaconReached = true;
        game.beacon = null;
        game.score += 500;
        notify(game, "RELAY RESTORED — BONUS DATA DOWNLINKED");
        burst(game, ship.x, ship.y, "#ffe18a", 34, 230);
      }

      game.shots = game.shots.filter((shot) => shot.y > -25);
      game.rocks = game.rocks.filter((rock) => rock.y < HEIGHT + rock.radius + 20);
      game.cores = game.cores.filter((core) => core.y < HEIGHT + 25);
      game.pickups = game.pickups.filter((pickup) => pickup.y < HEIGHT + 25);
      game.particles = game.particles.filter((p) => p.life > 0);

      if (game.comboTimer <= 0) game.combo = 0;
      if (game.coresCollected >= game.coreGoal && game.beaconReached) {
        game.score += 250 + game.challenge.bonus;
        burst(game, ship.x, ship.y, "#8df7ff", 42, 250);
        syncHud(game);
        setAchievements((current) => [...new Set([...current, "first-rescue", ...(game.score >= 2000 ? ["high-orbit-score"] : []), ...(game.discoveries.length > 0 ? ["curious-pilot"] : [])])]);
        setStatus("won");
        running = false;
      }

      drawScene(ctx, game, now, boosting);
      hudTimer += dt;
      if (hudTimer > 0.12) {
        hudTimer = 0;
        syncHud(game);
      }
      if (running) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => {
      running = false;
      cancelAnimationFrame(frame);
    };
  }, [status]);

  useEffect(() => {
    const down = (event) => {
      const controlled = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " ", "Space", "w", "a", "s", "d", "W", "A", "S", "D", "Shift"];
      if (controlled.includes(event.key)) event.preventDefault();
      keysRef.current[event.key] = true;
      if (event.key === "Escape" && status === "playing") setStatus("paused");
      else if (event.key === "Escape" && status === "paused") setStatus("playing");
    };
    const up = (event) => { keysRef.current[event.key] = false; };
    const clear = () => { keysRef.current = {}; };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
    };
  }, [status]);

  function hold(key, pressed) {
    keysRef.current[key] = pressed;
  }

  const overlayTitle = status === "ready"
    ? "THE ORBIT IS NOT EMPTY."
    : status === "paused"
      ? "FLIGHT PAUSED"
      : status === "won"
        ? "RELAY RESTORED."
        : "SIGNAL LOST.";
  const overlayText = status === "ready"
    ? "Pilot through a living asteroid field, recover 8 data cores, and reach the golden distress relay. Watch for solar flares."
    : status === "paused"
      ? "Your spacecraft and mission progress are on hold."
      : status === "won"
        ? "You recovered the research data and restored the abandoned relay. Sector cleared."
        : "Hull integrity reached zero. Review your route, use boost to evade hazards, and try again.";

  return (
    <main className="space-adventure">
      <div className="sa-topbar">
        <button className="sa-back" onClick={onBack}>← BACK TO LUNAFORGE</button>
        <span className="sa-live"><i /> LIVE FLIGHT / NILE DELTA ORBIT</span>
      </div>
      <header className="sa-heading">
        <div>
          <p className="sa-kicker">LUNAFORGE ORIGINAL ARCADE</p>
          <h1>ORBIT <span>RUNNER</span></h1>
          <p>Explore the unknown. Bring the signal home.</p>
          <div className="sa-profile-line"><span>{profile.className}</span><span>{profile.hasDesign ? "ENGINEERING LOADOUT LINKED" : "DEFAULT TEST CRAFT"}</span></div>
        </div>
        <div className="sa-best"><small>PERSONAL BEST</small><strong>{bestScore.toLocaleString()}</strong></div>
      </header>

      <section className="sa-game-shell">
        <div className="sa-hud">
          <div><small>SCORE</small><strong>{hud.score.toLocaleString()}</strong></div>
          <div><small>DATA CORES</small><strong>{hud.cores} <em>/ {hud.coreGoal || dailyChallenge.coreGoal}</em></strong></div>
          <div><small>HULL</small><strong className="sa-lives">{"◆ ".repeat(hud.lives)}<span>{"◇ ".repeat(3 - hud.lives)}</span></strong></div>
          <div><small>COMBO</small><strong className="sa-combo">x{Math.max(1, hud.combo)}</strong></div>
          <div className="sa-boost-stat"><small>BOOST</small><div className="sa-boost-track"><i style={{ width: hud.boost + "%" }} /></div></div>
          <div><small>RELAY</small><strong className={hud.beacon ? "sa-relay-done" : ""}>{hud.beacon ? "ONLINE" : "SEARCH"}</strong></div>
        </div>

        <div className="sa-canvas-wrap">
          <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} aria-label="Orbit Runner space flight game" />
          {status === "playing" && gameRef.current.noticeTimer > 0 && (
            <div className="sa-live-notice">{gameRef.current.notice}</div>
          )}
          {status !== "playing" && (
            <div className="sa-overlay">
              <span>{status === "won" ? "MISSION COMPLETE" : status === "lost" ? "MISSION FAILED" : status === "paused" ? "PAUSED" : "FLIGHT BRIEFING"}</span>
              <h2>{overlayTitle}</h2>
              <p>{overlayText}</p>
              {(status === "won" || status === "lost") && (
                <div className="sa-debrief">
                  <div><small>FINAL SCORE</small><strong>{gameRef.current.score.toLocaleString()}</strong></div>
                  <div><small>DATA CORES</small><strong>{gameRef.current.coresCollected}/{gameRef.current.coreGoal}</strong></div>
                  <div><small>FLIGHT TIME</small><strong>{Math.floor(gameRef.current.elapsed)}s</strong></div>
                  <div><small>DISCOVERIES</small><strong>{gameRef.current.discoveries.length}</strong></div>
                  <p>{status === "won" ? "RESCUE CONFIRMED · DAILY BONUS INCLUDED" : "FLIGHT LOG SAVED · REVIEW YOUR ENGINEERING LOADOUT"}</p>
                </div>
              )}
              {status === "ready" && <div className="sa-objectives"><span>01 / RECOVER 8 DATA CORES</span><span>02 / RESTORE THE GOLD RELAY</span><span>03 / SURVIVE THE SOLAR FLARE</span></div>}
              <button onClick={status === "ready" || status === "won" || status === "lost" ? startGame : () => setStatus("playing")}>
                {status === "ready" ? "▶ LAUNCH MISSION" : status === "paused" ? "▶ RESUME FLIGHT" : "↻ FLY AGAIN"}
              </button>
            </div>
          )}
        </div>

        <div className="sa-game-footer">
          <span>WASD / ARROWS MOVE · SPACE PULSE · SHIFT BOOST · ESC PAUSE</span>
          <button onClick={() => setStatus(status === "playing" ? "paused" : status === "paused" ? "playing" : status)} disabled={status !== "playing" && status !== "paused"}>
            {status === "playing" ? "Ⅱ PAUSE" : "▶ RESUME"}
          </button>
        </div>
      </section>

      <section className="sa-meta-grid">
        <article className="sa-meta-card sa-challenge-card"><small>DAILY FLIGHT CHALLENGE · {dailyChallenge.dateKey}</small><strong>{dailyChallenge.title}</strong><p>{dailyChallenge.briefing}</p><span>COMPLETION BONUS · {dailyChallenge.bonus} PTS</span></article>
        <article className="sa-meta-card"><small>ENGINEERING FLIGHT PROFILE</small><strong>{profile.className}</strong><p>Mass {profile.massKg.toFixed(2)} kg · Battery {profile.batteryWh.toFixed(0)} Wh · Solar {profile.solarOutput.toFixed(1)} W</p><p>Agility ×{profile.agility.toFixed(2)} · Boost recharge {profile.boostRecharge.toFixed(1)}/s · Science ×{(profile.scienceMultiplier * profile.communicationsBonus).toFixed(2)}</p><button type="button" onClick={onEditDesign}>EDIT SPACECRAFT DESIGN ↗</button></article>
      </section>
      <section className="sa-journal-panel">
        <div><small>EXPLORATION JOURNAL</small><strong>{journal.length} / {DISCOVERIES.length} DISCOVERIES</strong><p>Hidden telemetry, samples and navigation fragments are saved between flights.</p></div>
        <div className="sa-journal-list">{journal.length ? journal.map((item) => <article key={item.id}><b>{item.title}</b><span>{item.detail}</span></article>) : <span className="sa-journal-empty">No discoveries yet. Search for data cores to uncover secrets.</span>}</div>
        <div className="sa-achievements"><small>UNLOCKED ACHIEVEMENTS</small>{achievements.length ? achievements.map((id) => <span key={id}>✦ {id === "first-rescue" ? "FIRST RESCUE" : id === "high-orbit-score" ? "HIGH ORBIT SCORE" : "CURIOUS PILOT"}</span>) : <span>Complete a rescue or uncover a secret to earn your first achievement.</span>}</div>
      </section>
      <div className="sa-instructions">
        <div><strong>MISSION CONTROL</strong><p>Recover eight data cores, locate the gold relay after core five, and restore its signal. Boost through tight gaps, destroy crystal rocks for bonus points, and collect repair or shield modules.</p></div>
        <div className="sa-key-guide">
          <span>WASD / ARROWS <small>STEER</small></span>
          <span>SPACE <small>PULSE</small></span>
          <span>SHIFT <small>BOOST</small></span>
          <span>ESC <small>PAUSE</small></span>
        </div>
      </div>

      <div className="sa-mobile-controls">
        <div className="sa-dpad">
          <button onPointerDown={() => hold("ArrowUp", true)} onPointerUp={() => hold("ArrowUp", false)} onPointerCancel={() => hold("ArrowUp", false)} onPointerLeave={() => hold("ArrowUp", false)}>↑</button>
          <button onPointerDown={() => hold("ArrowLeft", true)} onPointerUp={() => hold("ArrowLeft", false)} onPointerCancel={() => hold("ArrowLeft", false)} onPointerLeave={() => hold("ArrowLeft", false)}>←</button>
          <button onPointerDown={() => hold("ArrowDown", true)} onPointerUp={() => hold("ArrowDown", false)} onPointerCancel={() => hold("ArrowDown", false)} onPointerLeave={() => hold("ArrowDown", false)}>↓</button>
          <button onPointerDown={() => hold("ArrowRight", true)} onPointerUp={() => hold("ArrowRight", false)} onPointerCancel={() => hold("ArrowRight", false)} onPointerLeave={() => hold("ArrowRight", false)}>→</button>
        </div>
        <div className="sa-mobile-actions">
          <button className="sa-fire" onPointerDown={() => hold(" ", true)} onPointerUp={() => hold(" ", false)} onPointerCancel={() => hold(" ", false)} onPointerLeave={() => hold(" ", false)}>PULSE</button>
          <button className="sa-boost" onPointerDown={() => hold("Shift", true)} onPointerUp={() => hold("Shift", false)} onPointerCancel={() => hold("Shift", false)} onPointerLeave={() => hold("Shift", false)}>BOOST</button>
        </div>
      </div>
      <p className="sa-disclaimer">Engineering-to-gameplay values are simplified educational game mechanics, not real spacecraft performance predictions.</p>
    </main>
  );
}
