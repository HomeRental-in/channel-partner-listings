/**
 * Compact QR code generator — byte mode, error-correction level M, versions 1–10 (up to 213 bytes).
 * Ported from the public-domain QR algorithm (ISO/IEC 18004). No dependencies.
 * Returns a boolean matrix; render it as rects/SVG wherever you need it.
 */

export type QrMatrix = { size: number; modules: boolean[][] };

// Error-correction codewords per block and number of blocks, level M, indexed by version (index 0 unused).
const ECC_PER_BLOCK_M = [0, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26];
const NUM_BLOCKS_M = [0, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5];
const MAX_VERSION = 10;

function numRawDataModules(ver: number) {
  let result = (16 * ver + 128) * ver + 64;
  if (ver >= 2) {
    const numAlign = Math.floor(ver / 7) + 2;
    result -= (25 * numAlign - 10) * numAlign - 55;
    if (ver >= 7) result -= 36;
  }
  return result;
}
function numDataCodewords(ver: number) {
  return Math.floor(numRawDataModules(ver) / 8) - ECC_PER_BLOCK_M[ver] * NUM_BLOCKS_M[ver];
}
function byteCapacity(ver: number) {
  const countBits = ver <= 9 ? 8 : 16;
  return Math.floor((numDataCodewords(ver) * 8 - 4 - countBits) / 8);
}

// ── GF(256) Reed–Solomon ──
function rsMultiply(x: number, y: number) {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  return z;
}
function rsDivisor(degree: number) {
  const result = new Array<number>(degree).fill(0);
  result[degree - 1] = 1;
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < degree; j++) {
      result[j] = rsMultiply(result[j], root);
      if (j + 1 < degree) result[j] ^= result[j + 1];
    }
    root = rsMultiply(root, 0x02);
  }
  return result;
}
function rsRemainder(data: number[], divisor: number[]) {
  const result = new Array<number>(divisor.length).fill(0);
  for (const b of data) {
    const factor = b ^ result.shift()!;
    result.push(0);
    divisor.forEach((coef, i) => (result[i] ^= rsMultiply(coef, factor)));
  }
  return result;
}

function alignmentPositions(ver: number, size: number) {
  if (ver === 1) return [] as number[];
  const numAlign = Math.floor(ver / 7) + 2;
  const step = ver === 32 ? 26 : Math.ceil((ver * 4 + 4) / (numAlign * 2 - 2)) * 2;
  const result = [6];
  for (let i = 0, pos = size - 7; i < numAlign - 1; i++, pos -= step) result.splice(1, 0, pos);
  return result;
}

