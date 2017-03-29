/**
 * Created by haha370104 on 2017/3/10.
 */


let getAllFiles = (() => {
  var _ref = _asyncToGenerator(function* (folderPath) {
    let result = {};
    let files = fs.readdirSync(folderPath);
    for (let i in files) {
      let newPath = path.join(folderPath, files[i]);
      if (yield checkIfIsDir(newPath)) {
        Object.assign(result, (yield getAllFiles(newPath)));
      } else {
        result[files[i]] = newPath;
      }
    }
    return result;
  });

  return function getAllFiles(_x) {
    return _ref.apply(this, arguments);
  };
})();

let writeFile = (() => {
  var _ref2 = _asyncToGenerator(function* (folderPath, jsPath) {
    let allFiles = yield getAllFiles(folderPath);
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
        console.log(`Illegal file: ${ filePath } !`);
        continue;
      }
      finalScript += `  ${ fileName }: require('${ realFilePath }'),\n`;
    }

    fs.open(jsPath, 'w', function (e, fd) {
      if (e) throw e;

      finalScript += '};';
      fs.writeFileSync(jsPath, finalScript);
      console.log('image module has updated');
    });
  });

  return function writeFile(_x2, _x3) {
    return _ref2.apply(this, arguments);
  };
})();

// 用法 node imageFolderWatcher.js

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

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
        reject(err);
      }
      resolve(stats.isDirectory() === true);
    });
  });
}

function startWatch(imagePath, outputFile) {
  watch.watchTree(imagePath, (f, curr, prev) => {
    writeFile(imagePath, outputFile);
  });
}
//# sourceMappingURL=imageWatcher.js.map

const imagePath = process.argv[2];
const exportJsPath = process.argv[3];

startWatch(imagePath, exportJsPath);