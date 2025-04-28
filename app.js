/*

   App to poll an APC UPS (via apcupsd) and publish interesting values to MQTT.
   Published under MIT license by Ron Klinkien <ron@cyberjunky.nl>
   Copyright (C) 2014 The Netherlands

*/

'use strict';
var topic = 'ups'; // topic basename
var devicename = 'apc-ups'; // default, will be overwritten with upsname value
var pollint = 10000; // poll every 10 seconds, only changed values will be published

var exec = require('child_process').exec;
var mqtt = require('mqtt');
var mqttClient = mqtt.connect("mqtt://localhost")
var curvalues = {}; // holds current values

function executeCmd(cmd, callback) {

    exec(cmd, function (err, stdout, stderror) {
      if (err) {
        callback(err);
      } 
      else if (stderror) {
        callback(stderror);
      }
      else {
        if (stdout) {
          callback(null,stdout);
        } 
        else {
          callback(null, null);
        }
      }
    });
}

function poll() {

    var wanted = ['upsname', 'serialno', 'status', 'linev', 'linefreq', 'loadpct', 'battv', 'bcharge', 'timeleft'];

    executeCmd('apcaccess', function(err, response) {
      if (err) {
        console.error(err);
      }
      else {
        var lines = response.trim().split("\n");

        lines.forEach(function (line) {
          var stats = line.split(' : ');
          var label = stats[0].toLowerCase();
          var value = stats[1];

          // remove surrounding spaces
          label = label.replace(/(^\s+|\s+$)/g, '');
          if (wanted.indexOf(label) > -1) {
            value = value.replace(/(^\s+|\s+$)/g, '');
            if (label == 'upsname') {
              devicename = value;
            }
            if (curvalues[label] != value) {
              curvalues[label] = value;
              mqttClient.publish(topic+'/'+devicename+'/'+label, value, {retain: true});
              if (err) throw err;
            }
          }
        });
        mqttClient.publish(topic+'/'+devicename+'/last-update', new Date().toISOString(), {retain: true});
      }
      setTimeout(poll, pollint);
    })
}

// start plugin
function main() {

    console.log('Started APCUPSD monitor');
    poll();
}
main();
