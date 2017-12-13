module.exports = class extends aTools.ParamsFromFileOrObject {
    constructor(params, source){
        super(params)

        this.source = source;
        this.cache = []
    }

    getAll(type){ //should send an array with all items, or a generator function if more than max entity param
        if(this.logger){
            this.logger.info('getAll for type '+type)
        }
        return this.entities[entityType].getAll()
    }

    getForValue(type, value){ //should send all items with corresponding values. See doc for advanced uses
        if(this.logger){
            this.logger.info('getForValue for type '+type+' with value :', value)
        }
        return this.entities[entityType].getForValue(value)
    }

    getById(type, id){ //should send the entity corresponding at this id
        if(this.logger){
            this.logger.info('getById for type '+type+' with id :', id)
        }
        return this.entities[entityType].getById(id)
    }

    count(type){ //should return the number of entity of this type currently in db
        if(this.logger){
            this.logger.info('count for type '+type)
        }
        return this.entities[entityType].count()
    }

    save(type, entity){ //should create or update an entity (depending on if the datas send as an id or not)
        if(this.logger){
            this.logger.info('save for type '+type+' with entity :', entity)
        }
        return this.entities[entityType].save(value)
    }
}