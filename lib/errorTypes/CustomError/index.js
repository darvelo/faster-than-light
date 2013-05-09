function F(){}
function CustomError(message) {
  // correct if not called with "new"
  // var _this = (this===window) ? new F() : this, // no 'window' in Node
  var _this = new F(),
      tmp = Error.prototype.constructor.apply(_this,arguments)
  ;
  for (var i in tmp) {
     if (tmp.hasOwnProperty(i)) _this[i] = tmp[i];
  }

  _this.message = message; // for some reason the applied Error constructor doesn't assign the message property
  return _this;
}
function SubClass(){}
SubClass.prototype = Error.prototype;
F.prototype = CustomError.prototype = new SubClass();
CustomError.prototype.constructor = CustomError;

// add a custom method
/*CustomError.prototype.CustomField1 = function(custom_1){
  if (custom_1 != null) this.custom_1 = custom_1;
  return this.custom_1;
}
*/

module.exports = CustomError;
