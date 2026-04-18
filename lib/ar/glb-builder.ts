/**
 * Pure-JS GLB (glTF 2.0 binary) builder for a floating AR photo frame.
 *
 * Produces a self-contained .glb with:
 *   - a textured plane (the uploaded photo, unlit material)
 *   - a slightly larger gold-PBR plane behind it (the "frame")
 *
 * No external dependencies — everything is crafted by hand so it works on
 * Vercel's edge/serverless runtimes without binary add-ons.
 */

export interface BuildPhotoFrameOptions {
  imageBytes: Uint8Array;
  imageMimeType: 'image/jpeg' | 'image/png' | 'image/webp';
  /** Aspect ratio (width / height) of the source photo. Default 0.75 (3:4 portrait). */
  aspectRatio?: number;
  /** Longest side of the photo in meters. Default 0.60 m. */
  longestSideMeters?: number;
  /** Frame border thickness in meters. Default 0.03 m. */
  frameMeters?: number;
  /** Frame color (RGB, 0–1). Default warm gold. */
  goldRGB?: [number, number, number];
}

const GLB_MAGIC       = 0x46546c67;  // 'glTF'
const GLB_VERSION     = 2;
const CHUNK_JSON      = 0x4e4f534a;  // 'JSON'
const CHUNK_BIN       = 0x004e4942;  // 'BIN\0'
const COMP_UINT16     = 5123;
const COMP_FLOAT      = 5126;

const align4 = (n: number) => (n + 3) & ~3;

/** Extract pixel dimensions from raw PNG / JPEG bytes. Returns null if unknown. */
export function readImageDimensions(b: Uint8Array): { width: number; height: number } | null {
  // PNG: 89 50 4E 47 0D 0A 1A 0A then 4B len + 'IHDR' + 4B width + 4B height
  if (b.length >= 24 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) {
    const dv = new DataView(b.buffer, b.byteOffset + 16, 8);
    return { width: dv.getUint32(0, false), height: dv.getUint32(4, false) };
  }
  // JPEG
  if (b.length >= 4 && b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i < b.length - 9) {
      if (b[i] !== 0xff) return null;
      const marker = b[i + 1];
      if (marker === 0xd8 || marker === 0xd9) return null;
      const isSOF =
        (marker >= 0xc0 && marker <= 0xc3) ||
        (marker >= 0xc5 && marker <= 0xc7) ||
        (marker >= 0xc9 && marker <= 0xcb) ||
        (marker >= 0xcd && marker <= 0xcf);
      const segLen = (b[i + 2] << 8) | b[i + 3];
      if (isSOF) {
        const height = (b[i + 5] << 8) | b[i + 6];
        const width  = (b[i + 7] << 8) | b[i + 8];
        return { width, height };
      }
      i += 2 + segLen;
    }
  }
  return null;
}

