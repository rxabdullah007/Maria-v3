'use strict';
const utils = require('./utils');
global.Fca = {
    isThread: [],
    isUser: [],
    startTime: Date.now(),
    Setting: new Map(),
    Version: require('./package.json').version,
    Require: {
        fs: require("fs"),
        Fetch: require('got'),
        log: require("npmlog"),
        utils: require("./utils.js"),
        logger: require('./logger.js'),
        languageFile: require('./Language/index.json'),
        Security: require('./Extra/Src/uuid.js')
    },
    getText: function(...Data) {
        let Main = Data.splice(0,1).toString();
        for (let i = 0; i < Data.length; i++) Main = Main.replace(RegExp(`%${i + 1}`, 'g'), Data[i]);
        return Main;
    },
    Data: {
        ObjFastConfig: {
            Language: "en",
            PreKey: "",
            AutoUpdate: true,
            MainColor: "#9900FF",
            MainName: "[ MARIA-FCA ]",
            Uptime: false,
            Config: "default",
            DevMode: false,
            Login2Fa: false,
            AutoLogin: false,
            BroadCast: true,
            AuthString: "SD4S XQ32 O2JA WXB3 FUX2 OPJ7 Q7JZ 4R6Z | https://i.imgur.com/RAg3rvw.png",
            EncryptFeature: true,
            ResetDataLogin: false,
            AntiSendAppState: true,
            AutoRestartMinutes: 0,
            RestartMQTT_Minutes: 0,
            Websocket_Extension: { Status: false, ResetData: false, AppState_Path: "appstate.json" },
            HTML: { HTML: true, UserName: "Guest", MusicLink: "" },
            AntiGetInfo: { Database_Type: "default", AntiGetThreadInfo: true, AntiGetUserInfo: true },
            Stable_Version: { Accept: false, Version: "" },
            CheckPointBypass: { 956: { Allow: false, Difficult: "Easy", Notification: "Turn on with AutoLogin!" } },
            AntiStuckAndMemoryLeak: {
                AutoRestart: { Use: true, Explain: "Auto restart if memory >90% to avoid freeze." },
                LogFile: { Use: false, Explain: "Record memory usage logs. Default: Maria_Database/memory.logs" }
            }
        },
        CountTime: function() {
            const fs = global.Fca.Require.fs;
            let hours = 0;
            if (fs.existsSync(__dirname + '/CountTime.json')) {
                try { 
                    const data = Number(fs.readFileSync(__dirname + '/CountTime.json', 'utf8'));
                    hours = Math.floor(data / 3600);
                } catch { fs.writeFileSync(__dirname + '/CountTime.json', 0); hours = 0; }
            }
            return `${hours} Hours`;
        }
    },
    Action: async function(Type, ctx, Code, defaultFuncs) {
        switch(Type) {
            case "AutoLogin": {
                const Database = require('./Extra/Database');
                const logger = global.Fca.Require.logger;
                const Email = Database().get('Account').replace(/"/g,'');
                const PassWord = Database().get('Password').replace(/"/g,'');
                require('./Main')({ email: Email, password: PassWord }, async (error, api) => {
                    if (error) logger.Error(JSON.stringify(error,null,2), () => logger.Error("AutoLogin Failed!", ()=>process.exit(0)));
                    try { Database().set("TempState", Database().get('Through2Fa')); } 
                    catch(e) { logger.Warning(global.Fca.Require.Language.Index.ErrDatabase); logger.Error(); process.exit(0); }
                    process.exit(1);
                });
            } break;

            case "Bypass": {
                const Bypass_Module = require(`./Extra/Bypass/${Code}`);
                const logger = global.Fca.Require.logger;
                if (Code === 956) {
                    async function P1() {
                        return new Promise((resolve, reject) => {
                            try {
                                utils.get('https://www.facebook.com/checkpoint/828281030927956/', ctx.jar, null, ctx.globalOptions)
                                .then(data => resolve(Bypass_Module.Check(data.body)))
                                .catch(err => reject(err));
                            } catch (error) { reject(error); }
                        });
                    }
                    try {
                        const test = await P1();
                        if (test) {
                            const resp = await Bypass_Module.Cook_And_Work(ctx, defaultFuncs);
                            if (resp === true) return logger.Success("Bypassing 956 successfully!", ()=>process.exit(1));
                            else return logger.Error("Bypass 956 failed! DO YOURSELF :>", ()=>process.exit(0));
                        }
                    } catch { logger.Error("Bypass 956 failed! DO YOURSELF :>", ()=>process.exit(0)); }
                }
            } break;

            default: require('npmlog').Error("Invalid Message!");
        }
    }
};

// FastConfig Load & Validation
try {
    const fs = global.Fca.Require.fs;
    const pathConfig = process.cwd() + '/FastConfigFca.json';
    const Boolean_Fca = ["AntiSendAppState","AutoUpdate","Uptime","BroadCast","EncryptFeature","AutoLogin","ResetDataLogin","Login2Fa", "DevMode"];
    const String_Fca = ["MainName","PreKey","Language","AuthString","Config"];
    const Number_Fca = ["AutoRestartMinutes","RestartMQTT_Minutes"];
    const Object_Fca = ["HTML","Stable_Version","AntiGetInfo","Websocket_Extension", "CheckPointBypass", "AntiStuckAndMemoryLeak"];
    const All_Variable = Boolean_Fca.concat(String_Fca,Number_Fca,Object_Fca);

    if (!fs.existsSync(pathConfig)) { fs.writeFileSync(pathConfig, JSON.stringify(global.Fca.Data.ObjFastConfig,null,'\t')); process.exit(1); }

    let Data_Setting;
    try { Data_Setting = require(pathConfig); } 
    catch(e) { global.Fca.Require.logger.Error('Invalid FastConfig, restoring default'); fs.writeFileSync(pathConfig, JSON.stringify(global.Fca.Data.ObjFastConfig,null,'\t')); process.exit(1); }

    // Fill missing vars
    for (let i of All_Variable) if (Data_Setting[i] === undefined) Data_Setting[i] = global.Fca.Data.ObjFastConfig[i];

    // Type checking
    for (let i in Data_Setting) {
        if (Boolean_Fca.includes(i) && utils.getType(Data_Setting[i])!=="Boolean") logger.Error(i+" must be Boolean", ()=>process.exit(0));
        else if (String_Fca.includes(i) && utils.getType(Data_Setting[i])!=="String") logger.Error(i+" must be String", ()=>process.exit(0));
        else if (Number_Fca.includes(i) && utils.getType(Data_Setting[i])!=="Number") logger.Error(i+" must be Number", ()=>process.exit(0));
        else if (Object_Fca.includes(i) && utils.getType(Data_Setting[i])!=="Object") Data_Setting[i] = global.Fca.Data.ObjFastConfig[i];
    }

    // Language validation
    if (!global.Fca.Require.languageFile.some(i=>i.Language==Data_Setting.Language)) {
        global.Fca.Require.logger.Warning("Unsupported Language: "+Data_Setting.Language+" Only 'en' and 'vi'");
        process.exit(0);
    }
    global.Fca.Require.Language = global.Fca.Require.languageFile.find(i=>i.Language==Data_Setting.Language).Folder;
    global.Fca.Require.FastConfig = Data_Setting;

} catch(e) { console.log(e); global.Fca.Require.logger.Error(); }

// Export login wrapper
module.exports = function(loginData, options, callback) {
    const login = require('./Main');
    require('./Extra/Database');

    try {
        login(loginData, options, function(err, api) {
            if (err) return callback(err);

            try { api.createAITheme = require("./createAITheme")(api.defaultFuncs||api._defaultFuncs||api, api, api.ctx||api._ctx||{}); }
            catch(e) { console.error("Failed to load createAITheme:", e); }

            try { api.setThreadThemeMqtt = require("./setThreadThemeMqtt")(api.defaultFuncs||api._defaultFuncs||api, api, api.ctx||api._ctx||{}); }
            catch(e) { console.error("Failed to load setThreadThemeMqtt:", e); }

            return callback(null, api);
        });
    } catch(e) { console.log(e); }
};
