const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const runJavaScript = (code, input, timeoutMs = 5000) => {
  return new Promise((resolve) => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'exec-'));
    const filePath = path.join(tempDir, 'script.js');
    fs.writeFileSync(filePath, code);

    const startTime = Date.now();
    const child = spawn('node', [filePath]);

    let stdout = '';
    let stderr = '';
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGKILL');
    }, timeoutMs);

    child.stdout.on('data', (d) => (stdout += d.toString()));
    child.stderr.on('data', (d) => (stderr += d.toString()));

    child.on('error', (err) => {
      clearTimeout(timer);
      resolve({ stdout: '', stderr: `Failed to run: ${err.message}`, exitCode: 1, timedOut: false });
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

const runCode = async ({ language, code, input }) => {
  if (language === 'javascript') {
    return runJavaScript(code, input);
  }
  return {
    stdout: '',
    stderr: `${language} execution requires Docker, which we'll set up later. JavaScript works for now.`,
    exitCode: 1,
    timedOut: false,
  };
};

module.exports = runCode;