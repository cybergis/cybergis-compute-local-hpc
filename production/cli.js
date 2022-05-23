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
Object.defineProperty(exports, "__esModule", { value: true });
var commander_1 = require("commander");
var Git_1 = require("./src/models/Git");
var DB_1 = require("./src/DB");
var pkg = require('../package.json');
var cmd = new commander_1.Command();
cmd.version(pkg.version);
cmd.command('git <operation>')
    .option('-i, --id <id>', '[operation=add/update/delete/approve] git repository\'s id')
    .option('-a, --address <address>', '[operation=add/update] git repository\'s address')
    .option('-s, --sha <sha>', '[operation=add/update] git repository\'s sha hash')
    .action(function (operation, cmd) { return __awaiter(void 0, void 0, void 0, function () {
    var db, _a, git, connection, gitRepo, connection, i, gitRepo, _b, _c, connection, gitRepo;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                db = new DB_1.default(false);
                _a = operation;
                switch (_a) {
                    case 'add': return [3, 1];
                    case 'update': return [3, 4];
                    case 'approve': return [3, 8];
                    case 'delete': return [3, 11];
                }
                return [3, 13];
            case 1:
                git = new Git_1.Git();
                if (cmd.address && cmd.id) {
                    git.address = cmd.address;
                    git.id = cmd.id;
                }
                else {
                    console.error('-a, --address <address> and -i, --id <id> flags is required');
                    return [2];
                }
                git.isApproved = true;
                if (cmd.sha)
                    git.sha = cmd.sha;
                return [4, db.connect()];
            case 2:
                connection = _d.sent();
                gitRepo = connection.getRepository(Git_1.Git);
                return [4, gitRepo.save(git)];
            case 3:
                _d.sent();
                console.log('git successfully added:');
                console.log(git);
                return [3, 14];
            case 4:
                if (!cmd.id) {
                    console.error('-i, --id <id> flag is required');
                    return [2];
                }
                return [4, db.connect()];
            case 5:
                connection = _d.sent();
                i = {};
                if (cmd.address)
                    i['address'] = cmd.address;
                if (cmd.sha)
                    i['sha'] = cmd.sha;
                return [4, connection.createQueryBuilder()
                        .update(Git_1.Git)
                        .where('id = :id', { id: cmd.id })
                        .set(i)
                        .execute()];
            case 6:
                _d.sent();
                console.log('git successfully updated:');
                gitRepo = connection.getRepository(Git_1.Git);
                _c = (_b = console).log;
                return [4, gitRepo.findOne(cmd.id)];
            case 7:
                _c.apply(_b, [_d.sent()]);
                return [3, 14];
            case 8:
                if (!cmd.id) {
                    console.error('-i, --id <id> flag is required');
                    return [2];
                }
                return [4, db.connect()];
            case 9:
                connection = _d.sent();
                return [4, connection.createQueryBuilder()
                        .update(Git_1.Git)
                        .where('id = :id', { id: cmd.id })
                        .set({ isApproved: true })
                        .execute()];
            case 10:
                _d.sent();
                console.log('git approved');
                return [3, 14];
            case 11:
                if (!cmd.id) {
                    console.error('-i, --id <id> flag is required');
                    return [2];
                }
                gitRepo = connection.getRepository(Git_1.Git);
                return [4, gitRepo.delete(cmd.id)];
            case 12:
                _d.sent();
                console.log('git successfully deleted');
                return [3, 14];
            case 13:
                console.error('<operation> invalid operation, only support [add/update/delete/approve]');
                return [3, 14];
            case 14: return [4, db.close()];
            case 15:
                _d.sent();
                return [2];
        }
    });
}); });
cmd.parse(process.argv);
