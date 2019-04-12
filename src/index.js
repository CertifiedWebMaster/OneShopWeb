#!/usr/bin/env node

'use strict'

// bind LibSass with Node-sass
const sass = require('node-sass')

// simple function to compile received file
const compile = (file, opts = {}) => {
  // handle a new Promise
  return new Promise((resolve, reject) => {
    // https://www.npmjs.com/package/node-sass#options
    opts = Object.assign({
      file,
      outputStyle: 'compressed'
    }, opts)

    // render and resolve the promise with resultant CSS
    sass.render(opts, (err, result) => {
      if (err) {
        reject(err)
      } else {
        resolve(result)
      }
    })
  })
}

// abstracted function to build CSS file from theme dir and brand colors
const build = (baseDir, outputDir, primary, secondary) => {
  // core Node.js modules
  const path = require('path')
  const fs = require('fs')

  if (primary && secondary) {
    // save _brand.scss with received RGBs first
    let scss = '$primary: #' + primary + '; $secondary: #' + secondary + ';'
    fs.writeFileSync(path.join(baseDir, '/_brand.scss'), scss)
  }

  // get current main SCSS file based on module directory
  const mainSass = path.join(__dirname, '..', '/scss/storefront-twbs.scss')
  // output file path
  const outFile = path.join(outputDir, '/storefront-twbs.min.css')
  // modules path to import Bootstrap SCSS files
  const modulesPath = path.join(process.cwd(), 'node_modules')

  compile(mainSass, {
    outFile,
    sourceMap: true,
    includePaths: [ baseDir, modulesPath ]
  }).then(result => {
    // save CSS and map files
    fs.writeFile(outFile, result.css, err => { if (err) throw err })
    fs.writeFile(outFile + '.map', result.map, err => { if (err) console.error(err) })
  })

  // recursive copy theme assets folder
  const ncp = require('ncp').ncp
  ncp.limit = 16
  const assetsSrc = path.join(baseDir, 'theme', 'assets')
  // check if assets path exists and is a directory
  fs.stat(assetsSrc, (err, stats) => {
    if (!err && stats.isDirectory()) {
      // start copying
      ncp(assetsSrc, path.join(outputDir, 'assets'), err => {
        if (err) {
          console.error(err)
        }
      })
    }
  })
}

if (require.main === module) {
  // called directly
  // handle command line task
  // receive at least the directories to output and include as arguments
  if (process.argv.length >= 4) {
    // node ./index.js ~/mytheme/scss ~/mytheme/dist
    let baseDir = process.argv[2]
    let outputDir = process.argv[3]

    // brand colors
    let primary, secondary
    if (process.argv.length >= 6) {
      // node ./index.js ~/mytheme/scss ~/mytheme/dist 333 fff
      primary = process.argv[4]
      secondary = process.argv[5]
    }

    // run build
    build(baseDir, outputDir, primary, secondary)
  }
} else {
  module.exports = { compile, build }
}
