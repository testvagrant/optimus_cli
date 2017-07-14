#!/usr/bin/env node
const cmd=require('node-cmd');
var logSymbols = require('log-symbols');
var Table = require('console.table');


module.exports = function Devices(){
  var error;
  var devices = [];
  var deviceDetails= {};

  this.getDeviceDetails = new Promise(
    function(resolve,reject) {
      cmd.get(
              `adb devices -l > devicesList
               cat devicesList | grep -E -o "[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}:[0-9]{1,4}"
               cat devicesList | grep -E -o "([a-zA-Z0-9]){7,8}\\s\\s"
               rm devicesList
              `
      , function(data,err){
        if(err){
          var reason = new Error('No devices(s) found !');
          return reject(reason);
        }
        deviceList = data.split('\n');
        for(i=0; i<deviceList.length-1; i++){
             deviceDetails = {
              udid: deviceList[i]
             };
          devices.push(deviceDetails);
        }
        resolve(devices);
      });
  });

  this.getType = function(devices){
    return new Promise(
      function (resolve,reject){
        var emulatorPattern = new RegExp('^([0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}:[0-9]{1,4})$');
        var mobileDevicePattern = new RegExp('^([a-zA-Z0-9]){7,8}\\s\\s$');
          for(i=0; i<devices.length; i++){
              if(emulatorPattern.test(devices[i].udid)){
                devices[i].type = 'Emulator';
              }
              else if(mobileDevicePattern.test(devices[i].udid)){
                devices[i].type = 'Mobile Device';
              }
          }
           resolve(devices);
      }
    );
  };
}
