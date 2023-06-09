const childProcess = require('child_process');
const package = require('./package.json');
const config = require('./publishSyncrc');
const archiver = require('archiver');
const fs = require('fs');
const fetch = require('node-fetch').default;
const FormData = require('form-data');

const npmCMD = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const wrapLog = (msg) => {
  console.log(`========== ${msg} ==========`);
};

const handlePublish = () => {
  wrapLog(`npm publish start`);
  const child = childProcess.spawnSync(npmCMD, ['publish'], {
    cwd: process.cwd(),
    stdio: 'inherit',
    encoding: 'utf-8',
  });

  wrapLog(`npm publish end`);
  wrapLog(`xit code:  ${child.status}`);

  return child.status;
};

function buildDoc() {
  const child = childProcess.spawnSync(npmCMD, ['run', 'build'], {
    cwd: process.cwd(),
    stdio: 'inherit',
    encoding: 'utf-8',
  });
  return child.status;
}

function zipDoc() {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(`${__dirname}/${config.zipName}.zip`);
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Sets the compression level.
    });
    output.on('close', () => {
      console.log('archiver has been finalized and the output file descriptor has closed.');
      resolve(true);
    });
    output.on('end', () => {
      console.log('Data has been drained');
      resolve(true);
    });
    archive.pipe(output);
    archive.directory(config.zipSrc, false);
    archive.finalize();
  });
}

async function uploadDoc(packageId) {
  if (!packageId) {
    wrapLog(`upload packageId:${packageId} docs fail`);
    return;
  }
  const formData = new FormData();

  formData.append('file', fs.readFileSync(`./${config.zipName}.zip`), {
    contentType: 'application/zip',
    name: 'file',
    filename: `${config.zipName}.zip`,
  });

  formData.append('package_id', packageId);
  formData.append('app_auth_token', '');

  const headersData = {
    ...formData.getHeaders(),
    Authorization: `Bearer ${config.token}`,
  };

  try {
    wrapLog(`upload packageId:${packageId} doc start`);
    const response = await fetch(config.api.origin + config.api.upload.path, {
      method: config.api.upload.method,
      body: formData,
      headers: headersData,
    });
    const resData = await response.json();
    console.log(resData);
    wrapLog(`upload packageId:${packageId} doc end`);
  } catch (error) {
    console.log(error);
  }
}

function buildLowcode() {
  const child = childProcess.spawnSync(npmCMD, ['run', 'lowcode:build'], {
    cwd: process.cwd(),
    stdio: 'inherit',
    encoding: 'utf-8',
  });
  return child.status;
}

function getUserName() {
  return new Promise((resovle, reject) => {
    try {
      const childP = childProcess.spawnSync(npmCMD, ['config', 'ls'], {
        encoding: 'utf-8',
      });
      const scriptOutput = childP.output.toString();
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
  wrapLog('sync package info start');

  const username = await getUserName();
  const data = {
    name: package.name,
    description: package.description,
    creator: username,
    version: package.version,
  };
  try {
    console.log(data);
    const res = await fetch(config.api.origin + config.api.syncInfo.path, {
      method: config.api.syncInfo.method,
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.token}` },
    });
    const resData = await res.json();
    console.log(resData);
    wrapLog('sync package info end');
    return resData.data;
  } catch (error) {
    console.log(error);
  }
}

const start = async () => {
  try {
    const buildDocCode = buildDoc();
    if (buildDocCode) {
      return;
    }
    await zipDoc();
    const buildCode = buildLowcode();

    if (buildCode) {
      return;
    }

    const publishCode = handlePublish();

    if (publishCode) {
      return;
    }
    const packageId = await syncPackageInfo();
    await uploadDoc(packageId);
  } catch (error) {
    console.log(error);
  }
};

start();
