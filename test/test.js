const assert = require('assert');
const jsonKeeper = require('../index.js')
const path = require('path');


const baseConfig = {
    "source": {
        "basePath": "./test-base/"
    },
    "entities": {
        "user": {},
        "goat": {}
    }
}

const emptyBase = function (directory) {
    let files = fs.readdirSync(directory);
    for (const file of files) {
        fs.unlinkSync(path.join(directory, file));
    }

}
describe('json keeper', function () {


    describe('testing fileSource operations', function () {

        let FileSource = require("../fileSource.js");
        let fileSource;
        let testDataId;
        let hid;

        before(function(){
            emptyBase(baseConfig.source.basePath)
        })
        it('should create a new FileSource object', function(){
            fileSource = new FileSource(baseConfig.source);
            assert(Object.getOwnPropertyNames(fileSource.config).length === 0, "Config is not an empty object "+JSON.stringify(fileSource.config))
        });
        it('should get on handle', function(done){
            let pro = fileSource.getHandles("test")
            pro.then(handles=>{
                hid = Number(Object.keys(handles)[0]);
                assert.deepStrictEqual(fileSource.config, {"test":[hid]}, 'base config didn\'t take new handle into account : '+JSON.stringify(fileSource.config))
                done()
            }).catch(e=>{
                done(e)
            })
        });

        it('should add datas to the handle', function(done){
            let pro = fileSource.getHandles("test")
            pro.then(handles=>{
                handles[hid].create({
                    data:'value',
                    data2:'value2'
                }).then(id=>{
                    handles[hid].datas.then(datas=>{
                        let temoin = {}
                        temoin[id] = {
                            data:'value',
                            data2:'value2'
                        };
                        assert.deepStrictEqual(datas, temoin, 'Datas doesn\'t contains expected value : '+JSON.stringify(datas))
                        done()
                    }).catch(e=>{
                        done(e)
                    })
                }).catch(e=>{
                    done(e)
                })
            }).catch(e=>{
                done(e)
            })
        });
        it('should count the datas in the handler', function(done){
            let pro = fileSource.getHandles("test")
            pro.then(handles=>{
                handles[hid].count.then(count=>{
                    assert.equal(count, 1, "Count didn't return expected value : "+count)
                    done()
                }).catch(e=>{
                    done(e)
                })
            }).catch(e=>{
                done(e)
            })
        });

        it('should add new data in the handler', function(done){
            let pro = fileSource.getHandles("test")
            pro.then(handles=>{
                handles[hid].create({
                    data:'titi',
                    data2:'titi2'
                }).then(id=>{
                    handles[hid].datas.then(datas=>{
                        let temoin = {
                            data:'titi',
                            data2:'titi2'
                        };
                        testDataId = id;
                        assert.deepStrictEqual(datas[id], temoin, 'Datas doesn\'t contains expected value : '+JSON.stringify(datas))
                        done()
                    }).catch(e=>{
                        done(e)
                    })
                }).catch(e=>{
                    done(e)
                })
            }).catch(e=>{
                done(e)
            })
        });

        it('should count two now', function(done){
            let pro = fileSource.getHandles("test")
            pro.then(handles=>{
                handles[hid].count.then(count=>{
                    assert.equal(count, 2, "Count didn't return expected value : "+count)
                    done()
                }).catch(e=>{
                    done(e)
                })
            }).catch(e=>{
                done(e)
            })
        });

        it('should update datas in the handle', function(done){
            let pro = fileSource.getHandles("test")
            let oldData = JSON.parse(fs.readFileSync(baseConfig.source.basePath+'test#'+hid+'.json'))
            oldData[testDataId] = {
                data:'tutu',
                data2:'tutu2'
            }
            pro.then(handles=>{
                handles[hid].update({
                    data:'tutu',
                    data2:'tutu2'
                }, testDataId).then(id=>{
                    assert.deepStrictEqual(oldData, JSON.parse(fs.readFileSync(baseConfig.source.basePath+'test#'+hid+'.json')), "Count didn't return expected value : "+fs.readFileSync(baseConfig.source.basePath+'test#'+hid+'.json'))
                    done()
                }).catch(e=>{
                    done(e)
                })
            }).catch(e=>{
                done(e)
            })
        });

        it('should get datas in the handle', function(done){
            let pro = fileSource.getHandles("test")
            let oldData = JSON.parse(fs.readFileSync(baseConfig.source.basePath+'test#'+hid+'.json'))
            oldData[testDataId] = {
                data:'tutu',
                data2:'tutu2'
            }
            pro.then(handles=>{
                handles[hid].get(testDataId).then(data=>{
                    assert.deepStrictEqual(data, {
                        data:'tutu',
                        data2:'tutu2'
                    }, "Count didn't return expected value : "+data)
                    done()
                }).catch(e=>{
                    done(e)
                })
            }).catch(e=>{
                done(e)
            })
        });

        it('should delete datas in the hanlde', function(done){
            let pro = fileSource.getHandles("test")
            let oldData = JSON.parse(fs.readFileSync(baseConfig.source.basePath+'test#'+hid+'.json'))
            delete oldData[testDataId];
            pro.then(handles=>{
                handles[hid].delete(testDataId).then(id=>{
                    assert.deepStrictEqual(oldData, JSON.parse(fs.readFileSync(baseConfig.source.basePath+'test#'+hid+'.json')), "Count didn't return expected value : "+fs.readFileSync(baseConfig.source.basePath+'test#'+hid+'.json'))
                    done()
                }).catch(e=>{
                    done(e)
                })
            }).catch(e=>{
                done(e)
            })
        });
    });




    ////////////////////////////////////////////////////
    // global tests case

    
    describe('creation and configuration of a base', function () {
        before(function(){
            emptyBase(baseConfig.source.basePath)
        })
        it('should throw an error because of missing parameters', function () {
            assert.throws(
                () => jsonKeeper.newBase(),
                TypeError
            )
        });
        it('should fail because entities is ill formed', function () {
            assert.throws(
                () => jsonKeeper.newBase({
                    "source": {
                        "basePath": "./test-base/"
                    },
                    "entities": "fail"
                })
            )
        });
        it('should create the base', function () {
            assert.doesNotThrow(
                () => jsonKeeper.newBase(baseConfig),
                TypeError,
                "message recu :"
            )
        });
    });

    describe('testing the base basique read write operation', function () {
        let base;
        let testUser = {
            "firstname": "toto",
            "lastname": "roger",

            "age": "76"
        }
        let userId;
        before(function baseCreation() {
            emptyBase(baseConfig.source.basePath)
            base = jsonKeeper.newBase(baseConfig);
        })
        it('should find the entity user in entity list', function () {
            assert(base.entityList.indexOf("user") !== -1, "user entity should be present")
        });
        it('should find the entity goat in entity list', function () {
            assert(base.entityList.indexOf("goat") !== -1, "goat entity should be present")
        });
        it('should write the user and get an ID', function (done) {
            base.save("user", Object.assign({}, testUser)).then(id => {
                assert(id.indexOf('undefinded') === -1, "id ill formed : " + id);
                assert(id.indexOf('#') !== -1, "id ill formed : " + id);
                userId = id;
                done()
            }).catch(e => {
                done(e)
            });
        });
        it('should retrieve the user ' + userId, function (done) {
            base.getById("user", userId).then(user => {
                assert.deepEqual(user, testUser, "user different " + JSON.stringify(user));
                done()
            }).catch(e => {
                done(e)
            });
        });
        it('should retrieve the user after a base restart ' + userId, function (done) {

            base = null;

            base = jsonKeeper.newBase(baseConfig)

            base.getById("user", userId).then(user => {
                assert.deepEqual(user, testUser, "user different " + JSON.stringify(user));
                done()
            }).catch(e => {
                done(e)
            });
        });
        it('should count 1 entity user ', function (done) {

            base.count("user").then(count => {
                assert.equal(count, 1, "bad count result : " + JSON.stringify(count));
                done()
            }).catch(e => {
                done(e)
            });
        });
        it('should write a new user and get an ID', function (done) {
            let newUser = Object.assign({}, testUser);
            newUser.lastname = "roger2"
            base.save("user", newUser).then(id => {
                assert(id.indexOf('undefinded') === -1, "id ill formed : " + id);
                assert(id.indexOf('#') !== -1, "id ill formed : " + id);
                userId = id;
                done()
            }).catch(e => {
                done(e)
            });
        });
        it('should count 2 entity user after  1 insertion', function (done) {

            base.count("user").then(count => {
                assert.equal(count, 2, "bad count result : " + JSON.stringify(count));
                done()
            }).catch(e => {
                done(e)
            });
        });

        it('should update the user', function (done) {
            let update = Object.assign({}, testUser);
            update.lastname = "roger3"
            update.id = userId;
            base.save("user", update).then(id => {
                assert(id === userId, "got another id from base, creation instead of update " + id);
                done()
            }).catch(e => {
                done(e)
            });
        });

        it('should still count 2 entity user after  1 update', function (done) {

            base.count("user").then(count => {
                assert.equal(count, 2, "bad count result : " + JSON.stringify(count));
                done()
            }).catch(e => {
                done(e)
            });
        });
        it('should retrieve the user with modified values ' + userId, function (done) {
            base.getById("user", userId).then(user => {
                assert(user.lastname === "roger3", "not found expected value 'roger3' as lastname " + JSON.stringify(user));
                done()
            }).catch(e => {
                done(e)
            });
        });

        it('should suppress user ' + userId, function (done) {

            base.deleteEntity("user", userId).then(count => {
                done()
            }).catch(e => {
                done(e)
            });
        });
        it('should count 1 entity after deletion', function (done) {

            base.count("user").then(count => {
                assert.equal(count, 1, "bad count result : " + JSON.stringify(count));
                done()
            }).catch(e => {
                done(e)
            });
        });
    });
});