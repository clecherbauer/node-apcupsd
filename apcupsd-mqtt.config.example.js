module.exports = {
    apps: [{
        name: 'apcupsd-mqtt',
        script: './app.js',
        env: {
            MQTT_URL: 'mqtt://localhost',
        }
    }]
};