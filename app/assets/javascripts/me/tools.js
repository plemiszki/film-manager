Tools = {

  convertTrueFalseFromStringToBoolean: function(string) {
    if (string === "t") {
      return true;
    } else if (string === "f") {
      return false;
    } else {
      return string;
    }
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

  formatDate: function(date) {
    return (date.getMonth() + 1).toString() + "/" + date.getDate().toString() + "/" + date.getFullYear().toString();
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
  }
}
