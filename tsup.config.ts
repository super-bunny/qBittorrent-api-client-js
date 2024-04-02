// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig, type Options } from 'tsup'

export default defineConfig((options: Options) => ({
  entry: ['src/index.ts'],
  outDir: 'dist',
  clean: true,
  format: ['esm', 'cjs'],
  bundle: true,
  sourcemap: true,
  skipNodeModulesBundle: true,
  dts: true,
  ...options,
}))
