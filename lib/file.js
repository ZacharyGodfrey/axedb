import { resolve } from 'path';
import fs from 'fs-extra';
import { globSync } from 'glob';
import sharp from 'sharp';

export const listFiles = (pattern) => {
  return globSync(pattern, { cwd: resolve() });
};

export const readFile = (path, encoding = 'utf-8') => {
  return fs.readFileSync(resolve(path), { encoding });
};

export const writeFile = (path, content, encoding = 'utf-8') => {
  return fs.outputFileSync(resolve(path), content, { encoding });
};

export const createFolder = (path) => {
  return fs.ensureDirSync(resolve(path));
};

export const emptyFolder = (path) => {
  return fs.emptyDirSync(resolve(path));
};

export const copyFolder = (src, dest) => {
  return fs.copySync(resolve(src), resolve(dest));
};

export const imageToWebp = async (originalBuffer) => {
  return await sharp(originalBuffer)
    .resize(200, 200)
    .webp({ lossless: true, quality: 100 })
    .toBuffer();
};