/**
 *	WPPB GENERATOR SITE
 *	Author: Enrique Chavez
 *	Author URI: http://enriquechavez.co
 */

var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var path = require('path');
var ghdownload = require('github-download');
var rimraf = require('rimraf');
var fs = require('fs-extra');
var mime = require('mime');
var replace = require('replace');
var bodyParser = require('body-parser');
var EasyZip = require('easy-zip').EasyZip;
var CronJob = require('cron').CronJob;
var ua = require('universal-analytics');

app.set('port', port);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));

app
  .route(
    '/.well-known/acme-challenge/miU-q9A8ox1btoayRB8tM6wcWPisl42aR4wnixiK2UU'
  )
  .get(function (req, res) {
    res.send(
      'miU-q9A8ox1btoayRB8tM6wcWPisl42aR4wnixiK2UU.9s9UoMhX5iRzhJpZG6oAd-7PRFIBTPxbwd7nVTPfGcM'
    );
  });

app
  .route('/')
  //GET REQUEST DRAW THE HOME PAGE
  .get(function (req, res) {
    res.send(`<form id="generator-form" class="generator-form" action="" method="post" novalidate="novalidate">
    <div class="row">
    <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
     <input class="home valid" type="text" name="name" id="name" placeholder="Plugin Name" required="" aria-required="true" aria-invalid="false">
     </div>
     <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12"> 
     <input class="home" type="text" name="slug" id="slug" placeholder="Plugin Slug" required="" aria-required="true">
     <input class="home" type="text" name="prefix" id="prefix" placeholder="Plugin Prefix" required="" aria-required="true">
     </div>
     </div>
     <div class="row">
     <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12"> <input class="home" type="text" name="uri" id="uri" placeholder="Plugin Uri" required="" aria-required="true"></div></div><div class="row"><div class="col-lg-6 col-md-6 col-sm-12 col-xs-12"> <input class="home" type="text" name="author[name]" id="author-name" placeholder=" Author Name" required="" aria-required="true"></div><div class="col-lg-6 col-md-6 col-sm-12 col-xs-12"> <input class="home" type="text" name="author[email]" id="author-email" placeholder="Author Email" required="" aria-required="true"></div></div><div class="row"><div class="col-lg-12 col-md-12 col-sm-12 col-xs-12"> <input class="home valid" type="text" name="author[uri]" id="author-uri" placeholder="Author Uri" required="" aria-required="true" aria-invalid="false"></div></div><div class="row"><div class="col-lg-6 col-md-6 col-sm-12 col-xs-12"><div class="error-form"></div></div><div class="col-lg-6 col-md-6 col-sm-12 col-xs-12"> <button type="submit" class="primary pull-right">Build Plugin</button></div></div></form>`);
    //res.redirect('https://wppb.me');
  }) // END GET ROUTE

  .post(function (req, res) {
    var origin = process.cwd() + '/source/';
    var pluginSlug = '';
    var pluginName = '';
    var pluginURI = '';
    var pluginAuthor = '';
    var pluginAuthorURI = '';
    var pluginDescription = '';
    var pluginPrefix = '';
    var pluginNamePackage = '';
    var pluginNameInstance = '';
    var pluginAuthorEmail = '';
    var pluginAuthorFull = '';
    var pluginNameVersion = '';
    var pluginNamePath = '';
    var pluginNameUrl = '';
    var destination = '';
    var data = req.body;
    var visitor = ua('UA-56742268-1');

    //Track Event
    visitor.event('build', 'click', 'download', 1).send();
    // ALL FIELDS REQUIRED IF EMPTY SET DEFAULT VALUES
    pluginSlug = String(data.slug).length
      ? String(data.slug).toLowerCase()
      : 'amazing-plugin';
    pluginName = String(data.name).length ? data.name : 'Amazing Plugin';
    pluginURI = String(data.uri).length
      ? data.uri
      : 'https://codecanyon.net/user/divdojo/portfolio';
    pluginPrefix = String(data.prefix).length
    ? data.prefix
    : 'prefix';
    pluginAuthor = String(data.author.name).length
      ? data.author.name
      : 'DivDojo';
    pluginAuthorURI = String(data.author.uri).length
      ? data.author.uri
      : 'https://codecanyon.net/user/divdojo/portfolio';
    pluginAuthorEmail = String(data.author.email).length
      ? data.author.email
      : 'divdojo@gmail.com';
    pluginNamePackage = capitalize(pluginSlug);
    pluginNameInstance = pluginSlug.replace(/-/gi, '_');
    pluginNameVersion = (pluginNameInstance + '_VERSION').toUpperCase();
    pluginNamePath = (pluginNameInstance + '_PATH').toUpperCase();
    pluginNameUrl = (pluginNameInstance + '_URL').toUpperCase();
    pluginAuthorFull = pluginAuthor + ' <' + pluginAuthorEmail + '>';

    destination =
      process.cwd() + '/tmp/' + pluginSlug + '-' + new Date().getTime();

    fs.copy(origin, destination, function (err) {
      if (err) {
        console.error(err);

        return;
      }

      //RENAME THE MAIN PLUGIN DIRECTORY
      fs.renameSync(
        destination + '/plugin-name',
        destination + '/' + pluginSlug
      );

      //FIND AND REPLACE FILES NAMES
      walker(destination + '/' + pluginSlug, function (err, files) {
        if (err) {
          console.error(err);

          return;
        }

        files.forEach(function (file) {
          var newName;
          var re = /plugin-name/gi;
          newName = file.replace(re, pluginSlug);
          fs.renameSync(file, newName);
        });

        // Plugin URI
        replace({
          regex: 'http://example.com/plugin-name-uri/',
          replacement: pluginURI,
          paths: [destination + '/' + pluginSlug + '/' + pluginSlug + '.php'],
          recursive: false,
          silent: true
        });

        // Plugin Name
        replace({
          regex: 'WordPress Plugin Boilerplate',
          replacement: pluginName,
          paths: [destination + '/' + pluginSlug + '/' + pluginSlug + '.php'],
          recursive: true,
          silent: true
        });

        //Plugin URI
        replace({
          regex: 'http://example.com/plugin-name-uri/',
          replacement: pluginURI,
          paths: [destination + '/' + pluginSlug + '/' + pluginSlug + '.php'],
          recursive: true,
          silent: true
        });

        //replace Plugin Author
        replace({
          regex: 'Your Name or Your Company',
          replacement: pluginAuthor,
          paths: [destination + '/' + pluginSlug + '/' + pluginSlug + '.php'],
          recursive: true,
          silent: true
        });

        //replace Plugin Author Full
        replace({
          regex: 'Your Name <email@example.com>',
          replacement: pluginAuthorFull,
          paths: [destination + '/' + pluginSlug],
          recursive: true,
          silent: true
        });

        //replace Plugin_Name
        replace({
          regex: 'Plugin_Name',
          replacement: pluginNamePackage,
          paths: [destination + '/' + pluginSlug],
          recursive: true,
          silent: true
        });

        //replace Plugin slug
        replace({
          regex: 'plugin-name',
          replacement: pluginSlug,
          paths: [destination + '/' + pluginSlug],
          recursive: true,
          silent: true
        });

        //replace Author URI
        replace({
          regex: 'http://example.com/?',
          replacement: pluginAuthorURI,
          paths: [destination + '/' + pluginSlug],
          recursive: true,
          silent: true
        });

        //replace Plugin Version
        replace({
          regex: 'PLUGIN_NAME_VERSION',
          replacement: pluginNameVersion,
          paths: [destination + '/' + pluginSlug],
          recursive: true,
          silent: true
        });

        //replace Plugin prefix lowercase
        replace({
          regex: 'prefix',
          replacement: pluginPrefix,
          paths: [destination + '/' + pluginSlug],
          recursive: true,
          silent: true
        });

        //replace Plugin prefix capitalized
        replace({
          regex: 'Prefix',
          replacement: capitalize(pluginPrefix),
          paths: [destination + '/' + pluginSlug],
          recursive: true,
          silent: true
        });

        //replace Plugin prefix all capital
        replace({
          regex: 'PREFIX',
          replacement: pluginPrefix.toUpperCase(),
          paths: [destination + '/' + pluginSlug],
          recursive: true,
          silent: true
        });

        //replace Author URI
        replace({
          regex: 'plugin_name',
          replacement: pluginNameInstance,
          paths: [destination + '/' + pluginSlug + '/' + pluginSlug + '.php'],
          recursive: true,
          silent: true
        });

        //Replace done ZIP it

        var zip = new EasyZip();

        zip.zipFolder(destination + '/' + pluginSlug, function () {
          zip.writeToResponse(res, pluginSlug);
        });
      });
    });
  }); //END ROUTE

