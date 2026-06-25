const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const LANGUAGE_CONFIG = {
  javascript: {
    image: 'node:20-alpine',
    filename: 'script.js',
    cmd: (file) => ['node', file],
  },
  python: {
    image: 'python:3.11-alpine',
    filename: 'script.py',
    cmd: (file) => ['python', file],
  },
  cpp: {
    image: 'gcc:13.2.0',
    filename: 'script.cpp',
    cmd: (file) => ['sh', '-c', `g++ ${file} -o /code/a.out && /code/a.out`],
  },
};

const runInDocker = ({ language, code, input, timeoutMs = 5000 }) => {
  return new Promise((resolve) => {
    const config = LANGUAGE_CONFIG[language];
    if (!config) {
      return resolve({ stdout: '', stderr: 'Unsupported language', exitCode: 1, timedOut: false });
    }

    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'exec-'));
    const filePath = path.join(tempDir, config.filename);
    fs.writeFileSync(filePath, code);

    const containerPath = `/code/${config.filename}`;
    const command = config.cmd(containerPath);

    const dockerArgs = [
      'run', '--rm', '-i',
      '--network', 'none',
      '--memory', '128m',
      '--cpus', '0.5',
      '-v', `${tempDir}:/code`,
      config.image,
      ...command,
    ];

    const startTime = Date.now();
    const child = spawn('docker', dockerArgs);

    let stdout = '';
    let stderr = '';
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGKILL');
    }, timeoutMs);

    child.stdout.on('data', (data) => (stdout += data.toString()));
    child.stderr.on('data', (data) => (stderr += data.toString()));

    child.on('error', (err) => {
      clearTimeout(timer);
      resolve({ stdout: '', stderr: `Failed to start Docker: ${err.message}`, exitCode: 1, timedOut: false });
    });

    child.on('close', (exitCode) => {
      clearTimeout(timer);
      fs.rmSync(tempDir, { recursive: true, force: true });
      resolve({
        stdout: stdout.slice(0, 10000),
        stderr: stderr.slice(0, 10000),
        exitCode,
        timedOut,
        timeMs: Date.now() - startTime,
      });
    });

    if (input) child.stdin.write(input);
    child.stdin.end();
  });
};

module.exports = runInDocker;