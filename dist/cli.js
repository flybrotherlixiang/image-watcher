/**
 * Created by haha370104 on 2017/3/10.
 */

import { startWatch } from 'dist/lib/imageWatcher';

const imagePath = process.argv[2];
const exportJsPath = process.argv[3];

startWatch(imagePath, exportJsPath);
//# sourceMappingURL=cli.js.map