class Qr {
  size: number;
  modules: boolean[][];
  isFunction: boolean[][];
  constructor(public ver: number, data: number[], mask: number) {
    this.size = ver * 4 + 17;
    this.modules = Array.from({ length: this.size }, () => new Array<boolean>(this.size).fill(false));
    this.isFunction = Array.from({ length: this.size }, () => new Array<boolean>(this.size).fill(false));
    this.drawFunctionPatterns();
    const all = this.addEccAndInterleave(data);
    this.drawCodewords(all);
    if (mask < 0) {
      let min = Infinity;
      for (let i = 0; i < 8; i++) {
        this.applyMask(i);
        this.drawFormatBits(i);
        const p = this.penalty();
        if (p < min) {
          mask = i;
          min = p;
        }
        this.applyMask(i);
      }
    }
    this.applyMask(mask);
    this.drawFormatBits(mask);
  }
  private setFn(x: number, y: number, dark: boolean) {
    this.modules[y][x] = dark;
    this.isFunction[y][x] = true;
  }
  private drawFunctionPatterns() {
    for (let i = 0; i < this.size; i++) {
      this.setFn(6, i, i % 2 === 0);
      this.setFn(i, 6, i % 2 === 0);
    }
    this.drawFinder(3, 3);
    this.drawFinder(this.size - 4, 3);
    this.drawFinder(3, this.size - 4);
    const align = alignmentPositions(this.ver, this.size);
    const n = align.length;
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) {
        if ((i === 0 && j === 0) || (i === 0 && j === n - 1) || (i === n - 1 && j === 0)) continue;
        this.drawAlignment(align[i], align[j]);
      }
    this.drawFormatBits(0);
    this.drawVersion();
  }
  private drawFinder(x: number, y: number) {
    for (let dy = -4; dy <= 4; dy++)
      for (let dx = -4; dx <= 4; dx++) {
        const dist = Math.max(Math.abs(dx), Math.abs(dy));
        const xx = x + dx, yy = y + dy;
        if (xx >= 0 && xx < this.size && yy >= 0 && yy < this.size) this.setFn(xx, yy, dist !== 2 && dist !== 4);
      }
  }
  private drawAlignment(x: number, y: number) {
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) this.setFn(x + dx, y + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
  }
  private drawFormatBits(mask: number) {
    const data = (0 << 3) | mask; // level M format bits = 00
    let rem = data;
    for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    const bits = ((data << 10) | rem) ^ 0x5412;
    const bit = (i: number) => ((bits >>> i) & 1) !== 0;
    for (let i = 0; i <= 5; i++) this.setFn(8, i, bit(i));
    this.setFn(8, 7, bit(6));
    this.setFn(8, 8, bit(7));
    this.setFn(7, 8, bit(8));
    for (let i = 9; i < 15; i++) this.setFn(14 - i, 8, bit(i));
    for (let i = 0; i < 8; i++) this.setFn(this.size - 1 - i, 8, bit(i));
    for (let i = 8; i < 15; i++) this.setFn(8, this.size - 15 + i, bit(i));
    this.setFn(8, this.size - 8, true);
  }
  private drawVersion() {
    if (this.ver < 7) return;
    let rem = this.ver;
    for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
    const bits = (this.ver << 12) | rem;
    for (let i = 0; i < 18; i++) {
      const bit = ((bits >>> i) & 1) !== 0;
      const a = this.size - 11 + (i % 3), b = Math.floor(i / 3);
      this.setFn(a, b, bit);
      this.setFn(b, a, bit);
    }
  }
  private addEccAndInterleave(data: number[]) {
    const numBlocks = NUM_BLOCKS_M[this.ver];
    const blockEccLen = ECC_PER_BLOCK_M[this.ver];
    const rawCodewords = Math.floor(numRawDataModules(this.ver) / 8);
    const numShortBlocks = numBlocks - (rawCodewords % numBlocks);
    const shortBlockLen = Math.floor(rawCodewords / numBlocks);
    const blocks: number[][] = [];
    const rsDiv = rsDivisor(blockEccLen);
    for (let i = 0, k = 0; i < numBlocks; i++) {
      const dat = data.slice(k, k + shortBlockLen - blockEccLen + (i < numShortBlocks ? 0 : 1));
      k += dat.length;
      const ecc = rsRemainder(dat, rsDiv);
      if (i < numShortBlocks) dat.push(0);
      blocks.push(dat.concat(ecc));
    }
    const result: number[] = [];
    for (let i = 0; i < blocks[0].length; i++)
      blocks.forEach((block, j) => {
        if (i !== shortBlockLen - blockEccLen || j >= numShortBlocks) result.push(block[i]);
      });
    return result;
  }
  private drawCodewords(data: number[]) {
    let i = 0;
    for (let right = this.size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (let vert = 0; vert < this.size; vert++)
        for (let j = 0; j < 2; j++) {
          const x = right - j;
          const upward = ((right + 1) & 2) === 0;
          const y = upward ? this.size - 1 - vert : vert;
          if (!this.isFunction[y][x] && i < data.length * 8) {
            this.modules[y][x] = ((data[i >>> 3] >>> (7 - (i & 7))) & 1) !== 0;
            i++;
          }
        }
    }
  }
  private applyMask(mask: number) {
    for (let y = 0; y < this.size; y++)
      for (let x = 0; x < this.size; x++) {
        let invert = false;
        switch (mask) {
          case 0: invert = (x + y) % 2 === 0; break;
          case 1: invert = y % 2 === 0; break;
          case 2: invert = x % 3 === 0; break;
          case 3: invert = (x + y) % 3 === 0; break;
          case 4: invert = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0; break;
          case 5: invert = ((x * y) % 2) + ((x * y) % 3) === 0; break;
          case 6: invert = (((x * y) % 2) + ((x * y) % 3)) % 2 === 0; break;
          default: invert = (((x + y) % 2) + ((x * y) % 3)) % 2 === 0;
        }
        if (!this.isFunction[y][x] && invert) this.modules[y][x] = !this.modules[y][x];
      }
  }
  private penalty() {
    let result = 0;
    const s = this.size;
    const countPatterns = (hist: number[]) => {
      const n = hist[1];
      const core = n > 0 && hist[2] === n && hist[3] === n * 3 && hist[4] === n && hist[5] === n;
      return (core && hist[0] >= n * 4 && hist[6] >= n ? 1 : 0) + (core && hist[6] >= n * 4 && hist[0] >= n ? 1 : 0);
    };
    const addHistory = (len: number, hist: number[]) => {
      if (hist[0] === 0) len += s; // light border before the first run
      hist.pop();
      hist.unshift(len);
    };
    const scanLine = (get: (i: number) => boolean) => {
      let runColor = false, runLen = 0, pts = 0;
      const hist = [0, 0, 0, 0, 0, 0, 0];
      for (let i = 0; i < s; i++) {
        const c = get(i);
        if (c === runColor) {
          runLen++;
          if (runLen === 5) pts += 3;
          else if (runLen > 5) pts++;
        } else {
          addHistory(runLen, hist);
          if (!runColor) pts += countPatterns(hist) * 40;
          runColor = c;
          runLen = 1;
        }
      }
      if (runColor) {
        addHistory(runLen, hist);
        runLen = 0;
      }
      addHistory(runLen + s, hist);
      pts += countPatterns(hist) * 40;
      return pts;
    };
    for (let y = 0; y < s; y++) result += scanLine((x) => this.modules[y][x]);
    for (let x = 0; x < s; x++) result += scanLine((y) => this.modules[y][x]);
    for (let y = 0; y < s - 1; y++)
      for (let x = 0; x < s - 1; x++) {
        const c = this.modules[y][x];
        if (c === this.modules[y][x + 1] && c === this.modules[y + 1][x] && c === this.modules[y + 1][x + 1]) result += 3;
      }
    let dark = 0;
    for (const row of this.modules) for (const c of row) if (c) dark++;
    const total = s * s;
    const k = Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1;
    result += k * 10;
    return result;
  }
}

