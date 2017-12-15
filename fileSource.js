var EntityManager = require('./entityManager.js')
var FileSource = require('./fileSource.js')

class Handle {

    constructor(path, name) {
        this.path = path;
        this.name = name;

        this.datas = this._readFile().then(datas=>{
            this.datas = datas;
            this.pendingDatas = null;
        }).catch((e)=>{
            this.datas = {}
            this._saveFile()
        })

    }

    get(id) {
        return new Promise((res, rej)=>{
            if(this.datas instanceof Promise){
                this.datas.then(datas=>{
                    res(this.datas[id])
                }).catch((e)=>{
                    rej(e)
                })
            }else{
                res(this.datas[id])
            }
        })
    }

    create(data, indexes) {
        return new Promise((resolve, reject) => {
            try {
                var id = Date.now();

                if (id <= this.previous) {
                    id = ++this.previous;
                } else {
                    this.previous = id;
                }

                if (this.previous === Number.MAX_SAFE_INTEGER) { this.previous = 0 };

                if (this.datas[id]) {
                    throw new Error("Already existing ID generated")
                }

                this.datas[id] = data;
                this._saveFile().then(()=>{
                    resolve(id)
                }).catch(e=>{
                    reject(err);
                })
            } catch (err) {
                reject(err);
            }
        });
    }

    update(data, indexes, id) {
        return new Promise((resolve, reject) => {
                this.datas[id] = data;
                this._saveFile()
                resolve(id)
        });
    }

    delete(id, indexes) {
        return new Promise((resolve, reject) => {
            try {
                delete this.datas[id];
                this._saveFile()
                resolve(id)
            } catch (err) {
                reject(err);
            }
        });
    }

    _IndexesForEntity(entity, indexes) {

    }

    idForIndex(index) {

    }

    _saveFile() {
        return new Promise((resolve, reject) => {
            fs.writeFile(this.path + '#' + this.name + '.json', JSON.stringify(this.datas), (e) => {
                if (e) {
                    reject(e)
                } else {
                    resolve()
                }
            });
        })
    }

    _readFile() {
        return new Promise((resolve, reject) => {
            fs.readFile(this.path + '#' + this.name + '.json', function (err, data) {
                if (err) {
                    reject(err)
                } else {
                    resolve(JSON.parse(data))
                }
            });
        })
    }

    get count() {
        return (Object.keys(this.datas).length);
    }

    get writeReady() {
        return true
    }
}

module.exports = class extends aTools.ParamsFromFileOrObject {
    constructor(params) {
        super(params)
        try{
            this.config = this._readConfig();
        }catch(e){
            this.config = {};
            this._saveConfig();
        }
        
    }

    getHandles(entity) {
        return new Promise((res, rej)=>{
            var h = {};
            
                    if (this.config[entity]) {
                        for (let handle of this.config[entity]) {
                            h[handle] = new Handle(this.params.basePath + entity, handle)
                        }
                    } else {
                        let name = this._getHanldeId();
                        h[name] = new Handle(this.params.basePath + entity, name);
                        this.config[entity] = [name];
                        this._saveConfig().catch((e)=>{
                            throw new Error("Config can't be save")
                        });
                    }
            
                    res(h)
        })
    }

    _getHanldeId() {
        var id = Date.now();

        if (id <= this.previous) {
            id = ++this.previous;
        } else {
            this.previous = id;
        }

        if (this.previous === Number.MAX_SAFE_INTEGER) { this.previous = 0 };
        return id;
    }

    _saveConfig() {
        return new Promise((resolve, reject) => {
            fs.writeFile(this.params.basePath + "config.json", JSON.stringify(this.config), (e) => {
                if (e) {
                    reject(e)
                } else {
                    resolve()
                }
            });
        })
    }

    _readConfig() {
        return JSON.parse(fs.readFileSync(this.params.basePath + "config.json"));
    }

    //methods for ParamsFromFileOrObject
    get neededParams() {
        return [
            "basePath"
        ]
    }

    get className() {
        return "FileSource"
    }
}