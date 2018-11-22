(window["webpackJsonp_name_"] = window["webpackJsonp_name_"] || []).push([[0],{

/***/ "./src/app/features/lazy/index.ts":
/*!****************************************!*\
  !*** ./src/app/features/lazy/index.ts ***!
  \****************************************/
/*! exports provided: LazyModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "LazyModule", function() { return LazyModule; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/fesm5/common.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
/* harmony import */ var _lazy_routing__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./lazy.routing */ "./src/app/features/lazy/lazy.routing.ts");
/* harmony import */ var _lazy_component__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./lazy.component */ "./src/app/features/lazy/lazy.component.ts");






var LazyModule = /** @class */ (function () {
    function LazyModule() {
    }
    LazyModule = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["NgModule"])({
            imports: [
                _angular_common__WEBPACK_IMPORTED_MODULE_2__["CommonModule"],
                _angular_router__WEBPACK_IMPORTED_MODULE_3__["RouterModule"].forChild(_lazy_routing__WEBPACK_IMPORTED_MODULE_4__["routes"])
            ],
            declarations: [
                _lazy_component__WEBPACK_IMPORTED_MODULE_5__["LazyComponent"]
            ]
        })
    ], LazyModule);
    return LazyModule;
}());



/***/ }),

/***/ "./src/app/features/lazy/lazy.component.html":
/*!***************************************************!*\
  !*** ./src/app/features/lazy/lazy.component.html ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<header>\n  <h5>\n    This module is being loaded lazily.\n  </h5>\n</header>"

/***/ }),

/***/ "./src/app/features/lazy/lazy.component.ts":
/*!*************************************************!*\
  !*** ./src/app/features/lazy/lazy.component.ts ***!
  \*************************************************/
/*! exports provided: LazyComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "LazyComponent", function() { return LazyComponent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");


var LazyComponent = /** @class */ (function () {
    function LazyComponent() {
    }
    LazyComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
            selector: 'my-lazy',
            template: __webpack_require__(/*! ./lazy.component.html */ "./src/app/features/lazy/lazy.component.html")
        })
    ], LazyComponent);
    return LazyComponent;
}());



/***/ }),

/***/ "./src/app/features/lazy/lazy.routing.ts":
/*!***********************************************!*\
  !*** ./src/app/features/lazy/lazy.routing.ts ***!
  \***********************************************/
/*! exports provided: routes */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "routes", function() { return routes; });
/* harmony import */ var _lazy_component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./lazy.component */ "./src/app/features/lazy/lazy.component.ts");

var routes = [
    {
        path: '',
        component: _lazy_component__WEBPACK_IMPORTED_MODULE_0__["LazyComponent"]
    }
];


/***/ })

}]);
//# sourceMappingURL=0.dll.js.map