export function buildPhotoFrameGLB({
  imageBytes,
  imageMimeType,
  aspectRatio = 0.75,
  longestSideMeters = 0.60,
  frameMeters = 0.03,
  goldRGB = [0.83, 0.67, 0.22],
}: BuildPhotoFrameOptions): Uint8Array {
  // Photo size in meters. Longest side = longestSideMeters; other side scaled by aspect.
  let photoW: number;
  let photoH: number;
  if (aspectRatio >= 1) {
    photoW = longestSideMeters;
    photoH = longestSideMeters / aspectRatio;
  } else {
    photoH = longestSideMeters;
    photoW = longestSideMeters * aspectRatio;
  }

  const pw = photoW / 2;
  const ph = photoH / 2;
  const fw = (photoW + frameMeters * 2) / 2;
  const fh = (photoH + frameMeters * 2) / 2;
  const frameZ = -0.005;

  // Vertex data ----------------------------------------------------------
  const photoPositions = new Float32Array([
    -pw, -ph, 0,
     pw, -ph, 0,
     pw,  ph, 0,
    -pw,  ph, 0,
  ]);
  const photoUVs = new Float32Array([0, 1,  1, 1,  1, 0,  0, 0]);
  const photoIndices = new Uint16Array([0, 1, 2, 0, 2, 3]);

  const framePositions = new Float32Array([
    -fw, -fh, frameZ,
     fw, -fh, frameZ,
     fw,  fh, frameZ,
    -fw,  fh, frameZ,
  ]);
  const frameUVs = new Float32Array([0, 1,  1, 1,  1, 0,  0, 0]);
  const frameIndices = new Uint16Array([0, 1, 2, 0, 2, 3]);

  // BIN layout -----------------------------------------------------------
  let off = 0;
  const off_ppos = off; off += photoPositions.byteLength;    // 48
  const off_puv  = off; off += photoUVs.byteLength;          // 32
  const off_pidx = off; off += photoIndices.byteLength;      // 12
  off = align4(off);
  const off_fpos = off; off += framePositions.byteLength;    // 48
  const off_fuv  = off; off += frameUVs.byteLength;          // 32
  const off_fidx = off; off += frameIndices.byteLength;      // 12
  off = align4(off);
  const off_img = off;  off += imageBytes.byteLength;
  const binTotal = align4(off);

  const bin = new Uint8Array(binTotal);
  const u8 = (ta: ArrayBufferView) =>
    new Uint8Array(ta.buffer, ta.byteOffset, ta.byteLength);
  bin.set(u8(photoPositions), off_ppos);
  bin.set(u8(photoUVs),       off_puv);
  bin.set(u8(photoIndices),   off_pidx);
  bin.set(u8(framePositions), off_fpos);
  bin.set(u8(frameUVs),       off_fuv);
  bin.set(u8(frameIndices),   off_fidx);
  bin.set(imageBytes,         off_img);

  // glTF JSON ------------------------------------------------------------
  const gltf = {
    asset: { version: '2.0', generator: 'HI-AR-Frame/1.0' },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [
      { name: 'Portrait', children: [1, 2], translation: [0, photoH / 2, 0] },
      { name: 'Photo', mesh: 0 },
      { name: 'Frame', mesh: 1 },
    ],
    meshes: [
      {
        name: 'PhotoMesh',
        primitives: [{
          attributes: { POSITION: 0, TEXCOORD_0: 1 },
          indices: 2,
          material: 0,
        }],
      },
      {
        name: 'FrameMesh',
        primitives: [{
          attributes: { POSITION: 3, TEXCOORD_0: 4 },
          indices: 5,
          material: 1,
        }],
      },
    ],
    accessors: [
      { bufferView: 0, componentType: COMP_FLOAT,  count: 4, type: 'VEC3',
        min: [-pw, -ph, 0], max: [pw, ph, 0] },
      { bufferView: 1, componentType: COMP_FLOAT,  count: 4, type: 'VEC2' },
      { bufferView: 2, componentType: COMP_UINT16, count: 6, type: 'SCALAR' },
      { bufferView: 3, componentType: COMP_FLOAT,  count: 4, type: 'VEC3',
        min: [-fw, -fh, frameZ], max: [fw, fh, frameZ] },
      { bufferView: 4, componentType: COMP_FLOAT,  count: 4, type: 'VEC2' },
      { bufferView: 5, componentType: COMP_UINT16, count: 6, type: 'SCALAR' },
    ],
    bufferViews: [
      { buffer: 0, byteOffset: off_ppos, byteLength: photoPositions.byteLength },
      { buffer: 0, byteOffset: off_puv,  byteLength: photoUVs.byteLength },
      { buffer: 0, byteOffset: off_pidx, byteLength: photoIndices.byteLength },
      { buffer: 0, byteOffset: off_fpos, byteLength: framePositions.byteLength },
      { buffer: 0, byteOffset: off_fuv,  byteLength: frameUVs.byteLength },
      { buffer: 0, byteOffset: off_fidx, byteLength: frameIndices.byteLength },
      { buffer: 0, byteOffset: off_img,  byteLength: imageBytes.byteLength },
    ],
    buffers: [{ byteLength: binTotal }],
    materials: [
      {
        name: 'PhotoUnlit',
        pbrMetallicRoughness: {
          baseColorTexture: { index: 0 },
          metallicFactor: 0,
          roughnessFactor: 1,
        },
        extensions: { KHR_materials_unlit: {} },
      },
      {
        name: 'GoldFrame',
        pbrMetallicRoughness: {
          baseColorFactor: [goldRGB[0], goldRGB[1], goldRGB[2], 1],
          metallicFactor: 0.85,
          roughnessFactor: 0.28,
        },
        doubleSided: true,
      },
    ],
    textures: [{ source: 0, sampler: 0 }],
    samplers: [{ magFilter: 9729, minFilter: 9987 }],
    images: [{ bufferView: 6, mimeType: imageMimeType }],
    extensionsUsed: ['KHR_materials_unlit'],
  };

  // Encode JSON + align with spaces
  const jsonRaw = new TextEncoder().encode(JSON.stringify(gltf));
  const jsonLen = align4(jsonRaw.length);
  const jsonBuf = new Uint8Array(jsonLen);
  jsonBuf.set(jsonRaw);
  for (let i = jsonRaw.length; i < jsonLen; i++) jsonBuf[i] = 0x20;

  // Final GLB: header (12) + json chunk (8 + jsonLen) + bin chunk (8 + binTotal)
  const totalLen = 12 + 8 + jsonLen + 8 + binTotal;
  const out = new Uint8Array(totalLen);
  const dv = new DataView(out.buffer);

  dv.setUint32(0, GLB_MAGIC, true);
  dv.setUint32(4, GLB_VERSION, true);
  dv.setUint32(8, totalLen, true);

  dv.setUint32(12, jsonLen, true);
  dv.setUint32(16, CHUNK_JSON, true);
  out.set(jsonBuf, 20);

  const binHeaderOff = 20 + jsonLen;
  dv.setUint32(binHeaderOff, binTotal, true);
  dv.setUint32(binHeaderOff + 4, CHUNK_BIN, true);
  out.set(bin, binHeaderOff + 8);

  return out;
}
