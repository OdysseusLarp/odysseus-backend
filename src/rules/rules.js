import path from 'path'
import fs from 'fs'
import { isFunction } from 'lodash';

/* Require all *.js files in all subdirectories */

fs.readdirSync(__dirname, { withFileTypes:true }).forEach((entry) => {
    if (isFunction(entry.isDirectory) && entry.isDirectory()) {
        const dir = path.join(__dirname, entry.name);
        fs.readdirSync(dir).forEach((file) => {
            if (file.endsWith('.js')) {
                require(path.join(dir, file));
            }
        });
    }
});