/**
 * CRON JOB TO GET NEW CODE FROM GITHUB EVERY DAY AT 1:30AM
 */
var job = new CronJob(
  '30 1 * * *',
  function () {
    //GET FRESH CODE
    getSourceCode();
  },
  true,
  'America/Los_Angeles'
);

job.start();

/**
 * CRON JOB TO CLEAN THE TMP FOLDER EVERY HOUR
 */

var clean = new CronJob(
  '0 * * * *',
  function () {
    var destination = process.cwd() + '/tmp/';
    rimraf(destination, function () { });
  },
  true,
  'America/Los_Angeles'
);

clean.start();

/**
 * GET PLUGIN CODE FROM GITHUB
 */
var getSourceCode = function () {
  var repo = {
    user: 'MehbubRashid',
    repo: 'WordPress-Plugin-Boilerplate',
    ref: 'master'
  };

  var destination = process.cwd() + '/source/';

  //DELETE OLD CODE
  rimraf(destination, function () { });

  //GET THE NEW CODE FORM THE REPO
  ghdownload(repo, destination)
    .on('zip', function (zipUrl) {
      console.log('zip: ' + zipUrl);
    })

    .on('error', function (err) {
      console.error('error ' + err);
    })

    .on('end', function () {
      console.log('Finish Github Download ');
    });
};

/**
 * RECURSIVE WALKER TO GET ALL THE FILES IN DIRECTORY
 */
var walker = function (dir, done) {
  var results = [];

  fs.readdir(dir, function (err, list) {
    if (err) return done(err);

    var i = 0;

    (function next() {
      var file = list[i++];

      if (!file) return done(null, results);

      file = dir + '/' + file;

      fs.stat(file, function (err, stat) {
        if (stat && stat.isDirectory()) {
          walker(file, function (err, res) {
            results = results.concat(res);

            next();
          });
        } else {
          results.push(file);

          next();
        }
      });
    })();
  });
};

var capitalize = function (name) {
  var newName = '';
  name = name.replace(/-/gi, ' ');
  pieces = name.split(' ');
  pieces.forEach(function (word) {
    newName += word.charAt(0).toUpperCase() + word.slice(1) + ' ';
  });

  return newName.trim().replace(/ /gi, '_');
};

// On Init get initial code
getSourceCode();

//Start web app.
app.listen(app.get('port'), function () {
  console.log('Node app is running at localhost:' + app.get('port'));
});
