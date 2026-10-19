import test from 'node:test';
import assert from 'node:assert/strict';
import { galleryAdmin, isGalleryPreview, validGalleryPath, validBlobUrl, sameOrigin, MAX_IMAGE, MAX_VIDEO } from '../lib/gallery/policy.ts';
const host = 'yoditest.public.blob.vercel-storage.com';
test('all production and non-refonte environments are closed', () => {
  for (const env of [{}, { VERCEL_ENV: 'production', VERCEL_GIT_COMMIT_REF: 'refonte' }, { VERCEL_ENV: 'preview', VERCEL_GIT_COMMIT_REF: 'master' }]) assert.equal(isGalleryPreview(env), false);
  assert.equal(isGalleryPreview({ VERCEL_ENV: 'preview', VERCEL_GIT_COMMIT_REF: 'refonte' }), true);
});
test('a customer session and absent allowlist never grant publication access', () => {
  assert.equal(galleryAdmin('customer@example.test', ''), false);
  assert.equal(galleryAdmin('customer@example.test', 'owner@example.test'), false);
  assert.equal(galleryAdmin(null, 'owner@example.test'), false);
  assert.equal(galleryAdmin('OWNER@example.test', ' owner@example.test , second@example.test '), true);
});
test('upload paths cannot leave the Preview gallery or upload active documents', () => {
  assert.equal(validGalleryPath('gallery/refonte/12345678-1234-1234-1234-123456789abc.mp4'), true);
  for (const path of ['gallery/production/123.mp4', '../gallery/refonte/a.png', 'gallery/refonte/test.svg', 'gallery/refonte/test.html']) assert.equal(validGalleryPath(path), false);
  assert.equal(MAX_IMAGE, 8 * 1024 * 1024); assert.equal(MAX_VIDEO, 100 * 1024 * 1024);
});
test('media must belong to the configured public Blob store and isolated prefix', () => {
  assert.equal(validBlobUrl(`https://${host}/gallery/refonte/a.jpg`, host), true);
  for (const value of [`https://${host}/other/a.jpg`, `https://evil.test/gallery/refonte/a.jpg`, `http://${host}/gallery/refonte/a.jpg`, `https://user:pass@${host}/gallery/refonte/a.jpg`, `https://${host}/gallery/refonte/a.jpg?token=secret`, `https://${host}/gallery/refonte/a.jpg#hash`, `https://${host}/gallery/refonte/../other/a.jpg`]) assert.equal(validBlobUrl(value, host), false);
  assert.equal(validBlobUrl(`https://${host}/gallery/refonte/a.jpg`, undefined), false);
});
test('cross-origin or missing-origin publication requests are rejected', () => {
  const url = 'https://admin-preview.example.test/api/gallery';
  assert.equal(sameOrigin(new Request(url, { headers: { origin: 'https://admin-preview.example.test' } })), true);
  assert.equal(sameOrigin(new Request(url, { headers: { origin: 'https://evil.test' } })), false);
  assert.equal(sameOrigin(new Request(url)), false);
});
