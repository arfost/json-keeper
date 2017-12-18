module.exports = class extends aTools.ParamsFromFileOrObject {
    constructor(params, source, typeName) {
        super(params)

        this.typeName = typeName;
        this.source = source;

        this.handles = this.source.getHandles(this.typeName, this.params.indexes)
        this.cache = []; //one day there will be a cache
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
            this.handles.then(handles=>{
                resolve(handles[id[0]].get(id[1]))
            })
        })
    }

    delete(id) { //should send the entity corresponding at this id
        return new Promise((resolve, reject) => {
            id = id.split("#")
            this.handles.then(handles=>{
                resolve(handles[id[0]].delete(id[1]))
            })
        })
    }

    count() { //should return the number of entity of this type currently in db
        return new Promise((resolve, reject) => {
            this.handles.then(handles=>{
                let counts = [];
                for (let handle of Object.values(handles)) {
                    counts.push(handle.count)
                }
                Promise.all(counts=>{
                    resolve(counts.reduce((agre, value)=>agre+value, 0))
                })
            })
        })
    }

    save(entity) { //should create or update an entity (depending on if the datas send as an id or not)
        return new Promise((resolve, reject) => {
            if (!this.handles) {
                reject(new Error("No handle avaible"))
            }
            this.handles.then(handles=>{
                
                if (entity.id) {
                    let id = entity.id.split("#")
                    handles[id[0]].update(entity, id[1]).then((backId)=>{
                        resolve(id[0]+ "#" +backId)
                    })
                } else {
                    let avaibleHandle = false;
                    for (let handle in handles) {
                        if (handles[handle].writeReady) {
                            avaibleHandle = true;
                            let activHandle = handles[handle];
                            activHandle.create(entity, this.params.indexes).then((id) => {
                                resolve(handle + "#" + id)
                            }).catch(e => {
                                //TODO add logger
                                reject(e)
                            })
                            break;
                        }
                    }
                    if (avaibleHandle === false) {
                        reject(new Error("No writable handle avaible. Creating new handle when one is full is not yet implemented"));
                    }
                }
            })
            
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