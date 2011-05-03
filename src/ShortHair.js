/**
 * ShortHair.js
 * simple attach keyboard shortcut library
 * TODO symbols are little bit scary
 * TODO implement Space key
 */
(function(window) {
  var existingKeyDownEventHandler = null;
  var existingKeyPressEventHandler = null;
  var maps = [];
  var modifierKeyFlag = 0;
  var keyCode = 0;

  var LEFT_ARROW_CODE = -37;
  var TOP_ARROW_CODE = -38;
  var RIGHT_ARROW_CODE = -39;
  var DOWN_ARROW_CODE = -40;

  var SHIFT_KEY_FLAG = 1;
  var ALT_KEY_FLAG = 2;
  var CTRL_KEY_FLAG = 4;

  /**
   * capture modifier keys and arrow key
   * @name keyDownHandler
   * @function
   * @param event 
   */
  var keyDownHandler = function(event) {
    modifierKeyFlag = 0;

    if (event.shiftKey) {
      modifierKeyFlag += SHIFT_KEY_FLAG;
    }

    if (event.altKey) {
      modifierKeyFlag += ALT_KEY_FLAG;
    }

    if (event.ctrlKey) {
      modifierKeyFlag += CTRL_KEY_FLAG;
    }

    //left arrow
    if (event.keyCode === 37) {
      fire(search(modifierKeyFlag, LEFT_ARROW_CODE));
    //top arrow
    } else if (event.keyCode === 38) {
      fire(search(modifierKeyFlag, TOP_ARROW_CODE));
    //right arrow
    } else if (event.keyCode === 39) {
      fire(search(modifierKeyFlag, RIGHT_ARROW_CODE));
    //down arrow
    } else if (event.keyCode === 40) {
      fire(search(modifierKeyFlag, DOWN_ARROW_CODE));
    //standard key
    } else {
      //normalize to lower case
      //TODO remove this
      keyCode = String.fromCharCode(event.keyCode).toLowerCase().charCodeAt(0);
      //console.log(keyCode);
    }
    //console.log(modifierKeyFlag, "down", event.keyCode, event.charCode);
  };

  /**
   * capture ascii keys
   * @name keyPressHandler
   * @function
   * @param event 
   */
  var keyPressHandler = function(event) {
    fire(search(modifierKeyFlag, String.fromCharCode(event.keyCode).toLowerCase().charCodeAt(0)));
    //console.log(modifierKeyFlag, "press", event.keyCode, event.charCode);
  };

  var search = function(modifierKeyFlag, code) {
    if (code) {
      for (var i = 0, length = maps.length; i < length; i++) {
        var map = maps[i];
        if (map.key[0] === modifierKeyFlag && map.key[1] === code) {
          return map.callback;
        }
      }
    }
    return null;
  };

  /**
   * fire callback function or open url
   * @name fire
   * @function
   * @param callback 
   */
  var fire = function(callback) {
    if (!callback) {
      return;
    }

    //function
    if (typeof callback === "function") {
      callback.apply();
    //anchor object
    } else if (typeof callback === "object") {
      var url = callback.href;
      var target = callback.target;
      if (!target) {
        location.href = url;
      } else {
        window.open(url, target);
      }
    }
  };

  /**
   * parse formatted key
   * @name parseFormattedKey
   * @function
   * @param formattedKey 
   * @return key pairs
   */
  var parseFormattedKey = function(formattedKey) {
    var pattern = /^([ASC]-){0,3}(\S{1}|Left|Right|Top|Bottom)$/gi;
    var modifierKeyFlag = 0;
    var keyCode = 0;
    if (pattern.exec(formattedKey)) {
      //FIXME I want use RegExp group capture instead of split. but not work.
      var keys = formattedKey.split(/-/);
      var key = keys.pop();
      if (64 < key.charCodeAt(0) && key.charCodeAt(0) < 91) {
        key = key.toLowerCase();
      }
      switch (key) {
        case "left":
          keyCode = LEFT_ARROW_CODE;
          break;
        case "top":
          keyCode = TOP_ARROW_CODE;
          break;
        case "right":
          keyCode = RIGHT_ARROW_CODE;
          break;
        case "down":
          keyCode = DOWN_ARROW_CODE;
          break;
        default:
          //normalize to lower case
          keyCode = key.toLowerCase().charCodeAt(0);
          break;
      }

      //modifier key
      for (var i = 0, length = keys.length; i < length; i++) {
        switch (keys[i].toLowerCase()) {
          case "s":
            modifierKeyFlag += SHIFT_KEY_FLAG;
            break;
          case "a":
            modifierKeyFlag += ALT_KEY_FLAG;
            break;
          case "c":
            modifierKeyFlag += CTRL_KEY_FLAG;
            break;
        }
      }
    }
    //console.log(modifierKeyFlag, keyCode);
    return [modifierKeyFlag, keyCode];
  };

  window.ShortHair = {
    /**
     * map key and function/anchor element
     * @name map
     * @function
     * @param key 
     * @param callback
     */
    map: function(key, callback) {
      //not initialized
      if (maps.length === 0) {
        //avoid conflict
        if (window.onkeydown) {
          existingKeyDownEventHandler = window.onkeydown;
        }

        window.onkeydown = function(event) {
          if (existingKeyDownEventHandler) {
            existingKeyDownEventHandler.apply(window, arguments);
          }
          keyDownHandler.apply(window, arguments);
        };

        if (window.onkeypress) {
          existingKeyPressEventHandler = window.onkeypress;
        }

        window.onkeypress = function(event) {
          if (existingKeyPressEventHandler) {
            existingKeyPressEventHandler.apply(window, arguments);
          }
          keyPressHandler.apply(window, arguments);
        };

      }
      //mapping
      maps.push({key: parseFormattedKey(key), callback: callback});
    }
  };
})(window);
