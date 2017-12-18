var EntityManager = require('./entityManager.js')
var FileSource = require('./fileSource.js')

class Handle {

    constructor(path, name) {
        this.path = path;
        this.name = name;

        this.datas = this._readFile()

    }

    get(id) {
        return new Promise((res, rej)=>{
            this.datas.then(datas=>{
                res(datas[id])
            }).catch((e)=>{
                rej(e)
            })
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

                this.datas.then(datas=>{
                    datas[id] = data;
                    this._saveFile(datas).then(()=>{
                        resolve(id)
                        
                    }).catch(e=>{
                        reject(err);
                    })
                });
                
            } catch (err) {
                reject(err);
            }
        });
    }

    update(data, id) {
        return new Promise((resolve, reject) => {
            this.datas.then(datas=>{
                datas[id] = data;
                this._saveFile(datas).then(()=>{
                    resolve(id)
                }).catch(e=>{
                    reject(err);
                })
            });
        });
    }

    delete(id) {
        return new Promise((resolve, reject) => {
            this.datas.then(datas=>{
                delete datas[id];
                this._saveFile(datas).then(()=>{
                    resolve(id)
                }).catch(e=>{
                    reject(err);
                })
            });
        });
    }

    _IndexesForEntity(entity, indexes) {

    }

    idForIndex(index) {

    }

    _saveFile(datas) {
        return new Promise((resolve, reject) => {
            fs.writeFile(this.path + '#' + this.name + '.json', JSON.stringify(datas), (e) => {
                if (e) {
                    reject(e)
                } else {
                    this.datas = this._readFile()
                    resolve()
                }
            });
        })
    }

    _readFile() {
        return new Promise((resolve, reject) => {
            fs.readFile(this.path + '#' + this.name + '.json',  (err, data) =>{
                if (err) {
                    this._saveFile({}).then(()=>{
                        resolve({})
                    })
                } else {
                    resolve(JSON.parse(data))
                }
            });
        })
    }

    get count() {
        return new Promise((resolve, reject) => {
            this.datas.then(datas=>{
                resolve(Object.keys(datas).length)
            });
        });
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

    getHandles(entity, indexes) {
        return new Promise((res, rej)=>{
            var h = {};
            
                    if (this.config[entity]) {
                        for (let handle of this.config[entity]) {
                            h[handle] = new Handle(this.params.basePath + entity, handle, indexes)
                        }
                    } else {
                        let name = this._getHanldeId();
                        h[name] = new Handle(this.params.basePath + entity, name, indexes);
                        this.config[entity] = [name];
                        this._saveConfig().then(()=>{
                            res(h)
                        }).catch((e)=>{
                            throw new Error("Config can't be save")
                        });
                    }
            
                    
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