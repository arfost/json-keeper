var EntityManager = require('./entityManager.js')
var FileSource = require('./fileSource.js')



module.exports = class extends aTools.ParamsFromFileOrObject {
    constructor(params){
        super(params)
    }

    getHandles(){

    }

    //methods for ParamsFromFileOrObject
    get neededParams(){
        return [
            "basePath"
        ]
    }

    get className(){
        return "FileSource"
    }
}