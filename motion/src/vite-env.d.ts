/// <reference types="vite/client" />

declare module '*?scene' {
  const scene: import('@motion-canvas/core').FullSceneDescription;
  export default scene;
}
