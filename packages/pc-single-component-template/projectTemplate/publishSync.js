const childProcess = require('child_process');
const package = require('./package.json');
const http = require('http');

console.log('========== npm publish start ==========');
const npmCMD = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const child = childProcess.spawnSync(npmCMD, ['publish'], {
  cwd: process.cwd(),
  stdio: 'inherit',
  encoding: 'utf-8',
});

console.log('========== npm publish end ==========');

console.log('exit code: ', child.status);

function getUserName() {
  return new Promise((resovle, reject) => {
    try {
      const childP = childProcess.spawnSync(npmCMD, ['config', 'ls'], {
        encoding: 'utf-8',
      });
      scriptOutput = childP.output.toString();
      let username = '';
      scriptOutput.replace(/:\s*username\s*=\s*"((?:[^"]|"")*)"/g, (match, $1) => {
        username = $1;
      });
      resovle(username);
    } catch (error) {
      reject(error);
    }
  });
}

async function syncPackageInfo() {
  console.log('========== sync info start ==========');
  const username = await getUserName();
  const data = {
    name: package.name,
    description: package.description,
    creator: username,
    version: package.version,
  };
  const postData = JSON.stringify(data);
  const request = http.request(
    {
      hostname: 'localhost',
      port: 3200,
      path: '/v1/package/sync',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    },
    (res) => {
      res.on('data', (d) => {
        process.stdout.write(d);
        console.log('\n========== sync info end ==========');
      });
    },
  );
  request.on('error', (e) => {
    console.error(e);
  });
  request.write(postData);
  request.end();
}

if (!child.status || child.status === null) {
  try {
    syncPackageInfo();
  } catch (error) {
    console.log(error);
  }
}
