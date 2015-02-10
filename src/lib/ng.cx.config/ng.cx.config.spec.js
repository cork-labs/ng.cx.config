describe('ng.cx.config', function () {
    'use strict';

    beforeEach(module('ng.cx.config'));

    describe('cxConfigProvider', function () {

        // helper variable for testing agument validation
        var dataTypes;
        beforeEach(function () {
            dataTypes = {
                'string': Math.random().toString(36),
                'null': null,
                'undefined': undefined,
                'integer': Math.round(Math.random()),
                'double': Math.random(),
                'boolean': false,
                'function': function () {},
                'object': {
                    someAttribute: 'someValue'
                }
            };
        });

        var cxConfigProvider;
        beforeEach(module(function (_cxConfigProvider_) {
            cxConfigProvider = _cxConfigProvider_;
        }));

        describe('get()', function () {

            // kickstart the injector http://stackoverflow.com/questions/15391683/how-can-i-test-a-angularjs-provider
            it('', inject(function () {}));

            it('should throw an error if "path" argument is of an invalid type.', function () {

                var setInvalidData = function (data) {
                    return function () {
                        cxConfigProvider.get(data);
                    };
                };

                delete dataTypes['undefined'];
                delete dataTypes['string'];
                for (var key in dataTypes) {
                    var expectedError = 'Invalid argument "path". Should be "undefined" or "string", was "' + (typeof dataTypes[key]) + '".';
                    expect(setInvalidData(dataTypes[key])).toThrow(expectedError);
                }
            });

            it('should retrieve all the existing data if no path provided.', function () {

                var data = {
                    foo: {
                        bar: 42
                    },
                    baz: 99
                };
                cxConfigProvider.merge(data);

                var expected = angular.copy(data);
                expect(cxConfigProvider.get()).toEqual(expected);
            });

            it('should retrieve existing data by path.', function () {

                var data = {
                    foo: {
                        bar: 42
                    }
                };
                cxConfigProvider.merge(data);

                expect(cxConfigProvider.get('foo.bar')).toBe(42);
            });

            it('should clone retrieved data.', function () {

                var data = {
                    bar: 'baz'
                };

                cxConfigProvider.set('foo', data);

                var foo = cxConfigProvider.get('foo');

                foo.bar = 'qux';

                expect(cxConfigProvider.get('foo.bar')).toBe('baz');
            });

            it('should throw an error if data is not defined.', function () {

                var expectedError = 'Config path "qux" is not defined.';

                expect(function () {
                    cxConfigProvider.get('qux');
                }).toThrow(expectedError);
            });

            describe('when a default value is provided', function () {

                it('should still throw an error if data is not defined.', function () {

                    var expectedError = 'Config path "foo.qux.quux" is not defined.';

                    cxConfigProvider.set('foo.bar.baz', 42);

                    expect(function () {
                        cxConfigProvider.get('foo.qux.quux', 'default');
                    }).toThrow(expectedError);
                });

                it('should return the provided default if final property is not defined.', function () {

                    cxConfigProvider.set('foo.bar', 42);

                    expect(cxConfigProvider.get('foo.bar.baz', 'default')).toBe('default');
                });
            });
        });

        describe('set()', function () {

            // kickstart the injector http://stackoverflow.com/questions/15391683/how-can-i-test-a-angularjs-provider
            it('', inject(function () {}));

            it('should throw an error if "path" argument is of an invalid type.', function () {

                var setInvalidData = function (data) {
                    return function () {
                        cxConfigProvider.set(data);
                    };
                };

                delete dataTypes['string'];
                for (var key in dataTypes) {
                    var expectedError = 'Invalid argument "path". Should be "string", was "' + (typeof dataTypes[key]) + '".';
                    expect(setInvalidData(dataTypes[key])).toThrow(expectedError);
                }
            });

            it('should store the provided data.', function () {

                var data = {
                    foo: {}
                };
                cxConfigProvider.merge(data);
                cxConfigProvider.set('foo.bar', 42);

                expect(cxConfigProvider.get('foo.bar')).toBe(42);
            });

            it('should override existing objects with scalars.', function () {

                cxConfigProvider.set('foo.bar', 42);
                cxConfigProvider.set('foo', 42);

                expect(cxConfigProvider.get('foo')).toBe(42);
                expect(cxConfigProvider.get('foo.bar', 'empty')).toBe('empty');
            });

            it('should override existing scalars with objects.', function () {

                cxConfigProvider.set('foo', 42);
                cxConfigProvider.set('foo.bar', 42);

                expect(cxConfigProvider.get('foo.bar')).toBe(42);
            });

            it('should clone provided data.', function () {

                var data = {
                    bar: 'baz'
                };

                cxConfigProvider.set('foo', data);

                data.bar = 'qux';

                expect(cxConfigProvider.get('foo.bar')).toBe('baz');

                cxConfigProvider.set('foo.bar', 'quux');

                expect(data.bar).toBe('qux');
            });
        });

        describe('merge()', function () {

            it('should override existing data with provided data.', function () {

                var data = {
                    foo: {
                        bar: 42,
                        baz: 99
                    }
                };
                cxConfigProvider.merge(data);

                var moreData = {
                    foo: {
                        baz: {
                            qux: 123
                        }
                    },
                    quux: 'corge'
                };
                cxConfigProvider.merge(moreData);

                expect(cxConfigProvider.get('foo.bar')).toBe(42);
                expect(cxConfigProvider.get('foo.baz.qux')).toBe(123);
                expect(cxConfigProvider.get('quux')).toBe('corge');
            });

            it('should clone provided data.', function () {

                var data = {
                    foo: {
                        bar: 42
                    }
                };
                cxConfigProvider.merge(data);

                data.foo.bar = 99;

                expect(cxConfigProvider.get('foo.bar')).toBe(42);
            });
        });

    });

    describe('cxConfig', function () {

        var cxConfigProvider;
        beforeEach(module(function (_cxConfigProvider_) {
            cxConfigProvider = _cxConfigProvider_;
        }));

        it('should expose the provider`s "set" and "get" methods.', inject(function (cxConfig) {

            expect(cxConfig.set).toBe(cxConfigProvider.set);
            expect(cxConfig.get).toBe(cxConfigProvider.get);
        }));
    });

});

