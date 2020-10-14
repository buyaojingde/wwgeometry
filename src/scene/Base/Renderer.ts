/**
* * by lianbo.guo
 **/
import { WebGLRenderer as PIXIWebGlRenderer } from 'pixi.js';
import { WebGLRenderer } from 'three';

export const Renderer3D = new WebGLRenderer({
  antialias: true,
  // logarithmicDepthBuffer: true,
});

export const Renderer2D = new PIXIWebGlRenderer({
  backgroundColor: 0xe8e8e8,
  forceFXAA: true,
  antialias: true,
});

// if (Renderer3D.context.getExtension('WEBGL_lose_context')) {
//   Renderer3D.context.getExtension('WEBGL_lose_context').loseContext();
// }
// if (Renderer2D.gl.getExtension('WEBGL_lose_context')) {
//   Renderer2D.gl.getExtension('WEBGL_lose_context').loseContext();
// }
