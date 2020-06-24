"use strict";
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
    function Repository(name, options) {
        var _this = this;
        if (options === void 0) { options = {
            prefix: './db/',
            auto_compaction: true,
        }; }
        this.name = name;
        this.options = options;
        this.changeListeners = [];
        this.db = new pouchdb_node_1.default(options.name || name, options);
        this.db
            .changes({
            since: 'now',
            live: true,
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
            var results, _i, items_1, item, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        results = [];
                        _i = 0, items_1 = items;
                        _c.label = 1;
                    case 1:
                        if (!(_i < items_1.length)) return [3 /*break*/, 4];
                        item = items_1[_i];
                        _b = (_a = results).push;
                        return [4 /*yield*/, this.save(item)];
                    case 2:
                        _b.apply(_a, [_c.sent()]);
                        _c.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, results];
                }
            });
        });
    };
    Repository.prototype.get = function (id, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.db.get(id, options)];
                    case 1: 
                    // TODO: Get with table name
                    return [2 /*return*/, _a.sent()];
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
            var id, entity;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = typeof item === 'string' ? item : item._id;
                        if (id === undefined) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.get(id)];
                    case 1:
                        entity = _a.sent();
                        if (!entity) return [3 /*break*/, 3];
                        entity._deleted = true;
                        return [4 /*yield*/, this.save(entity)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    Repository.prototype.removeAll = function (items) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, items_2, item;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _i = 0, items_2 = items;
                        _a.label = 1;
                    case 1:
                        if (!(_i < items_2.length)) return [3 /*break*/, 4];
                        item = items_2[_i];
                        return [4 /*yield*/, this.remove(item)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Repository.prototype.query = function (options) {
        if (options === void 0) { options = { selector: {} }; }
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
    Repository.prototype.clear = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.removeAll;
                        return [4 /*yield*/, this.query()];
                    case 1: return [4 /*yield*/, _a.apply(this, [_b.sent()])];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Repository.prototype.onChange = function (handler) {
        this.changeListeners.push(handler);
    };
    Repository.prototype.removeOnChangeListener = function (handler) {
        this.changeListeners = this.changeListeners.filter(function (h) { return h !== handler; });
    };
    Repository.prototype.removeAllChangeListener = function () {
        this.changeListeners = [];
    };
    Repository.prototype._isNew = function (entity) {
        return entity._id === undefined;
    };
    return Repository;
}());
exports.Repository = Repository;
