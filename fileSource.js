var EntityManager = require('./entityManager.js')
var FileSource = require('./fileSource.js')

class Handle {

    constructor(path, name) {
        this.path = path;
        this.name = name;

        try{
            this.datas = require(this.path + '#' + this.name + '.json')
        }catch(e){
            this.datas = {}
            fs.writeFileSync(this.path + '#' + this.name + '.json', JSON.stringify({}));
        }
        
    }

    get(id) {
        return this.datas[id]
    }

    push(data, indexes) {
        return new Promise((resolve, reject) =>{
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
                fs.writeFileSync(this.path + '#' + this.name + '.json', JSON.stringify(this.datas));
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

    get count() {
        return Object.keys(this.datas).length;
    }

    get writeReady() {
        return this.count < 5000
    }
}

module.exports = class extends aTools.ParamsFromFileOrObject {
    constructor(params) {
        super(params)
        try{
            this.config = require(this.params.basePath + "config.json");
        }catch(e){
            this.config = {}
            this._saveConfig()
        }
    }

    getHandles(entity) {
        var h = {};

        if (this.config[entity]) {
            for (let handle of this.config[entity]) {
                h[handle] = new Handle(this.params.basePath + entity, handle)
            }
        } else {
            let name = this._getHanldeId();
            h[name] = new Handle(this.params.basePath + entity, name);
            this.config[entity] = [name];
            this._saveConfig();
        }

        return h
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

    _saveConfig(){
        return new Promise((resolve, reject)=>{
            try{
                fs.writeFileSync(this.params.basePath + "config.json", JSON.stringify(this.config));
            }catch(e){
                //TODO logger and proper fail logic
            }
        })
        
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