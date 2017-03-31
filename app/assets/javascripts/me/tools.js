String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

String.prototype.toUnderscore = function() {
	return this.replace(/([A-Z])/g, function($1) { return "_" + $1.toLowerCase(); });
};

String.prototype.removeFinanceSymbols = function() {
  return this.replace('$', '').replace(',', '');
};

Tools = {

  addNextNumberKeyToObject: function(object, value) {
    var keys = Object.keys(object);
    var nextKey = keys.length;
    object[nextKey] = value;
    return object;
  },

  alphabetizeArrayOfObjects: function(array, property) {
    return array.sort(function(a, b) {
      if (a[property].toUpperCase() < b[property].toUpperCase()) {
        return -1;
      } else if (a[property].toUpperCase() > b[property].toUpperCase()) {
        return 1;
      } else {
        return 0;
      }
    });
  },

  convertBooleanToTFString: function(boolean) {
    return boolean ? "t" : "f";
  },

  convertTrueFalseFromStringToBoolean: function(string) {
    if (string === "t") {
      return true;
    } else if (string === "f") {
      return false;
    } else {
      return string;
    }
  },

  copyArray: function(array) {
    return array.slice(0);
  },

  copyObject: function(object) {
    return Object.assign({}, object);
  },

  createArray: function(length, value) {
    var result = [];
    var element = Array.isArray(value) ? Tools.copyArray(value) : value;
    for (var i = 0; i < length; i++) {
      result.push(element);
    }
    return result;
  },

  deepCopy: function(obj) {
    if (typeof obj == 'object') {
      if (Array.isArray(obj)) {
        var l = obj.length;
        var r = new Array(l);
        for (var i = 0; i < l; i++) {
          r[i] = Tools.deepCopy(obj[i]);
        }
        return r;
      } else {
        var r = {};
        r.prototype = obj.prototype;
        for (var k in obj) {
          r[k] = Tools.deepCopy(obj[k]);
        }
        return r;
      }
    }
    return obj;
  },

  ifGreaterThanZero: function(n) {
    return n > 0 ? n : 0;
  },

  findObjectInArrayById: function(array, id) {
    for (var i = 0; i < array.length; i++) {
      if (array[i].id == id) {
        return array[i];
      }
    }
    return null;
  },

  objectsAreEqual: function(obj1, obj2) {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  },

  rearrangeFields: function(currentOrder, draggedIndex, dropZoneIndex) {
    var result = {};
    var draggedTaskId;
    if (dropZoneIndex == -1) {
      draggedTaskId = currentOrder[draggedIndex];
      result[0] = draggedTaskId;
    }
    for (var i = 0; i < Object.keys(currentOrder).length; i++) {
      if (i != draggedIndex) {
        result[Object.keys(result).length] = currentOrder[i];
      }
      if (i == dropZoneIndex) {
        result[Object.keys(result).length] = currentOrder[draggedIndex];
      }
    }
    return result;
  },

  removeFromArray: function(array, element) {
    var index = array.indexOf(element);
    if (index >= 0) {
      array.splice(index, 1);
    }
    return array;
  },

  sortArrayOfObjects: function(array, property) {
    return array.sort(function(a, b) {
      if (parseInt(a[property]) < parseInt(b[property])) {
        return -1;
      } else if (parseInt(a[property]) > parseInt(b[property])) {
        return 1;
      } else {
        return 0;
      }
    });
  }
}
