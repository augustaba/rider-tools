const babel = require('@babel/core');
const { join, extname } = require('path')
const rimraf = require('rimraf')
const vfs = require('vinyl-fs');
const through = require('through2');
const chalk = require('chalk')
const log = require('./utils/log')

const cwd = process.cwd()

function getBabelConfig() {
  return {
    presets: [
      require.resolve('@babel/preset-typescript'),
      require.resolve('@babel/preset-env')
    ] 
  }
}

function transform(opts) {
  const babelConfig = getBabelConfig()
  log.transform(
    chalk['blue'](
      `${opts.path.replace(`${cwd}/`, '')}`,
    ),
  );
  return babel.transform(opts.contents, {
    ...babelConfig,
    filename: opts.path
  }).code
}

function build(dir) {
  const libDir = join(dir, 'lib')
  const srcDir = join(dir, 'src')
  rimraf.sync(join(cwd, libDir))

  function createStream(src) {
    return vfs
      .src(src, {
        base: srcDir
      })
      .pipe(through.obj((f, _, cb) => {
        if (['.js', '.ts'].includes(extname(f.path))) {
          f.contents = Buffer.from(
            transform({
              contents: f.contents,
              path: f.path
            })
          )

          f.path = f.path.replace(extname(f.path), '.js')
        }
        cb(null, f)
      }))
      .pipe(vfs.dest(libDir));
  }

  const stream = createStream(join(srcDir, '**/*'))
  stream.on('end', () => {
    log.success(chalk['green']('process success'))
  })
}

build('./')