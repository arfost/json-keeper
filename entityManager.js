module.exports = class extends aTools.ParamsFromFileOrObject {
    constructor(params, source, name) {
        super(params)

        this.name = name;
        this.source = source;

        this.handles = this.source.getHandles(this.name)
        this.cache = [];

        if (this.params.indexes) {
            this.constructIndex(this.params.indexes)
        }

    }

    getAll() { //should send an array with all items, or a generator function if more than max entity param
        throw new Error("Not implemented yet")
    }

    getForValue(value) { //should send all items with corresponding values. See doc for advanced uses
        throw new Error("Not implemented yet")
    }

    getById(id) { //should send the entity corresponding at this id
        return new Promise((resolve, reject) => {
            id = id.split("#")
            resolve(this.handles[id[0]].get(id[1]))
        })
    }

    count() { //should return the number of entity of this type currently in db
        throw new Error("Not implemented yet")
    }

    save(entity) { //should create or update an entity (depending on if the datas send as an id or not)
        return new Promise((resolve, reject) => {
            if(Object.keys(this.handles).length ===0){
                reject(new Error("No handle avaible"))
            }
            let avaibleHandle = false;
            let pouet = ""
            for (let handle in this.handles) {
                if (this.handles[handle].writeReady) {
                    avaibleHandle = true;
                    let activHandle = this.handles[handle];
                    activHandle.push(entity, this.params.indexes).then((id, indexes) => {
                        for (let index in indexes) {
                            for (let value in indexes[index]) {
                                this.masterIndexes[index][value] ? this.masterIndexes[index][value] = [...this.masterIndexes[index][value], ...values[value]] : this.masterIndexes[index][value] = values[value];
                            }
                        }
                        resolve(id)
                    }).catch(e=>{
                        //TODO add logger
                        reject(e)
                    })
                    break;
                }
            }
            if(avaibleHandle === false){
                reject(new Error("No writable handle avaible " + pouet + "::"));
            }
        })
    }

    constructIndex(indexes) {
        this.masterIndexes = {};
        let allIndexes = [];
        for (let index of indexes) {
            this.masterIndexes[index] = {}
            for (let handle in this.handles) {
                allIndexes.push(
                    this.handles[handle].idForIndex(index).then(values => {
                        for (let val in values) {
                            this.masterIndexes[index][val] ? this.masterIndexes[index][val] = [...this.masterIndexes[index][val], ...values[val]] : this.masterIndexes[index][val] = values[val];
                        }
                    }).catch(() => {
                        //TODO proper error gestion (send logger from parent if exist, or fail)
                    })
                )
            }
        }
        Promise.all(allIndexes).then(() => {
            this.indexesReady = true;
        })
    }

    //methods for ParamsFromFileOrObject
    get neededParams() {
        return []
    }

    get className() {
        return "EntityManager"
    }
}