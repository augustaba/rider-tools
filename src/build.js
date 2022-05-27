const babel = require('@babel/core');
const { join, extname } = require('path')
const rimraf = require('rimraf')
const vfs = require('vinyl-fs');
const through = require('through2');

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
  return babel.transform(opts.contents, {
    ...getBabelConfig,
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
    console.log('process send:', process.send)
  })
}

build('./')
