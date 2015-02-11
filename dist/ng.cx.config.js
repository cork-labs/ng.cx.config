/**
 * ng.cx.config - v0.0.1 - 2015-02-11
 * https://github.com/ef-ctx/ng.cx.config
 *
 * Copyright (c) 2015 EF CTX <http://ef.com>
 * License: MIT <https://raw.githubusercontent.com/EFEducationFirstMobile/oss/master/LICENSE>
 */
(function (angular) {
    'use strict';

    var module = angular.module('ng.cx.config', []);

    function isRegExp(value) {
        return window.toString.call(value) === '[object RegExp]';
    }

    function extendDeep(destination, source) {
        if (destination !== source) {
            //
            if (angular.isDate(source)) {
                destination = new Date(source.getTime());
            } else if (isRegExp(source)) {
                destination = new RegExp(source.source, source.toString().match(/[^\/]*$/)[0]);
                destination.lastIndex = source.lastIndex;
            }
            // if source is object (or array) go recursive
            else if (angular.isObject(source)) {
                // initialize as (or smash to) destination property to Array
                if (angular.isArray(source)) {
                    if (!angular.isArray(destination)) {
                        destination = [];
                    }
                }
                // initialize as (or smash to) destination property to Object
                else if (!angular.isObject(destination) || angular.isArray(destination)) {
                    destination = {};
                }
                for (var key in source) {
                    destination[key] = extendDeep(destination[key], source[key]);
                }
            } else {
                destination = source;
            }
        }
        return destination;
    }

    /**
     * @ngdoc object
     * @name ng.cx.config.cxConfigProvider
     *
     * @description
     * Can be used to store configuration in the `config()` phase of the application via the `set()` and `merge()` methods.
     * Can also be used to retrieve data to configure other providers via the `get()` method.
     *
     * See also the {@link ng.cx.config.cxConfig cxConfig} service. It provides a way to read/write config data during the execution of the application.
     */
    module.provider('cxConfig', [
        function cxConfigProvider() {

            var pendingRequests = [];
            var configData = {};

            /**
             * @ngdoc function
             * @name set
             * @methodOf ng.cx.config.cxConfigProvider
             *
             * @description
             * Sets a config value or extends config with provided data.
             *
             * @param {string} path  The "dot separated" path to set. Ex: `'foo.bar'`.
             * @param {*}      value The config value to store in the given path.
             */
            var set = function (path, value) {
                var parts;
                var val = configData;
                var key;

                if (angular.isString(path)) {
                    parts = path.split('.');
                    while (parts.length > 1 && val) {
                        key = parts.shift();
                        if (!val.hasOwnProperty(key) || typeof val[key] !== 'object') {
                            val[key] = {};
                        }
                        val = val[key];
                    }

                    key = parts.shift();
                    val[key] = 'object' === typeof value ? angular.copy(value) : value;
                } else {
                    throw new Error('Invalid argument "path". Should be "string", was "' + (typeof path) + '".');
                }
            };

            /**
             * @ngdoc function
             * @name get
             * @methodOf ng.cx.config.cxConfigProvider
             *
             * @description
             * Returns the current config value for the given config path.
             *
             * If the requested value is not defined you will **throw an error**. To avoid this you can pass a second
             * parameter specifying which value to fallback to. Even `null` or `undefined` are OK.
             *
             * Please note, that the fallback is only used if the undefined value corresponds to last segment of the
             * requested path.
             *
             * Examples:
             *
             * - Given `foo.bar.baz` exists, `get('foo.bar.qux')` results in an **error**.
             *
             * - Given `foo.bar.baz` exists, `get('foo.bar.qux', 'fallback')` > `fallback`.
             *
             * - Given `foo.bar.baz` exists, `get('foo.qux.quux', 'fallback')`, always results in an **error**, regardless of a fallback being provided.
             *
             * @param {string} path         The config path separated by dots. Ex: `'foo.bar'`.
             * @param {*=}     defaultValue Optional value to return in case `.bar` does not exist in the config.
             *
             * @returns {*} The config value if it exists, `null` if not.
             */
            var get = function (path, defaultValue) {
                var parts;
                var value = configData;
                var key;
                var args;

                if (angular.isUndefined(path) || angular.isString(path)) {
                    parts = path ? path.split('.') : [];
                    while (parts.length && value) {
                        key = parts.shift();
                        if (value.hasOwnProperty(key)) {
                            value = value[key];
                        } else {
                            // the whole path is consumed and a defaultValue was provided
                            if (!parts.length && arguments.length > 1) {
                                return defaultValue;
                            } else {
                                throw new Error('Config path "' + path + '" is not defined.');
                            }
                        }
                    }
                } else {
                    throw new Error('Invalid argument "path". Should be "undefined" or "string", was "' + (typeof path) + '".');
                }

                return 'object' === typeof value ? angular.copy(value) : value;
            };

            /**
             * @ngdoc function
             * @name merge
             * @methodOf ng.cx.config.cxConfigProvider
             *
             * @description
             * Extends config with provided data.
             *
             * @param {Object} obj The config data to merge into the existing data.
             */
            var merge = function (obj) {
                extendDeep(configData, obj);
            };

            // -- API

            this.set = set;
            this.get = get;
            this.merge = merge;

            /**
             * @ngdoc service
             * @name ng.cx.config.cxConfig
             *
             * @description
             * Configuration service, provides an interface to read and write config values during the `run` phase of the
             * application.
             *
             * See also the {@link ng.cx.config.cxConfigProvider cxConfigProvider} which allows you to interact with config
             * data during the `config` phase of the application.
             */
            this.$get = [
                '$q',
                '$http',
                function cxConfig($q, $http) {

                    /**
                     * @ngdoc function
                     * @name set
                     * @methodOf ng.cx.config.cxConfig
                     *
                     * @description
                     * Sets a config value or extends config with provided data.
                     *
                     * @param {string} path  The "dot separated" path to set. Ex: `'foo.bar'`.
                     * @param {*}      value The config value to store in the given path.
                     */

                    /**
                     * @ngdoc function
                     * @name get
                     * @methodOf ng.cx.config.cxConfig
                     *
                     * @description
                     * Returns the current config value for the given config path.
                     *
                     * @param {string} path The config path separated by dots. Ex: `'foo.bar'`.
                     * @param {*=}     defaultValue Optional value to return in case `.bar` does not exist in the config.
                     *
                     * @returns {*} The config value if it exists, `null` if not.
                     */

                    // -- API

                    var serviceApi = {
                        set: set,
                        get: get
                    };

                    return serviceApi;
                }
            ];
        }
    ]);

})(angular);

