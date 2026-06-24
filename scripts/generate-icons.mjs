// Genera iconos PNG para la PWA usando canvas nativo del navegador via sharp
// Ejecutar: node scripts/generate-icons.mjs
import { createCanvas } from "canvas";
import { writeFileSync } from "fs";

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

for (const size of sizes) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  // Fondo verde salvia
  ctx.fillStyle = "#4E8B6B";
  ctx.beginPath();
  const r = size * 0.22;
  ctx.roundRect(0, 0, size, size, r);
  ctx.fill();

  // Letra Z centrada
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `bold ${Math.round(size * 0.52)}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Z", size / 2, size / 2 + size * 0.02);

  const buffer = canvas.toBuffer("image/png");
  writeFileSync(`public/icons/icon-${size}.png`, buffer);
  console.log(`✓ icon-${size}.png`);
}
console.log("Iconos generados correctamente.");
