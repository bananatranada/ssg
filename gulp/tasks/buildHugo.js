import fs from 'fs';
import childProcess from 'child_process';
import gulp from 'gulp';
import through from 'through2';
// import hugo from '../plugins/hugo';

// const options = {
//   src
//   dest
//   browserSync
//   env
//   datapath
//   args
//   onSuccess
//   onError
// }
export default function buildHugo($, options) {
  const { env, datapath, args, onSuccess, onError } = options;
  return done => {
    const data = {
      env: env,
    };
    fs.writeFile(datapath, JSON.stringify(data), 'utf8', err => {
      if (err) {
        onError("Can't write to datapath. " + err);
        return done();
      }
      childProcess
        .spawn('hugo', args, { stdio: 'inherit' })
        .on('close', code => {
          if (code === 0) {
            onSuccess();
          } else {
            onError('Unable to start hugo process. Code ' + code);
          }
          done();
        });
    });
  };
}
