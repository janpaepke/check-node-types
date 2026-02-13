import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

export default defineConfig({
  onwarn(warning, defaultHandler) {
    if (warning.code === 'CIRCULAR_DEPENDENCY' && warning.ids?.every(id => id.includes('node_modules'))) return;
    defaultHandler(warning);
  },
  input: 'src/cli.ts',
  output: {
    file: 'dist/cli.mjs',
    format: 'es',
    banner: '#!/usr/bin/env node',
  },
  plugins: [
    typescript({ tsconfig: './tsconfig.json' }),
    resolve({ preferBuiltins: true }),
    commonjs(),
    terser(),
  ],
  external: [/^node:/],
});
