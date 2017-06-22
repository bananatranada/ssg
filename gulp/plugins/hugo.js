import fs from 'fs';
import childProcess from 'child_process';
import through from 'through2';
import gutil from 'gulp-util';

// options = {
//   env: '',
//   args: '',
// datapath: ''
// }
export default function hugo(options) {
  const { env, args, datapath } = options;
  return through.obj((file, encoding, cb) => {
    console.log(file.isStream());
    const data = {
      env: env,
    };
    fs.writeFile(datapath, JSON.stringify(data), 'utf8', err => {
      if (err) {
        return cb(
          new gutil.PluginError('hugo', "Can't write to datapath. " + err),
        );
      }
      childProcess
        .spawn('hugo', args, { stdio: 'inherit' })
        .on('close', code => {
          if (code === 0) {
            return cb(null, file);
          } else {
            return cb(
              new gutil.PluginError(
                'hugo',
                'Unable to start hugo process. Code ' + code,
              ),
            );
          }
        });
    });
  });
}
