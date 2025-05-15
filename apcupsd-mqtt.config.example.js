const path = require('path');
const baseDir = path.resolve(__dirname);

module.exports = {
    apps: [{
        name: 'apcupsd-mqtt',
        script: './app.js',
        cwd: baseDir,
        env: {
            MQTT_URL: 'mqtt://localhost',
        }
    }]
};


