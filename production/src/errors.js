"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectorError = exports.NotImplementedError = exports.FileNotExistError = exports.FileStructureError = exports.FileFormatError = void 0;
var FileFormatError = (function (_super) {
    __extends(FileFormatError, _super);
    function FileFormatError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = "FileFormatError";
        return _this;
    }
    return FileFormatError;
}(Error));
exports.FileFormatError = FileFormatError;
var FileStructureError = (function (_super) {
    __extends(FileStructureError, _super);
    function FileStructureError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = "FileStructureError";
        return _this;
    }
    return FileStructureError;
}(Error));
exports.FileStructureError = FileStructureError;
var FileNotExistError = (function (_super) {
    __extends(FileNotExistError, _super);
    function FileNotExistError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = "FileNotExistError";
        return _this;
    }
    return FileNotExistError;
}(Error));
exports.FileNotExistError = FileNotExistError;
var NotImplementedError = (function (_super) {
    __extends(NotImplementedError, _super);
    function NotImplementedError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = "NotImplementedError";
        return _this;
    }
    return NotImplementedError;
}(Error));
exports.NotImplementedError = NotImplementedError;
var ConnectorError = (function (_super) {
    __extends(ConnectorError, _super);
    function ConnectorError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = "ConnectorError";
        return _this;
    }
    return ConnectorError;
}(Error));
exports.ConnectorError = ConnectorError;
