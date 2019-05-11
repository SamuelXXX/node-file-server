'use strict'
var fs = require("fs");

/**
 * Server config container
 */
const serverConfig={
    /**
     * Parse server config file
     * @param {string} configPath 
     */
    parseServerConfig:function(configPath)
    {
        console.log("Parsing server config");
        if (!fs.existsSync(configPath)) {
            console.log("No 'ServerConfig.cfg' found under server directory, will use default server configure.");
            return;
        }

        var configItems = fs.readFileSync(configPath).toString().split('\r\n');
        var configPatt=/^\s*[A-Za-z]{2,}\s*=[^=#\n]+($|#)/i;//pattern for a config item
        var configCommentLinePatt=/^\s*#.*$/i;//pattern for comment line
        
        try {
            for (var i = 0; i < configItems.length; i++) {
                if(configPatt.test(configItems[i]))//Is a config line
                {
                    var configKey=configItems[i].split("=")[0].trim().replace(/[\t\f\r]+/,"");
                    var configValue=configItems[i].split("=")[1].trim().replace(/[\t\f\r]+/,"");
                    var configComment="";

                    if(/#/.test(configValue))
                    {
                        configComment=configValue.slice(configValue.indexOf('#'),configValue.length);
                        configValue=configValue.slice(0,configValue.indexOf('#')); 
                        configValue=configValue.trim();
                    }
                    serverConfig[configKey] = configValue;
                }
            }
        }
        catch (e) {
            console.error("'ServerConfig.cfg' read exception!!!");
        }
    },

    root:"./www",
    port:"80",

    maxPartialResponse:"524288",
};

serverConfig.parseServerConfig("ServerConfig.cfg");
module.exports=serverConfig;