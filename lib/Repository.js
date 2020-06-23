"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Repository = void 0;
var pouchdb_node_1 = __importDefault(require("pouchdb-node"));
var pouchdb_find_1 = __importDefault(require("pouchdb-find"));
var uuid_1 = require("uuid");
pouchdb_node_1.default.plugin(pouchdb_find_1.default);
var Repository = /** @class */ (function () {
    function Repository(table, options) {
        var _this = this;
        if (options === void 0) { options = { db: { name: 'db' }, deletedFlag: true }; }
        this.table = table;
        this.options = options;
        this.changeListeners = [];
        this.table = table;
        this.db = new pouchdb_node_1.default(options.db.name, options.db);
        this.db
            .changes({
            since: 'now',
            live: true,
            filter: function (doc) {
                return doc.$table === _this.table;
            },
        })
            .on('change', function (change) { return __awaiter(_this, void 0, void 0, function () {
            var entity;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get(change.id)];
                    case 1:
                        entity = _a.sent();
                        if (entity) {
                            this.changeListeners.forEach(function (listener) {
                                listener(entity);
                            });
                        }
                        return [2 /*return*/];
                }
            });
        }); });
    }
    Repository.prototype.save = function (item) {
        return __awaiter(this, void 0, void 0, function () {
            var now, doc;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        now = new Date();
                        if (this._isNew(item)) {
                            item._id = uuid_1.v4();
                            item.created = now;
                        }
                        item.lastModified = now;
                        item = __assign(__assign({}, item), { $table: this.table });
                        return [4 /*yield*/, this.db.put(item)];
                    case 1:
                        doc = _a.sent();
                        item._id = doc.id;
                        item._rev = doc.rev;
                        return [2 /*return*/, item];
                }
            });
        });
    };
    Repository.prototype.saveAll = function (items) {
        return __awaiter(this, void 0, void 0, function () {
            var results;
            var _this = this;
            return __generator(this, function (_a) {
                results = [];
                items.forEach(function (i) { return __awaiter(_this, void 0, void 0, function () {
                    var _a, _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                _b = (_a = results).push;
                                return [4 /*yield*/, this.save(i)];
                            case 1:
                                _b.apply(_a, [_c.sent()]);
                                return [2 /*return*/];
                        }
                    });
                }); });
                return [2 /*return*/, results];
            });
        });
    };
    Repository.prototype.get = function (id, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var result, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.db.get(id, options)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result];
                    case 2:
                        e_1 = _a.sent();
                        return [2 /*return*/, undefined];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    Repository.prototype.remove = function (item) {
        return __awaiter(this, void 0, void 0, function () {
            var id, entity, doc;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = typeof item === 'string' ? item : item._id;
                        if (id === undefined) {
                            return [2 /*return*/];
                        }
                        if (!this.options.deletedFlag) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.get(id)];
                    case 1:
                        entity = _a.sent();
                        if (!entity) return [3 /*break*/, 3];
                        entity._deleted = true;
                        return [4 /*yield*/, this.save(entity)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [3 /*break*/, 7];
                    case 4: return [4 /*yield*/, this.db.get(id)];
                    case 5:
                        doc = _a.sent();
                        return [4 /*yield*/, this.db.remove(doc._id, doc._rev)];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    Repository.prototype.removeAll = function (items) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                items.forEach(function (i) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, this.remove(i)];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                return [2 /*return*/];
            });
        });
    };
    Repository.prototype.query = function (options) {
        if (options === void 0) { options = { selector: { $table: this.table } }; }
        return __awaiter(this, void 0, void 0, function () {
            var docs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.find(options)];
                    case 1:
                        docs = _a.sent();
                        return [2 /*return*/, docs.docs];
                }
            });
        });
    };
    Repository.prototype.onChange = function (handler) {
        this.changeListeners.push(handler);
    };
    Repository.prototype.removeOnChangeListener = function (handler) {
        this.changeListeners.filter(function (h) { return h !== handler; });
    };
    Repository.prototype._isNew = function (entity) {
        return entity._id === undefined;
    };
    return Repository;
}());
exports.Repository = Repository;