/** Encode text (UTF-8) as a QR matrix. `mask` -1 = auto-select. Throws if the text exceeds version 10 capacity. */
export function encodeQr(text: string, opts: { mask?: number; minVersion?: number } = {}): QrMatrix {
  const bytes = Array.from(new TextEncoder().encode(text));
  let ver = Math.max(1, opts.minVersion ?? 1);
  while (ver <= MAX_VERSION && byteCapacity(ver) < bytes.length) ver++;
  if (ver > MAX_VERSION) throw new Error("QR payload too long");
  const bits: number[] = [];
  const push = (val: number, len: number) => { for (let i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1); };
  push(4, 4);
  push(bytes.length, ver <= 9 ? 8 : 16);
  for (const b of bytes) push(b, 8);
  const capBits = numDataCodewords(ver) * 8;
  push(0, Math.min(4, capBits - bits.length));
  push(0, (8 - (bits.length % 8)) % 8);
  for (let pad = 0xec; bits.length < capBits; pad ^= 0xec ^ 0x11) push(pad, 8);
  const data: number[] = [];
  bits.forEach((b, i) => (data[i >>> 3] = (data[i >>> 3] ?? 0) | (b << (7 - (i & 7)))));
  const qr = new Qr(ver, data, opts.mask ?? -1);
  return { size: qr.size, modules: qr.modules };
}

/** Rects for rendering: each dark module as {x, y} in module units. */
export function qrRects(m: QrMatrix) {
  const out: { x: number; y: number }[] = [];
  for (let y = 0; y < m.size; y++) for (let x = 0; x < m.size; x++) if (m.modules[y][x]) out.push({ x, y });
  return out;
}

/** SVG string (with quiet zone) for embedding as a data URI. */
export function qrSvg(m: QrMatrix, opts: { px?: number; dark?: string; light?: string; quiet?: number } = {}) {
  const { px = 4, dark = "#000", light = "#fff", quiet = 2 } = opts;
  const total = (m.size + quiet * 2) * px;
  const rects = qrRects(m).map((r) => `<rect x="${(r.x + quiet) * px}" y="${(r.y + quiet) * px}" width="${px}" height="${px}"/>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" width="${total}" height="${total}"><rect width="100%" height="100%" fill="${light}"/><g fill="${dark}">${rects}</g></svg>`;
}
