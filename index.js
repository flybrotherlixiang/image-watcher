/**
 * Created by haha370104 on 2017/3/6.
 */
const fs = require('fs');
const path = require('path');
const watch = require('watch');

function checkIfIsDir(path) {
  return new Promise((resolve, reject) => {
    fs.stat(path, (err, stats) => {
      if (err) {
        reject(err)
      }
      resolve(stats.isDirectory() === true)
    });
  })
}

async function getAllFiles(folderPath) {
  let result = {};
  let files = fs.readdirSync(folderPath);
  for (let i in files) {
    let newPath = path.join(folderPath, files[i]);
    if (await checkIfIsDir(newPath)) {
      Object.assign(result, await getAllFiles(newPath));
    } else {
      result[files[i]] = newPath;
    }
  }
  return result;
}

async function writeFile(folderPath, jsPath) {
  let allFiles = await getAllFiles(folderPath);
  let finalScript = 'export default {\n';
  //这里会把xx.js当成一个文件夹 所以要先上一层一次
  let abJsPath = path.resolve(jsPath);
  abJsPath = path.dirname(abJsPath);

  for (let file in allFiles) {
    let filePath = allFiles[file];
    let abFilePath = path.resolve(filePath);
    let realFilePath = path.relative(abJsPath, abFilePath);
    let fileName = path.basename(filePath, '.png');
    if (fileName.indexOf('.') != -1) {
      console.log(`Illegal file: ${filePath} !`);
      continue;
    }
    finalScript += `  ${fileName}: require('${realFilePath}'),\n`
  }

  fs.open(jsPath, 'w', function (e, fd) {
    if (e) throw e;

    finalScript += '};';
    fs.writeFileSync(jsPath, finalScript);
    console.log('image module has updated')
  });
}

function startWatch(imagePath, outputFile) {
  watch.watchTree(imagePath, (f, curr, prev) => {
    writeFile(imagePath, outputFile)
  });
}

const imagePath = process.argv[2];
const exportJsPath = process.argv[3];
const needWatcher = process.argv[4];

if (needWatcher) {
  startWatch(imagePath, exportJsPath);
} else {
  writeFile(imagePath, exportJsPath);
}
