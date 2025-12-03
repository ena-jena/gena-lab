import React, { useRef, useEffect, useState } from "react";

interface Snowflake {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  radius: number;
  settled: boolean;
  rotation: number;
  rotationSpeed: number;
}

interface Building {
  x: number;
  y: number;
  width: number;
  height: number;
  depth: number;
  roofSnow: number[][];
}

function project3D(
  x: number,
  y: number,
  z: number,
  width: number,
  height: number,
  cameraZ: number = 600
) {
  const perspective = cameraZ / (cameraZ - z);
  return {
    x: width / 2 + (x - width / 2) * perspective,
    y: height - (height - y) * perspective,
  };
}

const App: React.FC = () => {
  const [flakeSize, setFlakeSize] = useState(4);
  const [density, setDensity] = useState(120);
  const [fallSpeed, setFallSpeed] = useState(1.2);
  const [wind, setWind] = useState(0);
  const [accumulation, setAccumulation] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 520 });

  const groundY = 420;
  const cameraZ = 600;

  const buildingsRef = useRef<Building[]>([
    {
      x: 180,
      y: 0,
      width: 90,
      height: 120,
      depth: 60,
      roofSnow: [],
    },
    {
      x: 370,
      y: 0,
      width: 70,
      height: 80,
      depth: 50,
      roofSnow: [],
    },
    {
      x: 600,
      y: 0,
      width: 120,
      height: 160,
      depth: 80,
      roofSnow: [],
    },
  ]);

  const snowflakesRef = useRef<Snowflake[]>([]);
  const [_, setFrame] = useState(0);
  const accumulationMapRef = useRef<number[]>([]);

  const [trafficLight, setTrafficLight] = useState<'red' | 'green' | 'yellow'>('red');
  useEffect(() => {
    let state: 'red' | 'green' | 'yellow' = 'red';
    let tick = 0;
    let running = true;
    function cycle() {
      if (!running) return;
      tick++;
      if (state === 'red' && tick % 120 === 0) state = 'green';
      else if (state === 'green' && tick % 120 === 0) state = 'yellow';
      else if (state === 'yellow' && tick % 60 === 0) state = 'red';
      setTrafficLight(state);
      setTimeout(cycle, 33);
    }
    cycle();
    return () => { running = false; };
  }, []);

  useEffect(() => {
    function handleResize() {
      const maxWidth = Math.min(window.innerWidth - 32, 900);
      const w = Math.max(maxWidth, 320);
      const h = Math.max(Math.min(window.innerHeight * 0.7, 520), 340);
      setDimensions({ width: w, height: h });
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!accumulationMapRef.current.length || accumulationMapRef.current.length !== dimensions.width) {
      accumulationMapRef.current = Array(dimensions.width).fill(0);
    }
    for (const b of buildingsRef.current) {
      if (!b.roofSnow.length || b.roofSnow.length !== b.width) {
        b.roofSnow = Array(b.width)
          .fill(0)
          .map(() => Array(b.depth).fill(0));
      }
    }
  }, [dimensions.width]);

  useEffect(() => {
    const snowflakes = snowflakesRef.current;
    if (density > snowflakes.length) {
      for (let i = snowflakes.length; i < density; i++) {
        snowflakes.push({
          x: Math.random() * dimensions.width,
          y: Math.random() * -dimensions.height,
          z: Math.random() * 400,
          vx: 0,
          vy: 0,
          vz: 0,
          radius: flakeSize + Math.random() * flakeSize * 0.7,
          settled: false,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.02,
        });
      }
    } else if (density < snowflakes.length) {
      snowflakes.length = density;
    }
  }, [density, dimensions.width, dimensions.height]);

  useEffect(() => {
    let running = true;
    function animate() {
      if (!running) return;
      updateSnowflakes();
      drawScene();
      setFrame((f) => f + 1);
      requestAnimationFrame(animate);
    }
    animate();
    return () => {
      running = false;
    };
  }, [flakeSize, density, fallSpeed, wind, accumulation, dimensions.width, dimensions.height, darkMode]);

  function pointInPolygon(x: number, y: number, poly: {x: number, y: number}[]) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i].x, yi = poly[i].y;
      const xj = poly[j].x, yj = poly[j].y;
      const intersect = ((yi > y) !== (yj > y)) &&
        (x < (xj - xi) * (y - yi) / (yj - yi + 0.00001) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  function updateSnowflakes() {
    const snowflakes = snowflakesRef.current;
    const accMap = accumulationMapRef.current;
    for (const b of buildingsRef.current) {
      if (!b.roofSnow.length) {
        b.roofSnow = Array(b.width)
          .fill(0)
          .map(() => Array(b.depth).fill(0));
      }
    }
    for (const flake of snowflakes) {
      if (flake.settled) continue;
      flake.vx = wind * 0.7 + (Math.random() - 0.5) * 0.2;
      flake.vz = (Math.random() - 0.5) * 0.1;
      flake.vy = fallSpeed * (0.7 + Math.random() * 0.5);
      flake.x += flake.vx;
      flake.y += flake.vy;
      flake.z += flake.vz;
      flake.rotation += flake.rotationSpeed;
      if (flake.x < 0) flake.x += dimensions.width;
      if (flake.x > dimensions.width) flake.x -= dimensions.width;
      if (flake.z < 0) flake.z = 0;
      if (flake.z > 400) flake.z = 400;
      let hitBuilding = false;
      const flake2D = project3D(flake.x, flake.y, flake.z, dimensions.width, dimensions.height);
      buildingsRef.current.forEach((b) => {
        const bx = b.x, bw = b.width, bh = b.height, bd = b.depth;
        const by = groundY - bh;
        const depthOffset = bd * 0.6;
        const p = [
          project3D(bx, groundY, 0, dimensions.width, dimensions.height),
          project3D(bx + bw, groundY, 0, dimensions.width, dimensions.height),
          project3D(bx + bw, by, 0, dimensions.width, dimensions.height),
          project3D(bx, by, 0, dimensions.width, dimensions.height), 
          project3D(bx + depthOffset, groundY - depthOffset, 0, dimensions.width, dimensions.height), 
          project3D(bx + bw + depthOffset, groundY - depthOffset, 0, dimensions.width, dimensions.height),
          project3D(bx + bw + depthOffset, by - depthOffset, 0, dimensions.width, dimensions.height),
          project3D(bx + depthOffset, by - depthOffset, 0, dimensions.width, dimensions.height),
        ];
        
        const poly = [p[0], p[1], p[5], p[6], p[7], p[3], p[0]];
        if (pointInPolygon(flake2D.x, flake2D.y, poly)) {
          hitBuilding = true;
        }
      });
      if (hitBuilding) {
        if (accumulation) {
          buildingsRef.current.forEach((b) => {
            const bx = b.x, bw = b.width, bh = b.height, bd = b.depth;
            const by = groundY - bh;
            const depthOffset = bd * 0.6;
            const p = [
              project3D(bx, groundY, 0, dimensions.width, dimensions.height),
              project3D(bx + bw, groundY, 0, dimensions.width, dimensions.height),
              project3D(bx + bw, by, 0, dimensions.width, dimensions.height),
              project3D(bx, by, 0, dimensions.width, dimensions.height),
              project3D(bx + depthOffset, groundY - depthOffset, 0, dimensions.width, dimensions.height),
              project3D(bx + bw + depthOffset, groundY - depthOffset, 0, dimensions.width, dimensions.height),
              project3D(bx + bw + depthOffset, by - depthOffset, 0, dimensions.width, dimensions.height),
              project3D(bx + depthOffset, by - depthOffset, 0, dimensions.width, dimensions.height),
            ];
            const topPoly = [p[3], p[2], p[6], p[7], p[3]];
            if (pointInPolygon(flake2D.x, flake2D.y, topPoly)) {
              const rx = Math.floor(((flake.x - bx) / bw) * b.width);
              const rz = Math.floor((flake.z / bd) * b.depth);
              if (
                rx >= 0 && rx < b.width &&
                rz >= 0 && rz < b.depth &&
                b.roofSnow[rx][rz] < 12
              ) {
                b.roofSnow[rx][rz] += Math.max(6, flake.radius * 2.2);

                flake.x = Math.random() * dimensions.width;
                flake.y = Math.random() * -dimensions.height * 0.2;
                flake.z = Math.random() * 400;
                flake.radius = flakeSize + Math.random() * flakeSize * 0.7;
                flake.rotation = Math.random() * Math.PI * 2;
                flake.rotationSpeed = (Math.random() - 0.5) * 0.02;
              }
            }
          });
        }
        flake.x = Math.random() * dimensions.width;
        flake.y = Math.random() * -dimensions.height * 0.2;
        flake.z = Math.random() * 400;
        flake.radius = flakeSize + Math.random() * flakeSize * 0.7;
        flake.settled = false;
        flake.rotation = Math.random() * Math.PI * 2;
        flake.rotationSpeed = (Math.random() - 0.5) * 0.02;
        continue;
      }
      if (flake.y >= groundY - accMap[Math.floor(flake.x)]) {
        if (accumulation) {
          if (accMap[Math.floor(flake.x)] < 16) {
            accMap[Math.floor(flake.x)] += flake.radius * 0.8;
            flake.settled = true;
          }
        } else {
          flake.x = Math.random() * dimensions.width;
          flake.y = Math.random() * -dimensions.height * 0.2;
          flake.z = Math.random() * 400;
          flake.radius = flakeSize + Math.random() * flakeSize * 0.7;
          flake.settled = false;
          flake.rotation = Math.random() * Math.PI * 2;
          flake.rotationSpeed = (Math.random() - 0.5) * 0.02;
          continue;
        }
      }
    }
    for (const flake of snowflakes) {
      if (flake.settled) {
        flake.x = Math.random() * dimensions.width;
        flake.y = Math.random() * -dimensions.height * 0.2;
        flake.z = Math.random() * 400;
        flake.radius = flakeSize + Math.random() * flakeSize * 0.7;
        flake.settled = false;
      }
    }
  }

  function drawScene() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);
    const groundDepth = 120;
    const groundColor = darkMode ? '#222b36' : '#a3a3a3';
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(dimensions.width, groundY);
    ctx.lineTo(dimensions.width, groundY - groundDepth);
    ctx.lineTo(0, groundY - groundDepth);
    ctx.lineTo(0, dimensions.height);
    ctx.lineTo(dimensions.width, dimensions.height);
    ctx.lineTo(dimensions.width, groundY);
    ctx.closePath();
    ctx.fillStyle = groundColor;
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(dimensions.width, groundY);
    ctx.lineTo(dimensions.width, groundY + 18);
    ctx.lineTo(0, groundY + 18);
    ctx.closePath();
    ctx.globalAlpha = 0;
    ctx.fillStyle = '#64748b';
    ctx.filter = 'blur(2px)';
    ctx.fill();
    ctx.filter = 'none';
    ctx.globalAlpha = 1;
    ctx.restore();
    buildingsRef.current.forEach((b, i) => {
      const bx = b.x, bw = b.width, bh = b.height, bd = b.depth;
      const by = groundY - bh;
      const depthOffset = bd * 0.6;

      const corners = {
        frontBL: { x: bx, y: groundY },
        frontBR: { x: bx + bw, y: groundY },
        frontTR: { x: bx + bw, y: by },
        frontTL: { x: bx, y: by },
        backBL: { x: bx + depthOffset, y: groundY - depthOffset },
        backBR: { x: bx + bw + depthOffset, y: groundY - depthOffset },
        backTR: { x: bx + bw + depthOffset, y: by - depthOffset },
        backTL: { x: bx + depthOffset, y: by - depthOffset },
      };

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(corners.frontBR.x, corners.frontBR.y);
      ctx.lineTo(corners.backBR.x, corners.backBR.y);
      ctx.lineTo(corners.backTR.x, corners.backTR.y);
      ctx.lineTo(corners.frontTR.x, corners.frontTR.y);
      ctx.closePath();
      const buildingRight = darkMode ? '#23293a' : '#7b8fa6';
      ctx.fillStyle = buildingRight;
      ctx.fill();
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(corners.frontTL.x, corners.frontTL.y);
      ctx.lineTo(corners.frontTR.x, corners.frontTR.y);
      ctx.lineTo(corners.backTR.x, corners.backTR.y);
      ctx.lineTo(corners.backTL.x, corners.backTL.y);
      ctx.closePath();
      const buildingTop = darkMode ? '#4b5670' : '#b0b9c5';
      ctx.fillStyle = buildingTop;
      ctx.fill();
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(corners.frontBL.x, corners.frontBL.y);
      ctx.lineTo(corners.frontBR.x, corners.frontBR.y);
      ctx.lineTo(corners.frontTR.x, corners.frontTR.y);
      ctx.lineTo(corners.frontTL.x, corners.frontTL.y);
      ctx.closePath();
      const buildingFront = darkMode ? '#3a4256' : '#a6b8ce';
      ctx.fillStyle = buildingFront;
      ctx.fill();
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
      ctx.save();
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(corners.frontBL.x, corners.frontBL.y);
      ctx.lineTo(corners.frontBR.x, corners.frontBR.y);
      ctx.lineTo(corners.frontTR.x, corners.frontTR.y);
      ctx.lineTo(corners.frontTL.x, corners.frontTL.y);
      ctx.closePath();
      ctx.moveTo(corners.frontTL.x, corners.frontTL.y);
      ctx.lineTo(corners.backTL.x, corners.backTL.y);
      ctx.lineTo(corners.backTR.x, corners.backTR.y);
      ctx.lineTo(corners.frontTR.x, corners.frontTR.y);
      ctx.moveTo(corners.frontTR.x, corners.frontTR.y);
      ctx.lineTo(corners.backTR.x, corners.backTR.y);
      ctx.lineTo(corners.backBR.x, corners.backBR.y);
      ctx.stroke();
      ctx.restore();

      if (accumulation) {
        ctx.save();
        ctx.fillStyle = "#fff";
        for (let rx = 0; rx < b.width; rx += 2) {
          for (let rz = 0; rz < b.depth; rz += 2) {
            const snow = b.roofSnow[rx][rz];
            if (snow > 0) {
              const px = bx + rx + depthOffset * (rz / b.depth);
              const py = by - rz * (depthOffset / b.depth) - snow * 0.7;
              ctx.globalAlpha = 0.7;
              ctx.beginPath();
              ctx.arc(px, py, 1.2 + snow * 0.2, 0, 2 * Math.PI);
              ctx.fill();
            }
          }
        }
        ctx.globalAlpha = 1;
        ctx.restore();
      }

      const windowCols = Math.max(2, Math.floor(bw / 18));
      const windowRows = Math.max(2, Math.floor(bh / 28));
      for (let row = 0; row < windowRows; row++) {
        for (let col = 0; col < windowCols; col++) {
          const marginX = bw * 0.08;
          const marginY = bh * 0.08;
          const wx = bx + marginX + col * ((bw - 2 * marginX) / windowCols);
          const wy = by + marginY + row * ((bh - 2 * marginY) / windowRows);
          const wWidth = (bw - 2 * marginX) / windowCols * 0.7;
          const wHeight = (bh - 2 * marginY) / windowRows * 0.6;
          ctx.save();
          ctx.beginPath();
          ctx.rect(wx, wy, wWidth, wHeight);
          const seed = windowSeed(i, row, col);
          if (darkMode) {
            if (seed > 0.18) {
              const warmColors = ['#ffe066', '#ffd6a5', '#ffb347', '#fffbe6'];
              ctx.fillStyle = warmColors[Math.floor(seed * warmColors.length)];
              ctx.globalAlpha = 0.85 + (seed * 0.15);
              ctx.shadowColor = ctx.fillStyle;
              ctx.shadowBlur = 8 + seed * 6;
            } else {
              ctx.fillStyle = '#232323';
              ctx.globalAlpha = 0.5;
            }
          } else {
            ctx.fillStyle = '#d1d5db';
            ctx.globalAlpha = 0.8;
          }
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1;
          ctx.restore();
        }
      }
    });
    for (const flake of snowflakesRef.current) {
      const { x, y, z, radius, rotation } = flake;
      const proj = project3D(x, y, z, dimensions.width, dimensions.height, cameraZ);
      ctx.save();
      ctx.globalAlpha = 0.7 + 0.3 * (1 - z / 400);
      ctx.translate(proj.x, proj.y);
      ctx.rotate(rotation);
      drawSnowflakeShape(ctx, radius * (1 - z / 900));
      ctx.restore();
    }
    for (const flake of snowflakesRef.current) {
      if (flake.z > 350) {
        const proj = project3D(flake.x, flake.y, flake.z, dimensions.width, dimensions.height, cameraZ);
        ctx.save();
        ctx.globalAlpha = 0.18;
        ctx.translate(proj.x, proj.y);
        ctx.rotate(flake.rotation);
        drawSnowflakeShape(ctx, flake.radius * 1.2);
        ctx.restore();
      }
    }
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.fillStyle = groundColor;
    ctx.fillRect(0, groundY, dimensions.width, 2);
    ctx.restore();
    if (accumulation) {
      ctx.save();
      ctx.fillStyle = '#fff';
      ctx.globalAlpha = 0.92;
      const step = 4;
      const points: {x: number, y: number}[] = [];
      for (let x = 0; x <= dimensions.width; x += step) {
        const h = accumulationMapRef.current[Math.floor(x)] || 0;
        const height = Math.floor(h);
        points.push({ x, y: groundY - height });
      }
      ctx.beginPath();
      if (points.length > 0) {
        ctx.moveTo(points[0].x, groundY + 1);
        for (let i = 0; i < points.length - 1; i++) {
          const p0 = points[i];
          const p1 = points[i + 1];
          const cx = (p0.x + p1.x) / 2;
          const cy = (p0.y + p1.y) / 2;
          ctx.quadraticCurveTo(p0.x, p0.y, cx, cy);
        }
        ctx.lineTo(points[points.length - 1].x, groundY + 1);
        ctx.lineTo(points[0].x, groundY + 1);
        ctx.closePath();
        ctx.fill();
        for (let i = 0; i < points.length; i++) {
          const { x, y } = points[i];
          ctx.globalAlpha = 0.18;
          ctx.beginPath();
          ctx.arc(x, y, 3.5, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      ctx.restore();
    }
    const roadHeight = 38;
    const roadY = groundY + 2;
    ctx.save();
    ctx.fillStyle = darkMode ? '#23272e' : '#44474e';
    ctx.fillRect(0, roadY, dimensions.width, roadHeight);
    ctx.strokeStyle = darkMode ? '#bfc9d1' : '#e5e7eb';
    ctx.lineWidth = 3;
    ctx.setLineDash([18, 16]);
    ctx.beginPath();
    ctx.moveTo(0, roadY + roadHeight / 2);
    ctx.lineTo(dimensions.width, roadY + roadHeight / 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    const poleX = Math.floor(dimensions.width - 60);
    const poleY = roadY - 60;
    const poleH = roadHeight + 120;
    const poleW = 8;
    const lightBoxW = 32;
    const lightBoxH = 90;
    const lightBoxX = poleX - 12;
    const lightBoxY = poleY - lightBoxH + 18;
    ctx.save();
    ctx.lineWidth = 2;
    ctx.strokeStyle = darkMode ? '#bfc9d1' : '#222';
    ctx.fillStyle = darkMode ? '#3b4252' : '#888';
    ctx.beginPath();
    ctx.roundRect(poleX, poleY, poleW, poleH, 4);
    ctx.fill();
    ctx.stroke();
    if (darkMode) {
      for (let i = 0; i < 7; i++) {
        ctx.save();
        const py = poleY + 18 + i * (poleH - 36) / 6;
        ctx.beginPath();
        ctx.arc(poleX + poleW / 2, py, 3, 0, 2 * Math.PI);
        const colors = ['#ffd600', '#43a047', '#e53935', '#00bcd4', '#f7b2ad', '#fffbe6', '#ffd6a5'];
        ctx.fillStyle = colors[(i + Math.floor(Date.now() / 300)) % colors.length];
        ctx.globalAlpha = 0.3 + 0.3 * Math.abs(Math.sin((Date.now() / 400) + i));
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
        ctx.restore();
      }
    }
    ctx.save();
    ctx.fillStyle = darkMode ? '#222' : '#e5e7eb';
    ctx.strokeStyle = darkMode ? '#bfc9d1' : '#222';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(lightBoxX, lightBoxY, lightBoxW, lightBoxH, 8);
    ctx.fill();
    ctx.stroke();
    const lightR = 12;
    const lightSpacing = 28;
    const lights = [
      { color: '#e53935', y: lightBoxY + lightR + 6, on: trafficLight === 'red' },
      { color: '#ffd600', y: lightBoxY + lightR + 6 + lightSpacing, on: trafficLight === 'yellow' },
      { color: '#43a047', y: lightBoxY + lightR + 6 + 2 * lightSpacing, on: trafficLight === 'green' },
    ];
    lights.forEach((l) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(lightBoxX + lightBoxW / 2, l.y, lightR, 0, 2 * Math.PI);
      ctx.fillStyle = l.color;
      ctx.globalAlpha = l.on ? 1 : 0.18;
      ctx.shadowColor = l.color;
      ctx.shadowBlur = l.on ? 16 : 0;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
      ctx.restore();
    });
    ctx.restore();
  }

  function drawSnowflakeShape(ctx: CanvasRenderingContext2D, size: number) {
    ctx.save();
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * size, Math.sin(angle) * size);
      const branchAngle1 = angle - Math.PI / 12;
      const branchAngle2 = angle + Math.PI / 12;
      ctx.moveTo(Math.cos(angle) * size * 0.6, Math.sin(angle) * size * 0.6);
      ctx.lineTo(Math.cos(branchAngle1) * size * 0.8, Math.sin(branchAngle1) * size * 0.8);
      ctx.moveTo(Math.cos(angle) * size * 0.6, Math.sin(angle) * size * 0.6);
      ctx.lineTo(Math.cos(branchAngle2) * size * 0.8, Math.sin(branchAngle2) * size * 0.8);
    }
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = Math.max(1, size * 0.18);
    ctx.shadowColor = '#e0e7ef';
    ctx.shadowBlur = 6;
    ctx.stroke();
    ctx.restore();
  }

  function windowSeed(i: number, row: number, col: number) {
    return Math.abs(Math.sin(i * 31 + row * 17 + col * 13)) % 1;
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
        html, body, #root, .poppins-font {
          font-family: 'Poppins', sans-serif !important;
        }
      `}</style>
      <div
        className={`min-h-screen w-screen flex flex-col items-center justify-center overflow-x-hidden transition-colors duration-300 relative poppins-font ${
          darkMode
            ? 'bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800'
            : 'bg-gradient-to-br from-blue-50 via-indigo-100 to-white'
        }`}
        style={{
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        }}
      >
        <div 
          className="absolute inset-0 opacity-30 dark:opacity-20"
          style={{
            backgroundImage: darkMode 
              ? `radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
                 radial-gradient(circle at 80% 20%, rgba(147, 51, 234, 0.1) 0%, transparent 50%),
                 radial-gradient(circle at 40% 40%, rgba(6, 182, 212, 0.08) 0%, transparent 50%)`
              : `radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
                 radial-gradient(circle at 80% 20%, rgba(147, 51, 234, 0.06) 0%, transparent 50%),
                 radial-gradient(circle at 40% 40%, rgba(6, 182, 212, 0.04) 0%, transparent 50%)`,
          }}
        />
        
        <div 
          className="absolute inset-0 opacity-20 dark:opacity-10"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
        
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute top-20 left-10 w-32 h-32 rounded-full blur-3xl opacity-20 ${
            darkMode ? 'bg-blue-500' : 'bg-blue-300'
          }`} />
          <div className={`absolute top-40 right-20 w-24 h-24 rounded-full blur-2xl opacity-15 ${
            darkMode ? 'bg-purple-500' : 'bg-indigo-300'
          }`} />
          <div className={`absolute bottom-32 left-1/4 w-40 h-40 rounded-full blur-3xl opacity-10 ${
            darkMode ? 'bg-cyan-500' : 'bg-cyan-200'
          }`} />
          <div className={`absolute bottom-20 right-1/3 w-28 h-28 rounded-full blur-2xl opacity-15 ${
            darkMode ? 'bg-blue-400' : 'bg-blue-200'
          }`} />
        </div>

        <div className="w-full px-4 py-10 flex flex-col items-center max-w-full relative z-10">
          <div className="mb-8 w-full max-w-6xl flex flex-col items-center justify-center gap-6 lg:gap-8">
            <div className="flex flex-col items-center justify-center text-center w-full max-w-2xl mx-auto">
              <h1 className={
                `text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight mb-2
                ${darkMode ? 'text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)]' : 'text-slate-800'}
                `
              }>Holiday Snowfall Simulator</h1>
              <p className={
                `text-base lg:text-lg font-medium leading-snug mb-2
                ${darkMode ? 'text-white/90 drop-shadow-[0_1px_8px_rgba(0,0,0,0.7)]' : 'text-slate-600'}
                `
              }>A festive, interactive 3D snow scene for your dashboard</p>
            </div>
            <section
              className={
                `w-full max-w-xl flex flex-wrap gap-4 lg:gap-6 items-center
                bg-gradient-to-br
                ${darkMode
                  ? 'from-slate-800/90 via-slate-900/80 to-blue-950/80'
                  : 'from-white/90 via-blue-50/80 to-slate-100/80'}
                rounded-2xl shadow-2xl
                border border-white/60 dark:border-slate-500/30
                backdrop-blur-xl
                px-4 lg:px-8 py-5
                transition-colors duration-300
                mt-2
                `
              }
              style={{
                boxShadow: darkMode
                  ? '0 6px 32px 0 rgba(30,41,59,0.18), 0 1.5px 8px 0 rgba(30,41,59,0.10)'
                  : '0 8px 32px 0 rgba(31, 38, 135, 0.10), 0 1.5px 8px 0 rgba(31,38,135,0.06)',
                borderRadius: '1.25rem',
                minWidth: 0,
                maxWidth: '100%',
              }}
              aria-label="Snowfall Controls"
            >
              <div className="flex flex-col items-start min-w-[120px] flex-1 lg:flex-none">
                <label className={`text-xs font-semibold tracking-wide mb-2 uppercase 
                  ${darkMode ? 'text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.7)]' : 'text-slate-700'}
                `}>Snowflake Size</label>
                <input
                  type="range"
                  min={2}
                  max={10}
                  value={flakeSize}
                  onChange={(e) => setFlakeSize(Number(e.target.value))}
                  className="w-full lg:w-32 accent-blue-500 h-2 rounded-lg appearance-none bg-slate-200 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  style={{ boxShadow: '0 1px 4px 0 rgba(30,41,59,0.08)' }}
                />
              </div>
              <div className="flex flex-col items-start min-w-[120px] flex-1 lg:flex-none">
                <label className={`text-xs font-semibold tracking-wide mb-2 uppercase 
                  ${darkMode ? 'text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.7)]' : 'text-slate-700'}
                `}>Density</label>
                <input
                  type="range"
                  min={40}
                  max={300}
                  value={density}
                  onChange={(e) => setDensity(Number(e.target.value))}
                  className="w-full lg:w-32 accent-blue-500 h-2 rounded-lg appearance-none bg-slate-200 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  style={{ boxShadow: '0 1px 4px 0 rgba(30,41,59,0.08)' }}
                />
              </div>
              <div className="flex flex-col items-start min-w-[120px] flex-1 lg:flex-none">
                <label className={`text-xs font-semibold tracking-wide mb-2 uppercase 
                  ${darkMode ? 'text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.7)]' : 'text-slate-700'}
                `}>Fall Speed</label>
                <input
                  type="range"
                  min={0.5}
                  max={3}
                  step={0.05}
                  value={fallSpeed}
                  onChange={(e) => setFallSpeed(Number(e.target.value))}
                  className="w-full lg:w-32 accent-blue-500 h-2 rounded-lg appearance-none bg-slate-200 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  style={{ boxShadow: '0 1px 4px 0 rgba(30,41,59,0.08)' }}
                />
              </div>
              <div className="flex flex-col items-start min-w-[120px] flex-1 lg:flex-none">
                <label className={`text-xs font-semibold tracking-wide mb-2 uppercase 
                  ${darkMode ? 'text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.7)]' : 'text-slate-700'}
                `}>Wind</label>
                <input
                  type="range"
                  min={-2}
                  max={2}
                  step={0.05}
                  value={wind}
                  onChange={(e) => setWind(Number(e.target.value))}
                  className="w-full lg:w-32 accent-blue-500 h-2 rounded-lg appearance-none bg-slate-200 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  style={{ boxShadow: '0 1px 4px 0 rgba(30,41,59,0.08)' }}
                />
              </div>
              <div className="flex flex-col items-start min-w-[120px] flex-1 lg:flex-none">
                <label className={`text-xs font-semibold tracking-wide mb-2 uppercase 
                  ${darkMode ? 'text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.7)]' : 'text-slate-700'}
                `}>Accumulation</label>
                <button
                  className={`w-14 h-8 rounded-full border-2 flex items-center transition-colors duration-200
                    ${accumulation ? 'bg-blue-500/90 border-blue-500' : 'bg-slate-200 dark:bg-slate-700 border-slate-400 dark:border-slate-500'}
                    shadow-sm`}
                  onClick={() => setAccumulation((a) => !a)}
                  aria-pressed={accumulation}
                  tabIndex={0}
                >
                  <span
                    className={`block w-7 h-7 bg-white dark:bg-slate-800 rounded-full shadow-md transform transition-transform duration-200
                      ${accumulation ? 'translate-x-6' : 'translate-x-0'}
                      border border-slate-300 dark:border-slate-600
                    `}
                  />
                </button>
              </div>
              <div className="flex flex-col items-start min-w-[120px] flex-1 lg:flex-none">
                <label className={`text-xs font-semibold tracking-wide mb-2 uppercase 
                  ${darkMode ? 'text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.7)]' : 'text-slate-700'}
                `}>Dark Mode</label>
                <button
                  className={`w-14 h-8 rounded-full border-2 flex items-center transition-colors duration-200
                    ${darkMode ? 'bg-slate-900/90 border-blue-900' : 'bg-slate-200 border-slate-400'}
                    shadow-sm`}
                  onClick={() => setDarkMode((d) => !d)}
                  aria-pressed={darkMode}
                  tabIndex={0}
                >
                  <span
                    className={`block w-7 h-7 bg-white dark:bg-slate-800 rounded-full shadow-md transform transition-transform duration-200
                      ${darkMode ? 'translate-x-6' : 'translate-x-0'}
                      border border-slate-300 dark:border-slate-600
                    `}
                  />
                </button>
              </div>
            </section>
          </div>
          <div
            className="rounded-2xl shadow-2xl border border-white/60 dark:border-slate-400/30 bg-white/60 dark:bg-slate-900/70 backdrop-blur-xl flex justify-center items-center transition-all duration-300"
            style={{
              width: dimensions.width,
              height: dimensions.height,
              boxShadow:
                '0 20px 40px 0 rgba(31, 38, 135, 0.15), 0 8px 16px 0 rgba(31,38,135,0.08)',
              border: darkMode
                ? '1.5px solid rgba(100,116,139,0.25)'
                : '1.5px solid rgba(255,255,255,0.45)',
              borderRadius: '1.25rem',
              maxWidth: 'calc(100vw - 2rem)',
              maxHeight: '80vh',
              overflow: 'hidden',
            }}
          >
            <canvas
              ref={canvasRef}
              width={dimensions.width}
              height={dimensions.height}
              className={`block w-full h-full ${darkMode ? 'bg-gradient-to-b from-slate-800 to-blue-900' : 'bg-gradient-to-b from-blue-200 to-blue-400'}`}
              style={{ aspectRatio: `${dimensions.width} / ${dimensions.height}` }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default App;
