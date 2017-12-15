var EntityManager = require('./entityManager.js')
var FileSource = require('./fileSource.js')



module.exports = class extends aTools.ParamsFromFileOrObject {
    constructor(params){
        super(params)

        this.source = new FileSource(this.params.source)

        if(this.params.logConfigFile){
            this.logger = require('stealthLog')(this.params.logConfigFile)("baseLogger")
        }

        this.entities = {};
        for(let entityType in this.params.entities){
            try{
                this.entities[entityType] = new EntityManager(this.params.entities[entityType], this.source, entityType)
            }catch(e){
                if(this.logger){
                    this.logger.error("can't create entity "+entityType+" :"+ e.message)
                }else{
                    throw new Error("can't create entity "+entityType+" :"+ e.stack)
                }
            }
        }
    }

    get entityList(){
        return Object.keys(this.entities)
    }

    getAll(type){ //should send an array with all items, or a generator function if more than max entity param
        if(this.logger){
            this.logger.info('getAll for type '+type)
        }
        return this.entities[type].getAll()
    }

    getForValue(type, value){ //should send all items with corresponding values. See doc for advanced uses
        if(this.logger){
            this.logger.info('getForValue for type '+type+' with value :', value)
        }
        return this.entities[type].getForValue(value)
    }

    getById(type, id){ //should send the entity corresponding at this id
        if(this.logger){
            this.logger.info('getById for type '+type+' with id :', id)
        }
        return this.entities[type].getById(id)
    }

    deleteEntity(type, id){ //should send the entity corresponding at this id
        if(this.logger){
            this.logger.info('delete for type '+type+' with id :', id)
        }
        return this.entities[type].delete(id)
    }

    count(type){ //should return the number of entity of this type currently in db
        if(this.logger){
            this.logger.info('count for type '+type)
        }
        return this.entities[type].count()
    }

    save(type, entity){ //should create or update an entity (depending on if the datas send as an id or not)
        if(this.logger){
            this.logger.info('save for type '+type+' with entity :', entity)
        }
        return this.entities[type].save(entity)
    }

    //methods for ParamsFromFileOrObject
    get neededParams(){
        return [
            "source",
            "entities"
        ]
    }

    get className(){
        return "Base"
    }
}