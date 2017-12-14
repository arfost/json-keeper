const assert = require('assert');
const jsonKeeper = require('../index.js')

describe('json keeper', function () {

    describe('creation and configuration of a base', function () {

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
                () => jsonKeeper.newBase({
                    "source": {
                        "basePath": "./test-base/"
                    },
                    "entities": {
                        "user": {},
                        "goat": {}
                    }
                })
            )
        });
    });

    describe('testing the base configuration', function () {
        let base;
        let user = {
            "firstname":"toto",
            "lastname":"roger",

            "age":"76"
        }
        let userId;
        before(function baseCreation(){
            base = jsonKeeper.newBase({
                "source": {
                    "basePath": "./test-base/"
                },
                "entities": {
                    "user": {},
                    "goat": {}
                }
            })

        })
        it('should find the entity user in entity list', function () {
            assert(base.entityList.indexOf("user") !== -1, "user entity should be present")
        });
        it('should find the entity goat in entity list', function () {
            assert(base.entityList.indexOf("goat") !== -1, "goat entity should be present")
        });
        it('should write the user and get an ID', function (done) {
            base.save("user", user).then(id=>{
                done()
            }).catch(e=>{
                done(e)
            });
        });
    });

});