// Reexport the native module. On web, it will be resolved to tsyncnativeModule.web.ts
// and on native platforms to tsyncnativeModule.ts
export { default } from './src/tsyncnativeModule';
export * from './src/tsyncnative.types';
