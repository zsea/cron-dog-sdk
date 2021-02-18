const cron = require('node-cron')
    , axios = require("axios")
    , sleep = require("sleep")
    ;
var cronId = 0, runings = {};
function CronDog({ name, group, server, token }) {
    Object.defineProperty(this, "__server", {
        value: server,
        writable: false
    });
    Object.defineProperty(this, "__handler", {
        value: {},
        writable: false
    });
    let id = cronId++;
    Object.defineProperty(this, "__Instance", {
        value: id,
        writable: false
    });
    Object.defineProperty(this, "__tasks", {
        value: {},
        writable: false
    });
    Object.defineProperty(this, "Token", {
        value: token,
        writable: false
    });
    Object.defineProperty(this, "Name", {
        value: name,
        writable: false
    });
    Object.defineProperty(this, "Group", {
        value: group,
        writable: false
    });
    Object.defineProperty(this, "IsRuning", {
        get: function () {
            return runings[id] === true
        },
        writable: false
    });
}
async function Start(dog) {
    runings[dog.__Instance] = true;
    let st = 10;
    while (runings[dog.__Instance]) {
        let response = await axios.post(`${this.__server}/heart`, {
            instance: {
                name: dog.Name,
                group: dog.Group
            },
            handlers: dog.__handler
        }, { validateStatus: function () { return true }, headers: { "x-token": dog.Token } });
        if (response.status !== 200) {
            await sleep(100);
            continue;
        }
        //解析指令
        let tasks = response.data || [];
        await sleep(st * 1000);
    }
}
CronDog.prototype.AddType = function (type, callback) {
    this.__handler[type] = callback;
}
CronDog.prototype.Start = function () {
    //开始执行心跳与服务器通信等命令
    Start(this);
    for (let tid in this.__tasks) {
        let task = this.__tasks[tid];
        if (task) {
            task.start();
        }
    }
}
CronDog.prototype.Stop = function () {
    runings[this.__Instance] = false;
    for (let tid in this.__tasks) {
        let task = this.__tasks[tid];
        if (task) {
            task.stop();
        }
    }
}
CronDog.prototype.Destroy = function () {
    delete runings[this.__Instance];
    for (let tid in this.__tasks) {
        let task = this.__tasks[tid];
        if (task) {
            task.destroy();
        }
    }
}
module.export = CronDog;