#!/usr/bin/env node
var program = require('commander');
const http = require('http');
var Commands = require('./js/commands');
var Devices = require('./js/getDevices');
var Setup = require('./js/setup');
const hostname = '127.0.0.1';
const port = 3000;
var git = require("nodegit");
var mkdirp = require('mkdirp');
var ProgressBar = require('progress');
var pjson = require('./package.json');
var TestFeed = require('./js/testfeed');
var del = require('del');
var colors = require('colors/safe');
var inits = require('inits');
var express = require('express');
var open = require('opn');
var path = require('path');
var fs = require('fs');

inits.options.logTimes=false;
inits.options.showErrors=false;
inits.init(function(callback) {
  new Setup().instDeps();
  callback();
});

function createproject(args,callback) {
  var projectfolder;
  if(args.includes(" ")) {
    projectfolder = args.replace(" ","");
  } else {
   projectfolder = args;
  }
  fs.stat(projectfolder, function(err,callback){
    if(err) {
      process.stdout.write(colors.magenta("creating project '"+projectfolder+"'.."));
      mkdirp(projectfolder, function (err) {
          if (err) console.error(err)
      });
      var projCreated;
      var obj = git.Clone("https://github.com/testvagrant/optimusTemplate.git",projectfolder,{}).then(function (repo) {
        del([projectfolder+"/.git"]);
        del([projectfolder+"/docs"]);
        projCreated = true;
        console.log(colors.green("\nCreated project '"+projectfolder+"'"));
    }).catch(function (err) {
        console.log(err);
    });
    var bar = new ProgressBar('Estimated time to download :total, time elapsed so far :elapsed', {
        complete: '=',
        incomplete: ' ',
        width: 20,
        total: 20000
      });
    var iv = setInterval(function () {
      if(projCreated===undefined) {
      // bar.tick();
      process.stdout.write(colors.magenta("."));

    }
      if (projCreated!=undefined) {
        clearInterval(iv);
      }
    }, 350);

     function progress() {
       iv;
     }
   } else {
     console.log(colors.red('Error: Project '+ projectfolder+' is already present in this directory. Create project with a different name.'));
   }
  });

}

function createtestfeed(args,callback) {
  var app = express();
  app.use(express.static(path.join(__dirname, 'web')))
  app.listen(3000);
  open('http://localhost:3000/testfeed.html');
}

function doctor(args,callback) {
    var commands = new Commands();
    commands.verifyJava();
    commands.verifyAppium();
    commands.verifyMongoDB();
    commands.verifyAPT();
    commands.verifyXcode();
    commands.verifyGradle();
}

function setup(args,callback) {
    var commands = new Commands();
    commands.installJava();
    commands.installAppium();
    commands.installMongoDB();
    commands.installAPT();
    commands.installFBSimctl();
    commands.installGradle();
}

function getAndroidDevices(args,callback) {
  var commands = new Devices();
  commands.getAndroidDevices();
}

function getIOSDevices(args,callback) {
  var commands = new Devices();
  commands.getIOSDevices();
}

function getAllConnectedDevices(args,callback) {
  var commands = new Devices();
  commands.getAllConnectedDevices();
}
function appVersion(args,callback) {
  console.log(pjson.version);
}

program
  .command('new <project_name>')
  .description('creates a new optimus project')
  .action(createproject);

program
  .command('testfeed')
  .description('Create a testfeed for the project')
  .action(createtestfeed);

program
  .command('doctor')
  .description('verifies the workspace for dependencies')
  .action(doctor);

program
  .command('setup')
  .description('sets up the optimus environment')
  .action(setup);

program
  .option('-v','--version',appVersion)
  .description('get the optimus version')
  .action(appVersion);

program
  .command('getandroiddevices')
  .description('get all the connected android devices')
  .action(getAndroidDevices);

program
  .command('getiosdevices')
  .description('get all the connected iOS devices')
  .action(getIOSDevices);

program
  .command('getallconnecteddevices')
  .description('get all the connected devices')
  .action(getAllConnectedDevices);

program.parse(process.argv);
