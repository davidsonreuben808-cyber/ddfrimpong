import { spawn } from 'node:child_process';
const vite = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '0.0.0.0'], { stdio: 'inherit' });
const stop = () => vite.kill();
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
vite.on('exit', code => { process.exitCode = code ?? 0; });
