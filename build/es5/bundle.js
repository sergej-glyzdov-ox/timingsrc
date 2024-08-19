'use strict';

const observable = Symbol.observable || "@@observable";

function patch(arg) {
    if (!Symbol.observable) {
        if (typeof arg === "function" &&
            arg.prototype &&
            arg.prototype[Symbol.observable]) {
            arg.prototype[observable] = arg.prototype[Symbol.observable];
            delete arg.prototype[Symbol.observable];
        }
        else {
            arg[observable] = arg[Symbol.observable];
            delete arg[Symbol.observable];
        }
    }
    return arg;
}

const noop$1 = () => { };
const rethrow = (error) => {
    throw error;
};
function toObserver(observer) {
    if (observer) {
        if (observer.next && observer.error && observer.complete) {
            return observer;
        }
        return {
            complete: (observer.complete ?? noop$1).bind(observer),
            error: (observer.error ?? rethrow).bind(observer),
            next: (observer.next ?? noop$1).bind(observer),
        };
    }
    return {
        complete: noop$1,
        error: rethrow,
        next: noop$1,
    };
}

const createAnimationFrame = (emitNotSupportedError, window, wrapSubscribeFunction) => {
    return () => wrapSubscribeFunction((observer) => {
        if (window === null || window.cancelAnimationFrame === undefined || window.requestAnimationFrame === undefined) {
            return emitNotSupportedError(observer);
        }
        let animationFrameHandle = window.requestAnimationFrame(function animationFrameCallback(timestamp) {
            animationFrameHandle = window.requestAnimationFrame(animationFrameCallback);
            observer.next(timestamp);
        });
        return () => window.cancelAnimationFrame(animationFrameHandle);
    });
};

const createOn = (wrapSubscribeFunction) => {
    return (target, type, options) => wrapSubscribeFunction((observer) => {
        const listener = (event) => observer.next(event);
        target.addEventListener(type, listener, options);
        return () => target.removeEventListener(type, listener, options);
    });
};

// @todo TypeScript does not include type definitions for the Reporting API yet.
const createWindow$1 = () => (typeof window === 'undefined' ? null : window);

const createWrapSubscribeFunction = (patch, toObserver) => {
    const emptyFunction = () => { }; // tslint:disable-line:no-empty
    const isNextFunction = (args) => typeof args[0] === 'function';
    return (innerSubscribe) => {
        const subscribe = ((...args) => {
            const unsubscribe = innerSubscribe(isNextFunction(args) ? toObserver({ next: args[0] }) : toObserver(...args));
            if (unsubscribe !== undefined) {
                return unsubscribe;
            }
            return emptyFunction;
        });
        subscribe[Symbol.observable] = () => ({
            subscribe: (...args) => ({ unsubscribe: subscribe(...args) })
        });
        return patch(subscribe);
    };
};

const emitNotSupportedError = (observer) => {
    observer.error(new Error('The required browser API seems to be not supported.'));
    return () => { }; // tslint:disable-line:no-empty
};

const window$1 = createWindow$1();
const wrapSubscribeFunction = createWrapSubscribeFunction(patch, toObserver);
const animationFrame = createAnimationFrame(emitNotSupportedError, window$1, wrapSubscribeFunction);
const on = createOn(wrapSubscribeFunction);

const translateTimingStateVector = (vector, delta) => {
    const { acceleration, position, timestamp, velocity } = vector;
    return {
        acceleration,
        position: position + velocity * delta + 0.5 * acceleration * delta ** 2,
        timestamp: timestamp + delta,
        velocity: velocity + acceleration * delta
    };
};

var createComputeVelocity = function createComputeVelocity(timeConstant) {
  return function (delta, minValue, maxValue, velocity) {
    var factor = (Math.abs(delta) + timeConstant) / timeConstant;
    return Math.max(minValue, Math.min(maxValue, delta > 0 ? velocity / factor : factor * velocity));
  };
};

var DEFAULT_THRESHOLD = 1;
var DEFAULT_TIME_CONSTANT = 0.5;
var DEFAULT_TOLERANCE = 0.025;
var createDefaultSetTimingsrc = function createDefaultSetTimingsrc(createComputeVelocity, createSetTimingsrc, createUpdateGradually, createUpdateStepwise, determineSupportedPlaybackRateValues, setTimingsrcWithCustomUpdateFunction, window) {
  console.log('createUpdateStepwise', createUpdateStepwise);
  var update = createUpdateGradually(createComputeVelocity(DEFAULT_TIME_CONSTANT), determineSupportedPlaybackRateValues(window), DEFAULT_THRESHOLD, DEFAULT_TOLERANCE);
  return createSetTimingsrc(setTimingsrcWithCustomUpdateFunction, update);
};

var createSetCurrentTime = function createSetCurrentTime(currentTimeAssignments) {
  return function (mediaElement, previousValue, nextValue) {
    var currentTimeAssignment = currentTimeAssignments.get(mediaElement);
    console.log('@@@createSetCurrentTime', {
      currentTimeAssignment: currentTimeAssignment,
      previousValue: previousValue,
      nextValue: nextValue
    });
    if (currentTimeAssignment === undefined ||
    // Bug #5: Safari limits the precision of the value after a while.
    Math.abs(currentTimeAssignment[0] - previousValue) > 0.0001 || currentTimeAssignment[1] !== nextValue) {
      mediaElement.currentTime = nextValue;
      currentTimeAssignments.set(mediaElement, [mediaElement.currentTime, nextValue]);
    }
  };
};

var createSetPlaybackRate = function createSetPlaybackRate(negativeMaximum, playbackRateAssignments, positiveMinimum) {
  return function (mediaElement, previousValue, nextValue) {
    var playbackRateAssignment = playbackRateAssignments.get(mediaElement);
    if (playbackRateAssignment === undefined || playbackRateAssignment[0] !== previousValue || playbackRateAssignment[1] !== nextValue) {
      // Bug #6: Chrome does not adjust the tempo when the playbackRate is very close to 1.
      console.log('nextValue', nextValue);
      mediaElement.playbackRate = Math.min(nextValue > 1 ? Math.max(positiveMinimum, nextValue) : Math.min(negativeMaximum, nextValue), 2);
      playbackRateAssignments.set(mediaElement, [mediaElement.playbackRate, nextValue]);
    }
  };
};

var createSetTimingsrc = function createSetTimingsrc(setTimingsrcWithCustomUpdateFunction, update) {
  return function (mediaElement, timingObject) {
    var prepareTimingStateVector = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    var prepareUpdateVector = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
    return setTimingsrcWithCustomUpdateFunction(mediaElement, timingObject, update, prepareTimingStateVector, prepareUpdateVector);
  };
};

function _typeof(o) {
  "@babel/helpers - typeof";

  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
    return typeof o;
  } : function (o) {
    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
  }, _typeof(o);
}

function toPrimitive$5(t, r) {
  if ("object" != _typeof(t) || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || "default");
    if ("object" != _typeof(i)) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}

function toPropertyKey$a(t) {
  var i = toPrimitive$5(t, "string");
  return "symbol" == _typeof(i) ? i : i + "";
}

function _defineProperty(e, r, t) {
  return (r = toPropertyKey$a(r)) in e ? Object.defineProperty(e, r, {
    value: t,
    enumerable: !0,
    configurable: !0,
    writable: !0
  }) : e[r] = t, e;
}

function ownKeys$4(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys$4(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$4(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var createSetTimingsrcWithCustomUpdateFunction = function createSetTimingsrcWithCustomUpdateFunction(animationFrame, clearInterval, document, on, setInterval, updateMediaElement) {
  return function (mediaElement, timingObject, updateFunction) {
    var prepareTimingStateVector = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
    var prepareUpdateVector = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
    var previousUpdateVectorWithCustomState = null;
    var update = function update() {
      var currentTime = mediaElement.currentTime,
        duration = mediaElement.duration,
        playbackRate = mediaElement.playbackRate;
      var timingStateVector = timingObject.query();
      previousUpdateVectorWithCustomState = updateFunction(prepareTimingStateVector === null ? timingStateVector : prepareTimingStateVector(timingStateVector), currentTime, previousUpdateVectorWithCustomState);
      var sanitizedDuration = typeof duration === 'number' && !isNaN(duration) ? duration : 0;
      var _ref = prepareUpdateVector === null ? previousUpdateVectorWithCustomState : prepareUpdateVector(previousUpdateVectorWithCustomState),
        position = _ref.position,
        velocity = _ref.velocity;
      previousUpdateVectorWithCustomState = _objectSpread(_objectSpread({}, previousUpdateVectorWithCustomState), {}, {
        position: position,
        velocity: velocity
      });
      updateMediaElement(currentTime, sanitizedDuration, mediaElement, playbackRate, position, velocity);
      return velocity !== 0;
    };
    var unsubscribe;
    var updateOnce = function updateOnce() {
      if (!update()) {
        unsubscribe();
        unsubscribe = updateReactively();
      }
    };
    var updateConsistently = function updateConsistently() {
      var intervalId = setInterval(function () {
        return updateOnce();
      }, 100);
      var restartInterval = function restartInterval() {
        clearInterval(intervalId);
        intervalId = setInterval(function () {
          return updateOnce();
        }, 100);
      };
      var unsubscribeFunctions = [function () {
        return clearInterval(intervalId);
      }, animationFrame()(function () {
        restartInterval();
        updateOnce();
      }), on(timingObject, 'change')(function () {
        if (document.visibilityState === 'hidden') {
          restartInterval();
          updateOnce();
        }
      })];
      return function () {
        return unsubscribeFunctions.forEach(function (unsubscribeFunction) {
          return unsubscribeFunction();
        });
      };
    };
    var updateReactively = function updateReactively() {
      return on(timingObject, 'change')(function () {
        if (update()) {
          unsubscribe();
          unsubscribe = updateConsistently();
        }
      });
    };
    unsubscribe = update() ? updateConsistently() : updateReactively();
    return function () {
      return unsubscribe();
    };
  };
};

function _arrayWithHoles(r) {
  if (Array.isArray(r)) return r;
}

function _iterableToArrayLimit(r, l) {
  var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (null != t) {
    var e,
      n,
      i,
      u,
      a = [],
      f = !0,
      o = !1;
    try {
      if (i = (t = t.call(r)).next, 0 === l) ; else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
    } catch (r) {
      o = !0, n = r;
    } finally {
      try {
        if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return;
      } finally {
        if (o) throw n;
      }
    }
    return a;
  }
}

function _arrayLikeToArray(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
  return n;
}

function _unsupportedIterableToArray(r, a) {
  if (r) {
    if ("string" == typeof r) return _arrayLikeToArray(r, a);
    var t = {}.toString.call(r).slice(8, -1);
    return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
  }
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function _slicedToArray(r, e) {
  return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
}

var createUpdateGradually = function createUpdateGradually(computeVelocity, _ref, threshold, tolerance) {
  var _ref2 = _slicedToArray(_ref, 2),
    minValue = _ref2[0],
    maxValue = _ref2[1];
  return function (_ref3, currentTime, previousUpdateVectorWithCustomState) {
    var position = _ref3.position,
      velocity = _ref3.velocity;
    var _ref4 = previousUpdateVectorWithCustomState !== null && previousUpdateVectorWithCustomState !== void 0 ? previousUpdateVectorWithCustomState : {
        mediaElementDelay: 0
      },
      mediaElementDelay = _ref4.mediaElementDelay;
    if (velocity < minValue || velocity > maxValue) {
      return {
        mediaElementDelay: mediaElementDelay,
        position: position,
        velocity: 0
      };
    }
    if (position < 0 || velocity === 0) {
      return {
        mediaElementDelay: mediaElementDelay,
        position: position,
        velocity: velocity
      };
    }
    var positionDifference = currentTime - position;
    var absolutePositionDifference = Math.abs(positionDifference);
    if (absolutePositionDifference > threshold) {
      var _ref5 = previousUpdateVectorWithCustomState !== null && previousUpdateVectorWithCustomState !== void 0 ? previousUpdateVectorWithCustomState : {
          position: null
        },
        lastPosition = _ref5.position;
      if (positionDifference < 0 || positionDifference > mediaElementDelay) {
        if (lastPosition === currentTime) {
          mediaElementDelay += absolutePositionDifference;
        }
        return {
          mediaElementDelay: mediaElementDelay,
          position: position + mediaElementDelay,
          velocity: velocity
        };
      }
      if (lastPosition !== currentTime) {
        mediaElementDelay -= absolutePositionDifference;
        return {
          mediaElementDelay: mediaElementDelay,
          position: position + mediaElementDelay,
          velocity: velocity
        };
      }
    }
    if (absolutePositionDifference > tolerance) {
      return {
        mediaElementDelay: mediaElementDelay,
        position: currentTime,
        velocity: computeVelocity(positionDifference, minValue, maxValue, velocity)
      };
    }
    return {
      mediaElementDelay: mediaElementDelay,
      position: currentTime,
      velocity: velocity
    };
  };
};

var createUpdateMediaElement = function createUpdateMediaElement(pause, play, setCurrentTime, setPlaybackRate) {
  return function (currentTime, duration, mediaElement, playbackRate, position, velocity) {
    if (position < 0) {
      if (currentTime > 0) {
        setCurrentTime(mediaElement, currentTime, 0);
      }
      pause(mediaElement);
    } else if (position >= duration) {
      if (currentTime !== duration) {
        setCurrentTime(mediaElement, currentTime, duration);
      }
      pause(mediaElement);
    } else if (currentTime !== position) {
      setCurrentTime(mediaElement, currentTime, position);
      if (velocity !== 0) {
        if (playbackRate !== velocity) {
          setPlaybackRate(mediaElement, playbackRate, velocity);
        }
        play(mediaElement);
      } else {
        pause(mediaElement);
      }
    } else if (playbackRate !== velocity) {
      if (velocity !== 0) {
        setPlaybackRate(mediaElement, playbackRate, velocity);
        play(mediaElement);
      } else {
        pause(mediaElement);
      }
    }
  };
};

var MAXIMUM_PLAYHEAD_DIFFERENCE = 0.5;
var createUpdateStepwiseFactory = function createUpdateStepwiseFactory(translateTimingStateVector) {
  return function (tolerance) {
    return function (timingStateVector, currentTime, previousUpdateVectorWithCustomState) {
      var _ref = previousUpdateVectorWithCustomState !== null && previousUpdateVectorWithCustomState !== void 0 ? previousUpdateVectorWithCustomState : {
          lastAppliedPostion: 0,
          lastAppliedTimestamp: 0,
          lastAppliedVelocity: 0,
          lastPlayheadDifference: 0,
          mediaElementDelay: 0,
          numberOfDetectedResets: 0,
          numberOfExpectedResets: 1
        },
        lastAppliedPostion = _ref.lastAppliedPostion,
        lastAppliedTimestamp = _ref.lastAppliedTimestamp,
        lastAppliedVelocity = _ref.lastAppliedVelocity,
        lastPlayheadDifference = _ref.lastPlayheadDifference,
        mediaElementDelay = _ref.mediaElementDelay,
        numberOfDetectedResets = _ref.numberOfDetectedResets,
        numberOfExpectedResets = _ref.numberOfExpectedResets;
      if (timingStateVector.position < 0 || timingStateVector.velocity === 0) {
        lastAppliedPostion = timingStateVector.position;
        lastAppliedVelocity = timingStateVector.velocity;
        return {
          lastAppliedPostion: lastAppliedPostion,
          lastAppliedTimestamp: 0,
          lastAppliedVelocity: lastAppliedVelocity,
          lastPlayheadDifference: lastPlayheadDifference,
          mediaElementDelay: mediaElementDelay,
          numberOfDetectedResets: numberOfDetectedResets,
          numberOfExpectedResets: numberOfExpectedResets,
          position: lastAppliedPostion,
          velocity: lastAppliedVelocity
        };
      }
      // Bug #4: Safari decreases currentTime after playing for about 200 milliseconds.
      if (lastAppliedVelocity === timingStateVector.velocity && lastPlayheadDifference < MAXIMUM_PLAYHEAD_DIFFERENCE) {
        var playheadDifference = Math.abs(currentTime - lastAppliedPostion) * lastAppliedVelocity;
        if (playheadDifference < MAXIMUM_PLAYHEAD_DIFFERENCE) {
          if (playheadDifference + 0.001 > lastPlayheadDifference) {
            lastPlayheadDifference = playheadDifference;
            if (numberOfDetectedResets < numberOfExpectedResets) {
              return {
                lastAppliedPostion: lastAppliedPostion,
                lastAppliedTimestamp: lastAppliedTimestamp,
                lastAppliedVelocity: lastAppliedVelocity,
                lastPlayheadDifference: lastPlayheadDifference,
                mediaElementDelay: mediaElementDelay,
                numberOfDetectedResets: numberOfDetectedResets,
                numberOfExpectedResets: numberOfExpectedResets,
                position: currentTime,
                velocity: lastAppliedVelocity
              };
            }
          } else {
            lastPlayheadDifference = playheadDifference;
            numberOfDetectedResets += 1;
            if (numberOfDetectedResets <= numberOfExpectedResets) {
              return {
                lastAppliedPostion: lastAppliedPostion,
                lastAppliedTimestamp: lastAppliedTimestamp,
                lastAppliedVelocity: lastAppliedVelocity,
                lastPlayheadDifference: lastPlayheadDifference,
                mediaElementDelay: mediaElementDelay,
                numberOfDetectedResets: numberOfDetectedResets,
                numberOfExpectedResets: numberOfExpectedResets,
                position: currentTime,
                velocity: lastAppliedVelocity
              };
            }
            numberOfExpectedResets += 1;
          }
        } else {
          lastPlayheadDifference = playheadDifference;
          numberOfExpectedResets = Math.max(numberOfDetectedResets, 1);
        }
      } else {
        lastAppliedTimestamp = 0;
      }
      var positionDifference = Math.abs(currentTime - timingStateVector.position);
      var velocityHasChanged = lastAppliedVelocity === 0 || lastAppliedVelocity < 0 && timingStateVector.velocity > 0 || lastAppliedVelocity > 0 && timingStateVector.velocity < 0;
      if (positionDifference > tolerance || velocityHasChanged) {
        if (lastAppliedTimestamp > 0) {
          var elapsedTime = timingStateVector.timestamp - lastAppliedTimestamp;
          var _translateTimingState = translateTimingStateVector({
              acceleration: 0,
              position: lastAppliedPostion,
              timestamp: lastAppliedTimestamp,
              velocity: lastAppliedVelocity
            }, elapsedTime),
            position = _translateTimingState.position;
          mediaElementDelay = position - currentTime;
        }
        lastAppliedPostion = timingStateVector.position + mediaElementDelay;
        lastAppliedVelocity = timingStateVector.velocity;
        return {
          lastAppliedPostion: lastAppliedPostion,
          lastAppliedTimestamp: timingStateVector.timestamp,
          lastAppliedVelocity: lastAppliedVelocity,
          lastPlayheadDifference: 0,
          mediaElementDelay: mediaElementDelay,
          numberOfDetectedResets: 0,
          numberOfExpectedResets: numberOfExpectedResets,
          position: lastAppliedPostion,
          velocity: lastAppliedVelocity
        };
      }
      return {
        lastAppliedPostion: lastAppliedPostion,
        lastAppliedTimestamp: lastAppliedTimestamp,
        lastAppliedVelocity: lastAppliedVelocity,
        lastPlayheadDifference: lastPlayheadDifference,
        mediaElementDelay: mediaElementDelay,
        numberOfDetectedResets: numberOfDetectedResets,
        numberOfExpectedResets: numberOfExpectedResets,
        position: currentTime,
        velocity: timingStateVector.velocity
      };
    };
  };
};

var createWindow = function createWindow() {
  return typeof window === 'undefined' ? null : window;
};

var DEFAULT_VALUES = [Number.MIN_VALUE, Number.MAX_VALUE];
var determineSupportedPlaybackRateValues = function determineSupportedPlaybackRateValues(window) {
  if (window === null) {
    return DEFAULT_VALUES;
  }
  var audio = new window.Audio();
  try {
    // Bug #2: Chrome does not support values above 16.
    audio.playbackRate = 17;
  } catch (_unused) {
    // Bug #1: Chrome does not support values below 0.0625.
    return [0.0625, 16];
  }
  try {
    // Bug #3: Firefox does not support negative values.
    audio.playbackRate = -1;
  } catch (_unused2) {
    return [0, DEFAULT_VALUES[1]];
  }
  return DEFAULT_VALUES;
};

var pause = function pause(mediaElement) {
  if (!mediaElement.paused) {
    mediaElement.pause();
  }
};

var play = function play(mediaElement) {
  if (mediaElement.paused) {
    mediaElement.play().catch(function (err) {
      return console.error(err);
    }); // tslint:disable-line no-console
  }
};

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

var check = function (it) {
  return it && it.Math === Math && it;
};

// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var globalThis_1 =
  // eslint-disable-next-line es/no-global-this -- safe
  check(typeof globalThis == 'object' && globalThis) ||
  check(typeof window == 'object' && window) ||
  // eslint-disable-next-line no-restricted-globals -- safe
  check(typeof self == 'object' && self) ||
  check(typeof commonjsGlobal == 'object' && commonjsGlobal) ||
  check(typeof commonjsGlobal == 'object' && commonjsGlobal) ||
  // eslint-disable-next-line no-new-func -- fallback
  (function () { return this; })() || Function('return this')();

var objectGetOwnPropertyDescriptor = {};

var fails$1z = function (exec) {
  try {
    return !!exec();
  } catch (error) {
    return true;
  }
};

var fails$1y = fails$1z;

// Detect IE8's incomplete defineProperty implementation
var descriptors = !fails$1y(function () {
  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
  return Object.defineProperty({}, 1, { get: function () { return 7; } })[1] !== 7;
});

var fails$1x = fails$1z;

var functionBindNative = !fails$1x(function () {
  // eslint-disable-next-line es/no-function-prototype-bind -- safe
  var test = (function () { /* empty */ }).bind();
  // eslint-disable-next-line no-prototype-builtins -- safe
  return typeof test != 'function' || test.hasOwnProperty('prototype');
});

var NATIVE_BIND$4 = functionBindNative;

var call$15 = Function.prototype.call;

var functionCall = NATIVE_BIND$4 ? call$15.bind(call$15) : function () {
  return call$15.apply(call$15, arguments);
};

var objectPropertyIsEnumerable = {};

var $propertyIsEnumerable$2 = {}.propertyIsEnumerable;
// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var getOwnPropertyDescriptor$c = Object.getOwnPropertyDescriptor;

// Nashorn ~ JDK8 bug
var NASHORN_BUG = getOwnPropertyDescriptor$c && !$propertyIsEnumerable$2.call({ 1: 2 }, 1);

// `Object.prototype.propertyIsEnumerable` method implementation
// https://tc39.es/ecma262/#sec-object.prototype.propertyisenumerable
objectPropertyIsEnumerable.f = NASHORN_BUG ? function propertyIsEnumerable(V) {
  var descriptor = getOwnPropertyDescriptor$c(this, V);
  return !!descriptor && descriptor.enumerable;
} : $propertyIsEnumerable$2;

var createPropertyDescriptor$d = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};

var NATIVE_BIND$3 = functionBindNative;

var FunctionPrototype$5 = Function.prototype;
var call$14 = FunctionPrototype$5.call;
var uncurryThisWithBind = NATIVE_BIND$3 && FunctionPrototype$5.bind.bind(call$14, call$14);

var functionUncurryThis = NATIVE_BIND$3 ? uncurryThisWithBind : function (fn) {
  return function () {
    return call$14.apply(fn, arguments);
  };
};

var uncurryThis$1F = functionUncurryThis;

var toString$H = uncurryThis$1F({}.toString);
var stringSlice$j = uncurryThis$1F(''.slice);

var classofRaw$2 = function (it) {
  return stringSlice$j(toString$H(it), 8, -1);
};

var uncurryThis$1E = functionUncurryThis;
var fails$1w = fails$1z;
var classof$q = classofRaw$2;

var $Object$5 = Object;
var split$3 = uncurryThis$1E(''.split);

// fallback for non-array-like ES3 and non-enumerable old V8 strings
var indexedObject = fails$1w(function () {
  // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
  // eslint-disable-next-line no-prototype-builtins -- safe
  return !$Object$5('z').propertyIsEnumerable(0);
}) ? function (it) {
  return classof$q(it) === 'String' ? split$3(it, '') : $Object$5(it);
} : $Object$5;

// we can't use just `it == null` since of `document.all` special case
// https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot-aec
var isNullOrUndefined$f = function (it) {
  return it === null || it === undefined;
};

var isNullOrUndefined$e = isNullOrUndefined$f;

var $TypeError$A = TypeError;

// `RequireObjectCoercible` abstract operation
// https://tc39.es/ecma262/#sec-requireobjectcoercible
var requireObjectCoercible$o = function (it) {
  if (isNullOrUndefined$e(it)) throw new $TypeError$A("Can't call method on " + it);
  return it;
};

// toObject with fallback for non-array-like ES3 strings
var IndexedObject$7 = indexedObject;
var requireObjectCoercible$n = requireObjectCoercible$o;

var toIndexedObject$j = function (it) {
  return IndexedObject$7(requireObjectCoercible$n(it));
};

// https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot
var documentAll = typeof document == 'object' && document.all;

// `IsCallable` abstract operation
// https://tc39.es/ecma262/#sec-iscallable
// eslint-disable-next-line unicorn/no-typeof-undefined -- required for testing
var isCallable$D = typeof documentAll == 'undefined' && documentAll !== undefined ? function (argument) {
  return typeof argument == 'function' || argument === documentAll;
} : function (argument) {
  return typeof argument == 'function';
};

var isCallable$C = isCallable$D;

var isObject$J = function (it) {
  return typeof it == 'object' ? it !== null : isCallable$C(it);
};

var globalThis$1k = globalThis_1;
var isCallable$B = isCallable$D;

var aFunction = function (argument) {
  return isCallable$B(argument) ? argument : undefined;
};

var getBuiltIn$C = function (namespace, method) {
  return arguments.length < 2 ? aFunction(globalThis$1k[namespace]) : globalThis$1k[namespace] && globalThis$1k[namespace][method];
};

var uncurryThis$1D = functionUncurryThis;

var objectIsPrototypeOf = uncurryThis$1D({}.isPrototypeOf);

var globalThis$1j = globalThis_1;

var navigator = globalThis$1j.navigator;
var userAgent$8 = navigator && navigator.userAgent;

var environmentUserAgent = userAgent$8 ? String(userAgent$8) : '';

var globalThis$1i = globalThis_1;
var userAgent$7 = environmentUserAgent;

var process$3 = globalThis$1i.process;
var Deno$1 = globalThis$1i.Deno;
var versions = process$3 && process$3.versions || Deno$1 && Deno$1.version;
var v8 = versions && versions.v8;
var match, version;

if (v8) {
  match = v8.split('.');
  // in old Chrome, versions of V8 isn't V8 = Chrome / 10
  // but their correct versions are not interesting for us
  version = match[0] > 0 && match[0] < 4 ? 1 : +(match[0] + match[1]);
}

// BrowserFS NodeJS `process` polyfill incorrectly set `.v8` to `0.0`
// so check `userAgent` even if `.v8` exists, but 0
if (!version && userAgent$7) {
  match = userAgent$7.match(/Edge\/(\d+)/);
  if (!match || match[1] >= 74) {
    match = userAgent$7.match(/Chrome\/(\d+)/);
    if (match) version = +match[1];
  }
}

var environmentV8Version = version;

/* eslint-disable es/no-symbol -- required for testing */
var V8_VERSION$3 = environmentV8Version;
var fails$1v = fails$1z;
var globalThis$1h = globalThis_1;

var $String$a = globalThis$1h.String;

// eslint-disable-next-line es/no-object-getownpropertysymbols -- required for testing
var symbolConstructorDetection = !!Object.getOwnPropertySymbols && !fails$1v(function () {
  var symbol = Symbol('symbol detection');
  // Chrome 38 Symbol has incorrect toString conversion
  // `get-own-property-symbols` polyfill symbols converted to object are not Symbol instances
  // nb: Do not call `String` directly to avoid this being optimized out to `symbol+''` which will,
  // of course, fail.
  return !$String$a(symbol) || !(Object(symbol) instanceof Symbol) ||
    // Chrome 38-40 symbols are not inherited from DOM collections prototypes to instances
    !Symbol.sham && V8_VERSION$3 && V8_VERSION$3 < 41;
});

/* eslint-disable es/no-symbol -- required for testing */
var NATIVE_SYMBOL$7 = symbolConstructorDetection;

var useSymbolAsUid = NATIVE_SYMBOL$7
  && !Symbol.sham
  && typeof Symbol.iterator == 'symbol';

var getBuiltIn$B = getBuiltIn$C;
var isCallable$A = isCallable$D;
var isPrototypeOf$f = objectIsPrototypeOf;
var USE_SYMBOL_AS_UID$1 = useSymbolAsUid;

var $Object$4 = Object;

var isSymbol$7 = USE_SYMBOL_AS_UID$1 ? function (it) {
  return typeof it == 'symbol';
} : function (it) {
  var $Symbol = getBuiltIn$B('Symbol');
  return isCallable$A($Symbol) && isPrototypeOf$f($Symbol.prototype, $Object$4(it));
};

var $String$9 = String;

var tryToString$7 = function (argument) {
  try {
    return $String$9(argument);
  } catch (error) {
    return 'Object';
  }
};

var isCallable$z = isCallable$D;
var tryToString$6 = tryToString$7;

var $TypeError$z = TypeError;

// `Assert: IsCallable(argument) is true`
var aCallable$F = function (argument) {
  if (isCallable$z(argument)) return argument;
  throw new $TypeError$z(tryToString$6(argument) + ' is not a function');
};

var aCallable$E = aCallable$F;
var isNullOrUndefined$d = isNullOrUndefined$f;

// `GetMethod` abstract operation
// https://tc39.es/ecma262/#sec-getmethod
var getMethod$j = function (V, P) {
  var func = V[P];
  return isNullOrUndefined$d(func) ? undefined : aCallable$E(func);
};

var call$13 = functionCall;
var isCallable$y = isCallable$D;
var isObject$I = isObject$J;

var $TypeError$y = TypeError;

// `OrdinaryToPrimitive` abstract operation
// https://tc39.es/ecma262/#sec-ordinarytoprimitive
var ordinaryToPrimitive$2 = function (input, pref) {
  var fn, val;
  if (pref === 'string' && isCallable$y(fn = input.toString) && !isObject$I(val = call$13(fn, input))) return val;
  if (isCallable$y(fn = input.valueOf) && !isObject$I(val = call$13(fn, input))) return val;
  if (pref !== 'string' && isCallable$y(fn = input.toString) && !isObject$I(val = call$13(fn, input))) return val;
  throw new $TypeError$y("Can't convert object to primitive value");
};

var sharedStore = {exports: {}};

var isPure = false;

var globalThis$1g = globalThis_1;

// eslint-disable-next-line es/no-object-defineproperty -- safe
var defineProperty$h = Object.defineProperty;

var defineGlobalProperty$3 = function (key, value) {
  try {
    defineProperty$h(globalThis$1g, key, { value: value, configurable: true, writable: true });
  } catch (error) {
    globalThis$1g[key] = value;
  } return value;
};

var globalThis$1f = globalThis_1;
var defineGlobalProperty$2 = defineGlobalProperty$3;

var SHARED = '__core-js_shared__';
var store$3 = sharedStore.exports = globalThis$1f[SHARED] || defineGlobalProperty$2(SHARED, {});

(store$3.versions || (store$3.versions = [])).push({
  version: '3.38.0',
  mode: 'global',
  copyright: '© 2014-2024 Denis Pushkarev (zloirock.ru)',
  license: 'https://github.com/zloirock/core-js/blob/v3.38.0/LICENSE',
  source: 'https://github.com/zloirock/core-js'
});

var sharedStoreExports = sharedStore.exports;

var store$2 = sharedStoreExports;

var shared$8 = function (key, value) {
  return store$2[key] || (store$2[key] = value || {});
};

var requireObjectCoercible$m = requireObjectCoercible$o;

var $Object$3 = Object;

// `ToObject` abstract operation
// https://tc39.es/ecma262/#sec-toobject
var toObject$y = function (argument) {
  return $Object$3(requireObjectCoercible$m(argument));
};

var uncurryThis$1C = functionUncurryThis;
var toObject$x = toObject$y;

var hasOwnProperty = uncurryThis$1C({}.hasOwnProperty);

// `HasOwnProperty` abstract operation
// https://tc39.es/ecma262/#sec-hasownproperty
// eslint-disable-next-line es/no-object-hasown -- safe
var hasOwnProperty_1 = Object.hasOwn || function hasOwn(it, key) {
  return hasOwnProperty(toObject$x(it), key);
};

var uncurryThis$1B = functionUncurryThis;

var id$2 = 0;
var postfix = Math.random();
var toString$G = uncurryThis$1B(1.0.toString);

var uid$7 = function (key) {
  return 'Symbol(' + (key === undefined ? '' : key) + ')_' + toString$G(++id$2 + postfix, 36);
};

var globalThis$1e = globalThis_1;
var shared$7 = shared$8;
var hasOwn$D = hasOwnProperty_1;
var uid$6 = uid$7;
var NATIVE_SYMBOL$6 = symbolConstructorDetection;
var USE_SYMBOL_AS_UID = useSymbolAsUid;

var Symbol$5 = globalThis$1e.Symbol;
var WellKnownSymbolsStore$1 = shared$7('wks');
var createWellKnownSymbol = USE_SYMBOL_AS_UID ? Symbol$5['for'] || Symbol$5 : Symbol$5 && Symbol$5.withoutSetter || uid$6;

var wellKnownSymbol$O = function (name) {
  if (!hasOwn$D(WellKnownSymbolsStore$1, name)) {
    WellKnownSymbolsStore$1[name] = NATIVE_SYMBOL$6 && hasOwn$D(Symbol$5, name)
      ? Symbol$5[name]
      : createWellKnownSymbol('Symbol.' + name);
  } return WellKnownSymbolsStore$1[name];
};

var call$12 = functionCall;
var isObject$H = isObject$J;
var isSymbol$6 = isSymbol$7;
var getMethod$i = getMethod$j;
var ordinaryToPrimitive$1 = ordinaryToPrimitive$2;
var wellKnownSymbol$N = wellKnownSymbol$O;

var $TypeError$x = TypeError;
var TO_PRIMITIVE$1 = wellKnownSymbol$N('toPrimitive');

// `ToPrimitive` abstract operation
// https://tc39.es/ecma262/#sec-toprimitive
var toPrimitive$4 = function (input, pref) {
  if (!isObject$H(input) || isSymbol$6(input)) return input;
  var exoticToPrim = getMethod$i(input, TO_PRIMITIVE$1);
  var result;
  if (exoticToPrim) {
    if (pref === undefined) pref = 'default';
    result = call$12(exoticToPrim, input, pref);
    if (!isObject$H(result) || isSymbol$6(result)) return result;
    throw new $TypeError$x("Can't convert object to primitive value");
  }
  if (pref === undefined) pref = 'number';
  return ordinaryToPrimitive$1(input, pref);
};

var toPrimitive$3 = toPrimitive$4;
var isSymbol$5 = isSymbol$7;

// `ToPropertyKey` abstract operation
// https://tc39.es/ecma262/#sec-topropertykey
var toPropertyKey$9 = function (argument) {
  var key = toPrimitive$3(argument, 'string');
  return isSymbol$5(key) ? key : key + '';
};

var globalThis$1d = globalThis_1;
var isObject$G = isObject$J;

var document$3 = globalThis$1d.document;
// typeof document.createElement is 'object' in old IE
var EXISTS$1 = isObject$G(document$3) && isObject$G(document$3.createElement);

var documentCreateElement$2 = function (it) {
  return EXISTS$1 ? document$3.createElement(it) : {};
};

var DESCRIPTORS$R = descriptors;
var fails$1u = fails$1z;
var createElement$1 = documentCreateElement$2;

// Thanks to IE8 for its funny defineProperty
var ie8DomDefine = !DESCRIPTORS$R && !fails$1u(function () {
  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
  return Object.defineProperty(createElement$1('div'), 'a', {
    get: function () { return 7; }
  }).a !== 7;
});

var DESCRIPTORS$Q = descriptors;
var call$11 = functionCall;
var propertyIsEnumerableModule$2 = objectPropertyIsEnumerable;
var createPropertyDescriptor$c = createPropertyDescriptor$d;
var toIndexedObject$i = toIndexedObject$j;
var toPropertyKey$8 = toPropertyKey$9;
var hasOwn$C = hasOwnProperty_1;
var IE8_DOM_DEFINE$1 = ie8DomDefine;

// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var $getOwnPropertyDescriptor$2 = Object.getOwnPropertyDescriptor;

// `Object.getOwnPropertyDescriptor` method
// https://tc39.es/ecma262/#sec-object.getownpropertydescriptor
objectGetOwnPropertyDescriptor.f = DESCRIPTORS$Q ? $getOwnPropertyDescriptor$2 : function getOwnPropertyDescriptor(O, P) {
  O = toIndexedObject$i(O);
  P = toPropertyKey$8(P);
  if (IE8_DOM_DEFINE$1) try {
    return $getOwnPropertyDescriptor$2(O, P);
  } catch (error) { /* empty */ }
  if (hasOwn$C(O, P)) return createPropertyDescriptor$c(!call$11(propertyIsEnumerableModule$2.f, O, P), O[P]);
};

var objectDefineProperty = {};

var DESCRIPTORS$P = descriptors;
var fails$1t = fails$1z;

// V8 ~ Chrome 36-
// https://bugs.chromium.org/p/v8/issues/detail?id=3334
var v8PrototypeDefineBug = DESCRIPTORS$P && fails$1t(function () {
  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
  return Object.defineProperty(function () { /* empty */ }, 'prototype', {
    value: 42,
    writable: false
  }).prototype !== 42;
});

var isObject$F = isObject$J;

var $String$8 = String;
var $TypeError$w = TypeError;

// `Assert: Type(argument) is Object`
var anObject$11 = function (argument) {
  if (isObject$F(argument)) return argument;
  throw new $TypeError$w($String$8(argument) + ' is not an object');
};

var DESCRIPTORS$O = descriptors;
var IE8_DOM_DEFINE = ie8DomDefine;
var V8_PROTOTYPE_DEFINE_BUG$1 = v8PrototypeDefineBug;
var anObject$10 = anObject$11;
var toPropertyKey$7 = toPropertyKey$9;

var $TypeError$v = TypeError;
// eslint-disable-next-line es/no-object-defineproperty -- safe
var $defineProperty$1 = Object.defineProperty;
// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var $getOwnPropertyDescriptor$1 = Object.getOwnPropertyDescriptor;
var ENUMERABLE = 'enumerable';
var CONFIGURABLE$1 = 'configurable';
var WRITABLE = 'writable';

// `Object.defineProperty` method
// https://tc39.es/ecma262/#sec-object.defineproperty
objectDefineProperty.f = DESCRIPTORS$O ? V8_PROTOTYPE_DEFINE_BUG$1 ? function defineProperty(O, P, Attributes) {
  anObject$10(O);
  P = toPropertyKey$7(P);
  anObject$10(Attributes);
  if (typeof O === 'function' && P === 'prototype' && 'value' in Attributes && WRITABLE in Attributes && !Attributes[WRITABLE]) {
    var current = $getOwnPropertyDescriptor$1(O, P);
    if (current && current[WRITABLE]) {
      O[P] = Attributes.value;
      Attributes = {
        configurable: CONFIGURABLE$1 in Attributes ? Attributes[CONFIGURABLE$1] : current[CONFIGURABLE$1],
        enumerable: ENUMERABLE in Attributes ? Attributes[ENUMERABLE] : current[ENUMERABLE],
        writable: false
      };
    }
  } return $defineProperty$1(O, P, Attributes);
} : $defineProperty$1 : function defineProperty(O, P, Attributes) {
  anObject$10(O);
  P = toPropertyKey$7(P);
  anObject$10(Attributes);
  if (IE8_DOM_DEFINE) try {
    return $defineProperty$1(O, P, Attributes);
  } catch (error) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw new $TypeError$v('Accessors not supported');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};

var DESCRIPTORS$N = descriptors;
var definePropertyModule$b = objectDefineProperty;
var createPropertyDescriptor$b = createPropertyDescriptor$d;

var createNonEnumerableProperty$j = DESCRIPTORS$N ? function (object, key, value) {
  return definePropertyModule$b.f(object, key, createPropertyDescriptor$b(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};

var makeBuiltIn$4 = {exports: {}};

var DESCRIPTORS$M = descriptors;
var hasOwn$B = hasOwnProperty_1;

var FunctionPrototype$4 = Function.prototype;
// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var getDescriptor = DESCRIPTORS$M && Object.getOwnPropertyDescriptor;

var EXISTS = hasOwn$B(FunctionPrototype$4, 'name');
// additional protection from minified / mangled / dropped function names
var PROPER = EXISTS && (function something() { /* empty */ }).name === 'something';
var CONFIGURABLE = EXISTS && (!DESCRIPTORS$M || (DESCRIPTORS$M && getDescriptor(FunctionPrototype$4, 'name').configurable));

var functionName = {
  EXISTS: EXISTS,
  PROPER: PROPER,
  CONFIGURABLE: CONFIGURABLE
};

var uncurryThis$1A = functionUncurryThis;
var isCallable$x = isCallable$D;
var store$1 = sharedStoreExports;

var functionToString$1 = uncurryThis$1A(Function.toString);

// this helper broken in `core-js@3.4.1-3.4.4`, so we can't use `shared` helper
if (!isCallable$x(store$1.inspectSource)) {
  store$1.inspectSource = function (it) {
    return functionToString$1(it);
  };
}

var inspectSource$3 = store$1.inspectSource;

var globalThis$1c = globalThis_1;
var isCallable$w = isCallable$D;

var WeakMap$2 = globalThis$1c.WeakMap;

var weakMapBasicDetection = isCallable$w(WeakMap$2) && /native code/.test(String(WeakMap$2));

var shared$6 = shared$8;
var uid$5 = uid$7;

var keys$2 = shared$6('keys');

var sharedKey$4 = function (key) {
  return keys$2[key] || (keys$2[key] = uid$5(key));
};

var hiddenKeys$6 = {};

var NATIVE_WEAK_MAP$1 = weakMapBasicDetection;
var globalThis$1b = globalThis_1;
var isObject$E = isObject$J;
var createNonEnumerableProperty$i = createNonEnumerableProperty$j;
var hasOwn$A = hasOwnProperty_1;
var shared$5 = sharedStoreExports;
var sharedKey$3 = sharedKey$4;
var hiddenKeys$5 = hiddenKeys$6;

var OBJECT_ALREADY_INITIALIZED = 'Object already initialized';
var TypeError$a = globalThis$1b.TypeError;
var WeakMap$1 = globalThis$1b.WeakMap;
var set$4, get$3, has$7;

var enforce = function (it) {
  return has$7(it) ? get$3(it) : set$4(it, {});
};

var getterFor$1 = function (TYPE) {
  return function (it) {
    var state;
    if (!isObject$E(it) || (state = get$3(it)).type !== TYPE) {
      throw new TypeError$a('Incompatible receiver, ' + TYPE + ' required');
    } return state;
  };
};

if (NATIVE_WEAK_MAP$1 || shared$5.state) {
  var store = shared$5.state || (shared$5.state = new WeakMap$1());
  /* eslint-disable no-self-assign -- prototype methods protection */
  store.get = store.get;
  store.has = store.has;
  store.set = store.set;
  /* eslint-enable no-self-assign -- prototype methods protection */
  set$4 = function (it, metadata) {
    if (store.has(it)) throw new TypeError$a(OBJECT_ALREADY_INITIALIZED);
    metadata.facade = it;
    store.set(it, metadata);
    return metadata;
  };
  get$3 = function (it) {
    return store.get(it) || {};
  };
  has$7 = function (it) {
    return store.has(it);
  };
} else {
  var STATE = sharedKey$3('state');
  hiddenKeys$5[STATE] = true;
  set$4 = function (it, metadata) {
    if (hasOwn$A(it, STATE)) throw new TypeError$a(OBJECT_ALREADY_INITIALIZED);
    metadata.facade = it;
    createNonEnumerableProperty$i(it, STATE, metadata);
    return metadata;
  };
  get$3 = function (it) {
    return hasOwn$A(it, STATE) ? it[STATE] : {};
  };
  has$7 = function (it) {
    return hasOwn$A(it, STATE);
  };
}

var internalState = {
  set: set$4,
  get: get$3,
  has: has$7,
  enforce: enforce,
  getterFor: getterFor$1
};

var uncurryThis$1z = functionUncurryThis;
var fails$1s = fails$1z;
var isCallable$v = isCallable$D;
var hasOwn$z = hasOwnProperty_1;
var DESCRIPTORS$L = descriptors;
var CONFIGURABLE_FUNCTION_NAME$2 = functionName.CONFIGURABLE;
var inspectSource$2 = inspectSource$3;
var InternalStateModule$i = internalState;

var enforceInternalState$4 = InternalStateModule$i.enforce;
var getInternalState$c = InternalStateModule$i.get;
var $String$7 = String;
// eslint-disable-next-line es/no-object-defineproperty -- safe
var defineProperty$g = Object.defineProperty;
var stringSlice$i = uncurryThis$1z(''.slice);
var replace$c = uncurryThis$1z(''.replace);
var join$9 = uncurryThis$1z([].join);

var CONFIGURABLE_LENGTH = DESCRIPTORS$L && !fails$1s(function () {
  return defineProperty$g(function () { /* empty */ }, 'length', { value: 8 }).length !== 8;
});

var TEMPLATE = String(String).split('String');

var makeBuiltIn$3 = makeBuiltIn$4.exports = function (value, name, options) {
  if (stringSlice$i($String$7(name), 0, 7) === 'Symbol(') {
    name = '[' + replace$c($String$7(name), /^Symbol\(([^)]*)\).*$/, '$1') + ']';
  }
  if (options && options.getter) name = 'get ' + name;
  if (options && options.setter) name = 'set ' + name;
  if (!hasOwn$z(value, 'name') || (CONFIGURABLE_FUNCTION_NAME$2 && value.name !== name)) {
    if (DESCRIPTORS$L) defineProperty$g(value, 'name', { value: name, configurable: true });
    else value.name = name;
  }
  if (CONFIGURABLE_LENGTH && options && hasOwn$z(options, 'arity') && value.length !== options.arity) {
    defineProperty$g(value, 'length', { value: options.arity });
  }
  try {
    if (options && hasOwn$z(options, 'constructor') && options.constructor) {
      if (DESCRIPTORS$L) defineProperty$g(value, 'prototype', { writable: false });
    // in V8 ~ Chrome 53, prototypes of some methods, like `Array.prototype.values`, are non-writable
    } else if (value.prototype) value.prototype = undefined;
  } catch (error) { /* empty */ }
  var state = enforceInternalState$4(value);
  if (!hasOwn$z(state, 'source')) {
    state.source = join$9(TEMPLATE, typeof name == 'string' ? name : '');
  } return value;
};

// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
// eslint-disable-next-line no-extend-native -- required
Function.prototype.toString = makeBuiltIn$3(function toString() {
  return isCallable$v(this) && getInternalState$c(this).source || inspectSource$2(this);
}, 'toString');

var makeBuiltInExports = makeBuiltIn$4.exports;

var isCallable$u = isCallable$D;
var definePropertyModule$a = objectDefineProperty;
var makeBuiltIn$2 = makeBuiltInExports;
var defineGlobalProperty$1 = defineGlobalProperty$3;

var defineBuiltIn$t = function (O, key, value, options) {
  if (!options) options = {};
  var simple = options.enumerable;
  var name = options.name !== undefined ? options.name : key;
  if (isCallable$u(value)) makeBuiltIn$2(value, name, options);
  if (options.global) {
    if (simple) O[key] = value;
    else defineGlobalProperty$1(key, value);
  } else {
    try {
      if (!options.unsafe) delete O[key];
      else if (O[key]) simple = true;
    } catch (error) { /* empty */ }
    if (simple) O[key] = value;
    else definePropertyModule$a.f(O, key, {
      value: value,
      enumerable: false,
      configurable: !options.nonConfigurable,
      writable: !options.nonWritable
    });
  } return O;
};

var objectGetOwnPropertyNames = {};

var ceil$1 = Math.ceil;
var floor$a = Math.floor;

// `Math.trunc` method
// https://tc39.es/ecma262/#sec-math.trunc
// eslint-disable-next-line es/no-math-trunc -- safe
var mathTrunc = Math.trunc || function trunc(x) {
  var n = +x;
  return (n > 0 ? floor$a : ceil$1)(n);
};

var trunc$1 = mathTrunc;

// `ToIntegerOrInfinity` abstract operation
// https://tc39.es/ecma262/#sec-tointegerorinfinity
var toIntegerOrInfinity$n = function (argument) {
  var number = +argument;
  // eslint-disable-next-line no-self-compare -- NaN check
  return number !== number || number === 0 ? 0 : trunc$1(number);
};

var toIntegerOrInfinity$m = toIntegerOrInfinity$n;

var max$8 = Math.max;
var min$d = Math.min;

// Helper for a popular repeating case of the spec:
// Let integer be ? ToInteger(index).
// If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).
var toAbsoluteIndex$a = function (index, length) {
  var integer = toIntegerOrInfinity$m(index);
  return integer < 0 ? max$8(integer + length, 0) : min$d(integer, length);
};

var toIntegerOrInfinity$l = toIntegerOrInfinity$n;

var min$c = Math.min;

// `ToLength` abstract operation
// https://tc39.es/ecma262/#sec-tolength
var toLength$d = function (argument) {
  var len = toIntegerOrInfinity$l(argument);
  return len > 0 ? min$c(len, 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
};

var toLength$c = toLength$d;

// `LengthOfArrayLike` abstract operation
// https://tc39.es/ecma262/#sec-lengthofarraylike
var lengthOfArrayLike$w = function (obj) {
  return toLength$c(obj.length);
};

var toIndexedObject$h = toIndexedObject$j;
var toAbsoluteIndex$9 = toAbsoluteIndex$a;
var lengthOfArrayLike$v = lengthOfArrayLike$w;

// `Array.prototype.{ indexOf, includes }` methods implementation
var createMethod$8 = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIndexedObject$h($this);
    var length = lengthOfArrayLike$v(O);
    if (length === 0) return !IS_INCLUDES && -1;
    var index = toAbsoluteIndex$9(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare -- NaN check
    if (IS_INCLUDES && el !== el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare -- NaN check
      if (value !== value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) {
      if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};

var arrayIncludes = {
  // `Array.prototype.includes` method
  // https://tc39.es/ecma262/#sec-array.prototype.includes
  includes: createMethod$8(true),
  // `Array.prototype.indexOf` method
  // https://tc39.es/ecma262/#sec-array.prototype.indexof
  indexOf: createMethod$8(false)
};

var uncurryThis$1y = functionUncurryThis;
var hasOwn$y = hasOwnProperty_1;
var toIndexedObject$g = toIndexedObject$j;
var indexOf$2 = arrayIncludes.indexOf;
var hiddenKeys$4 = hiddenKeys$6;

var push$n = uncurryThis$1y([].push);

var objectKeysInternal = function (object, names) {
  var O = toIndexedObject$g(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) !hasOwn$y(hiddenKeys$4, key) && hasOwn$y(O, key) && push$n(result, key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (hasOwn$y(O, key = names[i++])) {
    ~indexOf$2(result, key) || push$n(result, key);
  }
  return result;
};

// IE8- don't enum bug keys
var enumBugKeys$3 = [
  'constructor',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toLocaleString',
  'toString',
  'valueOf'
];

var internalObjectKeys$1 = objectKeysInternal;
var enumBugKeys$2 = enumBugKeys$3;

var hiddenKeys$3 = enumBugKeys$2.concat('length', 'prototype');

// `Object.getOwnPropertyNames` method
// https://tc39.es/ecma262/#sec-object.getownpropertynames
// eslint-disable-next-line es/no-object-getownpropertynames -- safe
objectGetOwnPropertyNames.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return internalObjectKeys$1(O, hiddenKeys$3);
};

var objectGetOwnPropertySymbols = {};

// eslint-disable-next-line es/no-object-getownpropertysymbols -- safe
objectGetOwnPropertySymbols.f = Object.getOwnPropertySymbols;

var getBuiltIn$A = getBuiltIn$C;
var uncurryThis$1x = functionUncurryThis;
var getOwnPropertyNamesModule$2 = objectGetOwnPropertyNames;
var getOwnPropertySymbolsModule$3 = objectGetOwnPropertySymbols;
var anObject$$ = anObject$11;

var concat$3 = uncurryThis$1x([].concat);

// all object keys, includes non-enumerable and symbols
var ownKeys$3 = getBuiltIn$A('Reflect', 'ownKeys') || function ownKeys(it) {
  var keys = getOwnPropertyNamesModule$2.f(anObject$$(it));
  var getOwnPropertySymbols = getOwnPropertySymbolsModule$3.f;
  return getOwnPropertySymbols ? concat$3(keys, getOwnPropertySymbols(it)) : keys;
};

var hasOwn$x = hasOwnProperty_1;
var ownKeys$2 = ownKeys$3;
var getOwnPropertyDescriptorModule$6 = objectGetOwnPropertyDescriptor;
var definePropertyModule$9 = objectDefineProperty;

var copyConstructorProperties$7 = function (target, source, exceptions) {
  var keys = ownKeys$2(source);
  var defineProperty = definePropertyModule$9.f;
  var getOwnPropertyDescriptor = getOwnPropertyDescriptorModule$6.f;
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (!hasOwn$x(target, key) && !(exceptions && hasOwn$x(exceptions, key))) {
      defineProperty(target, key, getOwnPropertyDescriptor(source, key));
    }
  }
};

var fails$1r = fails$1z;
var isCallable$t = isCallable$D;

var replacement = /#|\.prototype\./;

var isForced$5 = function (feature, detection) {
  var value = data[normalize(feature)];
  return value === POLYFILL ? true
    : value === NATIVE ? false
    : isCallable$t(detection) ? fails$1r(detection)
    : !!detection;
};

var normalize = isForced$5.normalize = function (string) {
  return String(string).replace(replacement, '.').toLowerCase();
};

var data = isForced$5.data = {};
var NATIVE = isForced$5.NATIVE = 'N';
var POLYFILL = isForced$5.POLYFILL = 'P';

var isForced_1 = isForced$5;

var globalThis$1a = globalThis_1;
var getOwnPropertyDescriptor$b = objectGetOwnPropertyDescriptor.f;
var createNonEnumerableProperty$h = createNonEnumerableProperty$j;
var defineBuiltIn$s = defineBuiltIn$t;
var defineGlobalProperty = defineGlobalProperty$3;
var copyConstructorProperties$6 = copyConstructorProperties$7;
var isForced$4 = isForced_1;

/*
  options.target         - name of the target object
  options.global         - target is the global object
  options.stat           - export as static methods of target
  options.proto          - export as prototype methods of target
  options.real           - real prototype method for the `pure` version
  options.forced         - export even if the native feature is available
  options.bind           - bind methods to the target, required for the `pure` version
  options.wrap           - wrap constructors to preventing global pollution, required for the `pure` version
  options.unsafe         - use the simple assignment of property instead of delete + defineProperty
  options.sham           - add a flag to not completely full polyfills
  options.enumerable     - export as enumerable property
  options.dontCallGetSet - prevent calling a getter on target
  options.name           - the .name of the function if it does not match the key
*/
var _export = function (options, source) {
  var TARGET = options.target;
  var GLOBAL = options.global;
  var STATIC = options.stat;
  var FORCED, target, key, targetProperty, sourceProperty, descriptor;
  if (GLOBAL) {
    target = globalThis$1a;
  } else if (STATIC) {
    target = globalThis$1a[TARGET] || defineGlobalProperty(TARGET, {});
  } else {
    target = globalThis$1a[TARGET] && globalThis$1a[TARGET].prototype;
  }
  if (target) for (key in source) {
    sourceProperty = source[key];
    if (options.dontCallGetSet) {
      descriptor = getOwnPropertyDescriptor$b(target, key);
      targetProperty = descriptor && descriptor.value;
    } else targetProperty = target[key];
    FORCED = isForced$4(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced);
    // contained in target
    if (!FORCED && targetProperty !== undefined) {
      if (typeof sourceProperty == typeof targetProperty) continue;
      copyConstructorProperties$6(sourceProperty, targetProperty);
    }
    // add a flag to not completely full polyfills
    if (options.sham || (targetProperty && targetProperty.sham)) {
      createNonEnumerableProperty$h(sourceProperty, 'sham', true);
    }
    defineBuiltIn$s(target, key, sourceProperty, options);
  }
};

var wellKnownSymbol$M = wellKnownSymbol$O;

var TO_STRING_TAG$b = wellKnownSymbol$M('toStringTag');
var test$2 = {};

test$2[TO_STRING_TAG$b] = 'z';

var toStringTagSupport = String(test$2) === '[object z]';

var TO_STRING_TAG_SUPPORT$2 = toStringTagSupport;
var isCallable$s = isCallable$D;
var classofRaw$1 = classofRaw$2;
var wellKnownSymbol$L = wellKnownSymbol$O;

var TO_STRING_TAG$a = wellKnownSymbol$L('toStringTag');
var $Object$2 = Object;

// ES3 wrong here
var CORRECT_ARGUMENTS = classofRaw$1(function () { return arguments; }()) === 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (error) { /* empty */ }
};

// getting tag from ES6+ `Object.prototype.toString`
var classof$p = TO_STRING_TAG_SUPPORT$2 ? classofRaw$1 : function (it) {
  var O, tag, result;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (tag = tryGet(O = $Object$2(it), TO_STRING_TAG$a)) == 'string' ? tag
    // builtinTag case
    : CORRECT_ARGUMENTS ? classofRaw$1(O)
    // ES3 arguments fallback
    : (result = classofRaw$1(O)) === 'Object' && isCallable$s(O.callee) ? 'Arguments' : result;
};

var classof$o = classof$p;

var $String$6 = String;

var toString$F = function (argument) {
  if (classof$o(argument) === 'Symbol') throw new TypeError('Cannot convert a Symbol value to a string');
  return $String$6(argument);
};

var objectDefineProperties = {};

var internalObjectKeys = objectKeysInternal;
var enumBugKeys$1 = enumBugKeys$3;

// `Object.keys` method
// https://tc39.es/ecma262/#sec-object.keys
// eslint-disable-next-line es/no-object-keys -- safe
var objectKeys$5 = Object.keys || function keys(O) {
  return internalObjectKeys(O, enumBugKeys$1);
};

var DESCRIPTORS$K = descriptors;
var V8_PROTOTYPE_DEFINE_BUG = v8PrototypeDefineBug;
var definePropertyModule$8 = objectDefineProperty;
var anObject$_ = anObject$11;
var toIndexedObject$f = toIndexedObject$j;
var objectKeys$4 = objectKeys$5;

// `Object.defineProperties` method
// https://tc39.es/ecma262/#sec-object.defineproperties
// eslint-disable-next-line es/no-object-defineproperties -- safe
objectDefineProperties.f = DESCRIPTORS$K && !V8_PROTOTYPE_DEFINE_BUG ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject$_(O);
  var props = toIndexedObject$f(Properties);
  var keys = objectKeys$4(Properties);
  var length = keys.length;
  var index = 0;
  var key;
  while (length > index) definePropertyModule$8.f(O, key = keys[index++], props[key]);
  return O;
};

var getBuiltIn$z = getBuiltIn$C;

var html$2 = getBuiltIn$z('document', 'documentElement');

/* global ActiveXObject -- old IE, WSH */
var anObject$Z = anObject$11;
var definePropertiesModule$1 = objectDefineProperties;
var enumBugKeys = enumBugKeys$3;
var hiddenKeys$2 = hiddenKeys$6;
var html$1 = html$2;
var documentCreateElement$1 = documentCreateElement$2;
var sharedKey$2 = sharedKey$4;

var GT = '>';
var LT = '<';
var PROTOTYPE$2 = 'prototype';
var SCRIPT = 'script';
var IE_PROTO$1 = sharedKey$2('IE_PROTO');

var EmptyConstructor = function () { /* empty */ };

var scriptTag = function (content) {
  return LT + SCRIPT + GT + content + LT + '/' + SCRIPT + GT;
};

// Create object with fake `null` prototype: use ActiveX Object with cleared prototype
var NullProtoObjectViaActiveX = function (activeXDocument) {
  activeXDocument.write(scriptTag(''));
  activeXDocument.close();
  var temp = activeXDocument.parentWindow.Object;
  // eslint-disable-next-line no-useless-assignment -- avoid memory leak
  activeXDocument = null;
  return temp;
};

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var NullProtoObjectViaIFrame = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = documentCreateElement$1('iframe');
  var JS = 'java' + SCRIPT + ':';
  var iframeDocument;
  iframe.style.display = 'none';
  html$1.appendChild(iframe);
  // https://github.com/zloirock/core-js/issues/475
  iframe.src = String(JS);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(scriptTag('document.F=Object'));
  iframeDocument.close();
  return iframeDocument.F;
};

// Check for document.domain and active x support
// No need to use active x approach when document.domain is not set
// see https://github.com/es-shims/es5-shim/issues/150
// variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
// avoid IE GC bug
var activeXDocument;
var NullProtoObject = function () {
  try {
    activeXDocument = new ActiveXObject('htmlfile');
  } catch (error) { /* ignore */ }
  NullProtoObject = typeof document != 'undefined'
    ? document.domain && activeXDocument
      ? NullProtoObjectViaActiveX(activeXDocument) // old IE
      : NullProtoObjectViaIFrame()
    : NullProtoObjectViaActiveX(activeXDocument); // WSH
  var length = enumBugKeys.length;
  while (length--) delete NullProtoObject[PROTOTYPE$2][enumBugKeys[length]];
  return NullProtoObject();
};

hiddenKeys$2[IE_PROTO$1] = true;

// `Object.create` method
// https://tc39.es/ecma262/#sec-object.create
// eslint-disable-next-line es/no-object-create -- safe
var objectCreate$1 = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    EmptyConstructor[PROTOTYPE$2] = anObject$Z(O);
    result = new EmptyConstructor();
    EmptyConstructor[PROTOTYPE$2] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO$1] = O;
  } else result = NullProtoObject();
  return Properties === undefined ? result : definePropertiesModule$1.f(result, Properties);
};

var objectGetOwnPropertyNamesExternal = {};

var uncurryThis$1w = functionUncurryThis;

var arraySlice$a = uncurryThis$1w([].slice);

/* eslint-disable es/no-object-getownpropertynames -- safe */
var classof$n = classofRaw$2;
var toIndexedObject$e = toIndexedObject$j;
var $getOwnPropertyNames$1 = objectGetOwnPropertyNames.f;
var arraySlice$9 = arraySlice$a;

var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function (it) {
  try {
    return $getOwnPropertyNames$1(it);
  } catch (error) {
    return arraySlice$9(windowNames);
  }
};

// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
objectGetOwnPropertyNamesExternal.f = function getOwnPropertyNames(it) {
  return windowNames && classof$n(it) === 'Window'
    ? getWindowNames(it)
    : $getOwnPropertyNames$1(toIndexedObject$e(it));
};

var makeBuiltIn$1 = makeBuiltInExports;
var defineProperty$f = objectDefineProperty;

var defineBuiltInAccessor$l = function (target, name, descriptor) {
  if (descriptor.get) makeBuiltIn$1(descriptor.get, name, { getter: true });
  if (descriptor.set) makeBuiltIn$1(descriptor.set, name, { setter: true });
  return defineProperty$f.f(target, name, descriptor);
};

var wellKnownSymbolWrapped = {};

var wellKnownSymbol$K = wellKnownSymbol$O;

wellKnownSymbolWrapped.f = wellKnownSymbol$K;

var globalThis$19 = globalThis_1;

var path$2 = globalThis$19;

var path$1 = path$2;
var hasOwn$w = hasOwnProperty_1;
var wrappedWellKnownSymbolModule$1 = wellKnownSymbolWrapped;
var defineProperty$e = objectDefineProperty.f;

var wellKnownSymbolDefine = function (NAME) {
  var Symbol = path$1.Symbol || (path$1.Symbol = {});
  if (!hasOwn$w(Symbol, NAME)) defineProperty$e(Symbol, NAME, {
    value: wrappedWellKnownSymbolModule$1.f(NAME)
  });
};

var call$10 = functionCall;
var getBuiltIn$y = getBuiltIn$C;
var wellKnownSymbol$J = wellKnownSymbol$O;
var defineBuiltIn$r = defineBuiltIn$t;

var symbolDefineToPrimitive = function () {
  var Symbol = getBuiltIn$y('Symbol');
  var SymbolPrototype = Symbol && Symbol.prototype;
  var valueOf = SymbolPrototype && SymbolPrototype.valueOf;
  var TO_PRIMITIVE = wellKnownSymbol$J('toPrimitive');

  if (SymbolPrototype && !SymbolPrototype[TO_PRIMITIVE]) {
    // `Symbol.prototype[@@toPrimitive]` method
    // https://tc39.es/ecma262/#sec-symbol.prototype-@@toprimitive
    // eslint-disable-next-line no-unused-vars -- required for .length
    defineBuiltIn$r(SymbolPrototype, TO_PRIMITIVE, function (hint) {
      return call$10(valueOf, this);
    }, { arity: 1 });
  }
};

var defineProperty$d = objectDefineProperty.f;
var hasOwn$v = hasOwnProperty_1;
var wellKnownSymbol$I = wellKnownSymbol$O;

var TO_STRING_TAG$9 = wellKnownSymbol$I('toStringTag');

var setToStringTag$e = function (target, TAG, STATIC) {
  if (target && !STATIC) target = target.prototype;
  if (target && !hasOwn$v(target, TO_STRING_TAG$9)) {
    defineProperty$d(target, TO_STRING_TAG$9, { configurable: true, value: TAG });
  }
};

var classofRaw = classofRaw$2;
var uncurryThis$1v = functionUncurryThis;

var functionUncurryThisClause = function (fn) {
  // Nashorn bug:
  //   https://github.com/zloirock/core-js/issues/1128
  //   https://github.com/zloirock/core-js/issues/1130
  if (classofRaw(fn) === 'Function') return uncurryThis$1v(fn);
};

var uncurryThis$1u = functionUncurryThisClause;
var aCallable$D = aCallable$F;
var NATIVE_BIND$2 = functionBindNative;

var bind$i = uncurryThis$1u(uncurryThis$1u.bind);

// optional / simple context binding
var functionBindContext = function (fn, that) {
  aCallable$D(fn);
  return that === undefined ? fn : NATIVE_BIND$2 ? bind$i(fn, that) : function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};

var classof$m = classofRaw$2;

// `IsArray` abstract operation
// https://tc39.es/ecma262/#sec-isarray
// eslint-disable-next-line es/no-array-isarray -- safe
var isArray$a = Array.isArray || function isArray(argument) {
  return classof$m(argument) === 'Array';
};

var uncurryThis$1t = functionUncurryThis;
var fails$1q = fails$1z;
var isCallable$r = isCallable$D;
var classof$l = classof$p;
var getBuiltIn$x = getBuiltIn$C;
var inspectSource$1 = inspectSource$3;

var noop = function () { /* empty */ };
var construct$1 = getBuiltIn$x('Reflect', 'construct');
var constructorRegExp = /^\s*(?:class|function)\b/;
var exec$d = uncurryThis$1t(constructorRegExp.exec);
var INCORRECT_TO_STRING$2 = !constructorRegExp.test(noop);

var isConstructorModern = function isConstructor(argument) {
  if (!isCallable$r(argument)) return false;
  try {
    construct$1(noop, [], argument);
    return true;
  } catch (error) {
    return false;
  }
};

var isConstructorLegacy = function isConstructor(argument) {
  if (!isCallable$r(argument)) return false;
  switch (classof$l(argument)) {
    case 'AsyncFunction':
    case 'GeneratorFunction':
    case 'AsyncGeneratorFunction': return false;
  }
  try {
    // we can't check .prototype since constructors produced by .bind haven't it
    // `Function#toString` throws on some built-it function in some legacy engines
    // (for example, `DOMQuad` and similar in FF41-)
    return INCORRECT_TO_STRING$2 || !!exec$d(constructorRegExp, inspectSource$1(argument));
  } catch (error) {
    return true;
  }
};

isConstructorLegacy.sham = true;

// `IsConstructor` abstract operation
// https://tc39.es/ecma262/#sec-isconstructor
var isConstructor$7 = !construct$1 || fails$1q(function () {
  var called;
  return isConstructorModern(isConstructorModern.call)
    || !isConstructorModern(Object)
    || !isConstructorModern(function () { called = true; })
    || called;
}) ? isConstructorLegacy : isConstructorModern;

var isArray$9 = isArray$a;
var isConstructor$6 = isConstructor$7;
var isObject$D = isObject$J;
var wellKnownSymbol$H = wellKnownSymbol$O;

var SPECIES$6 = wellKnownSymbol$H('species');
var $Array$b = Array;

// a part of `ArraySpeciesCreate` abstract operation
// https://tc39.es/ecma262/#sec-arrayspeciescreate
var arraySpeciesConstructor$1 = function (originalArray) {
  var C;
  if (isArray$9(originalArray)) {
    C = originalArray.constructor;
    // cross-realm fallback
    if (isConstructor$6(C) && (C === $Array$b || isArray$9(C.prototype))) C = undefined;
    else if (isObject$D(C)) {
      C = C[SPECIES$6];
      if (C === null) C = undefined;
    }
  } return C === undefined ? $Array$b : C;
};

var arraySpeciesConstructor = arraySpeciesConstructor$1;

// `ArraySpeciesCreate` abstract operation
// https://tc39.es/ecma262/#sec-arrayspeciescreate
var arraySpeciesCreate$5 = function (originalArray, length) {
  return new (arraySpeciesConstructor(originalArray))(length === 0 ? 0 : length);
};

var bind$h = functionBindContext;
var uncurryThis$1s = functionUncurryThis;
var IndexedObject$6 = indexedObject;
var toObject$w = toObject$y;
var lengthOfArrayLike$u = lengthOfArrayLike$w;
var arraySpeciesCreate$4 = arraySpeciesCreate$5;

var push$m = uncurryThis$1s([].push);

// `Array.prototype.{ forEach, map, filter, some, every, find, findIndex, filterReject }` methods implementation
var createMethod$7 = function (TYPE) {
  var IS_MAP = TYPE === 1;
  var IS_FILTER = TYPE === 2;
  var IS_SOME = TYPE === 3;
  var IS_EVERY = TYPE === 4;
  var IS_FIND_INDEX = TYPE === 6;
  var IS_FILTER_REJECT = TYPE === 7;
  var NO_HOLES = TYPE === 5 || IS_FIND_INDEX;
  return function ($this, callbackfn, that, specificCreate) {
    var O = toObject$w($this);
    var self = IndexedObject$6(O);
    var length = lengthOfArrayLike$u(self);
    var boundFunction = bind$h(callbackfn, that);
    var index = 0;
    var create = specificCreate || arraySpeciesCreate$4;
    var target = IS_MAP ? create($this, length) : IS_FILTER || IS_FILTER_REJECT ? create($this, 0) : undefined;
    var value, result;
    for (;length > index; index++) if (NO_HOLES || index in self) {
      value = self[index];
      result = boundFunction(value, index, O);
      if (TYPE) {
        if (IS_MAP) target[index] = result; // map
        else if (result) switch (TYPE) {
          case 3: return true;              // some
          case 5: return value;             // find
          case 6: return index;             // findIndex
          case 2: push$m(target, value);      // filter
        } else switch (TYPE) {
          case 4: return false;             // every
          case 7: push$m(target, value);      // filterReject
        }
      }
    }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : target;
  };
};

var arrayIteration = {
  // `Array.prototype.forEach` method
  // https://tc39.es/ecma262/#sec-array.prototype.foreach
  forEach: createMethod$7(0),
  // `Array.prototype.map` method
  // https://tc39.es/ecma262/#sec-array.prototype.map
  map: createMethod$7(1),
  // `Array.prototype.filter` method
  // https://tc39.es/ecma262/#sec-array.prototype.filter
  filter: createMethod$7(2),
  // `Array.prototype.some` method
  // https://tc39.es/ecma262/#sec-array.prototype.some
  some: createMethod$7(3),
  // `Array.prototype.every` method
  // https://tc39.es/ecma262/#sec-array.prototype.every
  every: createMethod$7(4),
  // `Array.prototype.find` method
  // https://tc39.es/ecma262/#sec-array.prototype.find
  find: createMethod$7(5),
  // `Array.prototype.findIndex` method
  // https://tc39.es/ecma262/#sec-array.prototype.findIndex
  findIndex: createMethod$7(6),
  // `Array.prototype.filterReject` method
  // https://github.com/tc39/proposal-array-filtering
  filterReject: createMethod$7(7)
};

var $$3Y = _export;
var globalThis$18 = globalThis_1;
var call$$ = functionCall;
var uncurryThis$1r = functionUncurryThis;
var DESCRIPTORS$J = descriptors;
var NATIVE_SYMBOL$5 = symbolConstructorDetection;
var fails$1p = fails$1z;
var hasOwn$u = hasOwnProperty_1;
var isPrototypeOf$e = objectIsPrototypeOf;
var anObject$Y = anObject$11;
var toIndexedObject$d = toIndexedObject$j;
var toPropertyKey$6 = toPropertyKey$9;
var $toString$3 = toString$F;
var createPropertyDescriptor$a = createPropertyDescriptor$d;
var nativeObjectCreate = objectCreate$1;
var objectKeys$3 = objectKeys$5;
var getOwnPropertyNamesModule$1 = objectGetOwnPropertyNames;
var getOwnPropertyNamesExternal = objectGetOwnPropertyNamesExternal;
var getOwnPropertySymbolsModule$2 = objectGetOwnPropertySymbols;
var getOwnPropertyDescriptorModule$5 = objectGetOwnPropertyDescriptor;
var definePropertyModule$7 = objectDefineProperty;
var definePropertiesModule = objectDefineProperties;
var propertyIsEnumerableModule$1 = objectPropertyIsEnumerable;
var defineBuiltIn$q = defineBuiltIn$t;
var defineBuiltInAccessor$k = defineBuiltInAccessor$l;
var shared$4 = shared$8;
var sharedKey$1 = sharedKey$4;
var hiddenKeys$1 = hiddenKeys$6;
var uid$4 = uid$7;
var wellKnownSymbol$G = wellKnownSymbol$O;
var wrappedWellKnownSymbolModule = wellKnownSymbolWrapped;
var defineWellKnownSymbol$g = wellKnownSymbolDefine;
var defineSymbolToPrimitive$1 = symbolDefineToPrimitive;
var setToStringTag$d = setToStringTag$e;
var InternalStateModule$h = internalState;
var $forEach$3 = arrayIteration.forEach;

var HIDDEN = sharedKey$1('hidden');
var SYMBOL = 'Symbol';
var PROTOTYPE$1 = 'prototype';

var setInternalState$h = InternalStateModule$h.set;
var getInternalState$b = InternalStateModule$h.getterFor(SYMBOL);

var ObjectPrototype$5 = Object[PROTOTYPE$1];
var $Symbol = globalThis$18.Symbol;
var SymbolPrototype$1 = $Symbol && $Symbol[PROTOTYPE$1];
var RangeError$4 = globalThis$18.RangeError;
var TypeError$9 = globalThis$18.TypeError;
var QObject = globalThis$18.QObject;
var nativeGetOwnPropertyDescriptor$2 = getOwnPropertyDescriptorModule$5.f;
var nativeDefineProperty$1 = definePropertyModule$7.f;
var nativeGetOwnPropertyNames = getOwnPropertyNamesExternal.f;
var nativePropertyIsEnumerable = propertyIsEnumerableModule$1.f;
var push$l = uncurryThis$1r([].push);

var AllSymbols = shared$4('symbols');
var ObjectPrototypeSymbols = shared$4('op-symbols');
var WellKnownSymbolsStore = shared$4('wks');

// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
var USE_SETTER = !QObject || !QObject[PROTOTYPE$1] || !QObject[PROTOTYPE$1].findChild;

// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
var fallbackDefineProperty = function (O, P, Attributes) {
  var ObjectPrototypeDescriptor = nativeGetOwnPropertyDescriptor$2(ObjectPrototype$5, P);
  if (ObjectPrototypeDescriptor) delete ObjectPrototype$5[P];
  nativeDefineProperty$1(O, P, Attributes);
  if (ObjectPrototypeDescriptor && O !== ObjectPrototype$5) {
    nativeDefineProperty$1(ObjectPrototype$5, P, ObjectPrototypeDescriptor);
  }
};

var setSymbolDescriptor = DESCRIPTORS$J && fails$1p(function () {
  return nativeObjectCreate(nativeDefineProperty$1({}, 'a', {
    get: function () { return nativeDefineProperty$1(this, 'a', { value: 7 }).a; }
  })).a !== 7;
}) ? fallbackDefineProperty : nativeDefineProperty$1;

var wrap = function (tag, description) {
  var symbol = AllSymbols[tag] = nativeObjectCreate(SymbolPrototype$1);
  setInternalState$h(symbol, {
    type: SYMBOL,
    tag: tag,
    description: description
  });
  if (!DESCRIPTORS$J) symbol.description = description;
  return symbol;
};

var $defineProperty = function defineProperty(O, P, Attributes) {
  if (O === ObjectPrototype$5) $defineProperty(ObjectPrototypeSymbols, P, Attributes);
  anObject$Y(O);
  var key = toPropertyKey$6(P);
  anObject$Y(Attributes);
  if (hasOwn$u(AllSymbols, key)) {
    if (!Attributes.enumerable) {
      if (!hasOwn$u(O, HIDDEN)) nativeDefineProperty$1(O, HIDDEN, createPropertyDescriptor$a(1, nativeObjectCreate(null)));
      O[HIDDEN][key] = true;
    } else {
      if (hasOwn$u(O, HIDDEN) && O[HIDDEN][key]) O[HIDDEN][key] = false;
      Attributes = nativeObjectCreate(Attributes, { enumerable: createPropertyDescriptor$a(0, false) });
    } return setSymbolDescriptor(O, key, Attributes);
  } return nativeDefineProperty$1(O, key, Attributes);
};

var $defineProperties = function defineProperties(O, Properties) {
  anObject$Y(O);
  var properties = toIndexedObject$d(Properties);
  var keys = objectKeys$3(properties).concat($getOwnPropertySymbols(properties));
  $forEach$3(keys, function (key) {
    if (!DESCRIPTORS$J || call$$($propertyIsEnumerable$1, properties, key)) $defineProperty(O, key, properties[key]);
  });
  return O;
};

var $create = function create(O, Properties) {
  return Properties === undefined ? nativeObjectCreate(O) : $defineProperties(nativeObjectCreate(O), Properties);
};

var $propertyIsEnumerable$1 = function propertyIsEnumerable(V) {
  var P = toPropertyKey$6(V);
  var enumerable = call$$(nativePropertyIsEnumerable, this, P);
  if (this === ObjectPrototype$5 && hasOwn$u(AllSymbols, P) && !hasOwn$u(ObjectPrototypeSymbols, P)) return false;
  return enumerable || !hasOwn$u(this, P) || !hasOwn$u(AllSymbols, P) || hasOwn$u(this, HIDDEN) && this[HIDDEN][P]
    ? enumerable : true;
};

var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(O, P) {
  var it = toIndexedObject$d(O);
  var key = toPropertyKey$6(P);
  if (it === ObjectPrototype$5 && hasOwn$u(AllSymbols, key) && !hasOwn$u(ObjectPrototypeSymbols, key)) return;
  var descriptor = nativeGetOwnPropertyDescriptor$2(it, key);
  if (descriptor && hasOwn$u(AllSymbols, key) && !(hasOwn$u(it, HIDDEN) && it[HIDDEN][key])) {
    descriptor.enumerable = true;
  }
  return descriptor;
};

var $getOwnPropertyNames = function getOwnPropertyNames(O) {
  var names = nativeGetOwnPropertyNames(toIndexedObject$d(O));
  var result = [];
  $forEach$3(names, function (key) {
    if (!hasOwn$u(AllSymbols, key) && !hasOwn$u(hiddenKeys$1, key)) push$l(result, key);
  });
  return result;
};

var $getOwnPropertySymbols = function (O) {
  var IS_OBJECT_PROTOTYPE = O === ObjectPrototype$5;
  var names = nativeGetOwnPropertyNames(IS_OBJECT_PROTOTYPE ? ObjectPrototypeSymbols : toIndexedObject$d(O));
  var result = [];
  $forEach$3(names, function (key) {
    if (hasOwn$u(AllSymbols, key) && (!IS_OBJECT_PROTOTYPE || hasOwn$u(ObjectPrototype$5, key))) {
      push$l(result, AllSymbols[key]);
    }
  });
  return result;
};

// `Symbol` constructor
// https://tc39.es/ecma262/#sec-symbol-constructor
if (!NATIVE_SYMBOL$5) {
  $Symbol = function Symbol() {
    if (isPrototypeOf$e(SymbolPrototype$1, this)) throw new TypeError$9('Symbol is not a constructor');
    var description = !arguments.length || arguments[0] === undefined ? undefined : $toString$3(arguments[0]);
    var tag = uid$4(description);
    var setter = function (value) {
      var $this = this === undefined ? globalThis$18 : this;
      if ($this === ObjectPrototype$5) call$$(setter, ObjectPrototypeSymbols, value);
      if (hasOwn$u($this, HIDDEN) && hasOwn$u($this[HIDDEN], tag)) $this[HIDDEN][tag] = false;
      var descriptor = createPropertyDescriptor$a(1, value);
      try {
        setSymbolDescriptor($this, tag, descriptor);
      } catch (error) {
        if (!(error instanceof RangeError$4)) throw error;
        fallbackDefineProperty($this, tag, descriptor);
      }
    };
    if (DESCRIPTORS$J && USE_SETTER) setSymbolDescriptor(ObjectPrototype$5, tag, { configurable: true, set: setter });
    return wrap(tag, description);
  };

  SymbolPrototype$1 = $Symbol[PROTOTYPE$1];

  defineBuiltIn$q(SymbolPrototype$1, 'toString', function toString() {
    return getInternalState$b(this).tag;
  });

  defineBuiltIn$q($Symbol, 'withoutSetter', function (description) {
    return wrap(uid$4(description), description);
  });

  propertyIsEnumerableModule$1.f = $propertyIsEnumerable$1;
  definePropertyModule$7.f = $defineProperty;
  definePropertiesModule.f = $defineProperties;
  getOwnPropertyDescriptorModule$5.f = $getOwnPropertyDescriptor;
  getOwnPropertyNamesModule$1.f = getOwnPropertyNamesExternal.f = $getOwnPropertyNames;
  getOwnPropertySymbolsModule$2.f = $getOwnPropertySymbols;

  wrappedWellKnownSymbolModule.f = function (name) {
    return wrap(wellKnownSymbol$G(name), name);
  };

  if (DESCRIPTORS$J) {
    // https://github.com/tc39/proposal-Symbol-description
    defineBuiltInAccessor$k(SymbolPrototype$1, 'description', {
      configurable: true,
      get: function description() {
        return getInternalState$b(this).description;
      }
    });
    {
      defineBuiltIn$q(ObjectPrototype$5, 'propertyIsEnumerable', $propertyIsEnumerable$1, { unsafe: true });
    }
  }
}

$$3Y({ global: true, constructor: true, wrap: true, forced: !NATIVE_SYMBOL$5, sham: !NATIVE_SYMBOL$5 }, {
  Symbol: $Symbol
});

$forEach$3(objectKeys$3(WellKnownSymbolsStore), function (name) {
  defineWellKnownSymbol$g(name);
});

$$3Y({ target: SYMBOL, stat: true, forced: !NATIVE_SYMBOL$5 }, {
  useSetter: function () { USE_SETTER = true; },
  useSimple: function () { USE_SETTER = false; }
});

$$3Y({ target: 'Object', stat: true, forced: !NATIVE_SYMBOL$5, sham: !DESCRIPTORS$J }, {
  // `Object.create` method
  // https://tc39.es/ecma262/#sec-object.create
  create: $create,
  // `Object.defineProperty` method
  // https://tc39.es/ecma262/#sec-object.defineproperty
  defineProperty: $defineProperty,
  // `Object.defineProperties` method
  // https://tc39.es/ecma262/#sec-object.defineproperties
  defineProperties: $defineProperties,
  // `Object.getOwnPropertyDescriptor` method
  // https://tc39.es/ecma262/#sec-object.getownpropertydescriptors
  getOwnPropertyDescriptor: $getOwnPropertyDescriptor
});

$$3Y({ target: 'Object', stat: true, forced: !NATIVE_SYMBOL$5 }, {
  // `Object.getOwnPropertyNames` method
  // https://tc39.es/ecma262/#sec-object.getownpropertynames
  getOwnPropertyNames: $getOwnPropertyNames
});

// `Symbol.prototype[@@toPrimitive]` method
// https://tc39.es/ecma262/#sec-symbol.prototype-@@toprimitive
defineSymbolToPrimitive$1();

// `Symbol.prototype[@@toStringTag]` property
// https://tc39.es/ecma262/#sec-symbol.prototype-@@tostringtag
setToStringTag$d($Symbol, SYMBOL);

hiddenKeys$1[HIDDEN] = true;

var NATIVE_SYMBOL$4 = symbolConstructorDetection;

/* eslint-disable es/no-symbol -- safe */
var symbolRegistryDetection = NATIVE_SYMBOL$4 && !!Symbol['for'] && !!Symbol.keyFor;

var $$3X = _export;
var getBuiltIn$w = getBuiltIn$C;
var hasOwn$t = hasOwnProperty_1;
var toString$E = toString$F;
var shared$3 = shared$8;
var NATIVE_SYMBOL_REGISTRY$1 = symbolRegistryDetection;

var StringToSymbolRegistry = shared$3('string-to-symbol-registry');
var SymbolToStringRegistry$1 = shared$3('symbol-to-string-registry');

// `Symbol.for` method
// https://tc39.es/ecma262/#sec-symbol.for
$$3X({ target: 'Symbol', stat: true, forced: !NATIVE_SYMBOL_REGISTRY$1 }, {
  'for': function (key) {
    var string = toString$E(key);
    if (hasOwn$t(StringToSymbolRegistry, string)) return StringToSymbolRegistry[string];
    var symbol = getBuiltIn$w('Symbol')(string);
    StringToSymbolRegistry[string] = symbol;
    SymbolToStringRegistry$1[symbol] = string;
    return symbol;
  }
});

var $$3W = _export;
var hasOwn$s = hasOwnProperty_1;
var isSymbol$4 = isSymbol$7;
var tryToString$5 = tryToString$7;
var shared$2 = shared$8;
var NATIVE_SYMBOL_REGISTRY = symbolRegistryDetection;

var SymbolToStringRegistry = shared$2('symbol-to-string-registry');

// `Symbol.keyFor` method
// https://tc39.es/ecma262/#sec-symbol.keyfor
$$3W({ target: 'Symbol', stat: true, forced: !NATIVE_SYMBOL_REGISTRY }, {
  keyFor: function keyFor(sym) {
    if (!isSymbol$4(sym)) throw new TypeError(tryToString$5(sym) + ' is not a symbol');
    if (hasOwn$s(SymbolToStringRegistry, sym)) return SymbolToStringRegistry[sym];
  }
});

var NATIVE_BIND$1 = functionBindNative;

var FunctionPrototype$3 = Function.prototype;
var apply$b = FunctionPrototype$3.apply;
var call$_ = FunctionPrototype$3.call;

// eslint-disable-next-line es/no-reflect -- safe
var functionApply$1 = typeof Reflect == 'object' && Reflect.apply || (NATIVE_BIND$1 ? call$_.bind(apply$b) : function () {
  return call$_.apply(apply$b, arguments);
});

var uncurryThis$1q = functionUncurryThis;
var isArray$8 = isArray$a;
var isCallable$q = isCallable$D;
var classof$k = classofRaw$2;
var toString$D = toString$F;

var push$k = uncurryThis$1q([].push);

var getJsonReplacerFunction = function (replacer) {
  if (isCallable$q(replacer)) return replacer;
  if (!isArray$8(replacer)) return;
  var rawLength = replacer.length;
  var keys = [];
  for (var i = 0; i < rawLength; i++) {
    var element = replacer[i];
    if (typeof element == 'string') push$k(keys, element);
    else if (typeof element == 'number' || classof$k(element) === 'Number' || classof$k(element) === 'String') push$k(keys, toString$D(element));
  }
  var keysLength = keys.length;
  var root = true;
  return function (key, value) {
    if (root) {
      root = false;
      return value;
    }
    if (isArray$8(this)) return value;
    for (var j = 0; j < keysLength; j++) if (keys[j] === key) return value;
  };
};

var $$3V = _export;
var getBuiltIn$v = getBuiltIn$C;
var apply$a = functionApply$1;
var call$Z = functionCall;
var uncurryThis$1p = functionUncurryThis;
var fails$1o = fails$1z;
var isCallable$p = isCallable$D;
var isSymbol$3 = isSymbol$7;
var arraySlice$8 = arraySlice$a;
var getReplacerFunction$1 = getJsonReplacerFunction;
var NATIVE_SYMBOL$3 = symbolConstructorDetection;

var $String$5 = String;
var $stringify$1 = getBuiltIn$v('JSON', 'stringify');
var exec$c = uncurryThis$1p(/./.exec);
var charAt$h = uncurryThis$1p(''.charAt);
var charCodeAt$8 = uncurryThis$1p(''.charCodeAt);
var replace$b = uncurryThis$1p(''.replace);
var numberToString$4 = uncurryThis$1p(1.0.toString);

var tester = /[\uD800-\uDFFF]/g;
var low = /^[\uD800-\uDBFF]$/;
var hi = /^[\uDC00-\uDFFF]$/;

var WRONG_SYMBOLS_CONVERSION = !NATIVE_SYMBOL$3 || fails$1o(function () {
  var symbol = getBuiltIn$v('Symbol')('stringify detection');
  // MS Edge converts symbol values to JSON as {}
  return $stringify$1([symbol]) !== '[null]'
    // WebKit converts symbol values to JSON as null
    || $stringify$1({ a: symbol }) !== '{}'
    // V8 throws on boxed symbols
    || $stringify$1(Object(symbol)) !== '{}';
});

// https://github.com/tc39/proposal-well-formed-stringify
var ILL_FORMED_UNICODE = fails$1o(function () {
  return $stringify$1('\uDF06\uD834') !== '"\\udf06\\ud834"'
    || $stringify$1('\uDEAD') !== '"\\udead"';
});

var stringifyWithSymbolsFix = function (it, replacer) {
  var args = arraySlice$8(arguments);
  var $replacer = getReplacerFunction$1(replacer);
  if (!isCallable$p($replacer) && (it === undefined || isSymbol$3(it))) return; // IE8 returns string on undefined
  args[1] = function (key, value) {
    // some old implementations (like WebKit) could pass numbers as keys
    if (isCallable$p($replacer)) value = call$Z($replacer, this, $String$5(key), value);
    if (!isSymbol$3(value)) return value;
  };
  return apply$a($stringify$1, null, args);
};

var fixIllFormed = function (match, offset, string) {
  var prev = charAt$h(string, offset - 1);
  var next = charAt$h(string, offset + 1);
  if ((exec$c(low, match) && !exec$c(hi, next)) || (exec$c(hi, match) && !exec$c(low, prev))) {
    return '\\u' + numberToString$4(charCodeAt$8(match, 0), 16);
  } return match;
};

if ($stringify$1) {
  // `JSON.stringify` method
  // https://tc39.es/ecma262/#sec-json.stringify
  $$3V({ target: 'JSON', stat: true, arity: 3, forced: WRONG_SYMBOLS_CONVERSION || ILL_FORMED_UNICODE }, {
    // eslint-disable-next-line no-unused-vars -- required for `.length`
    stringify: function stringify(it, replacer, space) {
      var args = arraySlice$8(arguments);
      var result = apply$a(WRONG_SYMBOLS_CONVERSION ? stringifyWithSymbolsFix : $stringify$1, null, args);
      return ILL_FORMED_UNICODE && typeof result == 'string' ? replace$b(result, tester, fixIllFormed) : result;
    }
  });
}

var $$3U = _export;
var NATIVE_SYMBOL$2 = symbolConstructorDetection;
var fails$1n = fails$1z;
var getOwnPropertySymbolsModule$1 = objectGetOwnPropertySymbols;
var toObject$v = toObject$y;

// V8 ~ Chrome 38 and 39 `Object.getOwnPropertySymbols` fails on primitives
// https://bugs.chromium.org/p/v8/issues/detail?id=3443
var FORCED$H = !NATIVE_SYMBOL$2 || fails$1n(function () { getOwnPropertySymbolsModule$1.f(1); });

// `Object.getOwnPropertySymbols` method
// https://tc39.es/ecma262/#sec-object.getownpropertysymbols
$$3U({ target: 'Object', stat: true, forced: FORCED$H }, {
  getOwnPropertySymbols: function getOwnPropertySymbols(it) {
    var $getOwnPropertySymbols = getOwnPropertySymbolsModule$1.f;
    return $getOwnPropertySymbols ? $getOwnPropertySymbols(toObject$v(it)) : [];
  }
});

var $$3T = _export;
var DESCRIPTORS$I = descriptors;
var globalThis$17 = globalThis_1;
var uncurryThis$1o = functionUncurryThis;
var hasOwn$r = hasOwnProperty_1;
var isCallable$o = isCallable$D;
var isPrototypeOf$d = objectIsPrototypeOf;
var toString$C = toString$F;
var defineBuiltInAccessor$j = defineBuiltInAccessor$l;
var copyConstructorProperties$5 = copyConstructorProperties$7;

var NativeSymbol = globalThis$17.Symbol;
var SymbolPrototype = NativeSymbol && NativeSymbol.prototype;

if (DESCRIPTORS$I && isCallable$o(NativeSymbol) && (!('description' in SymbolPrototype) ||
  // Safari 12 bug
  NativeSymbol().description !== undefined
)) {
  var EmptyStringDescriptionStore = {};
  // wrap Symbol constructor for correct work with undefined description
  var SymbolWrapper = function Symbol() {
    var description = arguments.length < 1 || arguments[0] === undefined ? undefined : toString$C(arguments[0]);
    var result = isPrototypeOf$d(SymbolPrototype, this)
      ? new NativeSymbol(description)
      // in Edge 13, String(Symbol(undefined)) === 'Symbol(undefined)'
      : description === undefined ? NativeSymbol() : NativeSymbol(description);
    if (description === '') EmptyStringDescriptionStore[result] = true;
    return result;
  };

  copyConstructorProperties$5(SymbolWrapper, NativeSymbol);
  SymbolWrapper.prototype = SymbolPrototype;
  SymbolPrototype.constructor = SymbolWrapper;

  var NATIVE_SYMBOL$1 = String(NativeSymbol('description detection')) === 'Symbol(description detection)';
  var thisSymbolValue = uncurryThis$1o(SymbolPrototype.valueOf);
  var symbolDescriptiveString = uncurryThis$1o(SymbolPrototype.toString);
  var regexp = /^Symbol\((.*)\)[^)]+$/;
  var replace$a = uncurryThis$1o(''.replace);
  var stringSlice$h = uncurryThis$1o(''.slice);

  defineBuiltInAccessor$j(SymbolPrototype, 'description', {
    configurable: true,
    get: function description() {
      var symbol = thisSymbolValue(this);
      if (hasOwn$r(EmptyStringDescriptionStore, symbol)) return '';
      var string = symbolDescriptiveString(symbol);
      var desc = NATIVE_SYMBOL$1 ? stringSlice$h(string, 7, -1) : replace$a(string, regexp, '$1');
      return desc === '' ? undefined : desc;
    }
  });

  $$3T({ global: true, constructor: true, forced: true }, {
    Symbol: SymbolWrapper
  });
}

var defineWellKnownSymbol$f = wellKnownSymbolDefine;

// `Symbol.asyncIterator` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.asynciterator
defineWellKnownSymbol$f('asyncIterator');

var defineWellKnownSymbol$e = wellKnownSymbolDefine;

// `Symbol.hasInstance` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.hasinstance
defineWellKnownSymbol$e('hasInstance');

var defineWellKnownSymbol$d = wellKnownSymbolDefine;

// `Symbol.isConcatSpreadable` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.isconcatspreadable
defineWellKnownSymbol$d('isConcatSpreadable');

var defineWellKnownSymbol$c = wellKnownSymbolDefine;

// `Symbol.iterator` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.iterator
defineWellKnownSymbol$c('iterator');

var defineWellKnownSymbol$b = wellKnownSymbolDefine;

// `Symbol.match` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.match
defineWellKnownSymbol$b('match');

var defineWellKnownSymbol$a = wellKnownSymbolDefine;

// `Symbol.matchAll` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.matchall
defineWellKnownSymbol$a('matchAll');

var defineWellKnownSymbol$9 = wellKnownSymbolDefine;

// `Symbol.replace` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.replace
defineWellKnownSymbol$9('replace');

var defineWellKnownSymbol$8 = wellKnownSymbolDefine;

// `Symbol.search` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.search
defineWellKnownSymbol$8('search');

var defineWellKnownSymbol$7 = wellKnownSymbolDefine;

// `Symbol.species` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.species
defineWellKnownSymbol$7('species');

var defineWellKnownSymbol$6 = wellKnownSymbolDefine;

// `Symbol.split` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.split
defineWellKnownSymbol$6('split');

var defineWellKnownSymbol$5 = wellKnownSymbolDefine;
var defineSymbolToPrimitive = symbolDefineToPrimitive;

// `Symbol.toPrimitive` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.toprimitive
defineWellKnownSymbol$5('toPrimitive');

// `Symbol.prototype[@@toPrimitive]` method
// https://tc39.es/ecma262/#sec-symbol.prototype-@@toprimitive
defineSymbolToPrimitive();

var getBuiltIn$u = getBuiltIn$C;
var defineWellKnownSymbol$4 = wellKnownSymbolDefine;
var setToStringTag$c = setToStringTag$e;

// `Symbol.toStringTag` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.tostringtag
defineWellKnownSymbol$4('toStringTag');

// `Symbol.prototype[@@toStringTag]` property
// https://tc39.es/ecma262/#sec-symbol.prototype-@@tostringtag
setToStringTag$c(getBuiltIn$u('Symbol'), 'Symbol');

var defineWellKnownSymbol$3 = wellKnownSymbolDefine;

// `Symbol.unscopables` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.unscopables
defineWellKnownSymbol$3('unscopables');

var uncurryThis$1n = functionUncurryThis;
var aCallable$C = aCallable$F;

var functionUncurryThisAccessor = function (object, key, method) {
  try {
    // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
    return uncurryThis$1n(aCallable$C(Object.getOwnPropertyDescriptor(object, key)[method]));
  } catch (error) { /* empty */ }
};

var isObject$C = isObject$J;

var isPossiblePrototype$2 = function (argument) {
  return isObject$C(argument) || argument === null;
};

var isPossiblePrototype$1 = isPossiblePrototype$2;

var $String$4 = String;
var $TypeError$u = TypeError;

var aPossiblePrototype$2 = function (argument) {
  if (isPossiblePrototype$1(argument)) return argument;
  throw new $TypeError$u("Can't set " + $String$4(argument) + ' as a prototype');
};

/* eslint-disable no-proto -- safe */
var uncurryThisAccessor$3 = functionUncurryThisAccessor;
var isObject$B = isObject$J;
var requireObjectCoercible$l = requireObjectCoercible$o;
var aPossiblePrototype$1 = aPossiblePrototype$2;

// `Object.setPrototypeOf` method
// https://tc39.es/ecma262/#sec-object.setprototypeof
// Works with __proto__ only. Old v8 can't work with null proto objects.
// eslint-disable-next-line es/no-object-setprototypeof -- safe
var objectSetPrototypeOf$1 = Object.setPrototypeOf || ('__proto__' in {} ? function () {
  var CORRECT_SETTER = false;
  var test = {};
  var setter;
  try {
    setter = uncurryThisAccessor$3(Object.prototype, '__proto__', 'set');
    setter(test, []);
    CORRECT_SETTER = test instanceof Array;
  } catch (error) { /* empty */ }
  return function setPrototypeOf(O, proto) {
    requireObjectCoercible$l(O);
    aPossiblePrototype$1(proto);
    if (!isObject$B(O)) return O;
    if (CORRECT_SETTER) setter(O, proto);
    else O.__proto__ = proto;
    return O;
  };
}() : undefined);

var defineProperty$c = objectDefineProperty.f;

var proxyAccessor$2 = function (Target, Source, key) {
  key in Target || defineProperty$c(Target, key, {
    configurable: true,
    get: function () { return Source[key]; },
    set: function (it) { Source[key] = it; }
  });
};

var isCallable$n = isCallable$D;
var isObject$A = isObject$J;
var setPrototypeOf$a = objectSetPrototypeOf$1;

// makes subclassing work correct for wrapped built-ins
var inheritIfRequired$7 = function ($this, dummy, Wrapper) {
  var NewTarget, NewTargetPrototype;
  if (
    // it can work only with native `setPrototypeOf`
    setPrototypeOf$a &&
    // we haven't completely correct pre-ES6 way for getting `new.target`, so use this
    isCallable$n(NewTarget = dummy.constructor) &&
    NewTarget !== Wrapper &&
    isObject$A(NewTargetPrototype = NewTarget.prototype) &&
    NewTargetPrototype !== Wrapper.prototype
  ) setPrototypeOf$a($this, NewTargetPrototype);
  return $this;
};

var toString$B = toString$F;

var normalizeStringArgument$6 = function (argument, $default) {
  return argument === undefined ? arguments.length < 2 ? '' : $default : toString$B(argument);
};

var isObject$z = isObject$J;
var createNonEnumerableProperty$g = createNonEnumerableProperty$j;

// `InstallErrorCause` abstract operation
// https://tc39.es/proposal-error-cause/#sec-errorobjects-install-error-cause
var installErrorCause$2 = function (O, options) {
  if (isObject$z(options) && 'cause' in options) {
    createNonEnumerableProperty$g(O, 'cause', options.cause);
  }
};

var uncurryThis$1m = functionUncurryThis;

var $Error$2 = Error;
var replace$9 = uncurryThis$1m(''.replace);

var TEST = (function (arg) { return String(new $Error$2(arg).stack); })('zxcasd');
// eslint-disable-next-line redos/no-vulnerable -- safe
var V8_OR_CHAKRA_STACK_ENTRY = /\n\s*at [^:]*:[^\n]*/;
var IS_V8_OR_CHAKRA_STACK = V8_OR_CHAKRA_STACK_ENTRY.test(TEST);

var errorStackClear = function (stack, dropEntries) {
  if (IS_V8_OR_CHAKRA_STACK && typeof stack == 'string' && !$Error$2.prepareStackTrace) {
    while (dropEntries--) stack = replace$9(stack, V8_OR_CHAKRA_STACK_ENTRY, '');
  } return stack;
};

var fails$1m = fails$1z;
var createPropertyDescriptor$9 = createPropertyDescriptor$d;

var errorStackInstallable = !fails$1m(function () {
  var error = new Error('a');
  if (!('stack' in error)) return true;
  // eslint-disable-next-line es/no-object-defineproperty -- safe
  Object.defineProperty(error, 'stack', createPropertyDescriptor$9(1, 7));
  return error.stack !== 7;
});

var createNonEnumerableProperty$f = createNonEnumerableProperty$j;
var clearErrorStack$2 = errorStackClear;
var ERROR_STACK_INSTALLABLE$1 = errorStackInstallable;

// non-standard V8
var captureStackTrace = Error.captureStackTrace;

var errorStackInstall = function (error, C, stack, dropEntries) {
  if (ERROR_STACK_INSTALLABLE$1) {
    if (captureStackTrace) captureStackTrace(error, C);
    else createNonEnumerableProperty$f(error, 'stack', clearErrorStack$2(stack, dropEntries));
  }
};

var getBuiltIn$t = getBuiltIn$C;
var hasOwn$q = hasOwnProperty_1;
var createNonEnumerableProperty$e = createNonEnumerableProperty$j;
var isPrototypeOf$c = objectIsPrototypeOf;
var setPrototypeOf$9 = objectSetPrototypeOf$1;
var copyConstructorProperties$4 = copyConstructorProperties$7;
var proxyAccessor$1 = proxyAccessor$2;
var inheritIfRequired$6 = inheritIfRequired$7;
var normalizeStringArgument$5 = normalizeStringArgument$6;
var installErrorCause$1 = installErrorCause$2;
var installErrorStack$2 = errorStackInstall;
var DESCRIPTORS$H = descriptors;

var wrapErrorConstructorWithCause$2 = function (FULL_NAME, wrapper, FORCED, IS_AGGREGATE_ERROR) {
  var STACK_TRACE_LIMIT = 'stackTraceLimit';
  var OPTIONS_POSITION = IS_AGGREGATE_ERROR ? 2 : 1;
  var path = FULL_NAME.split('.');
  var ERROR_NAME = path[path.length - 1];
  var OriginalError = getBuiltIn$t.apply(null, path);

  if (!OriginalError) return;

  var OriginalErrorPrototype = OriginalError.prototype;

  // V8 9.3- bug https://bugs.chromium.org/p/v8/issues/detail?id=12006
  if (hasOwn$q(OriginalErrorPrototype, 'cause')) delete OriginalErrorPrototype.cause;

  if (!FORCED) return OriginalError;

  var BaseError = getBuiltIn$t('Error');

  var WrappedError = wrapper(function (a, b) {
    var message = normalizeStringArgument$5(IS_AGGREGATE_ERROR ? b : a, undefined);
    var result = IS_AGGREGATE_ERROR ? new OriginalError(a) : new OriginalError();
    if (message !== undefined) createNonEnumerableProperty$e(result, 'message', message);
    installErrorStack$2(result, WrappedError, result.stack, 2);
    if (this && isPrototypeOf$c(OriginalErrorPrototype, this)) inheritIfRequired$6(result, this, WrappedError);
    if (arguments.length > OPTIONS_POSITION) installErrorCause$1(result, arguments[OPTIONS_POSITION]);
    return result;
  });

  WrappedError.prototype = OriginalErrorPrototype;

  if (ERROR_NAME !== 'Error') {
    if (setPrototypeOf$9) setPrototypeOf$9(WrappedError, BaseError);
    else copyConstructorProperties$4(WrappedError, BaseError, { name: true });
  } else if (DESCRIPTORS$H && STACK_TRACE_LIMIT in OriginalError) {
    proxyAccessor$1(WrappedError, OriginalError, STACK_TRACE_LIMIT);
    proxyAccessor$1(WrappedError, OriginalError, 'prepareStackTrace');
  }

  copyConstructorProperties$4(WrappedError, OriginalError);

  try {
    // Safari 13- bug: WebAssembly errors does not have a proper `.name`
    if (OriginalErrorPrototype.name !== ERROR_NAME) {
      createNonEnumerableProperty$e(OriginalErrorPrototype, 'name', ERROR_NAME);
    }
    OriginalErrorPrototype.constructor = WrappedError;
  } catch (error) { /* empty */ }

  return WrappedError;
};

/* eslint-disable no-unused-vars -- required for functions `.length` */
var $$3S = _export;
var globalThis$16 = globalThis_1;
var apply$9 = functionApply$1;
var wrapErrorConstructorWithCause$1 = wrapErrorConstructorWithCause$2;

var WEB_ASSEMBLY = 'WebAssembly';
var WebAssembly = globalThis$16[WEB_ASSEMBLY];

// eslint-disable-next-line es/no-error-cause -- feature detection
var FORCED$G = new Error('e', { cause: 7 }).cause !== 7;

var exportGlobalErrorCauseWrapper = function (ERROR_NAME, wrapper) {
  var O = {};
  O[ERROR_NAME] = wrapErrorConstructorWithCause$1(ERROR_NAME, wrapper, FORCED$G);
  $$3S({ global: true, constructor: true, arity: 1, forced: FORCED$G }, O);
};

var exportWebAssemblyErrorCauseWrapper = function (ERROR_NAME, wrapper) {
  if (WebAssembly && WebAssembly[ERROR_NAME]) {
    var O = {};
    O[ERROR_NAME] = wrapErrorConstructorWithCause$1(WEB_ASSEMBLY + '.' + ERROR_NAME, wrapper, FORCED$G);
    $$3S({ target: WEB_ASSEMBLY, stat: true, constructor: true, arity: 1, forced: FORCED$G }, O);
  }
};

// https://tc39.es/ecma262/#sec-nativeerror
exportGlobalErrorCauseWrapper('Error', function (init) {
  return function Error(message) { return apply$9(init, this, arguments); };
});
exportGlobalErrorCauseWrapper('EvalError', function (init) {
  return function EvalError(message) { return apply$9(init, this, arguments); };
});
exportGlobalErrorCauseWrapper('RangeError', function (init) {
  return function RangeError(message) { return apply$9(init, this, arguments); };
});
exportGlobalErrorCauseWrapper('ReferenceError', function (init) {
  return function ReferenceError(message) { return apply$9(init, this, arguments); };
});
exportGlobalErrorCauseWrapper('SyntaxError', function (init) {
  return function SyntaxError(message) { return apply$9(init, this, arguments); };
});
exportGlobalErrorCauseWrapper('TypeError', function (init) {
  return function TypeError(message) { return apply$9(init, this, arguments); };
});
exportGlobalErrorCauseWrapper('URIError', function (init) {
  return function URIError(message) { return apply$9(init, this, arguments); };
});
exportWebAssemblyErrorCauseWrapper('CompileError', function (init) {
  return function CompileError(message) { return apply$9(init, this, arguments); };
});
exportWebAssemblyErrorCauseWrapper('LinkError', function (init) {
  return function LinkError(message) { return apply$9(init, this, arguments); };
});
exportWebAssemblyErrorCauseWrapper('RuntimeError', function (init) {
  return function RuntimeError(message) { return apply$9(init, this, arguments); };
});

var DESCRIPTORS$G = descriptors;
var fails$1l = fails$1z;
var anObject$X = anObject$11;
var normalizeStringArgument$4 = normalizeStringArgument$6;

var nativeErrorToString = Error.prototype.toString;

var INCORRECT_TO_STRING$1 = fails$1l(function () {
  if (DESCRIPTORS$G) {
    // Chrome 32- incorrectly call accessor
    // eslint-disable-next-line es/no-object-create, es/no-object-defineproperty -- safe
    var object = Object.create(Object.defineProperty({}, 'name', { get: function () {
      return this === object;
    } }));
    if (nativeErrorToString.call(object) !== 'true') return true;
  }
  // FF10- does not properly handle non-strings
  return nativeErrorToString.call({ message: 1, name: 2 }) !== '2: 1'
    // IE8 does not properly handle defaults
    || nativeErrorToString.call({}) !== 'Error';
});

var errorToString$2 = INCORRECT_TO_STRING$1 ? function toString() {
  var O = anObject$X(this);
  var name = normalizeStringArgument$4(O.name, 'Error');
  var message = normalizeStringArgument$4(O.message);
  return !name ? message : !message ? name : name + ': ' + message;
} : nativeErrorToString;

var defineBuiltIn$p = defineBuiltIn$t;
var errorToString$1 = errorToString$2;

var ErrorPrototype$1 = Error.prototype;

// `Error.prototype.toString` method fix
// https://tc39.es/ecma262/#sec-error.prototype.tostring
if (ErrorPrototype$1.toString !== errorToString$1) {
  defineBuiltIn$p(ErrorPrototype$1, 'toString', errorToString$1);
}

var fails$1k = fails$1z;

var correctPrototypeGetter = !fails$1k(function () {
  function F() { /* empty */ }
  F.prototype.constructor = null;
  // eslint-disable-next-line es/no-object-getprototypeof -- required for testing
  return Object.getPrototypeOf(new F()) !== F.prototype;
});

var hasOwn$p = hasOwnProperty_1;
var isCallable$m = isCallable$D;
var toObject$u = toObject$y;
var sharedKey = sharedKey$4;
var CORRECT_PROTOTYPE_GETTER$2 = correctPrototypeGetter;

var IE_PROTO = sharedKey('IE_PROTO');
var $Object$1 = Object;
var ObjectPrototype$4 = $Object$1.prototype;

// `Object.getPrototypeOf` method
// https://tc39.es/ecma262/#sec-object.getprototypeof
// eslint-disable-next-line es/no-object-getprototypeof -- safe
var objectGetPrototypeOf$2 = CORRECT_PROTOTYPE_GETTER$2 ? $Object$1.getPrototypeOf : function (O) {
  var object = toObject$u(O);
  if (hasOwn$p(object, IE_PROTO)) return object[IE_PROTO];
  var constructor = object.constructor;
  if (isCallable$m(constructor) && object instanceof constructor) {
    return constructor.prototype;
  } return object instanceof $Object$1 ? ObjectPrototype$4 : null;
};

var iterators = {};

var wellKnownSymbol$F = wellKnownSymbol$O;
var Iterators$4 = iterators;

var ITERATOR$b = wellKnownSymbol$F('iterator');
var ArrayPrototype$1 = Array.prototype;

// check on default Array iterator
var isArrayIteratorMethod$3 = function (it) {
  return it !== undefined && (Iterators$4.Array === it || ArrayPrototype$1[ITERATOR$b] === it);
};

var classof$j = classof$p;
var getMethod$h = getMethod$j;
var isNullOrUndefined$c = isNullOrUndefined$f;
var Iterators$3 = iterators;
var wellKnownSymbol$E = wellKnownSymbol$O;

var ITERATOR$a = wellKnownSymbol$E('iterator');

var getIteratorMethod$8 = function (it) {
  if (!isNullOrUndefined$c(it)) return getMethod$h(it, ITERATOR$a)
    || getMethod$h(it, '@@iterator')
    || Iterators$3[classof$j(it)];
};

var call$Y = functionCall;
var aCallable$B = aCallable$F;
var anObject$W = anObject$11;
var tryToString$4 = tryToString$7;
var getIteratorMethod$7 = getIteratorMethod$8;

var $TypeError$t = TypeError;

var getIterator$6 = function (argument, usingIterator) {
  var iteratorMethod = arguments.length < 2 ? getIteratorMethod$7(argument) : usingIterator;
  if (aCallable$B(iteratorMethod)) return anObject$W(call$Y(iteratorMethod, argument));
  throw new $TypeError$t(tryToString$4(argument) + ' is not iterable');
};

var call$X = functionCall;
var anObject$V = anObject$11;
var getMethod$g = getMethod$j;

var iteratorClose$8 = function (iterator, kind, value) {
  var innerResult, innerError;
  anObject$V(iterator);
  try {
    innerResult = getMethod$g(iterator, 'return');
    if (!innerResult) {
      if (kind === 'throw') throw value;
      return value;
    }
    innerResult = call$X(innerResult, iterator);
  } catch (error) {
    innerError = true;
    innerResult = error;
  }
  if (kind === 'throw') throw value;
  if (innerError) throw innerResult;
  anObject$V(innerResult);
  return value;
};

var bind$g = functionBindContext;
var call$W = functionCall;
var anObject$U = anObject$11;
var tryToString$3 = tryToString$7;
var isArrayIteratorMethod$2 = isArrayIteratorMethod$3;
var lengthOfArrayLike$t = lengthOfArrayLike$w;
var isPrototypeOf$b = objectIsPrototypeOf;
var getIterator$5 = getIterator$6;
var getIteratorMethod$6 = getIteratorMethod$8;
var iteratorClose$7 = iteratorClose$8;

var $TypeError$s = TypeError;

var Result = function (stopped, result) {
  this.stopped = stopped;
  this.result = result;
};

var ResultPrototype = Result.prototype;

var iterate$k = function (iterable, unboundFunction, options) {
  var that = options && options.that;
  var AS_ENTRIES = !!(options && options.AS_ENTRIES);
  var IS_RECORD = !!(options && options.IS_RECORD);
  var IS_ITERATOR = !!(options && options.IS_ITERATOR);
  var INTERRUPTED = !!(options && options.INTERRUPTED);
  var fn = bind$g(unboundFunction, that);
  var iterator, iterFn, index, length, result, next, step;

  var stop = function (condition) {
    if (iterator) iteratorClose$7(iterator, 'normal', condition);
    return new Result(true, condition);
  };

  var callFn = function (value) {
    if (AS_ENTRIES) {
      anObject$U(value);
      return INTERRUPTED ? fn(value[0], value[1], stop) : fn(value[0], value[1]);
    } return INTERRUPTED ? fn(value, stop) : fn(value);
  };

  if (IS_RECORD) {
    iterator = iterable.iterator;
  } else if (IS_ITERATOR) {
    iterator = iterable;
  } else {
    iterFn = getIteratorMethod$6(iterable);
    if (!iterFn) throw new $TypeError$s(tryToString$3(iterable) + ' is not iterable');
    // optimisation for array iterators
    if (isArrayIteratorMethod$2(iterFn)) {
      for (index = 0, length = lengthOfArrayLike$t(iterable); length > index; index++) {
        result = callFn(iterable[index]);
        if (result && isPrototypeOf$b(ResultPrototype, result)) return result;
      } return new Result(false);
    }
    iterator = getIterator$5(iterable, iterFn);
  }

  next = IS_RECORD ? iterable.next : iterator.next;
  while (!(step = call$W(next, iterator)).done) {
    try {
      result = callFn(step.value);
    } catch (error) {
      iteratorClose$7(iterator, 'throw', error);
    }
    if (typeof result == 'object' && result && isPrototypeOf$b(ResultPrototype, result)) return result;
  } return new Result(false);
};

var $$3R = _export;
var isPrototypeOf$a = objectIsPrototypeOf;
var getPrototypeOf$d = objectGetPrototypeOf$2;
var setPrototypeOf$8 = objectSetPrototypeOf$1;
var copyConstructorProperties$3 = copyConstructorProperties$7;
var create$g = objectCreate$1;
var createNonEnumerableProperty$d = createNonEnumerableProperty$j;
var createPropertyDescriptor$8 = createPropertyDescriptor$d;
var installErrorCause = installErrorCause$2;
var installErrorStack$1 = errorStackInstall;
var iterate$j = iterate$k;
var normalizeStringArgument$3 = normalizeStringArgument$6;
var wellKnownSymbol$D = wellKnownSymbol$O;

var TO_STRING_TAG$8 = wellKnownSymbol$D('toStringTag');
var $Error$1 = Error;
var push$j = [].push;

var $AggregateError$1 = function AggregateError(errors, message /* , options */) {
  var isInstance = isPrototypeOf$a(AggregateErrorPrototype, this);
  var that;
  if (setPrototypeOf$8) {
    that = setPrototypeOf$8(new $Error$1(), isInstance ? getPrototypeOf$d(this) : AggregateErrorPrototype);
  } else {
    that = isInstance ? this : create$g(AggregateErrorPrototype);
    createNonEnumerableProperty$d(that, TO_STRING_TAG$8, 'Error');
  }
  if (message !== undefined) createNonEnumerableProperty$d(that, 'message', normalizeStringArgument$3(message));
  installErrorStack$1(that, $AggregateError$1, that.stack, 1);
  if (arguments.length > 2) installErrorCause(that, arguments[2]);
  var errorsArray = [];
  iterate$j(errors, push$j, { that: errorsArray });
  createNonEnumerableProperty$d(that, 'errors', errorsArray);
  return that;
};

if (setPrototypeOf$8) setPrototypeOf$8($AggregateError$1, $Error$1);
else copyConstructorProperties$3($AggregateError$1, $Error$1, { name: true });

var AggregateErrorPrototype = $AggregateError$1.prototype = create$g($Error$1.prototype, {
  constructor: createPropertyDescriptor$8(1, $AggregateError$1),
  message: createPropertyDescriptor$8(1, ''),
  name: createPropertyDescriptor$8(1, 'AggregateError')
});

// `AggregateError` constructor
// https://tc39.es/ecma262/#sec-aggregate-error-constructor
$$3R({ global: true, constructor: true, arity: 2 }, {
  AggregateError: $AggregateError$1
});

var $$3Q = _export;
var getBuiltIn$s = getBuiltIn$C;
var apply$8 = functionApply$1;
var fails$1j = fails$1z;
var wrapErrorConstructorWithCause = wrapErrorConstructorWithCause$2;

var AGGREGATE_ERROR = 'AggregateError';
var $AggregateError = getBuiltIn$s(AGGREGATE_ERROR);

var FORCED$F = !fails$1j(function () {
  return $AggregateError([1]).errors[0] !== 1;
}) && fails$1j(function () {
  return $AggregateError([1], AGGREGATE_ERROR, { cause: 7 }).cause !== 7;
});

// https://tc39.es/ecma262/#sec-aggregate-error
$$3Q({ global: true, constructor: true, arity: 2, forced: FORCED$F }, {
  AggregateError: wrapErrorConstructorWithCause(AGGREGATE_ERROR, function (init) {
    // eslint-disable-next-line no-unused-vars -- required for functions `.length`
    return function AggregateError(errors, message) { return apply$8(init, this, arguments); };
  }, FORCED$F, true)
});

var wellKnownSymbol$C = wellKnownSymbol$O;
var create$f = objectCreate$1;
var defineProperty$b = objectDefineProperty.f;

var UNSCOPABLES = wellKnownSymbol$C('unscopables');
var ArrayPrototype = Array.prototype;

// Array.prototype[@@unscopables]
// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
if (ArrayPrototype[UNSCOPABLES] === undefined) {
  defineProperty$b(ArrayPrototype, UNSCOPABLES, {
    configurable: true,
    value: create$f(null)
  });
}

// add a key to Array.prototype[@@unscopables]
var addToUnscopables$i = function (key) {
  ArrayPrototype[UNSCOPABLES][key] = true;
};

var $$3P = _export;
var toObject$t = toObject$y;
var lengthOfArrayLike$s = lengthOfArrayLike$w;
var toIntegerOrInfinity$k = toIntegerOrInfinity$n;
var addToUnscopables$h = addToUnscopables$i;

// `Array.prototype.at` method
// https://tc39.es/ecma262/#sec-array.prototype.at
$$3P({ target: 'Array', proto: true }, {
  at: function at(index) {
    var O = toObject$t(this);
    var len = lengthOfArrayLike$s(O);
    var relativeIndex = toIntegerOrInfinity$k(index);
    var k = relativeIndex >= 0 ? relativeIndex : len + relativeIndex;
    return (k < 0 || k >= len) ? undefined : O[k];
  }
});

addToUnscopables$h('at');

var $TypeError$r = TypeError;
var MAX_SAFE_INTEGER = 0x1FFFFFFFFFFFFF; // 2 ** 53 - 1 == 9007199254740991

var doesNotExceedSafeInteger$7 = function (it) {
  if (it > MAX_SAFE_INTEGER) throw $TypeError$r('Maximum allowed index exceeded');
  return it;
};

var DESCRIPTORS$F = descriptors;
var definePropertyModule$6 = objectDefineProperty;
var createPropertyDescriptor$7 = createPropertyDescriptor$d;

var createProperty$b = function (object, key, value) {
  if (DESCRIPTORS$F) definePropertyModule$6.f(object, key, createPropertyDescriptor$7(0, value));
  else object[key] = value;
};

var fails$1i = fails$1z;
var wellKnownSymbol$B = wellKnownSymbol$O;
var V8_VERSION$2 = environmentV8Version;

var SPECIES$5 = wellKnownSymbol$B('species');

var arrayMethodHasSpeciesSupport$5 = function (METHOD_NAME) {
  // We can't use this feature detection in V8 since it causes
  // deoptimization and serious performance degradation
  // https://github.com/zloirock/core-js/issues/677
  return V8_VERSION$2 >= 51 || !fails$1i(function () {
    var array = [];
    var constructor = array.constructor = {};
    constructor[SPECIES$5] = function () {
      return { foo: 1 };
    };
    return array[METHOD_NAME](Boolean).foo !== 1;
  });
};

var $$3O = _export;
var fails$1h = fails$1z;
var isArray$7 = isArray$a;
var isObject$y = isObject$J;
var toObject$s = toObject$y;
var lengthOfArrayLike$r = lengthOfArrayLike$w;
var doesNotExceedSafeInteger$6 = doesNotExceedSafeInteger$7;
var createProperty$a = createProperty$b;
var arraySpeciesCreate$3 = arraySpeciesCreate$5;
var arrayMethodHasSpeciesSupport$4 = arrayMethodHasSpeciesSupport$5;
var wellKnownSymbol$A = wellKnownSymbol$O;
var V8_VERSION$1 = environmentV8Version;

var IS_CONCAT_SPREADABLE = wellKnownSymbol$A('isConcatSpreadable');

// We can't use this feature detection in V8 since it causes
// deoptimization and serious performance degradation
// https://github.com/zloirock/core-js/issues/679
var IS_CONCAT_SPREADABLE_SUPPORT = V8_VERSION$1 >= 51 || !fails$1h(function () {
  var array = [];
  array[IS_CONCAT_SPREADABLE] = false;
  return array.concat()[0] !== array;
});

var isConcatSpreadable = function (O) {
  if (!isObject$y(O)) return false;
  var spreadable = O[IS_CONCAT_SPREADABLE];
  return spreadable !== undefined ? !!spreadable : isArray$7(O);
};

var FORCED$E = !IS_CONCAT_SPREADABLE_SUPPORT || !arrayMethodHasSpeciesSupport$4('concat');

// `Array.prototype.concat` method
// https://tc39.es/ecma262/#sec-array.prototype.concat
// with adding support of @@isConcatSpreadable and @@species
$$3O({ target: 'Array', proto: true, arity: 1, forced: FORCED$E }, {
  // eslint-disable-next-line no-unused-vars -- required for `.length`
  concat: function concat(arg) {
    var O = toObject$s(this);
    var A = arraySpeciesCreate$3(O, 0);
    var n = 0;
    var i, k, length, len, E;
    for (i = -1, length = arguments.length; i < length; i++) {
      E = i === -1 ? O : arguments[i];
      if (isConcatSpreadable(E)) {
        len = lengthOfArrayLike$r(E);
        doesNotExceedSafeInteger$6(n + len);
        for (k = 0; k < len; k++, n++) if (k in E) createProperty$a(A, n, E[k]);
      } else {
        doesNotExceedSafeInteger$6(n + 1);
        createProperty$a(A, n++, E);
      }
    }
    A.length = n;
    return A;
  }
});

var tryToString$2 = tryToString$7;

var $TypeError$q = TypeError;

var deletePropertyOrThrow$4 = function (O, P) {
  if (!delete O[P]) throw new $TypeError$q('Cannot delete property ' + tryToString$2(P) + ' of ' + tryToString$2(O));
};

var toObject$r = toObject$y;
var toAbsoluteIndex$8 = toAbsoluteIndex$a;
var lengthOfArrayLike$q = lengthOfArrayLike$w;
var deletePropertyOrThrow$3 = deletePropertyOrThrow$4;

var min$b = Math.min;

// `Array.prototype.copyWithin` method implementation
// https://tc39.es/ecma262/#sec-array.prototype.copywithin
// eslint-disable-next-line es/no-array-prototype-copywithin -- safe
var arrayCopyWithin = [].copyWithin || function copyWithin(target /* = 0 */, start /* = 0, end = @length */) {
  var O = toObject$r(this);
  var len = lengthOfArrayLike$q(O);
  var to = toAbsoluteIndex$8(target, len);
  var from = toAbsoluteIndex$8(start, len);
  var end = arguments.length > 2 ? arguments[2] : undefined;
  var count = min$b((end === undefined ? len : toAbsoluteIndex$8(end, len)) - from, len - to);
  var inc = 1;
  if (from < to && to < from + count) {
    inc = -1;
    from += count - 1;
    to += count - 1;
  }
  while (count-- > 0) {
    if (from in O) O[to] = O[from];
    else deletePropertyOrThrow$3(O, to);
    to += inc;
    from += inc;
  } return O;
};

var $$3N = _export;
var copyWithin = arrayCopyWithin;
var addToUnscopables$g = addToUnscopables$i;

// `Array.prototype.copyWithin` method
// https://tc39.es/ecma262/#sec-array.prototype.copywithin
$$3N({ target: 'Array', proto: true }, {
  copyWithin: copyWithin
});

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables$g('copyWithin');

var fails$1g = fails$1z;

var arrayMethodIsStrict$b = function (METHOD_NAME, argument) {
  var method = [][METHOD_NAME];
  return !!method && fails$1g(function () {
    // eslint-disable-next-line no-useless-call -- required for testing
    method.call(null, argument || function () { return 1; }, 1);
  });
};

var $$3M = _export;
var $every$2 = arrayIteration.every;
var arrayMethodIsStrict$a = arrayMethodIsStrict$b;

var STRICT_METHOD$4 = arrayMethodIsStrict$a('every');

// `Array.prototype.every` method
// https://tc39.es/ecma262/#sec-array.prototype.every
$$3M({ target: 'Array', proto: true, forced: !STRICT_METHOD$4 }, {
  every: function every(callbackfn /* , thisArg */) {
    return $every$2(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

var toObject$q = toObject$y;
var toAbsoluteIndex$7 = toAbsoluteIndex$a;
var lengthOfArrayLike$p = lengthOfArrayLike$w;

// `Array.prototype.fill` method implementation
// https://tc39.es/ecma262/#sec-array.prototype.fill
var arrayFill$1 = function fill(value /* , start = 0, end = @length */) {
  var O = toObject$q(this);
  var length = lengthOfArrayLike$p(O);
  var argumentsLength = arguments.length;
  var index = toAbsoluteIndex$7(argumentsLength > 1 ? arguments[1] : undefined, length);
  var end = argumentsLength > 2 ? arguments[2] : undefined;
  var endPos = end === undefined ? length : toAbsoluteIndex$7(end, length);
  while (endPos > index) O[index++] = value;
  return O;
};

var $$3L = _export;
var fill$1 = arrayFill$1;
var addToUnscopables$f = addToUnscopables$i;

// `Array.prototype.fill` method
// https://tc39.es/ecma262/#sec-array.prototype.fill
$$3L({ target: 'Array', proto: true }, {
  fill: fill$1
});

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables$f('fill');

var $$3K = _export;
var $filter$1 = arrayIteration.filter;
var arrayMethodHasSpeciesSupport$3 = arrayMethodHasSpeciesSupport$5;

var HAS_SPECIES_SUPPORT$3 = arrayMethodHasSpeciesSupport$3('filter');

// `Array.prototype.filter` method
// https://tc39.es/ecma262/#sec-array.prototype.filter
// with adding support of @@species
$$3K({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT$3 }, {
  filter: function filter(callbackfn /* , thisArg */) {
    return $filter$1(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

var $$3J = _export;
var $find$2 = arrayIteration.find;
var addToUnscopables$e = addToUnscopables$i;

var FIND = 'find';
var SKIPS_HOLES$1 = true;

// Shouldn't skip holes
// eslint-disable-next-line es/no-array-prototype-find -- testing
if (FIND in []) Array(1)[FIND](function () { SKIPS_HOLES$1 = false; });

// `Array.prototype.find` method
// https://tc39.es/ecma262/#sec-array.prototype.find
$$3J({ target: 'Array', proto: true, forced: SKIPS_HOLES$1 }, {
  find: function find(callbackfn /* , that = undefined */) {
    return $find$2(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables$e(FIND);

var $$3I = _export;
var $findIndex$1 = arrayIteration.findIndex;
var addToUnscopables$d = addToUnscopables$i;

var FIND_INDEX = 'findIndex';
var SKIPS_HOLES = true;

// Shouldn't skip holes
// eslint-disable-next-line es/no-array-prototype-findindex -- testing
if (FIND_INDEX in []) Array(1)[FIND_INDEX](function () { SKIPS_HOLES = false; });

// `Array.prototype.findIndex` method
// https://tc39.es/ecma262/#sec-array.prototype.findindex
$$3I({ target: 'Array', proto: true, forced: SKIPS_HOLES }, {
  findIndex: function findIndex(callbackfn /* , that = undefined */) {
    return $findIndex$1(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables$d(FIND_INDEX);

var bind$f = functionBindContext;
var IndexedObject$5 = indexedObject;
var toObject$p = toObject$y;
var lengthOfArrayLike$o = lengthOfArrayLike$w;

// `Array.prototype.{ findLast, findLastIndex }` methods implementation
var createMethod$6 = function (TYPE) {
  var IS_FIND_LAST_INDEX = TYPE === 1;
  return function ($this, callbackfn, that) {
    var O = toObject$p($this);
    var self = IndexedObject$5(O);
    var index = lengthOfArrayLike$o(self);
    var boundFunction = bind$f(callbackfn, that);
    var value, result;
    while (index-- > 0) {
      value = self[index];
      result = boundFunction(value, index, O);
      if (result) switch (TYPE) {
        case 0: return value; // findLast
        case 1: return index; // findLastIndex
      }
    }
    return IS_FIND_LAST_INDEX ? -1 : undefined;
  };
};

var arrayIterationFromLast = {
  // `Array.prototype.findLast` method
  // https://github.com/tc39/proposal-array-find-from-last
  findLast: createMethod$6(0),
  // `Array.prototype.findLastIndex` method
  // https://github.com/tc39/proposal-array-find-from-last
  findLastIndex: createMethod$6(1)
};

var $$3H = _export;
var $findLast$1 = arrayIterationFromLast.findLast;
var addToUnscopables$c = addToUnscopables$i;

// `Array.prototype.findLast` method
// https://tc39.es/ecma262/#sec-array.prototype.findlast
$$3H({ target: 'Array', proto: true }, {
  findLast: function findLast(callbackfn /* , that = undefined */) {
    return $findLast$1(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

addToUnscopables$c('findLast');

var $$3G = _export;
var $findLastIndex$1 = arrayIterationFromLast.findLastIndex;
var addToUnscopables$b = addToUnscopables$i;

// `Array.prototype.findLastIndex` method
// https://tc39.es/ecma262/#sec-array.prototype.findlastindex
$$3G({ target: 'Array', proto: true }, {
  findLastIndex: function findLastIndex(callbackfn /* , that = undefined */) {
    return $findLastIndex$1(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

addToUnscopables$b('findLastIndex');

var isArray$6 = isArray$a;
var lengthOfArrayLike$n = lengthOfArrayLike$w;
var doesNotExceedSafeInteger$5 = doesNotExceedSafeInteger$7;
var bind$e = functionBindContext;

// `FlattenIntoArray` abstract operation
// https://tc39.github.io/proposal-flatMap/#sec-FlattenIntoArray
var flattenIntoArray$2 = function (target, original, source, sourceLen, start, depth, mapper, thisArg) {
  var targetIndex = start;
  var sourceIndex = 0;
  var mapFn = mapper ? bind$e(mapper, thisArg) : false;
  var element, elementLen;

  while (sourceIndex < sourceLen) {
    if (sourceIndex in source) {
      element = mapFn ? mapFn(source[sourceIndex], sourceIndex, original) : source[sourceIndex];

      if (depth > 0 && isArray$6(element)) {
        elementLen = lengthOfArrayLike$n(element);
        targetIndex = flattenIntoArray$2(target, original, element, elementLen, targetIndex, depth - 1) - 1;
      } else {
        doesNotExceedSafeInteger$5(targetIndex + 1);
        target[targetIndex] = element;
      }

      targetIndex++;
    }
    sourceIndex++;
  }
  return targetIndex;
};

var flattenIntoArray_1 = flattenIntoArray$2;

var $$3F = _export;
var flattenIntoArray$1 = flattenIntoArray_1;
var toObject$o = toObject$y;
var lengthOfArrayLike$m = lengthOfArrayLike$w;
var toIntegerOrInfinity$j = toIntegerOrInfinity$n;
var arraySpeciesCreate$2 = arraySpeciesCreate$5;

// `Array.prototype.flat` method
// https://tc39.es/ecma262/#sec-array.prototype.flat
$$3F({ target: 'Array', proto: true }, {
  flat: function flat(/* depthArg = 1 */) {
    var depthArg = arguments.length ? arguments[0] : undefined;
    var O = toObject$o(this);
    var sourceLen = lengthOfArrayLike$m(O);
    var A = arraySpeciesCreate$2(O, 0);
    A.length = flattenIntoArray$1(A, O, O, sourceLen, 0, depthArg === undefined ? 1 : toIntegerOrInfinity$j(depthArg));
    return A;
  }
});

var $$3E = _export;
var flattenIntoArray = flattenIntoArray_1;
var aCallable$A = aCallable$F;
var toObject$n = toObject$y;
var lengthOfArrayLike$l = lengthOfArrayLike$w;
var arraySpeciesCreate$1 = arraySpeciesCreate$5;

// `Array.prototype.flatMap` method
// https://tc39.es/ecma262/#sec-array.prototype.flatmap
$$3E({ target: 'Array', proto: true }, {
  flatMap: function flatMap(callbackfn /* , thisArg */) {
    var O = toObject$n(this);
    var sourceLen = lengthOfArrayLike$l(O);
    var A;
    aCallable$A(callbackfn);
    A = arraySpeciesCreate$1(O, 0);
    A.length = flattenIntoArray(A, O, O, sourceLen, 0, 1, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    return A;
  }
});

var $forEach$2 = arrayIteration.forEach;
var arrayMethodIsStrict$9 = arrayMethodIsStrict$b;

var STRICT_METHOD$3 = arrayMethodIsStrict$9('forEach');

// `Array.prototype.forEach` method implementation
// https://tc39.es/ecma262/#sec-array.prototype.foreach
var arrayForEach = !STRICT_METHOD$3 ? function forEach(callbackfn /* , thisArg */) {
  return $forEach$2(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
// eslint-disable-next-line es/no-array-prototype-foreach -- safe
} : [].forEach;

var $$3D = _export;
var forEach$5 = arrayForEach;

// `Array.prototype.forEach` method
// https://tc39.es/ecma262/#sec-array.prototype.foreach
// eslint-disable-next-line es/no-array-prototype-foreach -- safe
$$3D({ target: 'Array', proto: true, forced: [].forEach !== forEach$5 }, {
  forEach: forEach$5
});

var anObject$T = anObject$11;
var iteratorClose$6 = iteratorClose$8;

// call something on iterator step with safe closing on error
var callWithSafeIterationClosing$3 = function (iterator, fn, value, ENTRIES) {
  try {
    return ENTRIES ? fn(anObject$T(value)[0], value[1]) : fn(value);
  } catch (error) {
    iteratorClose$6(iterator, 'throw', error);
  }
};

var bind$d = functionBindContext;
var call$V = functionCall;
var toObject$m = toObject$y;
var callWithSafeIterationClosing$2 = callWithSafeIterationClosing$3;
var isArrayIteratorMethod$1 = isArrayIteratorMethod$3;
var isConstructor$5 = isConstructor$7;
var lengthOfArrayLike$k = lengthOfArrayLike$w;
var createProperty$9 = createProperty$b;
var getIterator$4 = getIterator$6;
var getIteratorMethod$5 = getIteratorMethod$8;

var $Array$a = Array;

// `Array.from` method implementation
// https://tc39.es/ecma262/#sec-array.from
var arrayFrom$1 = function from(arrayLike /* , mapfn = undefined, thisArg = undefined */) {
  var O = toObject$m(arrayLike);
  var IS_CONSTRUCTOR = isConstructor$5(this);
  var argumentsLength = arguments.length;
  var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
  var mapping = mapfn !== undefined;
  if (mapping) mapfn = bind$d(mapfn, argumentsLength > 2 ? arguments[2] : undefined);
  var iteratorMethod = getIteratorMethod$5(O);
  var index = 0;
  var length, result, step, iterator, next, value;
  // if the target is not iterable or it's an array with the default iterator - use a simple case
  if (iteratorMethod && !(this === $Array$a && isArrayIteratorMethod$1(iteratorMethod))) {
    result = IS_CONSTRUCTOR ? new this() : [];
    iterator = getIterator$4(O, iteratorMethod);
    next = iterator.next;
    for (;!(step = call$V(next, iterator)).done; index++) {
      value = mapping ? callWithSafeIterationClosing$2(iterator, mapfn, [step.value, index], true) : step.value;
      createProperty$9(result, index, value);
    }
  } else {
    length = lengthOfArrayLike$k(O);
    result = IS_CONSTRUCTOR ? new this(length) : $Array$a(length);
    for (;length > index; index++) {
      value = mapping ? mapfn(O[index], index) : O[index];
      createProperty$9(result, index, value);
    }
  }
  result.length = index;
  return result;
};

var wellKnownSymbol$z = wellKnownSymbol$O;

var ITERATOR$9 = wellKnownSymbol$z('iterator');
var SAFE_CLOSING = false;

try {
  var called = 0;
  var iteratorWithReturn = {
    next: function () {
      return { done: !!called++ };
    },
    'return': function () {
      SAFE_CLOSING = true;
    }
  };
  iteratorWithReturn[ITERATOR$9] = function () {
    return this;
  };
  // eslint-disable-next-line es/no-array-from, no-throw-literal -- required for testing
  Array.from(iteratorWithReturn, function () { throw 2; });
} catch (error) { /* empty */ }

var checkCorrectnessOfIteration$4 = function (exec, SKIP_CLOSING) {
  try {
    if (!SKIP_CLOSING && !SAFE_CLOSING) return false;
  } catch (error) { return false; } // workaround of old WebKit + `eval` bug
  var ITERATION_SUPPORT = false;
  try {
    var object = {};
    object[ITERATOR$9] = function () {
      return {
        next: function () {
          return { done: ITERATION_SUPPORT = true };
        }
      };
    };
    exec(object);
  } catch (error) { /* empty */ }
  return ITERATION_SUPPORT;
};

var $$3C = _export;
var from = arrayFrom$1;
var checkCorrectnessOfIteration$3 = checkCorrectnessOfIteration$4;

var INCORRECT_ITERATION = !checkCorrectnessOfIteration$3(function (iterable) {
  // eslint-disable-next-line es/no-array-from -- required for testing
  Array.from(iterable);
});

// `Array.from` method
// https://tc39.es/ecma262/#sec-array.from
$$3C({ target: 'Array', stat: true, forced: INCORRECT_ITERATION }, {
  from: from
});

var $$3B = _export;
var $includes$1 = arrayIncludes.includes;
var fails$1f = fails$1z;
var addToUnscopables$a = addToUnscopables$i;

// FF99+ bug
var BROKEN_ON_SPARSE = fails$1f(function () {
  // eslint-disable-next-line es/no-array-prototype-includes -- detection
  return !Array(1).includes();
});

// `Array.prototype.includes` method
// https://tc39.es/ecma262/#sec-array.prototype.includes
$$3B({ target: 'Array', proto: true, forced: BROKEN_ON_SPARSE }, {
  includes: function includes(el /* , fromIndex = 0 */) {
    return $includes$1(this, el, arguments.length > 1 ? arguments[1] : undefined);
  }
});

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables$a('includes');

/* eslint-disable es/no-array-prototype-indexof -- required for testing */
var $$3A = _export;
var uncurryThis$1l = functionUncurryThisClause;
var $indexOf$1 = arrayIncludes.indexOf;
var arrayMethodIsStrict$8 = arrayMethodIsStrict$b;

var nativeIndexOf = uncurryThis$1l([].indexOf);

var NEGATIVE_ZERO$1 = !!nativeIndexOf && 1 / nativeIndexOf([1], 1, -0) < 0;
var FORCED$D = NEGATIVE_ZERO$1 || !arrayMethodIsStrict$8('indexOf');

// `Array.prototype.indexOf` method
// https://tc39.es/ecma262/#sec-array.prototype.indexof
$$3A({ target: 'Array', proto: true, forced: FORCED$D }, {
  indexOf: function indexOf(searchElement /* , fromIndex = 0 */) {
    var fromIndex = arguments.length > 1 ? arguments[1] : undefined;
    return NEGATIVE_ZERO$1
      // convert -0 to +0
      ? nativeIndexOf(this, searchElement, fromIndex) || 0
      : $indexOf$1(this, searchElement, fromIndex);
  }
});

var $$3z = _export;
var isArray$5 = isArray$a;

// `Array.isArray` method
// https://tc39.es/ecma262/#sec-array.isarray
$$3z({ target: 'Array', stat: true }, {
  isArray: isArray$5
});

var fails$1e = fails$1z;
var isCallable$l = isCallable$D;
var isObject$x = isObject$J;
var getPrototypeOf$c = objectGetPrototypeOf$2;
var defineBuiltIn$o = defineBuiltIn$t;
var wellKnownSymbol$y = wellKnownSymbol$O;

var ITERATOR$8 = wellKnownSymbol$y('iterator');
var BUGGY_SAFARI_ITERATORS$1 = false;

// `%IteratorPrototype%` object
// https://tc39.es/ecma262/#sec-%iteratorprototype%-object
var IteratorPrototype$6, PrototypeOfArrayIteratorPrototype, arrayIterator$1;

/* eslint-disable es/no-array-prototype-keys -- safe */
if ([].keys) {
  arrayIterator$1 = [].keys();
  // Safari 8 has buggy iterators w/o `next`
  if (!('next' in arrayIterator$1)) BUGGY_SAFARI_ITERATORS$1 = true;
  else {
    PrototypeOfArrayIteratorPrototype = getPrototypeOf$c(getPrototypeOf$c(arrayIterator$1));
    if (PrototypeOfArrayIteratorPrototype !== Object.prototype) IteratorPrototype$6 = PrototypeOfArrayIteratorPrototype;
  }
}

var NEW_ITERATOR_PROTOTYPE = !isObject$x(IteratorPrototype$6) || fails$1e(function () {
  var test = {};
  // FF44- legacy iterators case
  return IteratorPrototype$6[ITERATOR$8].call(test) !== test;
});

if (NEW_ITERATOR_PROTOTYPE) IteratorPrototype$6 = {};

// `%IteratorPrototype%[@@iterator]()` method
// https://tc39.es/ecma262/#sec-%iteratorprototype%-@@iterator
if (!isCallable$l(IteratorPrototype$6[ITERATOR$8])) {
  defineBuiltIn$o(IteratorPrototype$6, ITERATOR$8, function () {
    return this;
  });
}

var iteratorsCore = {
  IteratorPrototype: IteratorPrototype$6,
  BUGGY_SAFARI_ITERATORS: BUGGY_SAFARI_ITERATORS$1
};

var IteratorPrototype$5 = iteratorsCore.IteratorPrototype;
var create$e = objectCreate$1;
var createPropertyDescriptor$6 = createPropertyDescriptor$d;
var setToStringTag$b = setToStringTag$e;
var Iterators$2 = iterators;

var returnThis$1 = function () { return this; };

var iteratorCreateConstructor = function (IteratorConstructor, NAME, next, ENUMERABLE_NEXT) {
  var TO_STRING_TAG = NAME + ' Iterator';
  IteratorConstructor.prototype = create$e(IteratorPrototype$5, { next: createPropertyDescriptor$6(+!ENUMERABLE_NEXT, next) });
  setToStringTag$b(IteratorConstructor, TO_STRING_TAG, false);
  Iterators$2[TO_STRING_TAG] = returnThis$1;
  return IteratorConstructor;
};

var $$3y = _export;
var call$U = functionCall;
var FunctionName$1 = functionName;
var isCallable$k = isCallable$D;
var createIteratorConstructor$2 = iteratorCreateConstructor;
var getPrototypeOf$b = objectGetPrototypeOf$2;
var setPrototypeOf$7 = objectSetPrototypeOf$1;
var setToStringTag$a = setToStringTag$e;
var createNonEnumerableProperty$c = createNonEnumerableProperty$j;
var defineBuiltIn$n = defineBuiltIn$t;
var wellKnownSymbol$x = wellKnownSymbol$O;
var Iterators$1 = iterators;
var IteratorsCore = iteratorsCore;

var PROPER_FUNCTION_NAME$3 = FunctionName$1.PROPER;
var CONFIGURABLE_FUNCTION_NAME$1 = FunctionName$1.CONFIGURABLE;
var IteratorPrototype$4 = IteratorsCore.IteratorPrototype;
var BUGGY_SAFARI_ITERATORS = IteratorsCore.BUGGY_SAFARI_ITERATORS;
var ITERATOR$7 = wellKnownSymbol$x('iterator');
var KEYS = 'keys';
var VALUES = 'values';
var ENTRIES = 'entries';

var returnThis = function () { return this; };

var iteratorDefine = function (Iterable, NAME, IteratorConstructor, next, DEFAULT, IS_SET, FORCED) {
  createIteratorConstructor$2(IteratorConstructor, NAME, next);

  var getIterationMethod = function (KIND) {
    if (KIND === DEFAULT && defaultIterator) return defaultIterator;
    if (!BUGGY_SAFARI_ITERATORS && KIND && KIND in IterablePrototype) return IterablePrototype[KIND];

    switch (KIND) {
      case KEYS: return function keys() { return new IteratorConstructor(this, KIND); };
      case VALUES: return function values() { return new IteratorConstructor(this, KIND); };
      case ENTRIES: return function entries() { return new IteratorConstructor(this, KIND); };
    }

    return function () { return new IteratorConstructor(this); };
  };

  var TO_STRING_TAG = NAME + ' Iterator';
  var INCORRECT_VALUES_NAME = false;
  var IterablePrototype = Iterable.prototype;
  var nativeIterator = IterablePrototype[ITERATOR$7]
    || IterablePrototype['@@iterator']
    || DEFAULT && IterablePrototype[DEFAULT];
  var defaultIterator = !BUGGY_SAFARI_ITERATORS && nativeIterator || getIterationMethod(DEFAULT);
  var anyNativeIterator = NAME === 'Array' ? IterablePrototype.entries || nativeIterator : nativeIterator;
  var CurrentIteratorPrototype, methods, KEY;

  // fix native
  if (anyNativeIterator) {
    CurrentIteratorPrototype = getPrototypeOf$b(anyNativeIterator.call(new Iterable()));
    if (CurrentIteratorPrototype !== Object.prototype && CurrentIteratorPrototype.next) {
      if (getPrototypeOf$b(CurrentIteratorPrototype) !== IteratorPrototype$4) {
        if (setPrototypeOf$7) {
          setPrototypeOf$7(CurrentIteratorPrototype, IteratorPrototype$4);
        } else if (!isCallable$k(CurrentIteratorPrototype[ITERATOR$7])) {
          defineBuiltIn$n(CurrentIteratorPrototype, ITERATOR$7, returnThis);
        }
      }
      // Set @@toStringTag to native iterators
      setToStringTag$a(CurrentIteratorPrototype, TO_STRING_TAG, true);
    }
  }

  // fix Array.prototype.{ values, @@iterator }.name in V8 / FF
  if (PROPER_FUNCTION_NAME$3 && DEFAULT === VALUES && nativeIterator && nativeIterator.name !== VALUES) {
    if (CONFIGURABLE_FUNCTION_NAME$1) {
      createNonEnumerableProperty$c(IterablePrototype, 'name', VALUES);
    } else {
      INCORRECT_VALUES_NAME = true;
      defaultIterator = function values() { return call$U(nativeIterator, this); };
    }
  }

  // export additional methods
  if (DEFAULT) {
    methods = {
      values: getIterationMethod(VALUES),
      keys: IS_SET ? defaultIterator : getIterationMethod(KEYS),
      entries: getIterationMethod(ENTRIES)
    };
    if (FORCED) for (KEY in methods) {
      if (BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME || !(KEY in IterablePrototype)) {
        defineBuiltIn$n(IterablePrototype, KEY, methods[KEY]);
      }
    } else $$3y({ target: NAME, proto: true, forced: BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME }, methods);
  }

  // define iterator
  if (IterablePrototype[ITERATOR$7] !== defaultIterator) {
    defineBuiltIn$n(IterablePrototype, ITERATOR$7, defaultIterator, { name: DEFAULT });
  }
  Iterators$1[NAME] = defaultIterator;

  return methods;
};

// `CreateIterResultObject` abstract operation
// https://tc39.es/ecma262/#sec-createiterresultobject
var createIterResultObject$d = function (value, done) {
  return { value: value, done: done };
};

var toIndexedObject$c = toIndexedObject$j;
var addToUnscopables$9 = addToUnscopables$i;
var Iterators = iterators;
var InternalStateModule$g = internalState;
var defineProperty$a = objectDefineProperty.f;
var defineIterator$2 = iteratorDefine;
var createIterResultObject$c = createIterResultObject$d;
var DESCRIPTORS$E = descriptors;

var ARRAY_ITERATOR = 'Array Iterator';
var setInternalState$g = InternalStateModule$g.set;
var getInternalState$a = InternalStateModule$g.getterFor(ARRAY_ITERATOR);

// `Array.prototype.entries` method
// https://tc39.es/ecma262/#sec-array.prototype.entries
// `Array.prototype.keys` method
// https://tc39.es/ecma262/#sec-array.prototype.keys
// `Array.prototype.values` method
// https://tc39.es/ecma262/#sec-array.prototype.values
// `Array.prototype[@@iterator]` method
// https://tc39.es/ecma262/#sec-array.prototype-@@iterator
// `CreateArrayIterator` internal method
// https://tc39.es/ecma262/#sec-createarrayiterator
var es_array_iterator = defineIterator$2(Array, 'Array', function (iterated, kind) {
  setInternalState$g(this, {
    type: ARRAY_ITERATOR,
    target: toIndexedObject$c(iterated), // target
    index: 0,                          // next index
    kind: kind                         // kind
  });
// `%ArrayIteratorPrototype%.next` method
// https://tc39.es/ecma262/#sec-%arrayiteratorprototype%.next
}, function () {
  var state = getInternalState$a(this);
  var target = state.target;
  var index = state.index++;
  if (!target || index >= target.length) {
    state.target = undefined;
    return createIterResultObject$c(undefined, true);
  }
  switch (state.kind) {
    case 'keys': return createIterResultObject$c(index, false);
    case 'values': return createIterResultObject$c(target[index], false);
  } return createIterResultObject$c([index, target[index]], false);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values%
// https://tc39.es/ecma262/#sec-createunmappedargumentsobject
// https://tc39.es/ecma262/#sec-createmappedargumentsobject
var values = Iterators.Arguments = Iterators.Array;

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables$9('keys');
addToUnscopables$9('values');
addToUnscopables$9('entries');

// V8 ~ Chrome 45- bug
if (DESCRIPTORS$E && values.name !== 'values') try {
  defineProperty$a(values, 'name', { value: 'values' });
} catch (error) { /* empty */ }

var $$3x = _export;
var uncurryThis$1k = functionUncurryThis;
var IndexedObject$4 = indexedObject;
var toIndexedObject$b = toIndexedObject$j;
var arrayMethodIsStrict$7 = arrayMethodIsStrict$b;

var nativeJoin = uncurryThis$1k([].join);

var ES3_STRINGS = IndexedObject$4 !== Object;
var FORCED$C = ES3_STRINGS || !arrayMethodIsStrict$7('join', ',');

// `Array.prototype.join` method
// https://tc39.es/ecma262/#sec-array.prototype.join
$$3x({ target: 'Array', proto: true, forced: FORCED$C }, {
  join: function join(separator) {
    return nativeJoin(toIndexedObject$b(this), separator === undefined ? ',' : separator);
  }
});

/* eslint-disable es/no-array-prototype-lastindexof -- safe */
var apply$7 = functionApply$1;
var toIndexedObject$a = toIndexedObject$j;
var toIntegerOrInfinity$i = toIntegerOrInfinity$n;
var lengthOfArrayLike$j = lengthOfArrayLike$w;
var arrayMethodIsStrict$6 = arrayMethodIsStrict$b;

var min$a = Math.min;
var $lastIndexOf$1 = [].lastIndexOf;
var NEGATIVE_ZERO = !!$lastIndexOf$1 && 1 / [1].lastIndexOf(1, -0) < 0;
var STRICT_METHOD$2 = arrayMethodIsStrict$6('lastIndexOf');
var FORCED$B = NEGATIVE_ZERO || !STRICT_METHOD$2;

// `Array.prototype.lastIndexOf` method implementation
// https://tc39.es/ecma262/#sec-array.prototype.lastindexof
var arrayLastIndexOf = FORCED$B ? function lastIndexOf(searchElement /* , fromIndex = @[*-1] */) {
  // convert -0 to +0
  if (NEGATIVE_ZERO) return apply$7($lastIndexOf$1, this, arguments) || 0;
  var O = toIndexedObject$a(this);
  var length = lengthOfArrayLike$j(O);
  if (length === 0) return -1;
  var index = length - 1;
  if (arguments.length > 1) index = min$a(index, toIntegerOrInfinity$i(arguments[1]));
  if (index < 0) index = length + index;
  for (;index >= 0; index--) if (index in O && O[index] === searchElement) return index || 0;
  return -1;
} : $lastIndexOf$1;

var $$3w = _export;
var lastIndexOf = arrayLastIndexOf;

// `Array.prototype.lastIndexOf` method
// https://tc39.es/ecma262/#sec-array.prototype.lastindexof
// eslint-disable-next-line es/no-array-prototype-lastindexof -- required for testing
$$3w({ target: 'Array', proto: true, forced: lastIndexOf !== [].lastIndexOf }, {
  lastIndexOf: lastIndexOf
});

var $$3v = _export;
var $map$1 = arrayIteration.map;
var arrayMethodHasSpeciesSupport$2 = arrayMethodHasSpeciesSupport$5;

var HAS_SPECIES_SUPPORT$2 = arrayMethodHasSpeciesSupport$2('map');

// `Array.prototype.map` method
// https://tc39.es/ecma262/#sec-array.prototype.map
// with adding support of @@species
$$3v({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT$2 }, {
  map: function map(callbackfn /* , thisArg */) {
    return $map$1(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

var $$3u = _export;
var fails$1d = fails$1z;
var isConstructor$4 = isConstructor$7;
var createProperty$8 = createProperty$b;

var $Array$9 = Array;

var ISNT_GENERIC = fails$1d(function () {
  function F() { /* empty */ }
  // eslint-disable-next-line es/no-array-of -- safe
  return !($Array$9.of.call(F) instanceof F);
});

// `Array.of` method
// https://tc39.es/ecma262/#sec-array.of
// WebKit Array.of isn't generic
$$3u({ target: 'Array', stat: true, forced: ISNT_GENERIC }, {
  of: function of(/* ...args */) {
    var index = 0;
    var argumentsLength = arguments.length;
    var result = new (isConstructor$4(this) ? this : $Array$9)(argumentsLength);
    while (argumentsLength > index) createProperty$8(result, index, arguments[index++]);
    result.length = argumentsLength;
    return result;
  }
});

var DESCRIPTORS$D = descriptors;
var isArray$4 = isArray$a;

var $TypeError$p = TypeError;
// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var getOwnPropertyDescriptor$a = Object.getOwnPropertyDescriptor;

// Safari < 13 does not throw an error in this case
var SILENT_ON_NON_WRITABLE_LENGTH_SET = DESCRIPTORS$D && !function () {
  // makes no sense without proper strict mode support
  if (this !== undefined) return true;
  try {
    // eslint-disable-next-line es/no-object-defineproperty -- safe
    Object.defineProperty([], 'length', { writable: false }).length = 1;
  } catch (error) {
    return error instanceof TypeError;
  }
}();

var arraySetLength = SILENT_ON_NON_WRITABLE_LENGTH_SET ? function (O, length) {
  if (isArray$4(O) && !getOwnPropertyDescriptor$a(O, 'length').writable) {
    throw new $TypeError$p('Cannot set read only .length');
  } return O.length = length;
} : function (O, length) {
  return O.length = length;
};

var $$3t = _export;
var toObject$l = toObject$y;
var lengthOfArrayLike$i = lengthOfArrayLike$w;
var setArrayLength$2 = arraySetLength;
var doesNotExceedSafeInteger$4 = doesNotExceedSafeInteger$7;
var fails$1c = fails$1z;

var INCORRECT_TO_LENGTH = fails$1c(function () {
  return [].push.call({ length: 0x100000000 }, 1) !== 4294967297;
});

// V8 <= 121 and Safari <= 15.4; FF < 23 throws InternalError
// https://bugs.chromium.org/p/v8/issues/detail?id=12681
var properErrorOnNonWritableLength$1 = function () {
  try {
    // eslint-disable-next-line es/no-object-defineproperty -- safe
    Object.defineProperty([], 'length', { writable: false }).push();
  } catch (error) {
    return error instanceof TypeError;
  }
};

var FORCED$A = INCORRECT_TO_LENGTH || !properErrorOnNonWritableLength$1();

// `Array.prototype.push` method
// https://tc39.es/ecma262/#sec-array.prototype.push
$$3t({ target: 'Array', proto: true, arity: 1, forced: FORCED$A }, {
  // eslint-disable-next-line no-unused-vars -- required for `.length`
  push: function push(item) {
    var O = toObject$l(this);
    var len = lengthOfArrayLike$i(O);
    var argCount = arguments.length;
    doesNotExceedSafeInteger$4(len + argCount);
    for (var i = 0; i < argCount; i++) {
      O[len] = arguments[i];
      len++;
    }
    setArrayLength$2(O, len);
    return len;
  }
});

var aCallable$z = aCallable$F;
var toObject$k = toObject$y;
var IndexedObject$3 = indexedObject;
var lengthOfArrayLike$h = lengthOfArrayLike$w;

var $TypeError$o = TypeError;

var REDUCE_EMPTY = 'Reduce of empty array with no initial value';

// `Array.prototype.{ reduce, reduceRight }` methods implementation
var createMethod$5 = function (IS_RIGHT) {
  return function (that, callbackfn, argumentsLength, memo) {
    var O = toObject$k(that);
    var self = IndexedObject$3(O);
    var length = lengthOfArrayLike$h(O);
    aCallable$z(callbackfn);
    if (length === 0 && argumentsLength < 2) throw new $TypeError$o(REDUCE_EMPTY);
    var index = IS_RIGHT ? length - 1 : 0;
    var i = IS_RIGHT ? -1 : 1;
    if (argumentsLength < 2) while (true) {
      if (index in self) {
        memo = self[index];
        index += i;
        break;
      }
      index += i;
      if (IS_RIGHT ? index < 0 : length <= index) {
        throw new $TypeError$o(REDUCE_EMPTY);
      }
    }
    for (;IS_RIGHT ? index >= 0 : length > index; index += i) if (index in self) {
      memo = callbackfn(memo, self[index], index, O);
    }
    return memo;
  };
};

var arrayReduce = {
  // `Array.prototype.reduce` method
  // https://tc39.es/ecma262/#sec-array.prototype.reduce
  left: createMethod$5(false),
  // `Array.prototype.reduceRight` method
  // https://tc39.es/ecma262/#sec-array.prototype.reduceright
  right: createMethod$5(true)
};

/* global Bun, Deno -- detection */
var globalThis$15 = globalThis_1;
var userAgent$6 = environmentUserAgent;
var classof$i = classofRaw$2;

var userAgentStartsWith = function (string) {
  return userAgent$6.slice(0, string.length) === string;
};

var environment = (function () {
  if (userAgentStartsWith('Bun/')) return 'BUN';
  if (userAgentStartsWith('Cloudflare-Workers')) return 'CLOUDFLARE';
  if (userAgentStartsWith('Deno/')) return 'DENO';
  if (userAgentStartsWith('Node.js/')) return 'NODE';
  if (globalThis$15.Bun && typeof Bun.version == 'string') return 'BUN';
  if (globalThis$15.Deno && typeof Deno.version == 'object') return 'DENO';
  if (classof$i(globalThis$15.process) === 'process') return 'NODE';
  if (globalThis$15.window && globalThis$15.document) return 'BROWSER';
  return 'REST';
})();

var ENVIRONMENT$3 = environment;

var environmentIsNode = ENVIRONMENT$3 === 'NODE';

var $$3s = _export;
var $reduce$1 = arrayReduce.left;
var arrayMethodIsStrict$5 = arrayMethodIsStrict$b;
var CHROME_VERSION$1 = environmentV8Version;
var IS_NODE$5 = environmentIsNode;

// Chrome 80-82 has a critical bug
// https://bugs.chromium.org/p/chromium/issues/detail?id=1049982
var CHROME_BUG$1 = !IS_NODE$5 && CHROME_VERSION$1 > 79 && CHROME_VERSION$1 < 83;
var FORCED$z = CHROME_BUG$1 || !arrayMethodIsStrict$5('reduce');

// `Array.prototype.reduce` method
// https://tc39.es/ecma262/#sec-array.prototype.reduce
$$3s({ target: 'Array', proto: true, forced: FORCED$z }, {
  reduce: function reduce(callbackfn /* , initialValue */) {
    var length = arguments.length;
    return $reduce$1(this, callbackfn, length, length > 1 ? arguments[1] : undefined);
  }
});

var $$3r = _export;
var $reduceRight$1 = arrayReduce.right;
var arrayMethodIsStrict$4 = arrayMethodIsStrict$b;
var CHROME_VERSION = environmentV8Version;
var IS_NODE$4 = environmentIsNode;

// Chrome 80-82 has a critical bug
// https://bugs.chromium.org/p/chromium/issues/detail?id=1049982
var CHROME_BUG = !IS_NODE$4 && CHROME_VERSION > 79 && CHROME_VERSION < 83;
var FORCED$y = CHROME_BUG || !arrayMethodIsStrict$4('reduceRight');

// `Array.prototype.reduceRight` method
// https://tc39.es/ecma262/#sec-array.prototype.reduceright
$$3r({ target: 'Array', proto: true, forced: FORCED$y }, {
  reduceRight: function reduceRight(callbackfn /* , initialValue */) {
    return $reduceRight$1(this, callbackfn, arguments.length, arguments.length > 1 ? arguments[1] : undefined);
  }
});

var $$3q = _export;
var uncurryThis$1j = functionUncurryThis;
var isArray$3 = isArray$a;

var nativeReverse = uncurryThis$1j([].reverse);
var test$1 = [1, 2];

// `Array.prototype.reverse` method
// https://tc39.es/ecma262/#sec-array.prototype.reverse
// fix for Safari 12.0 bug
// https://bugs.webkit.org/show_bug.cgi?id=188794
$$3q({ target: 'Array', proto: true, forced: String(test$1) === String(test$1.reverse()) }, {
  reverse: function reverse() {
    // eslint-disable-next-line no-self-assign -- dirty hack
    if (isArray$3(this)) this.length = this.length;
    return nativeReverse(this);
  }
});

var $$3p = _export;
var isArray$2 = isArray$a;
var isConstructor$3 = isConstructor$7;
var isObject$w = isObject$J;
var toAbsoluteIndex$6 = toAbsoluteIndex$a;
var lengthOfArrayLike$g = lengthOfArrayLike$w;
var toIndexedObject$9 = toIndexedObject$j;
var createProperty$7 = createProperty$b;
var wellKnownSymbol$w = wellKnownSymbol$O;
var arrayMethodHasSpeciesSupport$1 = arrayMethodHasSpeciesSupport$5;
var nativeSlice = arraySlice$a;

var HAS_SPECIES_SUPPORT$1 = arrayMethodHasSpeciesSupport$1('slice');

var SPECIES$4 = wellKnownSymbol$w('species');
var $Array$8 = Array;
var max$7 = Math.max;

// `Array.prototype.slice` method
// https://tc39.es/ecma262/#sec-array.prototype.slice
// fallback for not array-like ES3 strings and DOM objects
$$3p({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT$1 }, {
  slice: function slice(start, end) {
    var O = toIndexedObject$9(this);
    var length = lengthOfArrayLike$g(O);
    var k = toAbsoluteIndex$6(start, length);
    var fin = toAbsoluteIndex$6(end === undefined ? length : end, length);
    // inline `ArraySpeciesCreate` for usage native `Array#slice` where it's possible
    var Constructor, result, n;
    if (isArray$2(O)) {
      Constructor = O.constructor;
      // cross-realm fallback
      if (isConstructor$3(Constructor) && (Constructor === $Array$8 || isArray$2(Constructor.prototype))) {
        Constructor = undefined;
      } else if (isObject$w(Constructor)) {
        Constructor = Constructor[SPECIES$4];
        if (Constructor === null) Constructor = undefined;
      }
      if (Constructor === $Array$8 || Constructor === undefined) {
        return nativeSlice(O, k, fin);
      }
    }
    result = new (Constructor === undefined ? $Array$8 : Constructor)(max$7(fin - k, 0));
    for (n = 0; k < fin; k++, n++) if (k in O) createProperty$7(result, n, O[k]);
    result.length = n;
    return result;
  }
});

var $$3o = _export;
var $some$2 = arrayIteration.some;
var arrayMethodIsStrict$3 = arrayMethodIsStrict$b;

var STRICT_METHOD$1 = arrayMethodIsStrict$3('some');

// `Array.prototype.some` method
// https://tc39.es/ecma262/#sec-array.prototype.some
$$3o({ target: 'Array', proto: true, forced: !STRICT_METHOD$1 }, {
  some: function some(callbackfn /* , thisArg */) {
    return $some$2(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

var arraySlice$7 = arraySlice$a;

var floor$9 = Math.floor;

var sort$2 = function (array, comparefn) {
  var length = array.length;

  if (length < 8) {
    // insertion sort
    var i = 1;
    var element, j;

    while (i < length) {
      j = i;
      element = array[i];
      while (j && comparefn(array[j - 1], element) > 0) {
        array[j] = array[--j];
      }
      if (j !== i++) array[j] = element;
    }
  } else {
    // merge sort
    var middle = floor$9(length / 2);
    var left = sort$2(arraySlice$7(array, 0, middle), comparefn);
    var right = sort$2(arraySlice$7(array, middle), comparefn);
    var llength = left.length;
    var rlength = right.length;
    var lindex = 0;
    var rindex = 0;

    while (lindex < llength || rindex < rlength) {
      array[lindex + rindex] = (lindex < llength && rindex < rlength)
        ? comparefn(left[lindex], right[rindex]) <= 0 ? left[lindex++] : right[rindex++]
        : lindex < llength ? left[lindex++] : right[rindex++];
    }
  }

  return array;
};

var arraySort$1 = sort$2;

var userAgent$5 = environmentUserAgent;

var firefox = userAgent$5.match(/firefox\/(\d+)/i);

var environmentFfVersion = !!firefox && +firefox[1];

var UA = environmentUserAgent;

var environmentIsIeOrEdge = /MSIE|Trident/.test(UA);

var userAgent$4 = environmentUserAgent;

var webkit = userAgent$4.match(/AppleWebKit\/(\d+)\./);

var environmentWebkitVersion = !!webkit && +webkit[1];

var $$3n = _export;
var uncurryThis$1i = functionUncurryThis;
var aCallable$y = aCallable$F;
var toObject$j = toObject$y;
var lengthOfArrayLike$f = lengthOfArrayLike$w;
var deletePropertyOrThrow$2 = deletePropertyOrThrow$4;
var toString$A = toString$F;
var fails$1b = fails$1z;
var internalSort$1 = arraySort$1;
var arrayMethodIsStrict$2 = arrayMethodIsStrict$b;
var FF$1 = environmentFfVersion;
var IE_OR_EDGE$1 = environmentIsIeOrEdge;
var V8$2 = environmentV8Version;
var WEBKIT$2 = environmentWebkitVersion;

var test = [];
var nativeSort$1 = uncurryThis$1i(test.sort);
var push$i = uncurryThis$1i(test.push);

// IE8-
var FAILS_ON_UNDEFINED = fails$1b(function () {
  test.sort(undefined);
});
// V8 bug
var FAILS_ON_NULL = fails$1b(function () {
  test.sort(null);
});
// Old WebKit
var STRICT_METHOD = arrayMethodIsStrict$2('sort');

var STABLE_SORT$1 = !fails$1b(function () {
  // feature detection can be too slow, so check engines versions
  if (V8$2) return V8$2 < 70;
  if (FF$1 && FF$1 > 3) return;
  if (IE_OR_EDGE$1) return true;
  if (WEBKIT$2) return WEBKIT$2 < 603;

  var result = '';
  var code, chr, value, index;

  // generate an array with more 512 elements (Chakra and old V8 fails only in this case)
  for (code = 65; code < 76; code++) {
    chr = String.fromCharCode(code);

    switch (code) {
      case 66: case 69: case 70: case 72: value = 3; break;
      case 68: case 71: value = 4; break;
      default: value = 2;
    }

    for (index = 0; index < 47; index++) {
      test.push({ k: chr + index, v: value });
    }
  }

  test.sort(function (a, b) { return b.v - a.v; });

  for (index = 0; index < test.length; index++) {
    chr = test[index].k.charAt(0);
    if (result.charAt(result.length - 1) !== chr) result += chr;
  }

  return result !== 'DGBEFHACIJK';
});

var FORCED$x = FAILS_ON_UNDEFINED || !FAILS_ON_NULL || !STRICT_METHOD || !STABLE_SORT$1;

var getSortCompare$1 = function (comparefn) {
  return function (x, y) {
    if (y === undefined) return -1;
    if (x === undefined) return 1;
    if (comparefn !== undefined) return +comparefn(x, y) || 0;
    return toString$A(x) > toString$A(y) ? 1 : -1;
  };
};

// `Array.prototype.sort` method
// https://tc39.es/ecma262/#sec-array.prototype.sort
$$3n({ target: 'Array', proto: true, forced: FORCED$x }, {
  sort: function sort(comparefn) {
    if (comparefn !== undefined) aCallable$y(comparefn);

    var array = toObject$j(this);

    if (STABLE_SORT$1) return comparefn === undefined ? nativeSort$1(array) : nativeSort$1(array, comparefn);

    var items = [];
    var arrayLength = lengthOfArrayLike$f(array);
    var itemsLength, index;

    for (index = 0; index < arrayLength; index++) {
      if (index in array) push$i(items, array[index]);
    }

    internalSort$1(items, getSortCompare$1(comparefn));

    itemsLength = lengthOfArrayLike$f(items);
    index = 0;

    while (index < itemsLength) array[index] = items[index++];
    while (index < arrayLength) deletePropertyOrThrow$2(array, index++);

    return array;
  }
});

var getBuiltIn$r = getBuiltIn$C;
var defineBuiltInAccessor$i = defineBuiltInAccessor$l;
var wellKnownSymbol$v = wellKnownSymbol$O;
var DESCRIPTORS$C = descriptors;

var SPECIES$3 = wellKnownSymbol$v('species');

var setSpecies$6 = function (CONSTRUCTOR_NAME) {
  var Constructor = getBuiltIn$r(CONSTRUCTOR_NAME);

  if (DESCRIPTORS$C && Constructor && !Constructor[SPECIES$3]) {
    defineBuiltInAccessor$i(Constructor, SPECIES$3, {
      configurable: true,
      get: function () { return this; }
    });
  }
};

var setSpecies$5 = setSpecies$6;

// `Array[@@species]` getter
// https://tc39.es/ecma262/#sec-get-array-@@species
setSpecies$5('Array');

var $$3m = _export;
var toObject$i = toObject$y;
var toAbsoluteIndex$5 = toAbsoluteIndex$a;
var toIntegerOrInfinity$h = toIntegerOrInfinity$n;
var lengthOfArrayLike$e = lengthOfArrayLike$w;
var setArrayLength$1 = arraySetLength;
var doesNotExceedSafeInteger$3 = doesNotExceedSafeInteger$7;
var arraySpeciesCreate = arraySpeciesCreate$5;
var createProperty$6 = createProperty$b;
var deletePropertyOrThrow$1 = deletePropertyOrThrow$4;
var arrayMethodHasSpeciesSupport = arrayMethodHasSpeciesSupport$5;

var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('splice');

var max$6 = Math.max;
var min$9 = Math.min;

// `Array.prototype.splice` method
// https://tc39.es/ecma262/#sec-array.prototype.splice
// with adding support of @@species
$$3m({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT }, {
  splice: function splice(start, deleteCount /* , ...items */) {
    var O = toObject$i(this);
    var len = lengthOfArrayLike$e(O);
    var actualStart = toAbsoluteIndex$5(start, len);
    var argumentsLength = arguments.length;
    var insertCount, actualDeleteCount, A, k, from, to;
    if (argumentsLength === 0) {
      insertCount = actualDeleteCount = 0;
    } else if (argumentsLength === 1) {
      insertCount = 0;
      actualDeleteCount = len - actualStart;
    } else {
      insertCount = argumentsLength - 2;
      actualDeleteCount = min$9(max$6(toIntegerOrInfinity$h(deleteCount), 0), len - actualStart);
    }
    doesNotExceedSafeInteger$3(len + insertCount - actualDeleteCount);
    A = arraySpeciesCreate(O, actualDeleteCount);
    for (k = 0; k < actualDeleteCount; k++) {
      from = actualStart + k;
      if (from in O) createProperty$6(A, k, O[from]);
    }
    A.length = actualDeleteCount;
    if (insertCount < actualDeleteCount) {
      for (k = actualStart; k < len - actualDeleteCount; k++) {
        from = k + actualDeleteCount;
        to = k + insertCount;
        if (from in O) O[to] = O[from];
        else deletePropertyOrThrow$1(O, to);
      }
      for (k = len; k > len - actualDeleteCount + insertCount; k--) deletePropertyOrThrow$1(O, k - 1);
    } else if (insertCount > actualDeleteCount) {
      for (k = len - actualDeleteCount; k > actualStart; k--) {
        from = k + actualDeleteCount - 1;
        to = k + insertCount - 1;
        if (from in O) O[to] = O[from];
        else deletePropertyOrThrow$1(O, to);
      }
    }
    for (k = 0; k < insertCount; k++) {
      O[k + actualStart] = arguments[k + 2];
    }
    setArrayLength$1(O, len - actualDeleteCount + insertCount);
    return A;
  }
});

var lengthOfArrayLike$d = lengthOfArrayLike$w;

// https://tc39.es/proposal-change-array-by-copy/#sec-array.prototype.toReversed
// https://tc39.es/proposal-change-array-by-copy/#sec-%typedarray%.prototype.toReversed
var arrayToReversed$2 = function (O, C) {
  var len = lengthOfArrayLike$d(O);
  var A = new C(len);
  var k = 0;
  for (; k < len; k++) A[k] = O[len - k - 1];
  return A;
};

var $$3l = _export;
var arrayToReversed$1 = arrayToReversed$2;
var toIndexedObject$8 = toIndexedObject$j;
var addToUnscopables$8 = addToUnscopables$i;

var $Array$7 = Array;

// `Array.prototype.toReversed` method
// https://tc39.es/ecma262/#sec-array.prototype.toreversed
$$3l({ target: 'Array', proto: true }, {
  toReversed: function toReversed() {
    return arrayToReversed$1(toIndexedObject$8(this), $Array$7);
  }
});

addToUnscopables$8('toReversed');

var lengthOfArrayLike$c = lengthOfArrayLike$w;

var arrayFromConstructorAndList$6 = function (Constructor, list, $length) {
  var index = 0;
  var length = arguments.length > 2 ? $length : lengthOfArrayLike$c(list);
  var result = new Constructor(length);
  while (length > index) result[index] = list[index++];
  return result;
};

var globalThis$14 = globalThis_1;

var getBuiltInPrototypeMethod$2 = function (CONSTRUCTOR, METHOD) {
  var Constructor = globalThis$14[CONSTRUCTOR];
  var Prototype = Constructor && Constructor.prototype;
  return Prototype && Prototype[METHOD];
};

var $$3k = _export;
var uncurryThis$1h = functionUncurryThis;
var aCallable$x = aCallable$F;
var toIndexedObject$7 = toIndexedObject$j;
var arrayFromConstructorAndList$5 = arrayFromConstructorAndList$6;
var getBuiltInPrototypeMethod$1 = getBuiltInPrototypeMethod$2;
var addToUnscopables$7 = addToUnscopables$i;

var $Array$6 = Array;
var sort$1 = uncurryThis$1h(getBuiltInPrototypeMethod$1('Array', 'sort'));

// `Array.prototype.toSorted` method
// https://tc39.es/ecma262/#sec-array.prototype.tosorted
$$3k({ target: 'Array', proto: true }, {
  toSorted: function toSorted(compareFn) {
    if (compareFn !== undefined) aCallable$x(compareFn);
    var O = toIndexedObject$7(this);
    var A = arrayFromConstructorAndList$5($Array$6, O);
    return sort$1(A, compareFn);
  }
});

addToUnscopables$7('toSorted');

var $$3j = _export;
var addToUnscopables$6 = addToUnscopables$i;
var doesNotExceedSafeInteger$2 = doesNotExceedSafeInteger$7;
var lengthOfArrayLike$b = lengthOfArrayLike$w;
var toAbsoluteIndex$4 = toAbsoluteIndex$a;
var toIndexedObject$6 = toIndexedObject$j;
var toIntegerOrInfinity$g = toIntegerOrInfinity$n;

var $Array$5 = Array;
var max$5 = Math.max;
var min$8 = Math.min;

// `Array.prototype.toSpliced` method
// https://tc39.es/ecma262/#sec-array.prototype.tospliced
$$3j({ target: 'Array', proto: true }, {
  toSpliced: function toSpliced(start, deleteCount /* , ...items */) {
    var O = toIndexedObject$6(this);
    var len = lengthOfArrayLike$b(O);
    var actualStart = toAbsoluteIndex$4(start, len);
    var argumentsLength = arguments.length;
    var k = 0;
    var insertCount, actualDeleteCount, newLen, A;
    if (argumentsLength === 0) {
      insertCount = actualDeleteCount = 0;
    } else if (argumentsLength === 1) {
      insertCount = 0;
      actualDeleteCount = len - actualStart;
    } else {
      insertCount = argumentsLength - 2;
      actualDeleteCount = min$8(max$5(toIntegerOrInfinity$g(deleteCount), 0), len - actualStart);
    }
    newLen = doesNotExceedSafeInteger$2(len + insertCount - actualDeleteCount);
    A = $Array$5(newLen);

    for (; k < actualStart; k++) A[k] = O[k];
    for (; k < actualStart + insertCount; k++) A[k] = arguments[k - actualStart + 2];
    for (; k < newLen; k++) A[k] = O[k + actualDeleteCount - insertCount];

    return A;
  }
});

addToUnscopables$6('toSpliced');

// this method was added to unscopables after implementation
// in popular engines, so it's moved to a separate module
var addToUnscopables$5 = addToUnscopables$i;

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables$5('flat');

// this method was added to unscopables after implementation
// in popular engines, so it's moved to a separate module
var addToUnscopables$4 = addToUnscopables$i;

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables$4('flatMap');

var $$3i = _export;
var toObject$h = toObject$y;
var lengthOfArrayLike$a = lengthOfArrayLike$w;
var setArrayLength = arraySetLength;
var deletePropertyOrThrow = deletePropertyOrThrow$4;
var doesNotExceedSafeInteger$1 = doesNotExceedSafeInteger$7;

// IE8-
var INCORRECT_RESULT = [].unshift(0) !== 1;

// V8 ~ Chrome < 71 and Safari <= 15.4, FF < 23 throws InternalError
var properErrorOnNonWritableLength = function () {
  try {
    // eslint-disable-next-line es/no-object-defineproperty -- safe
    Object.defineProperty([], 'length', { writable: false }).unshift();
  } catch (error) {
    return error instanceof TypeError;
  }
};

var FORCED$w = INCORRECT_RESULT || !properErrorOnNonWritableLength();

// `Array.prototype.unshift` method
// https://tc39.es/ecma262/#sec-array.prototype.unshift
$$3i({ target: 'Array', proto: true, arity: 1, forced: FORCED$w }, {
  // eslint-disable-next-line no-unused-vars -- required for `.length`
  unshift: function unshift(item) {
    var O = toObject$h(this);
    var len = lengthOfArrayLike$a(O);
    var argCount = arguments.length;
    if (argCount) {
      doesNotExceedSafeInteger$1(len + argCount);
      var k = len;
      while (k--) {
        var to = k + argCount;
        if (k in O) O[to] = O[k];
        else deletePropertyOrThrow(O, to);
      }
      for (var j = 0; j < argCount; j++) {
        O[j] = arguments[j];
      }
    } return setArrayLength(O, len + argCount);
  }
});

var lengthOfArrayLike$9 = lengthOfArrayLike$w;
var toIntegerOrInfinity$f = toIntegerOrInfinity$n;

var $RangeError$b = RangeError;

// https://tc39.es/proposal-change-array-by-copy/#sec-array.prototype.with
// https://tc39.es/proposal-change-array-by-copy/#sec-%typedarray%.prototype.with
var arrayWith$2 = function (O, C, index, value) {
  var len = lengthOfArrayLike$9(O);
  var relativeIndex = toIntegerOrInfinity$f(index);
  var actualIndex = relativeIndex < 0 ? len + relativeIndex : relativeIndex;
  if (actualIndex >= len || actualIndex < 0) throw new $RangeError$b('Incorrect index');
  var A = new C(len);
  var k = 0;
  for (; k < len; k++) A[k] = k === actualIndex ? value : O[k];
  return A;
};

var $$3h = _export;
var arrayWith$1 = arrayWith$2;
var toIndexedObject$5 = toIndexedObject$j;

var $Array$4 = Array;

// `Array.prototype.with` method
// https://tc39.es/ecma262/#sec-array.prototype.with
$$3h({ target: 'Array', proto: true }, {
  'with': function (index, value) {
    return arrayWith$1(toIndexedObject$5(this), $Array$4, index, value);
  }
});

// eslint-disable-next-line es/no-typed-arrays -- safe
var arrayBufferBasicDetection = typeof ArrayBuffer != 'undefined' && typeof DataView != 'undefined';

var defineBuiltIn$m = defineBuiltIn$t;

var defineBuiltIns$a = function (target, src, options) {
  for (var key in src) defineBuiltIn$m(target, key, src[key], options);
  return target;
};

var isPrototypeOf$9 = objectIsPrototypeOf;

var $TypeError$n = TypeError;

var anInstance$e = function (it, Prototype) {
  if (isPrototypeOf$9(Prototype, it)) return it;
  throw new $TypeError$n('Incorrect invocation');
};

var toIntegerOrInfinity$e = toIntegerOrInfinity$n;
var toLength$b = toLength$d;

var $RangeError$a = RangeError;

// `ToIndex` abstract operation
// https://tc39.es/ecma262/#sec-toindex
var toIndex$4 = function (it) {
  if (it === undefined) return 0;
  var number = toIntegerOrInfinity$e(it);
  var length = toLength$b(number);
  if (number !== length) throw new $RangeError$a('Wrong length or index');
  return length;
};

// `Math.sign` method implementation
// https://tc39.es/ecma262/#sec-math.sign
// eslint-disable-next-line es/no-math-sign -- safe
var mathSign = Math.sign || function sign(x) {
  var n = +x;
  // eslint-disable-next-line no-self-compare -- NaN check
  return n === 0 || n !== n ? n : n < 0 ? -1 : 1;
};

var sign$2 = mathSign;

var abs$8 = Math.abs;

var EPSILON = 2.220446049250313e-16; // Number.EPSILON
var INVERSE_EPSILON = 1 / EPSILON;

var roundTiesToEven = function (n) {
  return n + INVERSE_EPSILON - INVERSE_EPSILON;
};

var mathFloatRound = function (x, FLOAT_EPSILON, FLOAT_MAX_VALUE, FLOAT_MIN_VALUE) {
  var n = +x;
  var absolute = abs$8(n);
  var s = sign$2(n);
  if (absolute < FLOAT_MIN_VALUE) return s * roundTiesToEven(absolute / FLOAT_MIN_VALUE / FLOAT_EPSILON) * FLOAT_MIN_VALUE * FLOAT_EPSILON;
  var a = (1 + FLOAT_EPSILON / EPSILON) * absolute;
  var result = a - (a - absolute);
  // eslint-disable-next-line no-self-compare -- NaN check
  if (result > FLOAT_MAX_VALUE || result !== result) return s * Infinity;
  return s * result;
};

var floatRound$1 = mathFloatRound;

var FLOAT32_EPSILON = 1.1920928955078125e-7; // 2 ** -23;
var FLOAT32_MAX_VALUE = 3.4028234663852886e+38; // 2 ** 128 - 2 ** 104
var FLOAT32_MIN_VALUE = 1.1754943508222875e-38; // 2 ** -126;

// `Math.fround` method implementation
// https://tc39.es/ecma262/#sec-math.fround
// eslint-disable-next-line es/no-math-fround -- safe
var mathFround = Math.fround || function fround(x) {
  return floatRound$1(x, FLOAT32_EPSILON, FLOAT32_MAX_VALUE, FLOAT32_MIN_VALUE);
};

// IEEE754 conversions based on https://github.com/feross/ieee754
var $Array$3 = Array;
var abs$7 = Math.abs;
var pow$4 = Math.pow;
var floor$8 = Math.floor;
var log$8 = Math.log;
var LN2$2 = Math.LN2;

var pack = function (number, mantissaLength, bytes) {
  var buffer = $Array$3(bytes);
  var exponentLength = bytes * 8 - mantissaLength - 1;
  var eMax = (1 << exponentLength) - 1;
  var eBias = eMax >> 1;
  var rt = mantissaLength === 23 ? pow$4(2, -24) - pow$4(2, -77) : 0;
  var sign = number < 0 || number === 0 && 1 / number < 0 ? 1 : 0;
  var index = 0;
  var exponent, mantissa, c;
  number = abs$7(number);
  // eslint-disable-next-line no-self-compare -- NaN check
  if (number !== number || number === Infinity) {
    // eslint-disable-next-line no-self-compare -- NaN check
    mantissa = number !== number ? 1 : 0;
    exponent = eMax;
  } else {
    exponent = floor$8(log$8(number) / LN2$2);
    c = pow$4(2, -exponent);
    if (number * c < 1) {
      exponent--;
      c *= 2;
    }
    if (exponent + eBias >= 1) {
      number += rt / c;
    } else {
      number += rt * pow$4(2, 1 - eBias);
    }
    if (number * c >= 2) {
      exponent++;
      c /= 2;
    }
    if (exponent + eBias >= eMax) {
      mantissa = 0;
      exponent = eMax;
    } else if (exponent + eBias >= 1) {
      mantissa = (number * c - 1) * pow$4(2, mantissaLength);
      exponent += eBias;
    } else {
      mantissa = number * pow$4(2, eBias - 1) * pow$4(2, mantissaLength);
      exponent = 0;
    }
  }
  while (mantissaLength >= 8) {
    buffer[index++] = mantissa & 255;
    mantissa /= 256;
    mantissaLength -= 8;
  }
  exponent = exponent << mantissaLength | mantissa;
  exponentLength += mantissaLength;
  while (exponentLength > 0) {
    buffer[index++] = exponent & 255;
    exponent /= 256;
    exponentLength -= 8;
  }
  buffer[index - 1] |= sign * 128;
  return buffer;
};

var unpack = function (buffer, mantissaLength) {
  var bytes = buffer.length;
  var exponentLength = bytes * 8 - mantissaLength - 1;
  var eMax = (1 << exponentLength) - 1;
  var eBias = eMax >> 1;
  var nBits = exponentLength - 7;
  var index = bytes - 1;
  var sign = buffer[index--];
  var exponent = sign & 127;
  var mantissa;
  sign >>= 7;
  while (nBits > 0) {
    exponent = exponent * 256 + buffer[index--];
    nBits -= 8;
  }
  mantissa = exponent & (1 << -nBits) - 1;
  exponent >>= -nBits;
  nBits += mantissaLength;
  while (nBits > 0) {
    mantissa = mantissa * 256 + buffer[index--];
    nBits -= 8;
  }
  if (exponent === 0) {
    exponent = 1 - eBias;
  } else if (exponent === eMax) {
    return mantissa ? NaN : sign ? -Infinity : Infinity;
  } else {
    mantissa += pow$4(2, mantissaLength);
    exponent -= eBias;
  } return (sign ? -1 : 1) * mantissa * pow$4(2, exponent - mantissaLength);
};

var ieee754 = {
  pack: pack,
  unpack: unpack
};

var globalThis$13 = globalThis_1;
var uncurryThis$1g = functionUncurryThis;
var DESCRIPTORS$B = descriptors;
var NATIVE_ARRAY_BUFFER$2 = arrayBufferBasicDetection;
var FunctionName = functionName;
var createNonEnumerableProperty$b = createNonEnumerableProperty$j;
var defineBuiltInAccessor$h = defineBuiltInAccessor$l;
var defineBuiltIns$9 = defineBuiltIns$a;
var fails$1a = fails$1z;
var anInstance$d = anInstance$e;
var toIntegerOrInfinity$d = toIntegerOrInfinity$n;
var toLength$a = toLength$d;
var toIndex$3 = toIndex$4;
var fround$1 = mathFround;
var IEEE754 = ieee754;
var getPrototypeOf$a = objectGetPrototypeOf$2;
var setPrototypeOf$6 = objectSetPrototypeOf$1;
var arrayFill = arrayFill$1;
var arraySlice$6 = arraySlice$a;
var inheritIfRequired$5 = inheritIfRequired$7;
var copyConstructorProperties$2 = copyConstructorProperties$7;
var setToStringTag$9 = setToStringTag$e;
var InternalStateModule$f = internalState;

var PROPER_FUNCTION_NAME$2 = FunctionName.PROPER;
var CONFIGURABLE_FUNCTION_NAME = FunctionName.CONFIGURABLE;
var ARRAY_BUFFER$1 = 'ArrayBuffer';
var DATA_VIEW = 'DataView';
var PROTOTYPE = 'prototype';
var WRONG_LENGTH$1 = 'Wrong length';
var WRONG_INDEX = 'Wrong index';
var getInternalArrayBufferState = InternalStateModule$f.getterFor(ARRAY_BUFFER$1);
var getInternalDataViewState = InternalStateModule$f.getterFor(DATA_VIEW);
var setInternalState$f = InternalStateModule$f.set;
var NativeArrayBuffer$1 = globalThis$13[ARRAY_BUFFER$1];
var $ArrayBuffer$1 = NativeArrayBuffer$1;
var ArrayBufferPrototype$4 = $ArrayBuffer$1 && $ArrayBuffer$1[PROTOTYPE];
var $DataView = globalThis$13[DATA_VIEW];
var DataViewPrototype$2 = $DataView && $DataView[PROTOTYPE];
var ObjectPrototype$3 = Object.prototype;
var Array$2 = globalThis$13.Array;
var RangeError$3 = globalThis$13.RangeError;
var fill = uncurryThis$1g(arrayFill);
var reverse = uncurryThis$1g([].reverse);

var packIEEE754$1 = IEEE754.pack;
var unpackIEEE754$1 = IEEE754.unpack;

var packInt8 = function (number) {
  return [number & 0xFF];
};

var packInt16 = function (number) {
  return [number & 0xFF, number >> 8 & 0xFF];
};

var packInt32 = function (number) {
  return [number & 0xFF, number >> 8 & 0xFF, number >> 16 & 0xFF, number >> 24 & 0xFF];
};

var unpackInt32 = function (buffer) {
  return buffer[3] << 24 | buffer[2] << 16 | buffer[1] << 8 | buffer[0];
};

var packFloat32 = function (number) {
  return packIEEE754$1(fround$1(number), 23, 4);
};

var packFloat64 = function (number) {
  return packIEEE754$1(number, 52, 8);
};

var addGetter$1 = function (Constructor, key, getInternalState) {
  defineBuiltInAccessor$h(Constructor[PROTOTYPE], key, {
    configurable: true,
    get: function () {
      return getInternalState(this)[key];
    }
  });
};

var get$2 = function (view, count, index, isLittleEndian) {
  var store = getInternalDataViewState(view);
  var intIndex = toIndex$3(index);
  var boolIsLittleEndian = !!isLittleEndian;
  if (intIndex + count > store.byteLength) throw new RangeError$3(WRONG_INDEX);
  var bytes = store.bytes;
  var start = intIndex + store.byteOffset;
  var pack = arraySlice$6(bytes, start, start + count);
  return boolIsLittleEndian ? pack : reverse(pack);
};

var set$3 = function (view, count, index, conversion, value, isLittleEndian) {
  var store = getInternalDataViewState(view);
  var intIndex = toIndex$3(index);
  var pack = conversion(+value);
  var boolIsLittleEndian = !!isLittleEndian;
  if (intIndex + count > store.byteLength) throw new RangeError$3(WRONG_INDEX);
  var bytes = store.bytes;
  var start = intIndex + store.byteOffset;
  for (var i = 0; i < count; i++) bytes[start + i] = pack[boolIsLittleEndian ? i : count - i - 1];
};

if (!NATIVE_ARRAY_BUFFER$2) {
  $ArrayBuffer$1 = function ArrayBuffer(length) {
    anInstance$d(this, ArrayBufferPrototype$4);
    var byteLength = toIndex$3(length);
    setInternalState$f(this, {
      type: ARRAY_BUFFER$1,
      bytes: fill(Array$2(byteLength), 0),
      byteLength: byteLength
    });
    if (!DESCRIPTORS$B) {
      this.byteLength = byteLength;
      this.detached = false;
    }
  };

  ArrayBufferPrototype$4 = $ArrayBuffer$1[PROTOTYPE];

  $DataView = function DataView(buffer, byteOffset, byteLength) {
    anInstance$d(this, DataViewPrototype$2);
    anInstance$d(buffer, ArrayBufferPrototype$4);
    var bufferState = getInternalArrayBufferState(buffer);
    var bufferLength = bufferState.byteLength;
    var offset = toIntegerOrInfinity$d(byteOffset);
    if (offset < 0 || offset > bufferLength) throw new RangeError$3('Wrong offset');
    byteLength = byteLength === undefined ? bufferLength - offset : toLength$a(byteLength);
    if (offset + byteLength > bufferLength) throw new RangeError$3(WRONG_LENGTH$1);
    setInternalState$f(this, {
      type: DATA_VIEW,
      buffer: buffer,
      byteLength: byteLength,
      byteOffset: offset,
      bytes: bufferState.bytes
    });
    if (!DESCRIPTORS$B) {
      this.buffer = buffer;
      this.byteLength = byteLength;
      this.byteOffset = offset;
    }
  };

  DataViewPrototype$2 = $DataView[PROTOTYPE];

  if (DESCRIPTORS$B) {
    addGetter$1($ArrayBuffer$1, 'byteLength', getInternalArrayBufferState);
    addGetter$1($DataView, 'buffer', getInternalDataViewState);
    addGetter$1($DataView, 'byteLength', getInternalDataViewState);
    addGetter$1($DataView, 'byteOffset', getInternalDataViewState);
  }

  defineBuiltIns$9(DataViewPrototype$2, {
    getInt8: function getInt8(byteOffset) {
      return get$2(this, 1, byteOffset)[0] << 24 >> 24;
    },
    getUint8: function getUint8(byteOffset) {
      return get$2(this, 1, byteOffset)[0];
    },
    getInt16: function getInt16(byteOffset /* , littleEndian */) {
      var bytes = get$2(this, 2, byteOffset, arguments.length > 1 ? arguments[1] : false);
      return (bytes[1] << 8 | bytes[0]) << 16 >> 16;
    },
    getUint16: function getUint16(byteOffset /* , littleEndian */) {
      var bytes = get$2(this, 2, byteOffset, arguments.length > 1 ? arguments[1] : false);
      return bytes[1] << 8 | bytes[0];
    },
    getInt32: function getInt32(byteOffset /* , littleEndian */) {
      return unpackInt32(get$2(this, 4, byteOffset, arguments.length > 1 ? arguments[1] : false));
    },
    getUint32: function getUint32(byteOffset /* , littleEndian */) {
      return unpackInt32(get$2(this, 4, byteOffset, arguments.length > 1 ? arguments[1] : false)) >>> 0;
    },
    getFloat32: function getFloat32(byteOffset /* , littleEndian */) {
      return unpackIEEE754$1(get$2(this, 4, byteOffset, arguments.length > 1 ? arguments[1] : false), 23);
    },
    getFloat64: function getFloat64(byteOffset /* , littleEndian */) {
      return unpackIEEE754$1(get$2(this, 8, byteOffset, arguments.length > 1 ? arguments[1] : false), 52);
    },
    setInt8: function setInt8(byteOffset, value) {
      set$3(this, 1, byteOffset, packInt8, value);
    },
    setUint8: function setUint8(byteOffset, value) {
      set$3(this, 1, byteOffset, packInt8, value);
    },
    setInt16: function setInt16(byteOffset, value /* , littleEndian */) {
      set$3(this, 2, byteOffset, packInt16, value, arguments.length > 2 ? arguments[2] : false);
    },
    setUint16: function setUint16(byteOffset, value /* , littleEndian */) {
      set$3(this, 2, byteOffset, packInt16, value, arguments.length > 2 ? arguments[2] : false);
    },
    setInt32: function setInt32(byteOffset, value /* , littleEndian */) {
      set$3(this, 4, byteOffset, packInt32, value, arguments.length > 2 ? arguments[2] : false);
    },
    setUint32: function setUint32(byteOffset, value /* , littleEndian */) {
      set$3(this, 4, byteOffset, packInt32, value, arguments.length > 2 ? arguments[2] : false);
    },
    setFloat32: function setFloat32(byteOffset, value /* , littleEndian */) {
      set$3(this, 4, byteOffset, packFloat32, value, arguments.length > 2 ? arguments[2] : false);
    },
    setFloat64: function setFloat64(byteOffset, value /* , littleEndian */) {
      set$3(this, 8, byteOffset, packFloat64, value, arguments.length > 2 ? arguments[2] : false);
    }
  });
} else {
  var INCORRECT_ARRAY_BUFFER_NAME = PROPER_FUNCTION_NAME$2 && NativeArrayBuffer$1.name !== ARRAY_BUFFER$1;
  /* eslint-disable no-new -- required for testing */
  if (!fails$1a(function () {
    NativeArrayBuffer$1(1);
  }) || !fails$1a(function () {
    new NativeArrayBuffer$1(-1);
  }) || fails$1a(function () {
    new NativeArrayBuffer$1();
    new NativeArrayBuffer$1(1.5);
    new NativeArrayBuffer$1(NaN);
    return NativeArrayBuffer$1.length !== 1 || INCORRECT_ARRAY_BUFFER_NAME && !CONFIGURABLE_FUNCTION_NAME;
  })) {
    /* eslint-enable no-new -- required for testing */
    $ArrayBuffer$1 = function ArrayBuffer(length) {
      anInstance$d(this, ArrayBufferPrototype$4);
      return inheritIfRequired$5(new NativeArrayBuffer$1(toIndex$3(length)), this, $ArrayBuffer$1);
    };

    $ArrayBuffer$1[PROTOTYPE] = ArrayBufferPrototype$4;

    ArrayBufferPrototype$4.constructor = $ArrayBuffer$1;

    copyConstructorProperties$2($ArrayBuffer$1, NativeArrayBuffer$1);
  } else if (INCORRECT_ARRAY_BUFFER_NAME && CONFIGURABLE_FUNCTION_NAME) {
    createNonEnumerableProperty$b(NativeArrayBuffer$1, 'name', ARRAY_BUFFER$1);
  }

  // WebKit bug - the same parent prototype for typed arrays and data view
  if (setPrototypeOf$6 && getPrototypeOf$a(DataViewPrototype$2) !== ObjectPrototype$3) {
    setPrototypeOf$6(DataViewPrototype$2, ObjectPrototype$3);
  }

  // iOS Safari 7.x bug
  var testView = new $DataView(new $ArrayBuffer$1(2));
  var $setInt8 = uncurryThis$1g(DataViewPrototype$2.setInt8);
  testView.setInt8(0, 2147483648);
  testView.setInt8(1, 2147483649);
  if (testView.getInt8(0) || !testView.getInt8(1)) defineBuiltIns$9(DataViewPrototype$2, {
    setInt8: function setInt8(byteOffset, value) {
      $setInt8(this, byteOffset, value << 24 >> 24);
    },
    setUint8: function setUint8(byteOffset, value) {
      $setInt8(this, byteOffset, value << 24 >> 24);
    }
  }, { unsafe: true });
}

setToStringTag$9($ArrayBuffer$1, ARRAY_BUFFER$1);
setToStringTag$9($DataView, DATA_VIEW);

var arrayBuffer = {
  ArrayBuffer: $ArrayBuffer$1,
  DataView: $DataView
};

var $$3g = _export;
var globalThis$12 = globalThis_1;
var arrayBufferModule = arrayBuffer;
var setSpecies$4 = setSpecies$6;

var ARRAY_BUFFER = 'ArrayBuffer';
var ArrayBuffer$7 = arrayBufferModule[ARRAY_BUFFER];
var NativeArrayBuffer = globalThis$12[ARRAY_BUFFER];

// `ArrayBuffer` constructor
// https://tc39.es/ecma262/#sec-arraybuffer-constructor
$$3g({ global: true, constructor: true, forced: NativeArrayBuffer !== ArrayBuffer$7 }, {
  ArrayBuffer: ArrayBuffer$7
});

setSpecies$4(ARRAY_BUFFER);

var NATIVE_ARRAY_BUFFER$1 = arrayBufferBasicDetection;
var DESCRIPTORS$A = descriptors;
var globalThis$11 = globalThis_1;
var isCallable$j = isCallable$D;
var isObject$v = isObject$J;
var hasOwn$o = hasOwnProperty_1;
var classof$h = classof$p;
var tryToString$1 = tryToString$7;
var createNonEnumerableProperty$a = createNonEnumerableProperty$j;
var defineBuiltIn$l = defineBuiltIn$t;
var defineBuiltInAccessor$g = defineBuiltInAccessor$l;
var isPrototypeOf$8 = objectIsPrototypeOf;
var getPrototypeOf$9 = objectGetPrototypeOf$2;
var setPrototypeOf$5 = objectSetPrototypeOf$1;
var wellKnownSymbol$u = wellKnownSymbol$O;
var uid$3 = uid$7;
var InternalStateModule$e = internalState;

var enforceInternalState$3 = InternalStateModule$e.enforce;
var getInternalState$9 = InternalStateModule$e.get;
var Int8Array$4 = globalThis$11.Int8Array;
var Int8ArrayPrototype$1 = Int8Array$4 && Int8Array$4.prototype;
var Uint8ClampedArray$1 = globalThis$11.Uint8ClampedArray;
var Uint8ClampedArrayPrototype = Uint8ClampedArray$1 && Uint8ClampedArray$1.prototype;
var TypedArray$1 = Int8Array$4 && getPrototypeOf$9(Int8Array$4);
var TypedArrayPrototype$2 = Int8ArrayPrototype$1 && getPrototypeOf$9(Int8ArrayPrototype$1);
var ObjectPrototype$2 = Object.prototype;
var TypeError$8 = globalThis$11.TypeError;

var TO_STRING_TAG$7 = wellKnownSymbol$u('toStringTag');
var TYPED_ARRAY_TAG$1 = uid$3('TYPED_ARRAY_TAG');
var TYPED_ARRAY_CONSTRUCTOR = 'TypedArrayConstructor';
// Fixing native typed arrays in Opera Presto crashes the browser, see #595
var NATIVE_ARRAY_BUFFER_VIEWS$3 = NATIVE_ARRAY_BUFFER$1 && !!setPrototypeOf$5 && classof$h(globalThis$11.opera) !== 'Opera';
var TYPED_ARRAY_TAG_REQUIRED = false;
var NAME$1, Constructor, Prototype;

var TypedArrayConstructorsList = {
  Int8Array: 1,
  Uint8Array: 1,
  Uint8ClampedArray: 1,
  Int16Array: 2,
  Uint16Array: 2,
  Int32Array: 4,
  Uint32Array: 4,
  Float32Array: 4,
  Float64Array: 8
};

var BigIntArrayConstructorsList = {
  BigInt64Array: 8,
  BigUint64Array: 8
};

var isView = function isView(it) {
  if (!isObject$v(it)) return false;
  var klass = classof$h(it);
  return klass === 'DataView'
    || hasOwn$o(TypedArrayConstructorsList, klass)
    || hasOwn$o(BigIntArrayConstructorsList, klass);
};

var getTypedArrayConstructor$5 = function (it) {
  var proto = getPrototypeOf$9(it);
  if (!isObject$v(proto)) return;
  var state = getInternalState$9(proto);
  return (state && hasOwn$o(state, TYPED_ARRAY_CONSTRUCTOR)) ? state[TYPED_ARRAY_CONSTRUCTOR] : getTypedArrayConstructor$5(proto);
};

var isTypedArray$1 = function (it) {
  if (!isObject$v(it)) return false;
  var klass = classof$h(it);
  return hasOwn$o(TypedArrayConstructorsList, klass)
    || hasOwn$o(BigIntArrayConstructorsList, klass);
};

var aTypedArray$t = function (it) {
  if (isTypedArray$1(it)) return it;
  throw new TypeError$8('Target is not a typed array');
};

var aTypedArrayConstructor$3 = function (C) {
  if (isCallable$j(C) && (!setPrototypeOf$5 || isPrototypeOf$8(TypedArray$1, C))) return C;
  throw new TypeError$8(tryToString$1(C) + ' is not a typed array constructor');
};

var exportTypedArrayMethod$u = function (KEY, property, forced, options) {
  if (!DESCRIPTORS$A) return;
  if (forced) for (var ARRAY in TypedArrayConstructorsList) {
    var TypedArrayConstructor = globalThis$11[ARRAY];
    if (TypedArrayConstructor && hasOwn$o(TypedArrayConstructor.prototype, KEY)) try {
      delete TypedArrayConstructor.prototype[KEY];
    } catch (error) {
      // old WebKit bug - some methods are non-configurable
      try {
        TypedArrayConstructor.prototype[KEY] = property;
      } catch (error2) { /* empty */ }
    }
  }
  if (!TypedArrayPrototype$2[KEY] || forced) {
    defineBuiltIn$l(TypedArrayPrototype$2, KEY, forced ? property
      : NATIVE_ARRAY_BUFFER_VIEWS$3 && Int8ArrayPrototype$1[KEY] || property, options);
  }
};

var exportTypedArrayStaticMethod$2 = function (KEY, property, forced) {
  var ARRAY, TypedArrayConstructor;
  if (!DESCRIPTORS$A) return;
  if (setPrototypeOf$5) {
    if (forced) for (ARRAY in TypedArrayConstructorsList) {
      TypedArrayConstructor = globalThis$11[ARRAY];
      if (TypedArrayConstructor && hasOwn$o(TypedArrayConstructor, KEY)) try {
        delete TypedArrayConstructor[KEY];
      } catch (error) { /* empty */ }
    }
    if (!TypedArray$1[KEY] || forced) {
      // V8 ~ Chrome 49-50 `%TypedArray%` methods are non-writable non-configurable
      try {
        return defineBuiltIn$l(TypedArray$1, KEY, forced ? property : NATIVE_ARRAY_BUFFER_VIEWS$3 && TypedArray$1[KEY] || property);
      } catch (error) { /* empty */ }
    } else return;
  }
  for (ARRAY in TypedArrayConstructorsList) {
    TypedArrayConstructor = globalThis$11[ARRAY];
    if (TypedArrayConstructor && (!TypedArrayConstructor[KEY] || forced)) {
      defineBuiltIn$l(TypedArrayConstructor, KEY, property);
    }
  }
};

for (NAME$1 in TypedArrayConstructorsList) {
  Constructor = globalThis$11[NAME$1];
  Prototype = Constructor && Constructor.prototype;
  if (Prototype) enforceInternalState$3(Prototype)[TYPED_ARRAY_CONSTRUCTOR] = Constructor;
  else NATIVE_ARRAY_BUFFER_VIEWS$3 = false;
}

for (NAME$1 in BigIntArrayConstructorsList) {
  Constructor = globalThis$11[NAME$1];
  Prototype = Constructor && Constructor.prototype;
  if (Prototype) enforceInternalState$3(Prototype)[TYPED_ARRAY_CONSTRUCTOR] = Constructor;
}

// WebKit bug - typed arrays constructors prototype is Object.prototype
if (!NATIVE_ARRAY_BUFFER_VIEWS$3 || !isCallable$j(TypedArray$1) || TypedArray$1 === Function.prototype) {
  // eslint-disable-next-line no-shadow -- safe
  TypedArray$1 = function TypedArray() {
    throw new TypeError$8('Incorrect invocation');
  };
  if (NATIVE_ARRAY_BUFFER_VIEWS$3) for (NAME$1 in TypedArrayConstructorsList) {
    if (globalThis$11[NAME$1]) setPrototypeOf$5(globalThis$11[NAME$1], TypedArray$1);
  }
}

if (!NATIVE_ARRAY_BUFFER_VIEWS$3 || !TypedArrayPrototype$2 || TypedArrayPrototype$2 === ObjectPrototype$2) {
  TypedArrayPrototype$2 = TypedArray$1.prototype;
  if (NATIVE_ARRAY_BUFFER_VIEWS$3) for (NAME$1 in TypedArrayConstructorsList) {
    if (globalThis$11[NAME$1]) setPrototypeOf$5(globalThis$11[NAME$1].prototype, TypedArrayPrototype$2);
  }
}

// WebKit bug - one more object in Uint8ClampedArray prototype chain
if (NATIVE_ARRAY_BUFFER_VIEWS$3 && getPrototypeOf$9(Uint8ClampedArrayPrototype) !== TypedArrayPrototype$2) {
  setPrototypeOf$5(Uint8ClampedArrayPrototype, TypedArrayPrototype$2);
}

if (DESCRIPTORS$A && !hasOwn$o(TypedArrayPrototype$2, TO_STRING_TAG$7)) {
  TYPED_ARRAY_TAG_REQUIRED = true;
  defineBuiltInAccessor$g(TypedArrayPrototype$2, TO_STRING_TAG$7, {
    configurable: true,
    get: function () {
      return isObject$v(this) ? this[TYPED_ARRAY_TAG$1] : undefined;
    }
  });
  for (NAME$1 in TypedArrayConstructorsList) if (globalThis$11[NAME$1]) {
    createNonEnumerableProperty$a(globalThis$11[NAME$1], TYPED_ARRAY_TAG$1, NAME$1);
  }
}

var arrayBufferViewCore = {
  NATIVE_ARRAY_BUFFER_VIEWS: NATIVE_ARRAY_BUFFER_VIEWS$3,
  TYPED_ARRAY_TAG: TYPED_ARRAY_TAG_REQUIRED && TYPED_ARRAY_TAG$1,
  aTypedArray: aTypedArray$t,
  aTypedArrayConstructor: aTypedArrayConstructor$3,
  exportTypedArrayMethod: exportTypedArrayMethod$u,
  exportTypedArrayStaticMethod: exportTypedArrayStaticMethod$2,
  getTypedArrayConstructor: getTypedArrayConstructor$5,
  isView: isView,
  isTypedArray: isTypedArray$1,
  TypedArray: TypedArray$1,
  TypedArrayPrototype: TypedArrayPrototype$2
};

var $$3f = _export;
var ArrayBufferViewCore$w = arrayBufferViewCore;

var NATIVE_ARRAY_BUFFER_VIEWS$2 = ArrayBufferViewCore$w.NATIVE_ARRAY_BUFFER_VIEWS;

// `ArrayBuffer.isView` method
// https://tc39.es/ecma262/#sec-arraybuffer.isview
$$3f({ target: 'ArrayBuffer', stat: true, forced: !NATIVE_ARRAY_BUFFER_VIEWS$2 }, {
  isView: ArrayBufferViewCore$w.isView
});

var isConstructor$2 = isConstructor$7;
var tryToString = tryToString$7;

var $TypeError$m = TypeError;

// `Assert: IsConstructor(argument) is true`
var aConstructor$3 = function (argument) {
  if (isConstructor$2(argument)) return argument;
  throw new $TypeError$m(tryToString(argument) + ' is not a constructor');
};

var anObject$S = anObject$11;
var aConstructor$2 = aConstructor$3;
var isNullOrUndefined$b = isNullOrUndefined$f;
var wellKnownSymbol$t = wellKnownSymbol$O;

var SPECIES$2 = wellKnownSymbol$t('species');

// `SpeciesConstructor` abstract operation
// https://tc39.es/ecma262/#sec-speciesconstructor
var speciesConstructor$6 = function (O, defaultConstructor) {
  var C = anObject$S(O).constructor;
  var S;
  return C === undefined || isNullOrUndefined$b(S = anObject$S(C)[SPECIES$2]) ? defaultConstructor : aConstructor$2(S);
};

var $$3e = _export;
var uncurryThis$1f = functionUncurryThisClause;
var fails$19 = fails$1z;
var ArrayBufferModule$2 = arrayBuffer;
var anObject$R = anObject$11;
var toAbsoluteIndex$3 = toAbsoluteIndex$a;
var toLength$9 = toLength$d;
var speciesConstructor$5 = speciesConstructor$6;

var ArrayBuffer$6 = ArrayBufferModule$2.ArrayBuffer;
var DataView$3 = ArrayBufferModule$2.DataView;
var DataViewPrototype$1 = DataView$3.prototype;
var nativeArrayBufferSlice = uncurryThis$1f(ArrayBuffer$6.prototype.slice);
var getUint8 = uncurryThis$1f(DataViewPrototype$1.getUint8);
var setUint8 = uncurryThis$1f(DataViewPrototype$1.setUint8);

var INCORRECT_SLICE = fails$19(function () {
  return !new ArrayBuffer$6(2).slice(1, undefined).byteLength;
});

// `ArrayBuffer.prototype.slice` method
// https://tc39.es/ecma262/#sec-arraybuffer.prototype.slice
$$3e({ target: 'ArrayBuffer', proto: true, unsafe: true, forced: INCORRECT_SLICE }, {
  slice: function slice(start, end) {
    if (nativeArrayBufferSlice && end === undefined) {
      return nativeArrayBufferSlice(anObject$R(this), start); // FF fix
    }
    var length = anObject$R(this).byteLength;
    var first = toAbsoluteIndex$3(start, length);
    var fin = toAbsoluteIndex$3(end === undefined ? length : end, length);
    var result = new (speciesConstructor$5(this, ArrayBuffer$6))(toLength$9(fin - first));
    var viewSource = new DataView$3(this);
    var viewTarget = new DataView$3(result);
    var index = 0;
    while (first < fin) {
      setUint8(viewTarget, index++, getUint8(viewSource, first++));
    } return result;
  }
});

var $$3d = _export;
var ArrayBufferModule$1 = arrayBuffer;
var NATIVE_ARRAY_BUFFER = arrayBufferBasicDetection;

// `DataView` constructor
// https://tc39.es/ecma262/#sec-dataview-constructor
$$3d({ global: true, constructor: true, forced: !NATIVE_ARRAY_BUFFER }, {
  DataView: ArrayBufferModule$1.DataView
});

var globalThis$10 = globalThis_1;
var uncurryThisAccessor$2 = functionUncurryThisAccessor;
var classof$g = classofRaw$2;

var ArrayBuffer$5 = globalThis$10.ArrayBuffer;
var TypeError$7 = globalThis$10.TypeError;

// Includes
// - Perform ? RequireInternalSlot(O, [[ArrayBufferData]]).
// - If IsSharedArrayBuffer(O) is true, throw a TypeError exception.
var arrayBufferByteLength$2 = ArrayBuffer$5 && uncurryThisAccessor$2(ArrayBuffer$5.prototype, 'byteLength', 'get') || function (O) {
  if (classof$g(O) !== 'ArrayBuffer') throw new TypeError$7('ArrayBuffer expected');
  return O.byteLength;
};

var globalThis$$ = globalThis_1;
var uncurryThis$1e = functionUncurryThisClause;
var arrayBufferByteLength$1 = arrayBufferByteLength$2;

var ArrayBuffer$4 = globalThis$$.ArrayBuffer;
var ArrayBufferPrototype$3 = ArrayBuffer$4 && ArrayBuffer$4.prototype;
var slice$7 = ArrayBufferPrototype$3 && uncurryThis$1e(ArrayBufferPrototype$3.slice);

var arrayBufferIsDetached = function (O) {
  if (arrayBufferByteLength$1(O) !== 0) return false;
  if (!slice$7) return false;
  try {
    slice$7(O, 0, 0);
    return false;
  } catch (error) {
    return true;
  }
};

var DESCRIPTORS$z = descriptors;
var defineBuiltInAccessor$f = defineBuiltInAccessor$l;
var isDetached$1 = arrayBufferIsDetached;

var ArrayBufferPrototype$2 = ArrayBuffer.prototype;

if (DESCRIPTORS$z && !('detached' in ArrayBufferPrototype$2)) {
  defineBuiltInAccessor$f(ArrayBufferPrototype$2, 'detached', {
    configurable: true,
    get: function detached() {
      return isDetached$1(this);
    }
  });
}

var isDetached = arrayBufferIsDetached;

var $TypeError$l = TypeError;

var arrayBufferNotDetached = function (it) {
  if (isDetached(it)) throw new $TypeError$l('ArrayBuffer is detached');
  return it;
};

var globalThis$_ = globalThis_1;
var IS_NODE$3 = environmentIsNode;

var getBuiltInNodeModule$2 = function (name) {
  if (IS_NODE$3) {
    try {
      return globalThis$_.process.getBuiltinModule(name);
    } catch (error) { /* empty */ }
    try {
      // eslint-disable-next-line no-new-func -- safe
      return Function('return require("' + name + '")')();
    } catch (error) { /* empty */ }
  }
};

var globalThis$Z = globalThis_1;
var fails$18 = fails$1z;
var V8$1 = environmentV8Version;
var ENVIRONMENT$2 = environment;

var structuredClone$2 = globalThis$Z.structuredClone;

var structuredCloneProperTransfer = !!structuredClone$2 && !fails$18(function () {
  // prevent V8 ArrayBufferDetaching protector cell invalidation and performance degradation
  // https://github.com/zloirock/core-js/issues/679
  if ((ENVIRONMENT$2 === 'DENO' && V8$1 > 92) || (ENVIRONMENT$2 === 'NODE' && V8$1 > 94) || (ENVIRONMENT$2 === 'BROWSER' && V8$1 > 97)) return false;
  var buffer = new ArrayBuffer(8);
  var clone = structuredClone$2(buffer, { transfer: [buffer] });
  return buffer.byteLength !== 0 || clone.byteLength !== 8;
});

var globalThis$Y = globalThis_1;
var getBuiltInNodeModule$1 = getBuiltInNodeModule$2;
var PROPER_STRUCTURED_CLONE_TRANSFER$2 = structuredCloneProperTransfer;

var structuredClone$1 = globalThis$Y.structuredClone;
var $ArrayBuffer = globalThis$Y.ArrayBuffer;
var $MessageChannel = globalThis$Y.MessageChannel;
var detach = false;
var WorkerThreads, channel$1, buffer, $detach;

if (PROPER_STRUCTURED_CLONE_TRANSFER$2) {
  detach = function (transferable) {
    structuredClone$1(transferable, { transfer: [transferable] });
  };
} else if ($ArrayBuffer) try {
  if (!$MessageChannel) {
    WorkerThreads = getBuiltInNodeModule$1('worker_threads');
    if (WorkerThreads) $MessageChannel = WorkerThreads.MessageChannel;
  }

  if ($MessageChannel) {
    channel$1 = new $MessageChannel();
    buffer = new $ArrayBuffer(2);

    $detach = function (transferable) {
      channel$1.port1.postMessage(null, [transferable]);
    };

    if (buffer.byteLength === 2) {
      $detach(buffer);
      if (buffer.byteLength === 0) detach = $detach;
    }
  }
} catch (error) { /* empty */ }

var detachTransferable$2 = detach;

var globalThis$X = globalThis_1;
var uncurryThis$1d = functionUncurryThis;
var uncurryThisAccessor$1 = functionUncurryThisAccessor;
var toIndex$2 = toIndex$4;
var notDetached$4 = arrayBufferNotDetached;
var arrayBufferByteLength = arrayBufferByteLength$2;
var detachTransferable$1 = detachTransferable$2;
var PROPER_STRUCTURED_CLONE_TRANSFER$1 = structuredCloneProperTransfer;

var structuredClone = globalThis$X.structuredClone;
var ArrayBuffer$3 = globalThis$X.ArrayBuffer;
var DataView$2 = globalThis$X.DataView;
var min$7 = Math.min;
var ArrayBufferPrototype$1 = ArrayBuffer$3.prototype;
var DataViewPrototype = DataView$2.prototype;
var slice$6 = uncurryThis$1d(ArrayBufferPrototype$1.slice);
var isResizable = uncurryThisAccessor$1(ArrayBufferPrototype$1, 'resizable', 'get');
var maxByteLength = uncurryThisAccessor$1(ArrayBufferPrototype$1, 'maxByteLength', 'get');
var getInt8 = uncurryThis$1d(DataViewPrototype.getInt8);
var setInt8 = uncurryThis$1d(DataViewPrototype.setInt8);

var arrayBufferTransfer = (PROPER_STRUCTURED_CLONE_TRANSFER$1 || detachTransferable$1) && function (arrayBuffer, newLength, preserveResizability) {
  var byteLength = arrayBufferByteLength(arrayBuffer);
  var newByteLength = newLength === undefined ? byteLength : toIndex$2(newLength);
  var fixedLength = !isResizable || !isResizable(arrayBuffer);
  var newBuffer;
  notDetached$4(arrayBuffer);
  if (PROPER_STRUCTURED_CLONE_TRANSFER$1) {
    arrayBuffer = structuredClone(arrayBuffer, { transfer: [arrayBuffer] });
    if (byteLength === newByteLength && (preserveResizability || fixedLength)) return arrayBuffer;
  }
  if (byteLength >= newByteLength && (!preserveResizability || fixedLength)) {
    newBuffer = slice$6(arrayBuffer, 0, newByteLength);
  } else {
    var options = preserveResizability && !fixedLength && maxByteLength ? { maxByteLength: maxByteLength(arrayBuffer) } : undefined;
    newBuffer = new ArrayBuffer$3(newByteLength, options);
    var a = new DataView$2(arrayBuffer);
    var b = new DataView$2(newBuffer);
    var copyLength = min$7(newByteLength, byteLength);
    for (var i = 0; i < copyLength; i++) setInt8(b, i, getInt8(a, i));
  }
  if (!PROPER_STRUCTURED_CLONE_TRANSFER$1) detachTransferable$1(arrayBuffer);
  return newBuffer;
};

var $$3c = _export;
var $transfer$1 = arrayBufferTransfer;

// `ArrayBuffer.prototype.transfer` method
// https://tc39.es/proposal-arraybuffer-transfer/#sec-arraybuffer.prototype.transfer
if ($transfer$1) $$3c({ target: 'ArrayBuffer', proto: true }, {
  transfer: function transfer() {
    return $transfer$1(this, arguments.length ? arguments[0] : undefined, true);
  }
});

var $$3b = _export;
var $transfer = arrayBufferTransfer;

// `ArrayBuffer.prototype.transferToFixedLength` method
// https://tc39.es/proposal-arraybuffer-transfer/#sec-arraybuffer.prototype.transfertofixedlength
if ($transfer) $$3b({ target: 'ArrayBuffer', proto: true }, {
  transferToFixedLength: function transferToFixedLength() {
    return $transfer(this, arguments.length ? arguments[0] : undefined, false);
  }
});

var $$3a = _export;
var uncurryThis$1c = functionUncurryThis;
var fails$17 = fails$1z;

// IE8- non-standard case
var FORCED$v = fails$17(function () {
  // eslint-disable-next-line es/no-date-prototype-getyear-setyear -- detection
  return new Date(16e11).getYear() !== 120;
});

var getFullYear = uncurryThis$1c(Date.prototype.getFullYear);

// `Date.prototype.getYear` method
// https://tc39.es/ecma262/#sec-date.prototype.getyear
$$3a({ target: 'Date', proto: true, forced: FORCED$v }, {
  getYear: function getYear() {
    return getFullYear(this) - 1900;
  }
});

// TODO: Remove from `core-js@4`
var $$39 = _export;
var uncurryThis$1b = functionUncurryThis;

var $Date = Date;
var thisTimeValue$4 = uncurryThis$1b($Date.prototype.getTime);

// `Date.now` method
// https://tc39.es/ecma262/#sec-date.now
$$39({ target: 'Date', stat: true }, {
  now: function now() {
    return thisTimeValue$4(new $Date());
  }
});

var $$38 = _export;
var uncurryThis$1a = functionUncurryThis;
var toIntegerOrInfinity$c = toIntegerOrInfinity$n;

var DatePrototype$3 = Date.prototype;
var thisTimeValue$3 = uncurryThis$1a(DatePrototype$3.getTime);
var setFullYear = uncurryThis$1a(DatePrototype$3.setFullYear);

// `Date.prototype.setYear` method
// https://tc39.es/ecma262/#sec-date.prototype.setyear
$$38({ target: 'Date', proto: true }, {
  setYear: function setYear(year) {
    // validate
    thisTimeValue$3(this);
    var yi = toIntegerOrInfinity$c(year);
    var yyyy = yi >= 0 && yi <= 99 ? yi + 1900 : yi;
    return setFullYear(this, yyyy);
  }
});

var $$37 = _export;

// `Date.prototype.toGMTString` method
// https://tc39.es/ecma262/#sec-date.prototype.togmtstring
$$37({ target: 'Date', proto: true }, {
  toGMTString: Date.prototype.toUTCString
});

var toIntegerOrInfinity$b = toIntegerOrInfinity$n;
var toString$z = toString$F;
var requireObjectCoercible$k = requireObjectCoercible$o;

var $RangeError$9 = RangeError;

// `String.prototype.repeat` method implementation
// https://tc39.es/ecma262/#sec-string.prototype.repeat
var stringRepeat = function repeat(count) {
  var str = toString$z(requireObjectCoercible$k(this));
  var result = '';
  var n = toIntegerOrInfinity$b(count);
  if (n < 0 || n === Infinity) throw new $RangeError$9('Wrong number of repetitions');
  for (;n > 0; (n >>>= 1) && (str += str)) if (n & 1) result += str;
  return result;
};

// https://github.com/tc39/proposal-string-pad-start-end
var uncurryThis$19 = functionUncurryThis;
var toLength$8 = toLength$d;
var toString$y = toString$F;
var $repeat$2 = stringRepeat;
var requireObjectCoercible$j = requireObjectCoercible$o;

var repeat$3 = uncurryThis$19($repeat$2);
var stringSlice$g = uncurryThis$19(''.slice);
var ceil = Math.ceil;

// `String.prototype.{ padStart, padEnd }` methods implementation
var createMethod$4 = function (IS_END) {
  return function ($this, maxLength, fillString) {
    var S = toString$y(requireObjectCoercible$j($this));
    var intMaxLength = toLength$8(maxLength);
    var stringLength = S.length;
    var fillStr = fillString === undefined ? ' ' : toString$y(fillString);
    var fillLen, stringFiller;
    if (intMaxLength <= stringLength || fillStr === '') return S;
    fillLen = intMaxLength - stringLength;
    stringFiller = repeat$3(fillStr, ceil(fillLen / fillStr.length));
    if (stringFiller.length > fillLen) stringFiller = stringSlice$g(stringFiller, 0, fillLen);
    return IS_END ? S + stringFiller : stringFiller + S;
  };
};

var stringPad = {
  // `String.prototype.padStart` method
  // https://tc39.es/ecma262/#sec-string.prototype.padstart
  start: createMethod$4(false),
  // `String.prototype.padEnd` method
  // https://tc39.es/ecma262/#sec-string.prototype.padend
  end: createMethod$4(true)
};

var uncurryThis$18 = functionUncurryThis;
var fails$16 = fails$1z;
var padStart$1 = stringPad.start;

var $RangeError$8 = RangeError;
var $isFinite$1 = isFinite;
var abs$6 = Math.abs;
var DatePrototype$2 = Date.prototype;
var nativeDateToISOString = DatePrototype$2.toISOString;
var thisTimeValue$2 = uncurryThis$18(DatePrototype$2.getTime);
var getUTCDate = uncurryThis$18(DatePrototype$2.getUTCDate);
var getUTCFullYear = uncurryThis$18(DatePrototype$2.getUTCFullYear);
var getUTCHours = uncurryThis$18(DatePrototype$2.getUTCHours);
var getUTCMilliseconds = uncurryThis$18(DatePrototype$2.getUTCMilliseconds);
var getUTCMinutes = uncurryThis$18(DatePrototype$2.getUTCMinutes);
var getUTCMonth = uncurryThis$18(DatePrototype$2.getUTCMonth);
var getUTCSeconds = uncurryThis$18(DatePrototype$2.getUTCSeconds);

// `Date.prototype.toISOString` method implementation
// https://tc39.es/ecma262/#sec-date.prototype.toisostring
// PhantomJS / old WebKit fails here:
var dateToIsoString = (fails$16(function () {
  return nativeDateToISOString.call(new Date(-5e13 - 1)) !== '0385-07-25T07:06:39.999Z';
}) || !fails$16(function () {
  nativeDateToISOString.call(new Date(NaN));
})) ? function toISOString() {
  if (!$isFinite$1(thisTimeValue$2(this))) throw new $RangeError$8('Invalid time value');
  var date = this;
  var year = getUTCFullYear(date);
  var milliseconds = getUTCMilliseconds(date);
  var sign = year < 0 ? '-' : year > 9999 ? '+' : '';
  return sign + padStart$1(abs$6(year), sign ? 6 : 4, 0) +
    '-' + padStart$1(getUTCMonth(date) + 1, 2, 0) +
    '-' + padStart$1(getUTCDate(date), 2, 0) +
    'T' + padStart$1(getUTCHours(date), 2, 0) +
    ':' + padStart$1(getUTCMinutes(date), 2, 0) +
    ':' + padStart$1(getUTCSeconds(date), 2, 0) +
    '.' + padStart$1(milliseconds, 3, 0) +
    'Z';
} : nativeDateToISOString;

var $$36 = _export;
var toISOString = dateToIsoString;

// `Date.prototype.toISOString` method
// https://tc39.es/ecma262/#sec-date.prototype.toisostring
// PhantomJS / old WebKit has a broken implementations
$$36({ target: 'Date', proto: true, forced: Date.prototype.toISOString !== toISOString }, {
  toISOString: toISOString
});

var $$35 = _export;
var fails$15 = fails$1z;
var toObject$g = toObject$y;
var toPrimitive$2 = toPrimitive$4;

var FORCED$u = fails$15(function () {
  return new Date(NaN).toJSON() !== null
    || Date.prototype.toJSON.call({ toISOString: function () { return 1; } }) !== 1;
});

// `Date.prototype.toJSON` method
// https://tc39.es/ecma262/#sec-date.prototype.tojson
$$35({ target: 'Date', proto: true, arity: 1, forced: FORCED$u }, {
  // eslint-disable-next-line no-unused-vars -- required for `.length`
  toJSON: function toJSON(key) {
    var O = toObject$g(this);
    var pv = toPrimitive$2(O, 'number');
    return typeof pv == 'number' && !isFinite(pv) ? null : O.toISOString();
  }
});

var anObject$Q = anObject$11;
var ordinaryToPrimitive = ordinaryToPrimitive$2;

var $TypeError$k = TypeError;

// `Date.prototype[@@toPrimitive](hint)` method implementation
// https://tc39.es/ecma262/#sec-date.prototype-@@toprimitive
var dateToPrimitive$1 = function (hint) {
  anObject$Q(this);
  if (hint === 'string' || hint === 'default') hint = 'string';
  else if (hint !== 'number') throw new $TypeError$k('Incorrect hint');
  return ordinaryToPrimitive(this, hint);
};

var hasOwn$n = hasOwnProperty_1;
var defineBuiltIn$k = defineBuiltIn$t;
var dateToPrimitive = dateToPrimitive$1;
var wellKnownSymbol$s = wellKnownSymbol$O;

var TO_PRIMITIVE = wellKnownSymbol$s('toPrimitive');
var DatePrototype$1 = Date.prototype;

// `Date.prototype[@@toPrimitive]` method
// https://tc39.es/ecma262/#sec-date.prototype-@@toprimitive
if (!hasOwn$n(DatePrototype$1, TO_PRIMITIVE)) {
  defineBuiltIn$k(DatePrototype$1, TO_PRIMITIVE, dateToPrimitive);
}

// TODO: Remove from `core-js@4`
var uncurryThis$17 = functionUncurryThis;
var defineBuiltIn$j = defineBuiltIn$t;

var DatePrototype = Date.prototype;
var INVALID_DATE = 'Invalid Date';
var TO_STRING$1 = 'toString';
var nativeDateToString = uncurryThis$17(DatePrototype[TO_STRING$1]);
var thisTimeValue$1 = uncurryThis$17(DatePrototype.getTime);

// `Date.prototype.toString` method
// https://tc39.es/ecma262/#sec-date.prototype.tostring
if (String(new Date(NaN)) !== INVALID_DATE) {
  defineBuiltIn$j(DatePrototype, TO_STRING$1, function toString() {
    var value = thisTimeValue$1(this);
    // eslint-disable-next-line no-self-compare -- NaN check
    return value === value ? nativeDateToString(this) : INVALID_DATE;
  });
}

var $$34 = _export;
var uncurryThis$16 = functionUncurryThis;
var toString$x = toString$F;

var charAt$g = uncurryThis$16(''.charAt);
var charCodeAt$7 = uncurryThis$16(''.charCodeAt);
var exec$b = uncurryThis$16(/./.exec);
var numberToString$3 = uncurryThis$16(1.0.toString);
var toUpperCase = uncurryThis$16(''.toUpperCase);

var raw = /[\w*+\-./@]/;

var hex$1 = function (code, length) {
  var result = numberToString$3(code, 16);
  while (result.length < length) result = '0' + result;
  return result;
};

// `escape` method
// https://tc39.es/ecma262/#sec-escape-string
$$34({ global: true }, {
  escape: function escape(string) {
    var str = toString$x(string);
    var result = '';
    var length = str.length;
    var index = 0;
    var chr, code;
    while (index < length) {
      chr = charAt$g(str, index++);
      if (exec$b(raw, chr)) {
        result += chr;
      } else {
        code = charCodeAt$7(chr, 0);
        if (code < 256) {
          result += '%' + hex$1(code, 2);
        } else {
          result += '%u' + toUpperCase(hex$1(code, 4));
        }
      }
    } return result;
  }
});

var uncurryThis$15 = functionUncurryThis;
var aCallable$w = aCallable$F;
var isObject$u = isObject$J;
var hasOwn$m = hasOwnProperty_1;
var arraySlice$5 = arraySlice$a;
var NATIVE_BIND = functionBindNative;

var $Function = Function;
var concat$2 = uncurryThis$15([].concat);
var join$8 = uncurryThis$15([].join);
var factories = {};

var construct = function (C, argsLength, args) {
  if (!hasOwn$m(factories, argsLength)) {
    var list = [];
    var i = 0;
    for (; i < argsLength; i++) list[i] = 'a[' + i + ']';
    factories[argsLength] = $Function('C,a', 'return new C(' + join$8(list, ',') + ')');
  } return factories[argsLength](C, args);
};

// `Function.prototype.bind` method implementation
// https://tc39.es/ecma262/#sec-function.prototype.bind
// eslint-disable-next-line es/no-function-prototype-bind -- detection
var functionBind = NATIVE_BIND ? $Function.bind : function bind(that /* , ...args */) {
  var F = aCallable$w(this);
  var Prototype = F.prototype;
  var partArgs = arraySlice$5(arguments, 1);
  var boundFunction = function bound(/* args... */) {
    var args = concat$2(partArgs, arraySlice$5(arguments));
    return this instanceof boundFunction ? construct(F, args.length, args) : F.apply(that, args);
  };
  if (isObject$u(Prototype)) boundFunction.prototype = Prototype;
  return boundFunction;
};

// TODO: Remove from `core-js@4`
var $$33 = _export;
var bind$c = functionBind;

// `Function.prototype.bind` method
// https://tc39.es/ecma262/#sec-function.prototype.bind
// eslint-disable-next-line es/no-function-prototype-bind -- detection
$$33({ target: 'Function', proto: true, forced: Function.bind !== bind$c }, {
  bind: bind$c
});

var isCallable$i = isCallable$D;
var isObject$t = isObject$J;
var definePropertyModule$5 = objectDefineProperty;
var isPrototypeOf$7 = objectIsPrototypeOf;
var wellKnownSymbol$r = wellKnownSymbol$O;
var makeBuiltIn = makeBuiltInExports;

var HAS_INSTANCE = wellKnownSymbol$r('hasInstance');
var FunctionPrototype$2 = Function.prototype;

// `Function.prototype[@@hasInstance]` method
// https://tc39.es/ecma262/#sec-function.prototype-@@hasinstance
if (!(HAS_INSTANCE in FunctionPrototype$2)) {
  definePropertyModule$5.f(FunctionPrototype$2, HAS_INSTANCE, { value: makeBuiltIn(function (O) {
    if (!isCallable$i(this) || !isObject$t(O)) return false;
    var P = this.prototype;
    return isObject$t(P) ? isPrototypeOf$7(P, O) : O instanceof this;
  }, HAS_INSTANCE) });
}

var DESCRIPTORS$y = descriptors;
var FUNCTION_NAME_EXISTS = functionName.EXISTS;
var uncurryThis$14 = functionUncurryThis;
var defineBuiltInAccessor$e = defineBuiltInAccessor$l;

var FunctionPrototype$1 = Function.prototype;
var functionToString = uncurryThis$14(FunctionPrototype$1.toString);
var nameRE = /function\b(?:\s|\/\*[\S\s]*?\*\/|\/\/[^\n\r]*[\n\r]+)*([^\s(/]*)/;
var regExpExec$5 = uncurryThis$14(nameRE.exec);
var NAME = 'name';

// Function instances `.name` property
// https://tc39.es/ecma262/#sec-function-instances-name
if (DESCRIPTORS$y && !FUNCTION_NAME_EXISTS) {
  defineBuiltInAccessor$e(FunctionPrototype$1, NAME, {
    configurable: true,
    get: function () {
      try {
        return regExpExec$5(nameRE, functionToString(this))[1];
      } catch (error) {
        return '';
      }
    }
  });
}

var $$32 = _export;
var globalThis$W = globalThis_1;

// `globalThis` object
// https://tc39.es/ecma262/#sec-globalthis
$$32({ global: true, forced: globalThis$W.globalThis !== globalThis$W }, {
  globalThis: globalThis$W
});

var globalThis$V = globalThis_1;
var setToStringTag$8 = setToStringTag$e;

// JSON[@@toStringTag] property
// https://tc39.es/ecma262/#sec-json-@@tostringtag
setToStringTag$8(globalThis$V.JSON, 'JSON', true);

var internalMetadata = {exports: {}};

// FF26- bug: ArrayBuffers are non-extensible, but Object.isExtensible does not report it
var fails$14 = fails$1z;

var arrayBufferNonExtensible = fails$14(function () {
  if (typeof ArrayBuffer == 'function') {
    var buffer = new ArrayBuffer(8);
    // eslint-disable-next-line es/no-object-isextensible, es/no-object-defineproperty -- safe
    if (Object.isExtensible(buffer)) Object.defineProperty(buffer, 'a', { value: 8 });
  }
});

var fails$13 = fails$1z;
var isObject$s = isObject$J;
var classof$f = classofRaw$2;
var ARRAY_BUFFER_NON_EXTENSIBLE$2 = arrayBufferNonExtensible;

// eslint-disable-next-line es/no-object-isextensible -- safe
var $isExtensible$2 = Object.isExtensible;
var FAILS_ON_PRIMITIVES$6 = fails$13(function () { $isExtensible$2(1); });

// `Object.isExtensible` method
// https://tc39.es/ecma262/#sec-object.isextensible
var objectIsExtensible = (FAILS_ON_PRIMITIVES$6 || ARRAY_BUFFER_NON_EXTENSIBLE$2) ? function isExtensible(it) {
  if (!isObject$s(it)) return false;
  if (ARRAY_BUFFER_NON_EXTENSIBLE$2 && classof$f(it) === 'ArrayBuffer') return false;
  return $isExtensible$2 ? $isExtensible$2(it) : true;
} : $isExtensible$2;

var fails$12 = fails$1z;

var freezing = !fails$12(function () {
  // eslint-disable-next-line es/no-object-isextensible, es/no-object-preventextensions -- required for testing
  return Object.isExtensible(Object.preventExtensions({}));
});

var $$31 = _export;
var uncurryThis$13 = functionUncurryThis;
var hiddenKeys = hiddenKeys$6;
var isObject$r = isObject$J;
var hasOwn$l = hasOwnProperty_1;
var defineProperty$9 = objectDefineProperty.f;
var getOwnPropertyNamesModule = objectGetOwnPropertyNames;
var getOwnPropertyNamesExternalModule = objectGetOwnPropertyNamesExternal;
var isExtensible$1 = objectIsExtensible;
var uid$2 = uid$7;
var FREEZING$6 = freezing;

var REQUIRED = false;
var METADATA$1 = uid$2('meta');
var id$1 = 0;

var setMetadata = function (it) {
  defineProperty$9(it, METADATA$1, { value: {
    objectID: 'O' + id$1++, // object ID
    weakData: {}          // weak collections IDs
  } });
};

var fastKey$1 = function (it, create) {
  // return a primitive with prefix
  if (!isObject$r(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if (!hasOwn$l(it, METADATA$1)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible$1(it)) return 'F';
    // not necessary to add metadata
    if (!create) return 'E';
    // add missing metadata
    setMetadata(it);
  // return object ID
  } return it[METADATA$1].objectID;
};

var getWeakData$1 = function (it, create) {
  if (!hasOwn$l(it, METADATA$1)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible$1(it)) return true;
    // not necessary to add metadata
    if (!create) return false;
    // add missing metadata
    setMetadata(it);
  // return the store of weak collections IDs
  } return it[METADATA$1].weakData;
};

// add metadata on freeze-family methods calling
var onFreeze$3 = function (it) {
  if (FREEZING$6 && REQUIRED && isExtensible$1(it) && !hasOwn$l(it, METADATA$1)) setMetadata(it);
  return it;
};

var enable = function () {
  meta.enable = function () { /* empty */ };
  REQUIRED = true;
  var getOwnPropertyNames = getOwnPropertyNamesModule.f;
  var splice = uncurryThis$13([].splice);
  var test = {};
  test[METADATA$1] = 1;

  // prevent exposing of metadata key
  if (getOwnPropertyNames(test).length) {
    getOwnPropertyNamesModule.f = function (it) {
      var result = getOwnPropertyNames(it);
      for (var i = 0, length = result.length; i < length; i++) {
        if (result[i] === METADATA$1) {
          splice(result, i, 1);
          break;
        }
      } return result;
    };

    $$31({ target: 'Object', stat: true, forced: true }, {
      getOwnPropertyNames: getOwnPropertyNamesExternalModule.f
    });
  }
};

var meta = internalMetadata.exports = {
  enable: enable,
  fastKey: fastKey$1,
  getWeakData: getWeakData$1,
  onFreeze: onFreeze$3
};

hiddenKeys[METADATA$1] = true;

var internalMetadataExports = internalMetadata.exports;

var $$30 = _export;
var globalThis$U = globalThis_1;
var uncurryThis$12 = functionUncurryThis;
var isForced$3 = isForced_1;
var defineBuiltIn$i = defineBuiltIn$t;
var InternalMetadataModule$1 = internalMetadataExports;
var iterate$i = iterate$k;
var anInstance$c = anInstance$e;
var isCallable$h = isCallable$D;
var isNullOrUndefined$a = isNullOrUndefined$f;
var isObject$q = isObject$J;
var fails$11 = fails$1z;
var checkCorrectnessOfIteration$2 = checkCorrectnessOfIteration$4;
var setToStringTag$7 = setToStringTag$e;
var inheritIfRequired$4 = inheritIfRequired$7;

var collection$4 = function (CONSTRUCTOR_NAME, wrapper, common) {
  var IS_MAP = CONSTRUCTOR_NAME.indexOf('Map') !== -1;
  var IS_WEAK = CONSTRUCTOR_NAME.indexOf('Weak') !== -1;
  var ADDER = IS_MAP ? 'set' : 'add';
  var NativeConstructor = globalThis$U[CONSTRUCTOR_NAME];
  var NativePrototype = NativeConstructor && NativeConstructor.prototype;
  var Constructor = NativeConstructor;
  var exported = {};

  var fixMethod = function (KEY) {
    var uncurriedNativeMethod = uncurryThis$12(NativePrototype[KEY]);
    defineBuiltIn$i(NativePrototype, KEY,
      KEY === 'add' ? function add(value) {
        uncurriedNativeMethod(this, value === 0 ? 0 : value);
        return this;
      } : KEY === 'delete' ? function (key) {
        return IS_WEAK && !isObject$q(key) ? false : uncurriedNativeMethod(this, key === 0 ? 0 : key);
      } : KEY === 'get' ? function get(key) {
        return IS_WEAK && !isObject$q(key) ? undefined : uncurriedNativeMethod(this, key === 0 ? 0 : key);
      } : KEY === 'has' ? function has(key) {
        return IS_WEAK && !isObject$q(key) ? false : uncurriedNativeMethod(this, key === 0 ? 0 : key);
      } : function set(key, value) {
        uncurriedNativeMethod(this, key === 0 ? 0 : key, value);
        return this;
      }
    );
  };

  var REPLACE = isForced$3(
    CONSTRUCTOR_NAME,
    !isCallable$h(NativeConstructor) || !(IS_WEAK || NativePrototype.forEach && !fails$11(function () {
      new NativeConstructor().entries().next();
    }))
  );

  if (REPLACE) {
    // create collection constructor
    Constructor = common.getConstructor(wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER);
    InternalMetadataModule$1.enable();
  } else if (isForced$3(CONSTRUCTOR_NAME, true)) {
    var instance = new Constructor();
    // early implementations not supports chaining
    var HASNT_CHAINING = instance[ADDER](IS_WEAK ? {} : -0, 1) !== instance;
    // V8 ~ Chromium 40- weak-collections throws on primitives, but should return false
    var THROWS_ON_PRIMITIVES = fails$11(function () { instance.has(1); });
    // most early implementations doesn't supports iterables, most modern - not close it correctly
    // eslint-disable-next-line no-new -- required for testing
    var ACCEPT_ITERABLES = checkCorrectnessOfIteration$2(function (iterable) { new NativeConstructor(iterable); });
    // for early implementations -0 and +0 not the same
    var BUGGY_ZERO = !IS_WEAK && fails$11(function () {
      // V8 ~ Chromium 42- fails only with 5+ elements
      var $instance = new NativeConstructor();
      var index = 5;
      while (index--) $instance[ADDER](index, index);
      return !$instance.has(-0);
    });

    if (!ACCEPT_ITERABLES) {
      Constructor = wrapper(function (dummy, iterable) {
        anInstance$c(dummy, NativePrototype);
        var that = inheritIfRequired$4(new NativeConstructor(), dummy, Constructor);
        if (!isNullOrUndefined$a(iterable)) iterate$i(iterable, that[ADDER], { that: that, AS_ENTRIES: IS_MAP });
        return that;
      });
      Constructor.prototype = NativePrototype;
      NativePrototype.constructor = Constructor;
    }

    if (THROWS_ON_PRIMITIVES || BUGGY_ZERO) {
      fixMethod('delete');
      fixMethod('has');
      IS_MAP && fixMethod('get');
    }

    if (BUGGY_ZERO || HASNT_CHAINING) fixMethod(ADDER);

    // weak collections should not contains .clear method
    if (IS_WEAK && NativePrototype.clear) delete NativePrototype.clear;
  }

  exported[CONSTRUCTOR_NAME] = Constructor;
  $$30({ global: true, constructor: true, forced: Constructor !== NativeConstructor }, exported);

  setToStringTag$7(Constructor, CONSTRUCTOR_NAME);

  if (!IS_WEAK) common.setStrong(Constructor, CONSTRUCTOR_NAME, IS_MAP);

  return Constructor;
};

var create$d = objectCreate$1;
var defineBuiltInAccessor$d = defineBuiltInAccessor$l;
var defineBuiltIns$8 = defineBuiltIns$a;
var bind$b = functionBindContext;
var anInstance$b = anInstance$e;
var isNullOrUndefined$9 = isNullOrUndefined$f;
var iterate$h = iterate$k;
var defineIterator$1 = iteratorDefine;
var createIterResultObject$b = createIterResultObject$d;
var setSpecies$3 = setSpecies$6;
var DESCRIPTORS$x = descriptors;
var fastKey = internalMetadataExports.fastKey;
var InternalStateModule$d = internalState;

var setInternalState$e = InternalStateModule$d.set;
var internalStateGetterFor$1 = InternalStateModule$d.getterFor;

var collectionStrong$2 = {
  getConstructor: function (wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER) {
    var Constructor = wrapper(function (that, iterable) {
      anInstance$b(that, Prototype);
      setInternalState$e(that, {
        type: CONSTRUCTOR_NAME,
        index: create$d(null),
        first: undefined,
        last: undefined,
        size: 0
      });
      if (!DESCRIPTORS$x) that.size = 0;
      if (!isNullOrUndefined$9(iterable)) iterate$h(iterable, that[ADDER], { that: that, AS_ENTRIES: IS_MAP });
    });

    var Prototype = Constructor.prototype;

    var getInternalState = internalStateGetterFor$1(CONSTRUCTOR_NAME);

    var define = function (that, key, value) {
      var state = getInternalState(that);
      var entry = getEntry(that, key);
      var previous, index;
      // change existing entry
      if (entry) {
        entry.value = value;
      // create new entry
      } else {
        state.last = entry = {
          index: index = fastKey(key, true),
          key: key,
          value: value,
          previous: previous = state.last,
          next: undefined,
          removed: false
        };
        if (!state.first) state.first = entry;
        if (previous) previous.next = entry;
        if (DESCRIPTORS$x) state.size++;
        else that.size++;
        // add to index
        if (index !== 'F') state.index[index] = entry;
      } return that;
    };

    var getEntry = function (that, key) {
      var state = getInternalState(that);
      // fast case
      var index = fastKey(key);
      var entry;
      if (index !== 'F') return state.index[index];
      // frozen object case
      for (entry = state.first; entry; entry = entry.next) {
        if (entry.key === key) return entry;
      }
    };

    defineBuiltIns$8(Prototype, {
      // `{ Map, Set }.prototype.clear()` methods
      // https://tc39.es/ecma262/#sec-map.prototype.clear
      // https://tc39.es/ecma262/#sec-set.prototype.clear
      clear: function clear() {
        var that = this;
        var state = getInternalState(that);
        var entry = state.first;
        while (entry) {
          entry.removed = true;
          if (entry.previous) entry.previous = entry.previous.next = undefined;
          entry = entry.next;
        }
        state.first = state.last = undefined;
        state.index = create$d(null);
        if (DESCRIPTORS$x) state.size = 0;
        else that.size = 0;
      },
      // `{ Map, Set }.prototype.delete(key)` methods
      // https://tc39.es/ecma262/#sec-map.prototype.delete
      // https://tc39.es/ecma262/#sec-set.prototype.delete
      'delete': function (key) {
        var that = this;
        var state = getInternalState(that);
        var entry = getEntry(that, key);
        if (entry) {
          var next = entry.next;
          var prev = entry.previous;
          delete state.index[entry.index];
          entry.removed = true;
          if (prev) prev.next = next;
          if (next) next.previous = prev;
          if (state.first === entry) state.first = next;
          if (state.last === entry) state.last = prev;
          if (DESCRIPTORS$x) state.size--;
          else that.size--;
        } return !!entry;
      },
      // `{ Map, Set }.prototype.forEach(callbackfn, thisArg = undefined)` methods
      // https://tc39.es/ecma262/#sec-map.prototype.foreach
      // https://tc39.es/ecma262/#sec-set.prototype.foreach
      forEach: function forEach(callbackfn /* , that = undefined */) {
        var state = getInternalState(this);
        var boundFunction = bind$b(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
        var entry;
        while (entry = entry ? entry.next : state.first) {
          boundFunction(entry.value, entry.key, this);
          // revert to the last existing entry
          while (entry && entry.removed) entry = entry.previous;
        }
      },
      // `{ Map, Set}.prototype.has(key)` methods
      // https://tc39.es/ecma262/#sec-map.prototype.has
      // https://tc39.es/ecma262/#sec-set.prototype.has
      has: function has(key) {
        return !!getEntry(this, key);
      }
    });

    defineBuiltIns$8(Prototype, IS_MAP ? {
      // `Map.prototype.get(key)` method
      // https://tc39.es/ecma262/#sec-map.prototype.get
      get: function get(key) {
        var entry = getEntry(this, key);
        return entry && entry.value;
      },
      // `Map.prototype.set(key, value)` method
      // https://tc39.es/ecma262/#sec-map.prototype.set
      set: function set(key, value) {
        return define(this, key === 0 ? 0 : key, value);
      }
    } : {
      // `Set.prototype.add(value)` method
      // https://tc39.es/ecma262/#sec-set.prototype.add
      add: function add(value) {
        return define(this, value = value === 0 ? 0 : value, value);
      }
    });
    if (DESCRIPTORS$x) defineBuiltInAccessor$d(Prototype, 'size', {
      configurable: true,
      get: function () {
        return getInternalState(this).size;
      }
    });
    return Constructor;
  },
  setStrong: function (Constructor, CONSTRUCTOR_NAME, IS_MAP) {
    var ITERATOR_NAME = CONSTRUCTOR_NAME + ' Iterator';
    var getInternalCollectionState = internalStateGetterFor$1(CONSTRUCTOR_NAME);
    var getInternalIteratorState = internalStateGetterFor$1(ITERATOR_NAME);
    // `{ Map, Set }.prototype.{ keys, values, entries, @@iterator }()` methods
    // https://tc39.es/ecma262/#sec-map.prototype.entries
    // https://tc39.es/ecma262/#sec-map.prototype.keys
    // https://tc39.es/ecma262/#sec-map.prototype.values
    // https://tc39.es/ecma262/#sec-map.prototype-@@iterator
    // https://tc39.es/ecma262/#sec-set.prototype.entries
    // https://tc39.es/ecma262/#sec-set.prototype.keys
    // https://tc39.es/ecma262/#sec-set.prototype.values
    // https://tc39.es/ecma262/#sec-set.prototype-@@iterator
    defineIterator$1(Constructor, CONSTRUCTOR_NAME, function (iterated, kind) {
      setInternalState$e(this, {
        type: ITERATOR_NAME,
        target: iterated,
        state: getInternalCollectionState(iterated),
        kind: kind,
        last: undefined
      });
    }, function () {
      var state = getInternalIteratorState(this);
      var kind = state.kind;
      var entry = state.last;
      // revert to the last existing entry
      while (entry && entry.removed) entry = entry.previous;
      // get next entry
      if (!state.target || !(state.last = entry = entry ? entry.next : state.state.first)) {
        // or finish the iteration
        state.target = undefined;
        return createIterResultObject$b(undefined, true);
      }
      // return step by kind
      if (kind === 'keys') return createIterResultObject$b(entry.key, false);
      if (kind === 'values') return createIterResultObject$b(entry.value, false);
      return createIterResultObject$b([entry.key, entry.value], false);
    }, IS_MAP ? 'entries' : 'values', !IS_MAP, true);

    // `{ Map, Set }.prototype[@@species]` accessors
    // https://tc39.es/ecma262/#sec-get-map-@@species
    // https://tc39.es/ecma262/#sec-get-set-@@species
    setSpecies$3(CONSTRUCTOR_NAME);
  }
};

var collection$3 = collection$4;
var collectionStrong$1 = collectionStrong$2;

// `Map` constructor
// https://tc39.es/ecma262/#sec-map-objects
collection$3('Map', function (init) {
  return function Map() { return init(this, arguments.length ? arguments[0] : undefined); };
}, collectionStrong$1);

var uncurryThis$11 = functionUncurryThis;

// eslint-disable-next-line es/no-map -- safe
var MapPrototype = Map.prototype;

var mapHelpers = {
  // eslint-disable-next-line es/no-map -- safe
  Map: Map,
  set: uncurryThis$11(MapPrototype.set),
  get: uncurryThis$11(MapPrototype.get),
  has: uncurryThis$11(MapPrototype.has),
  remove: uncurryThis$11(MapPrototype['delete']),
  proto: MapPrototype
};

var $$2$ = _export;
var uncurryThis$10 = functionUncurryThis;
var aCallable$v = aCallable$F;
var requireObjectCoercible$i = requireObjectCoercible$o;
var iterate$g = iterate$k;
var MapHelpers$2 = mapHelpers;
var fails$10 = fails$1z;

var Map$3 = MapHelpers$2.Map;
var has$6 = MapHelpers$2.has;
var get$1 = MapHelpers$2.get;
var set$2 = MapHelpers$2.set;
var push$h = uncurryThis$10([].push);

var DOES_NOT_WORK_WITH_PRIMITIVES$1 = fails$10(function () {
  return Map$3.groupBy('ab', function (it) {
    return it;
  }).get('a').length !== 1;
});

// `Map.groupBy` method
// https://github.com/tc39/proposal-array-grouping
$$2$({ target: 'Map', stat: true, forced: DOES_NOT_WORK_WITH_PRIMITIVES$1 }, {
  groupBy: function groupBy(items, callbackfn) {
    requireObjectCoercible$i(items);
    aCallable$v(callbackfn);
    var map = new Map$3();
    var k = 0;
    iterate$g(items, function (value) {
      var key = callbackfn(value, k++);
      if (!has$6(map, key)) set$2(map, key, [value]);
      else push$h(get$1(map, key), value);
    });
    return map;
  }
});

var log$7 = Math.log;

// `Math.log1p` method implementation
// https://tc39.es/ecma262/#sec-math.log1p
// eslint-disable-next-line es/no-math-log1p -- safe
var mathLog1p = Math.log1p || function log1p(x) {
  var n = +x;
  return n > -1e-8 && n < 1e-8 ? n - n * n / 2 : log$7(1 + n);
};

var $$2_ = _export;
var log1p$1 = mathLog1p;

// eslint-disable-next-line es/no-math-acosh -- required for testing
var $acosh = Math.acosh;
var log$6 = Math.log;
var sqrt$2 = Math.sqrt;
var LN2$1 = Math.LN2;

var FORCED$t = !$acosh
  // V8 bug: https://code.google.com/p/v8/issues/detail?id=3509
  || Math.floor($acosh(Number.MAX_VALUE)) !== 710
  // Tor Browser bug: Math.acosh(Infinity) -> NaN
  || $acosh(Infinity) !== Infinity;

// `Math.acosh` method
// https://tc39.es/ecma262/#sec-math.acosh
$$2_({ target: 'Math', stat: true, forced: FORCED$t }, {
  acosh: function acosh(x) {
    var n = +x;
    return n < 1 ? NaN : n > 94906265.62425156
      ? log$6(n) + LN2$1
      : log1p$1(n - 1 + sqrt$2(n - 1) * sqrt$2(n + 1));
  }
});

var $$2Z = _export;

// eslint-disable-next-line es/no-math-asinh -- required for testing
var $asinh = Math.asinh;
var log$5 = Math.log;
var sqrt$1 = Math.sqrt;

function asinh(x) {
  var n = +x;
  return !isFinite(n) || n === 0 ? n : n < 0 ? -asinh(-n) : log$5(n + sqrt$1(n * n + 1));
}

var FORCED$s = !($asinh && 1 / $asinh(0) > 0);

// `Math.asinh` method
// https://tc39.es/ecma262/#sec-math.asinh
// Tor Browser bug: Math.asinh(0) -> -0
$$2Z({ target: 'Math', stat: true, forced: FORCED$s }, {
  asinh: asinh
});

var $$2Y = _export;

// eslint-disable-next-line es/no-math-atanh -- required for testing
var $atanh = Math.atanh;
var log$4 = Math.log;

var FORCED$r = !($atanh && 1 / $atanh(-0) < 0);

// `Math.atanh` method
// https://tc39.es/ecma262/#sec-math.atanh
// Tor Browser bug: Math.atanh(-0) -> 0
$$2Y({ target: 'Math', stat: true, forced: FORCED$r }, {
  atanh: function atanh(x) {
    var n = +x;
    return n === 0 ? n : log$4((1 + n) / (1 - n)) / 2;
  }
});

var $$2X = _export;
var sign$1 = mathSign;

var abs$5 = Math.abs;
var pow$3 = Math.pow;

// `Math.cbrt` method
// https://tc39.es/ecma262/#sec-math.cbrt
$$2X({ target: 'Math', stat: true }, {
  cbrt: function cbrt(x) {
    var n = +x;
    return sign$1(n) * pow$3(abs$5(n), 1 / 3);
  }
});

var $$2W = _export;

var floor$7 = Math.floor;
var log$3 = Math.log;
var LOG2E = Math.LOG2E;

// `Math.clz32` method
// https://tc39.es/ecma262/#sec-math.clz32
$$2W({ target: 'Math', stat: true }, {
  clz32: function clz32(x) {
    var n = x >>> 0;
    return n ? 31 - floor$7(log$3(n + 0.5) * LOG2E) : 32;
  }
});

// eslint-disable-next-line es/no-math-expm1 -- safe
var $expm1 = Math.expm1;
var exp$2 = Math.exp;

// `Math.expm1` method implementation
// https://tc39.es/ecma262/#sec-math.expm1
var mathExpm1 = (!$expm1
  // Old FF bug
  // eslint-disable-next-line no-loss-of-precision -- required for old engines
  || $expm1(10) > 22025.465794806719 || $expm1(10) < 22025.4657948067165168
  // Tor Browser bug
  || $expm1(-2e-17) !== -2e-17
) ? function expm1(x) {
  var n = +x;
  return n === 0 ? n : n > -1e-6 && n < 1e-6 ? n + n * n / 2 : exp$2(n) - 1;
} : $expm1;

var $$2V = _export;
var expm1$3 = mathExpm1;

// eslint-disable-next-line es/no-math-cosh -- required for testing
var $cosh = Math.cosh;
var abs$4 = Math.abs;
var E$1 = Math.E;

var FORCED$q = !$cosh || $cosh(710) === Infinity;

// `Math.cosh` method
// https://tc39.es/ecma262/#sec-math.cosh
$$2V({ target: 'Math', stat: true, forced: FORCED$q }, {
  cosh: function cosh(x) {
    var t = expm1$3(abs$4(x) - 1) + 1;
    return (t + 1 / (t * E$1 * E$1)) * (E$1 / 2);
  }
});

var $$2U = _export;
var expm1$2 = mathExpm1;

// `Math.expm1` method
// https://tc39.es/ecma262/#sec-math.expm1
// eslint-disable-next-line es/no-math-expm1 -- required for testing
$$2U({ target: 'Math', stat: true, forced: expm1$2 !== Math.expm1 }, { expm1: expm1$2 });

var $$2T = _export;
var fround = mathFround;

// `Math.fround` method
// https://tc39.es/ecma262/#sec-math.fround
$$2T({ target: 'Math', stat: true }, { fround: fround });

var $$2S = _export;

// eslint-disable-next-line es/no-math-hypot -- required for testing
var $hypot = Math.hypot;
var abs$3 = Math.abs;
var sqrt = Math.sqrt;

// Chrome 77 bug
// https://bugs.chromium.org/p/v8/issues/detail?id=9546
var FORCED$p = !!$hypot && $hypot(Infinity, NaN) !== Infinity;

// `Math.hypot` method
// https://tc39.es/ecma262/#sec-math.hypot
$$2S({ target: 'Math', stat: true, arity: 2, forced: FORCED$p }, {
  // eslint-disable-next-line no-unused-vars -- required for `.length`
  hypot: function hypot(value1, value2) {
    var sum = 0;
    var i = 0;
    var aLen = arguments.length;
    var larg = 0;
    var arg, div;
    while (i < aLen) {
      arg = abs$3(arguments[i++]);
      if (larg < arg) {
        div = larg / arg;
        sum = sum * div * div + 1;
        larg = arg;
      } else if (arg > 0) {
        div = arg / larg;
        sum += div * div;
      } else sum += arg;
    }
    return larg === Infinity ? Infinity : larg * sqrt(sum);
  }
});

var $$2R = _export;
var fails$$ = fails$1z;

// eslint-disable-next-line es/no-math-imul -- required for testing
var $imul = Math.imul;

var FORCED$o = fails$$(function () {
  return $imul(0xFFFFFFFF, 5) !== -5 || $imul.length !== 2;
});

// `Math.imul` method
// https://tc39.es/ecma262/#sec-math.imul
// some WebKit versions fails with big numbers, some has wrong arity
$$2R({ target: 'Math', stat: true, forced: FORCED$o }, {
  imul: function imul(x, y) {
    var UINT16 = 0xFFFF;
    var xn = +x;
    var yn = +y;
    var xl = UINT16 & xn;
    var yl = UINT16 & yn;
    return 0 | xl * yl + ((UINT16 & xn >>> 16) * yl + xl * (UINT16 & yn >>> 16) << 16 >>> 0);
  }
});

var log$2 = Math.log;
var LOG10E = Math.LOG10E;

// eslint-disable-next-line es/no-math-log10 -- safe
var mathLog10 = Math.log10 || function log10(x) {
  return log$2(x) * LOG10E;
};

var $$2Q = _export;
var log10$1 = mathLog10;

// `Math.log10` method
// https://tc39.es/ecma262/#sec-math.log10
$$2Q({ target: 'Math', stat: true }, {
  log10: log10$1
});

var $$2P = _export;
var log1p = mathLog1p;

// `Math.log1p` method
// https://tc39.es/ecma262/#sec-math.log1p
$$2P({ target: 'Math', stat: true }, { log1p: log1p });

var $$2O = _export;

var log$1 = Math.log;
var LN2 = Math.LN2;

// `Math.log2` method
// https://tc39.es/ecma262/#sec-math.log2
$$2O({ target: 'Math', stat: true }, {
  log2: function log2(x) {
    return log$1(x) / LN2;
  }
});

var $$2N = _export;
var sign = mathSign;

// `Math.sign` method
// https://tc39.es/ecma262/#sec-math.sign
$$2N({ target: 'Math', stat: true }, {
  sign: sign
});

var $$2M = _export;
var fails$_ = fails$1z;
var expm1$1 = mathExpm1;

var abs$2 = Math.abs;
var exp$1 = Math.exp;
var E = Math.E;

var FORCED$n = fails$_(function () {
  // eslint-disable-next-line es/no-math-sinh -- required for testing
  return Math.sinh(-2e-17) !== -2e-17;
});

// `Math.sinh` method
// https://tc39.es/ecma262/#sec-math.sinh
// V8 near Chromium 38 has a problem with very small numbers
$$2M({ target: 'Math', stat: true, forced: FORCED$n }, {
  sinh: function sinh(x) {
    var n = +x;
    return abs$2(n) < 1 ? (expm1$1(n) - expm1$1(-n)) / 2 : (exp$1(n - 1) - exp$1(-n - 1)) * (E / 2);
  }
});

var $$2L = _export;
var expm1 = mathExpm1;

var exp = Math.exp;

// `Math.tanh` method
// https://tc39.es/ecma262/#sec-math.tanh
$$2L({ target: 'Math', stat: true }, {
  tanh: function tanh(x) {
    var n = +x;
    var a = expm1(n);
    var b = expm1(-n);
    return a === Infinity ? 1 : b === Infinity ? -1 : (a - b) / (exp(n) + exp(-n));
  }
});

var setToStringTag$6 = setToStringTag$e;

// Math[@@toStringTag] property
// https://tc39.es/ecma262/#sec-math-@@tostringtag
setToStringTag$6(Math, 'Math', true);

var $$2K = _export;
var trunc = mathTrunc;

// `Math.trunc` method
// https://tc39.es/ecma262/#sec-math.trunc
$$2K({ target: 'Math', stat: true }, {
  trunc: trunc
});

var uncurryThis$$ = functionUncurryThis;

// `thisNumberValue` abstract operation
// https://tc39.es/ecma262/#sec-thisnumbervalue
var thisNumberValue$5 = uncurryThis$$(1.0.valueOf);

// a string of all valid unicode whitespaces
var whitespaces$5 = '\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u2000\u2001\u2002' +
  '\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';

var uncurryThis$_ = functionUncurryThis;
var requireObjectCoercible$h = requireObjectCoercible$o;
var toString$w = toString$F;
var whitespaces$4 = whitespaces$5;

var replace$8 = uncurryThis$_(''.replace);
var ltrim = RegExp('^[' + whitespaces$4 + ']+');
var rtrim = RegExp('(^|[^' + whitespaces$4 + '])[' + whitespaces$4 + ']+$');

// `String.prototype.{ trim, trimStart, trimEnd, trimLeft, trimRight }` methods implementation
var createMethod$3 = function (TYPE) {
  return function ($this) {
    var string = toString$w(requireObjectCoercible$h($this));
    if (TYPE & 1) string = replace$8(string, ltrim, '');
    if (TYPE & 2) string = replace$8(string, rtrim, '$1');
    return string;
  };
};

var stringTrim = {
  // `String.prototype.{ trimLeft, trimStart }` methods
  // https://tc39.es/ecma262/#sec-string.prototype.trimstart
  start: createMethod$3(1),
  // `String.prototype.{ trimRight, trimEnd }` methods
  // https://tc39.es/ecma262/#sec-string.prototype.trimend
  end: createMethod$3(2),
  // `String.prototype.trim` method
  // https://tc39.es/ecma262/#sec-string.prototype.trim
  trim: createMethod$3(3)
};

var $$2J = _export;
var IS_PURE$i = isPure;
var DESCRIPTORS$w = descriptors;
var globalThis$T = globalThis_1;
var path = path$2;
var uncurryThis$Z = functionUncurryThis;
var isForced$2 = isForced_1;
var hasOwn$k = hasOwnProperty_1;
var inheritIfRequired$3 = inheritIfRequired$7;
var isPrototypeOf$6 = objectIsPrototypeOf;
var isSymbol$2 = isSymbol$7;
var toPrimitive$1 = toPrimitive$4;
var fails$Z = fails$1z;
var getOwnPropertyNames$3 = objectGetOwnPropertyNames.f;
var getOwnPropertyDescriptor$9 = objectGetOwnPropertyDescriptor.f;
var defineProperty$8 = objectDefineProperty.f;
var thisNumberValue$4 = thisNumberValue$5;
var trim$2 = stringTrim.trim;

var NUMBER = 'Number';
var NativeNumber = globalThis$T[NUMBER];
path[NUMBER];
var NumberPrototype = NativeNumber.prototype;
var TypeError$6 = globalThis$T.TypeError;
var stringSlice$f = uncurryThis$Z(''.slice);
var charCodeAt$6 = uncurryThis$Z(''.charCodeAt);

// `ToNumeric` abstract operation
// https://tc39.es/ecma262/#sec-tonumeric
var toNumeric = function (value) {
  var primValue = toPrimitive$1(value, 'number');
  return typeof primValue == 'bigint' ? primValue : toNumber(primValue);
};

// `ToNumber` abstract operation
// https://tc39.es/ecma262/#sec-tonumber
var toNumber = function (argument) {
  var it = toPrimitive$1(argument, 'number');
  var first, third, radix, maxCode, digits, length, index, code;
  if (isSymbol$2(it)) throw new TypeError$6('Cannot convert a Symbol value to a number');
  if (typeof it == 'string' && it.length > 2) {
    it = trim$2(it);
    first = charCodeAt$6(it, 0);
    if (first === 43 || first === 45) {
      third = charCodeAt$6(it, 2);
      if (third === 88 || third === 120) return NaN; // Number('+0x1') should be NaN, old V8 fix
    } else if (first === 48) {
      switch (charCodeAt$6(it, 1)) {
        // fast equal of /^0b[01]+$/i
        case 66:
        case 98:
          radix = 2;
          maxCode = 49;
          break;
        // fast equal of /^0o[0-7]+$/i
        case 79:
        case 111:
          radix = 8;
          maxCode = 55;
          break;
        default:
          return +it;
      }
      digits = stringSlice$f(it, 2);
      length = digits.length;
      for (index = 0; index < length; index++) {
        code = charCodeAt$6(digits, index);
        // parseInt parses a string to a first unavailable symbol
        // but ToNumber should return NaN if a string contains unavailable symbols
        if (code < 48 || code > maxCode) return NaN;
      } return parseInt(digits, radix);
    }
  } return +it;
};

var FORCED$m = isForced$2(NUMBER, !NativeNumber(' 0o1') || !NativeNumber('0b1') || NativeNumber('+0x1'));

var calledWithNew = function (dummy) {
  // includes check on 1..constructor(foo) case
  return isPrototypeOf$6(NumberPrototype, dummy) && fails$Z(function () { thisNumberValue$4(dummy); });
};

// `Number` constructor
// https://tc39.es/ecma262/#sec-number-constructor
var NumberWrapper = function Number(value) {
  var n = arguments.length < 1 ? 0 : NativeNumber(toNumeric(value));
  return calledWithNew(this) ? inheritIfRequired$3(Object(n), this, NumberWrapper) : n;
};

NumberWrapper.prototype = NumberPrototype;
if (FORCED$m && !IS_PURE$i) NumberPrototype.constructor = NumberWrapper;

$$2J({ global: true, constructor: true, wrap: true, forced: FORCED$m }, {
  Number: NumberWrapper
});

// Use `internal/copy-constructor-properties` helper in `core-js@4`
var copyConstructorProperties$1 = function (target, source) {
  for (var keys = DESCRIPTORS$w ? getOwnPropertyNames$3(source) : (
    // ES3:
    'MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,' +
    // ES2015 (in case, if modules with ES2015 Number statics required before):
    'EPSILON,MAX_SAFE_INTEGER,MIN_SAFE_INTEGER,isFinite,isInteger,isNaN,isSafeInteger,parseFloat,parseInt,' +
    // ESNext
    'fromString,range'
  ).split(','), j = 0, key; keys.length > j; j++) {
    if (hasOwn$k(source, key = keys[j]) && !hasOwn$k(target, key)) {
      defineProperty$8(target, key, getOwnPropertyDescriptor$9(source, key));
    }
  }
};
if (FORCED$m || IS_PURE$i) copyConstructorProperties$1(path[NUMBER], NativeNumber);

var $$2I = _export;

// `Number.EPSILON` constant
// https://tc39.es/ecma262/#sec-number.epsilon
$$2I({ target: 'Number', stat: true, nonConfigurable: true, nonWritable: true }, {
  EPSILON: Math.pow(2, -52)
});

var globalThis$S = globalThis_1;

var globalIsFinite = globalThis$S.isFinite;

// `Number.isFinite` method
// https://tc39.es/ecma262/#sec-number.isfinite
// eslint-disable-next-line es/no-number-isfinite -- safe
var numberIsFinite$1 = Number.isFinite || function isFinite(it) {
  return typeof it == 'number' && globalIsFinite(it);
};

var $$2H = _export;
var numberIsFinite = numberIsFinite$1;

// `Number.isFinite` method
// https://tc39.es/ecma262/#sec-number.isfinite
$$2H({ target: 'Number', stat: true }, { isFinite: numberIsFinite });

var isObject$p = isObject$J;

var floor$6 = Math.floor;

// `IsIntegralNumber` abstract operation
// https://tc39.es/ecma262/#sec-isintegralnumber
// eslint-disable-next-line es/no-number-isinteger -- safe
var isIntegralNumber$3 = Number.isInteger || function isInteger(it) {
  return !isObject$p(it) && isFinite(it) && floor$6(it) === it;
};

var $$2G = _export;
var isIntegralNumber$2 = isIntegralNumber$3;

// `Number.isInteger` method
// https://tc39.es/ecma262/#sec-number.isinteger
$$2G({ target: 'Number', stat: true }, {
  isInteger: isIntegralNumber$2
});

var $$2F = _export;

// `Number.isNaN` method
// https://tc39.es/ecma262/#sec-number.isnan
$$2F({ target: 'Number', stat: true }, {
  isNaN: function isNaN(number) {
    // eslint-disable-next-line no-self-compare -- NaN check
    return number !== number;
  }
});

var $$2E = _export;
var isIntegralNumber$1 = isIntegralNumber$3;

var abs$1 = Math.abs;

// `Number.isSafeInteger` method
// https://tc39.es/ecma262/#sec-number.issafeinteger
$$2E({ target: 'Number', stat: true }, {
  isSafeInteger: function isSafeInteger(number) {
    return isIntegralNumber$1(number) && abs$1(number) <= 0x1FFFFFFFFFFFFF;
  }
});

var $$2D = _export;

// `Number.MAX_SAFE_INTEGER` constant
// https://tc39.es/ecma262/#sec-number.max_safe_integer
$$2D({ target: 'Number', stat: true, nonConfigurable: true, nonWritable: true }, {
  MAX_SAFE_INTEGER: 0x1FFFFFFFFFFFFF
});

var $$2C = _export;

// `Number.MIN_SAFE_INTEGER` constant
// https://tc39.es/ecma262/#sec-number.min_safe_integer
$$2C({ target: 'Number', stat: true, nonConfigurable: true, nonWritable: true }, {
  MIN_SAFE_INTEGER: -0x1FFFFFFFFFFFFF
});

var globalThis$R = globalThis_1;
var fails$Y = fails$1z;
var uncurryThis$Y = functionUncurryThis;
var toString$v = toString$F;
var trim$1 = stringTrim.trim;
var whitespaces$3 = whitespaces$5;

var charAt$f = uncurryThis$Y(''.charAt);
var $parseFloat$1 = globalThis$R.parseFloat;
var Symbol$4 = globalThis$R.Symbol;
var ITERATOR$6 = Symbol$4 && Symbol$4.iterator;
var FORCED$l = 1 / $parseFloat$1(whitespaces$3 + '-0') !== -Infinity
  // MS Edge 18- broken with boxed symbols
  || (ITERATOR$6 && !fails$Y(function () { $parseFloat$1(Object(ITERATOR$6)); }));

// `parseFloat` method
// https://tc39.es/ecma262/#sec-parsefloat-string
var numberParseFloat = FORCED$l ? function parseFloat(string) {
  var trimmedString = trim$1(toString$v(string));
  var result = $parseFloat$1(trimmedString);
  return result === 0 && charAt$f(trimmedString, 0) === '-' ? -0 : result;
} : $parseFloat$1;

var $$2B = _export;
var parseFloat$1 = numberParseFloat;

// `Number.parseFloat` method
// https://tc39.es/ecma262/#sec-number.parseFloat
// eslint-disable-next-line es/no-number-parsefloat -- required for testing
$$2B({ target: 'Number', stat: true, forced: Number.parseFloat !== parseFloat$1 }, {
  parseFloat: parseFloat$1
});

var globalThis$Q = globalThis_1;
var fails$X = fails$1z;
var uncurryThis$X = functionUncurryThis;
var toString$u = toString$F;
var trim = stringTrim.trim;
var whitespaces$2 = whitespaces$5;

var $parseInt$2 = globalThis$Q.parseInt;
var Symbol$3 = globalThis$Q.Symbol;
var ITERATOR$5 = Symbol$3 && Symbol$3.iterator;
var hex = /^[+-]?0x/i;
var exec$a = uncurryThis$X(hex.exec);
var FORCED$k = $parseInt$2(whitespaces$2 + '08') !== 8 || $parseInt$2(whitespaces$2 + '0x16') !== 22
  // MS Edge 18- broken with boxed symbols
  || (ITERATOR$5 && !fails$X(function () { $parseInt$2(Object(ITERATOR$5)); }));

// `parseInt` method
// https://tc39.es/ecma262/#sec-parseint-string-radix
var numberParseInt = FORCED$k ? function parseInt(string, radix) {
  var S = trim(toString$u(string));
  return $parseInt$2(S, (radix >>> 0) || (exec$a(hex, S) ? 16 : 10));
} : $parseInt$2;

var $$2A = _export;
var parseInt$3 = numberParseInt;

// `Number.parseInt` method
// https://tc39.es/ecma262/#sec-number.parseint
// eslint-disable-next-line es/no-number-parseint -- required for testing
$$2A({ target: 'Number', stat: true, forced: Number.parseInt !== parseInt$3 }, {
  parseInt: parseInt$3
});

var $$2z = _export;
var uncurryThis$W = functionUncurryThis;
var toIntegerOrInfinity$a = toIntegerOrInfinity$n;
var thisNumberValue$3 = thisNumberValue$5;
var $repeat$1 = stringRepeat;
var log10 = mathLog10;
var fails$W = fails$1z;

var $RangeError$7 = RangeError;
var $String$3 = String;
var $isFinite = isFinite;
var abs = Math.abs;
var floor$5 = Math.floor;
var pow$2 = Math.pow;
var round$1 = Math.round;
var nativeToExponential = uncurryThis$W(1.0.toExponential);
var repeat$2 = uncurryThis$W($repeat$1);
var stringSlice$e = uncurryThis$W(''.slice);

// Edge 17-
var ROUNDS_PROPERLY = nativeToExponential(-6.9e-11, 4) === '-6.9000e-11'
  // IE11- && Edge 14-
  && nativeToExponential(1.255, 2) === '1.25e+0'
  // FF86-, V8 ~ Chrome 49-50
  && nativeToExponential(12345, 3) === '1.235e+4'
  // FF86-, V8 ~ Chrome 49-50
  && nativeToExponential(25, 0) === '3e+1';

// IE8-
var throwsOnInfinityFraction = function () {
  return fails$W(function () {
    nativeToExponential(1, Infinity);
  }) && fails$W(function () {
    nativeToExponential(1, -Infinity);
  });
};

// Safari <11 && FF <50
var properNonFiniteThisCheck = function () {
  return !fails$W(function () {
    nativeToExponential(Infinity, Infinity);
    nativeToExponential(NaN, Infinity);
  });
};

var FORCED$j = !ROUNDS_PROPERLY || !throwsOnInfinityFraction() || !properNonFiniteThisCheck();

// `Number.prototype.toExponential` method
// https://tc39.es/ecma262/#sec-number.prototype.toexponential
$$2z({ target: 'Number', proto: true, forced: FORCED$j }, {
  toExponential: function toExponential(fractionDigits) {
    var x = thisNumberValue$3(this);
    if (fractionDigits === undefined) return nativeToExponential(x);
    var f = toIntegerOrInfinity$a(fractionDigits);
    if (!$isFinite(x)) return String(x);
    // TODO: ES2018 increased the maximum number of fraction digits to 100, need to improve the implementation
    if (f < 0 || f > 20) throw new $RangeError$7('Incorrect fraction digits');
    if (ROUNDS_PROPERLY) return nativeToExponential(x, f);
    var s = '';
    var m, e, c, d;
    if (x < 0) {
      s = '-';
      x = -x;
    }
    if (x === 0) {
      e = 0;
      m = repeat$2('0', f + 1);
    } else {
      // this block is based on https://gist.github.com/SheetJSDev/1100ad56b9f856c95299ed0e068eea08
      // TODO: improve accuracy with big fraction digits
      var l = log10(x);
      e = floor$5(l);
      var w = pow$2(10, e - f);
      var n = round$1(x / w);
      if (2 * x >= (2 * n + 1) * w) {
        n += 1;
      }
      if (n >= pow$2(10, f + 1)) {
        n /= 10;
        e += 1;
      }
      m = $String$3(n);
    }
    if (f !== 0) {
      m = stringSlice$e(m, 0, 1) + '.' + stringSlice$e(m, 1);
    }
    if (e === 0) {
      c = '+';
      d = '0';
    } else {
      c = e > 0 ? '+' : '-';
      d = $String$3(abs(e));
    }
    m += 'e' + c + d;
    return s + m;
  }
});

var $$2y = _export;
var uncurryThis$V = functionUncurryThis;
var toIntegerOrInfinity$9 = toIntegerOrInfinity$n;
var thisNumberValue$2 = thisNumberValue$5;
var $repeat = stringRepeat;
var fails$V = fails$1z;

var $RangeError$6 = RangeError;
var $String$2 = String;
var floor$4 = Math.floor;
var repeat$1 = uncurryThis$V($repeat);
var stringSlice$d = uncurryThis$V(''.slice);
var nativeToFixed = uncurryThis$V(1.0.toFixed);

var pow$1 = function (x, n, acc) {
  return n === 0 ? acc : n % 2 === 1 ? pow$1(x, n - 1, acc * x) : pow$1(x * x, n / 2, acc);
};

var log = function (x) {
  var n = 0;
  var x2 = x;
  while (x2 >= 4096) {
    n += 12;
    x2 /= 4096;
  }
  while (x2 >= 2) {
    n += 1;
    x2 /= 2;
  } return n;
};

var multiply = function (data, n, c) {
  var index = -1;
  var c2 = c;
  while (++index < 6) {
    c2 += n * data[index];
    data[index] = c2 % 1e7;
    c2 = floor$4(c2 / 1e7);
  }
};

var divide = function (data, n) {
  var index = 6;
  var c = 0;
  while (--index >= 0) {
    c += data[index];
    data[index] = floor$4(c / n);
    c = (c % n) * 1e7;
  }
};

var dataToString = function (data) {
  var index = 6;
  var s = '';
  while (--index >= 0) {
    if (s !== '' || index === 0 || data[index] !== 0) {
      var t = $String$2(data[index]);
      s = s === '' ? t : s + repeat$1('0', 7 - t.length) + t;
    }
  } return s;
};

var FORCED$i = fails$V(function () {
  return nativeToFixed(0.00008, 3) !== '0.000' ||
    nativeToFixed(0.9, 0) !== '1' ||
    nativeToFixed(1.255, 2) !== '1.25' ||
    nativeToFixed(1000000000000000128.0, 0) !== '1000000000000000128';
}) || !fails$V(function () {
  // V8 ~ Android 4.3-
  nativeToFixed({});
});

// `Number.prototype.toFixed` method
// https://tc39.es/ecma262/#sec-number.prototype.tofixed
$$2y({ target: 'Number', proto: true, forced: FORCED$i }, {
  toFixed: function toFixed(fractionDigits) {
    var number = thisNumberValue$2(this);
    var fractDigits = toIntegerOrInfinity$9(fractionDigits);
    var data = [0, 0, 0, 0, 0, 0];
    var sign = '';
    var result = '0';
    var e, z, j, k;

    // TODO: ES2018 increased the maximum number of fraction digits to 100, need to improve the implementation
    if (fractDigits < 0 || fractDigits > 20) throw new $RangeError$6('Incorrect fraction digits');
    // eslint-disable-next-line no-self-compare -- NaN check
    if (number !== number) return 'NaN';
    if (number <= -1e21 || number >= 1e21) return $String$2(number);
    if (number < 0) {
      sign = '-';
      number = -number;
    }
    if (number > 1e-21) {
      e = log(number * pow$1(2, 69, 1)) - 69;
      z = e < 0 ? number * pow$1(2, -e, 1) : number / pow$1(2, e, 1);
      z *= 0x10000000000000;
      e = 52 - e;
      if (e > 0) {
        multiply(data, 0, z);
        j = fractDigits;
        while (j >= 7) {
          multiply(data, 1e7, 0);
          j -= 7;
        }
        multiply(data, pow$1(10, j, 1), 0);
        j = e - 1;
        while (j >= 23) {
          divide(data, 1 << 23);
          j -= 23;
        }
        divide(data, 1 << j);
        multiply(data, 1, 1);
        divide(data, 2);
        result = dataToString(data);
      } else {
        multiply(data, 0, z);
        multiply(data, 1 << -e, 0);
        result = dataToString(data) + repeat$1('0', fractDigits);
      }
    }
    if (fractDigits > 0) {
      k = result.length;
      result = sign + (k <= fractDigits
        ? '0.' + repeat$1('0', fractDigits - k) + result
        : stringSlice$d(result, 0, k - fractDigits) + '.' + stringSlice$d(result, k - fractDigits));
    } else {
      result = sign + result;
    } return result;
  }
});

var $$2x = _export;
var uncurryThis$U = functionUncurryThis;
var fails$U = fails$1z;
var thisNumberValue$1 = thisNumberValue$5;

var nativeToPrecision = uncurryThis$U(1.0.toPrecision);

var FORCED$h = fails$U(function () {
  // IE7-
  return nativeToPrecision(1, undefined) !== '1';
}) || !fails$U(function () {
  // V8 ~ Android 4.3-
  nativeToPrecision({});
});

// `Number.prototype.toPrecision` method
// https://tc39.es/ecma262/#sec-number.prototype.toprecision
$$2x({ target: 'Number', proto: true, forced: FORCED$h }, {
  toPrecision: function toPrecision(precision) {
    return precision === undefined
      ? nativeToPrecision(thisNumberValue$1(this))
      : nativeToPrecision(thisNumberValue$1(this), precision);
  }
});

var DESCRIPTORS$v = descriptors;
var uncurryThis$T = functionUncurryThis;
var call$T = functionCall;
var fails$T = fails$1z;
var objectKeys$2 = objectKeys$5;
var getOwnPropertySymbolsModule = objectGetOwnPropertySymbols;
var propertyIsEnumerableModule = objectPropertyIsEnumerable;
var toObject$f = toObject$y;
var IndexedObject$2 = indexedObject;

// eslint-disable-next-line es/no-object-assign -- safe
var $assign = Object.assign;
// eslint-disable-next-line es/no-object-defineproperty -- required for testing
var defineProperty$7 = Object.defineProperty;
var concat$1 = uncurryThis$T([].concat);

// `Object.assign` method
// https://tc39.es/ecma262/#sec-object.assign
var objectAssign = !$assign || fails$T(function () {
  // should have correct order of operations (Edge bug)
  if (DESCRIPTORS$v && $assign({ b: 1 }, $assign(defineProperty$7({}, 'a', {
    enumerable: true,
    get: function () {
      defineProperty$7(this, 'b', {
        value: 3,
        enumerable: false
      });
    }
  }), { b: 2 })).b !== 1) return true;
  // should work with symbols and should have deterministic property order (V8 bug)
  var A = {};
  var B = {};
  // eslint-disable-next-line es/no-symbol -- safe
  var symbol = Symbol('assign detection');
  var alphabet = 'abcdefghijklmnopqrst';
  A[symbol] = 7;
  alphabet.split('').forEach(function (chr) { B[chr] = chr; });
  return $assign({}, A)[symbol] !== 7 || objectKeys$2($assign({}, B)).join('') !== alphabet;
}) ? function assign(target, source) { // eslint-disable-line no-unused-vars -- required for `.length`
  var T = toObject$f(target);
  var argumentsLength = arguments.length;
  var index = 1;
  var getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
  var propertyIsEnumerable = propertyIsEnumerableModule.f;
  while (argumentsLength > index) {
    var S = IndexedObject$2(arguments[index++]);
    var keys = getOwnPropertySymbols ? concat$1(objectKeys$2(S), getOwnPropertySymbols(S)) : objectKeys$2(S);
    var length = keys.length;
    var j = 0;
    var key;
    while (length > j) {
      key = keys[j++];
      if (!DESCRIPTORS$v || call$T(propertyIsEnumerable, S, key)) T[key] = S[key];
    }
  } return T;
} : $assign;

var $$2w = _export;
var assign$1 = objectAssign;

// `Object.assign` method
// https://tc39.es/ecma262/#sec-object.assign
// eslint-disable-next-line es/no-object-assign -- required for testing
$$2w({ target: 'Object', stat: true, arity: 2, forced: Object.assign !== assign$1 }, {
  assign: assign$1
});

// TODO: Remove from `core-js@4`
var $$2v = _export;
var DESCRIPTORS$u = descriptors;
var create$c = objectCreate$1;

// `Object.create` method
// https://tc39.es/ecma262/#sec-object.create
$$2v({ target: 'Object', stat: true, sham: !DESCRIPTORS$u }, {
  create: create$c
});

var globalThis$P = globalThis_1;
var fails$S = fails$1z;
var WEBKIT$1 = environmentWebkitVersion;

// Forced replacement object prototype accessors methods
var objectPrototypeAccessorsForced = !fails$S(function () {
  // This feature detection crashes old WebKit
  // https://github.com/zloirock/core-js/issues/232
  if (WEBKIT$1 && WEBKIT$1 < 535) return;
  var key = Math.random();
  // In FF throws only define methods
  // eslint-disable-next-line no-undef, no-useless-call, es/no-legacy-object-prototype-accessor-methods -- required for testing
  __defineSetter__.call(null, key, function () { /* empty */ });
  delete globalThis$P[key];
});

var $$2u = _export;
var DESCRIPTORS$t = descriptors;
var FORCED$g = objectPrototypeAccessorsForced;
var aCallable$u = aCallable$F;
var toObject$e = toObject$y;
var definePropertyModule$4 = objectDefineProperty;

// `Object.prototype.__defineGetter__` method
// https://tc39.es/ecma262/#sec-object.prototype.__defineGetter__
if (DESCRIPTORS$t) {
  $$2u({ target: 'Object', proto: true, forced: FORCED$g }, {
    __defineGetter__: function __defineGetter__(P, getter) {
      definePropertyModule$4.f(toObject$e(this), P, { get: aCallable$u(getter), enumerable: true, configurable: true });
    }
  });
}

var $$2t = _export;
var DESCRIPTORS$s = descriptors;
var defineProperties = objectDefineProperties.f;

// `Object.defineProperties` method
// https://tc39.es/ecma262/#sec-object.defineproperties
// eslint-disable-next-line es/no-object-defineproperties -- safe
$$2t({ target: 'Object', stat: true, forced: Object.defineProperties !== defineProperties, sham: !DESCRIPTORS$s }, {
  defineProperties: defineProperties
});

var $$2s = _export;
var DESCRIPTORS$r = descriptors;
var defineProperty$6 = objectDefineProperty.f;

// `Object.defineProperty` method
// https://tc39.es/ecma262/#sec-object.defineproperty
// eslint-disable-next-line es/no-object-defineproperty -- safe
$$2s({ target: 'Object', stat: true, forced: Object.defineProperty !== defineProperty$6, sham: !DESCRIPTORS$r }, {
  defineProperty: defineProperty$6
});

var $$2r = _export;
var DESCRIPTORS$q = descriptors;
var FORCED$f = objectPrototypeAccessorsForced;
var aCallable$t = aCallable$F;
var toObject$d = toObject$y;
var definePropertyModule$3 = objectDefineProperty;

// `Object.prototype.__defineSetter__` method
// https://tc39.es/ecma262/#sec-object.prototype.__defineSetter__
if (DESCRIPTORS$q) {
  $$2r({ target: 'Object', proto: true, forced: FORCED$f }, {
    __defineSetter__: function __defineSetter__(P, setter) {
      definePropertyModule$3.f(toObject$d(this), P, { set: aCallable$t(setter), enumerable: true, configurable: true });
    }
  });
}

var DESCRIPTORS$p = descriptors;
var fails$R = fails$1z;
var uncurryThis$S = functionUncurryThis;
var objectGetPrototypeOf$1 = objectGetPrototypeOf$2;
var objectKeys$1 = objectKeys$5;
var toIndexedObject$4 = toIndexedObject$j;
var $propertyIsEnumerable = objectPropertyIsEnumerable.f;

var propertyIsEnumerable = uncurryThis$S($propertyIsEnumerable);
var push$g = uncurryThis$S([].push);

// in some IE versions, `propertyIsEnumerable` returns incorrect result on integer keys
// of `null` prototype objects
var IE_BUG = DESCRIPTORS$p && fails$R(function () {
  // eslint-disable-next-line es/no-object-create -- safe
  var O = Object.create(null);
  O[2] = 2;
  return !propertyIsEnumerable(O, 2);
});

// `Object.{ entries, values }` methods implementation
var createMethod$2 = function (TO_ENTRIES) {
  return function (it) {
    var O = toIndexedObject$4(it);
    var keys = objectKeys$1(O);
    var IE_WORKAROUND = IE_BUG && objectGetPrototypeOf$1(O) === null;
    var length = keys.length;
    var i = 0;
    var result = [];
    var key;
    while (length > i) {
      key = keys[i++];
      if (!DESCRIPTORS$p || (IE_WORKAROUND ? key in O : propertyIsEnumerable(O, key))) {
        push$g(result, TO_ENTRIES ? [key, O[key]] : O[key]);
      }
    }
    return result;
  };
};

var objectToArray = {
  // `Object.entries` method
  // https://tc39.es/ecma262/#sec-object.entries
  entries: createMethod$2(true),
  // `Object.values` method
  // https://tc39.es/ecma262/#sec-object.values
  values: createMethod$2(false)
};

var $$2q = _export;
var $entries = objectToArray.entries;

// `Object.entries` method
// https://tc39.es/ecma262/#sec-object.entries
$$2q({ target: 'Object', stat: true }, {
  entries: function entries(O) {
    return $entries(O);
  }
});

var $$2p = _export;
var FREEZING$5 = freezing;
var fails$Q = fails$1z;
var isObject$o = isObject$J;
var onFreeze$2 = internalMetadataExports.onFreeze;

// eslint-disable-next-line es/no-object-freeze -- safe
var $freeze = Object.freeze;
var FAILS_ON_PRIMITIVES$5 = fails$Q(function () { $freeze(1); });

// `Object.freeze` method
// https://tc39.es/ecma262/#sec-object.freeze
$$2p({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES$5, sham: !FREEZING$5 }, {
  freeze: function freeze(it) {
    return $freeze && isObject$o(it) ? $freeze(onFreeze$2(it)) : it;
  }
});

var $$2o = _export;
var iterate$f = iterate$k;
var createProperty$5 = createProperty$b;

// `Object.fromEntries` method
// https://github.com/tc39/proposal-object-from-entries
$$2o({ target: 'Object', stat: true }, {
  fromEntries: function fromEntries(iterable) {
    var obj = {};
    iterate$f(iterable, function (k, v) {
      createProperty$5(obj, k, v);
    }, { AS_ENTRIES: true });
    return obj;
  }
});

var $$2n = _export;
var fails$P = fails$1z;
var toIndexedObject$3 = toIndexedObject$j;
var nativeGetOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;
var DESCRIPTORS$o = descriptors;

var FORCED$e = !DESCRIPTORS$o || fails$P(function () { nativeGetOwnPropertyDescriptor$1(1); });

// `Object.getOwnPropertyDescriptor` method
// https://tc39.es/ecma262/#sec-object.getownpropertydescriptor
$$2n({ target: 'Object', stat: true, forced: FORCED$e, sham: !DESCRIPTORS$o }, {
  getOwnPropertyDescriptor: function getOwnPropertyDescriptor(it, key) {
    return nativeGetOwnPropertyDescriptor$1(toIndexedObject$3(it), key);
  }
});

var $$2m = _export;
var DESCRIPTORS$n = descriptors;
var ownKeys$1 = ownKeys$3;
var toIndexedObject$2 = toIndexedObject$j;
var getOwnPropertyDescriptorModule$4 = objectGetOwnPropertyDescriptor;
var createProperty$4 = createProperty$b;

// `Object.getOwnPropertyDescriptors` method
// https://tc39.es/ecma262/#sec-object.getownpropertydescriptors
$$2m({ target: 'Object', stat: true, sham: !DESCRIPTORS$n }, {
  getOwnPropertyDescriptors: function getOwnPropertyDescriptors(object) {
    var O = toIndexedObject$2(object);
    var getOwnPropertyDescriptor = getOwnPropertyDescriptorModule$4.f;
    var keys = ownKeys$1(O);
    var result = {};
    var index = 0;
    var key, descriptor;
    while (keys.length > index) {
      descriptor = getOwnPropertyDescriptor(O, key = keys[index++]);
      if (descriptor !== undefined) createProperty$4(result, key, descriptor);
    }
    return result;
  }
});

var $$2l = _export;
var fails$O = fails$1z;
var getOwnPropertyNames$2 = objectGetOwnPropertyNamesExternal.f;

// eslint-disable-next-line es/no-object-getownpropertynames -- required for testing
var FAILS_ON_PRIMITIVES$4 = fails$O(function () { return !Object.getOwnPropertyNames(1); });

// `Object.getOwnPropertyNames` method
// https://tc39.es/ecma262/#sec-object.getownpropertynames
$$2l({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES$4 }, {
  getOwnPropertyNames: getOwnPropertyNames$2
});

var $$2k = _export;
var fails$N = fails$1z;
var toObject$c = toObject$y;
var nativeGetPrototypeOf = objectGetPrototypeOf$2;
var CORRECT_PROTOTYPE_GETTER$1 = correctPrototypeGetter;

var FAILS_ON_PRIMITIVES$3 = fails$N(function () { nativeGetPrototypeOf(1); });

// `Object.getPrototypeOf` method
// https://tc39.es/ecma262/#sec-object.getprototypeof
$$2k({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES$3, sham: !CORRECT_PROTOTYPE_GETTER$1 }, {
  getPrototypeOf: function getPrototypeOf(it) {
    return nativeGetPrototypeOf(toObject$c(it));
  }
});

var $$2j = _export;
var getBuiltIn$q = getBuiltIn$C;
var uncurryThis$R = functionUncurryThis;
var aCallable$s = aCallable$F;
var requireObjectCoercible$g = requireObjectCoercible$o;
var toPropertyKey$5 = toPropertyKey$9;
var iterate$e = iterate$k;
var fails$M = fails$1z;

// eslint-disable-next-line es/no-object-groupby -- testing
var nativeGroupBy = Object.groupBy;
var create$b = getBuiltIn$q('Object', 'create');
var push$f = uncurryThis$R([].push);

var DOES_NOT_WORK_WITH_PRIMITIVES = !nativeGroupBy || fails$M(function () {
  return nativeGroupBy('ab', function (it) {
    return it;
  }).a.length !== 1;
});

// `Object.groupBy` method
// https://github.com/tc39/proposal-array-grouping
$$2j({ target: 'Object', stat: true, forced: DOES_NOT_WORK_WITH_PRIMITIVES }, {
  groupBy: function groupBy(items, callbackfn) {
    requireObjectCoercible$g(items);
    aCallable$s(callbackfn);
    var obj = create$b(null);
    var k = 0;
    iterate$e(items, function (value) {
      var key = toPropertyKey$5(callbackfn(value, k++));
      // in some IE versions, `hasOwnProperty` returns incorrect result on integer keys
      // but since it's a `null` prototype object, we can safely use `in`
      if (key in obj) push$f(obj[key], value);
      else obj[key] = [value];
    });
    return obj;
  }
});

var $$2i = _export;
var hasOwn$j = hasOwnProperty_1;

// `Object.hasOwn` method
// https://tc39.es/ecma262/#sec-object.hasown
$$2i({ target: 'Object', stat: true }, {
  hasOwn: hasOwn$j
});

// `SameValue` abstract operation
// https://tc39.es/ecma262/#sec-samevalue
// eslint-disable-next-line es/no-object-is -- safe
var sameValue$1 = Object.is || function is(x, y) {
  // eslint-disable-next-line no-self-compare -- NaN check
  return x === y ? x !== 0 || 1 / x === 1 / y : x !== x && y !== y;
};

var $$2h = _export;
var is = sameValue$1;

// `Object.is` method
// https://tc39.es/ecma262/#sec-object.is
$$2h({ target: 'Object', stat: true }, {
  is: is
});

var $$2g = _export;
var $isExtensible$1 = objectIsExtensible;

// `Object.isExtensible` method
// https://tc39.es/ecma262/#sec-object.isextensible
// eslint-disable-next-line es/no-object-isextensible -- safe
$$2g({ target: 'Object', stat: true, forced: Object.isExtensible !== $isExtensible$1 }, {
  isExtensible: $isExtensible$1
});

var $$2f = _export;
var fails$L = fails$1z;
var isObject$n = isObject$J;
var classof$e = classofRaw$2;
var ARRAY_BUFFER_NON_EXTENSIBLE$1 = arrayBufferNonExtensible;

// eslint-disable-next-line es/no-object-isfrozen -- safe
var $isFrozen = Object.isFrozen;

var FORCED$d = ARRAY_BUFFER_NON_EXTENSIBLE$1 || fails$L(function () { $isFrozen(1); });

// `Object.isFrozen` method
// https://tc39.es/ecma262/#sec-object.isfrozen
$$2f({ target: 'Object', stat: true, forced: FORCED$d }, {
  isFrozen: function isFrozen(it) {
    if (!isObject$n(it)) return true;
    if (ARRAY_BUFFER_NON_EXTENSIBLE$1 && classof$e(it) === 'ArrayBuffer') return true;
    return $isFrozen ? $isFrozen(it) : false;
  }
});

var $$2e = _export;
var fails$K = fails$1z;
var isObject$m = isObject$J;
var classof$d = classofRaw$2;
var ARRAY_BUFFER_NON_EXTENSIBLE = arrayBufferNonExtensible;

// eslint-disable-next-line es/no-object-issealed -- safe
var $isSealed = Object.isSealed;

var FORCED$c = ARRAY_BUFFER_NON_EXTENSIBLE || fails$K(function () { $isSealed(1); });

// `Object.isSealed` method
// https://tc39.es/ecma262/#sec-object.issealed
$$2e({ target: 'Object', stat: true, forced: FORCED$c }, {
  isSealed: function isSealed(it) {
    if (!isObject$m(it)) return true;
    if (ARRAY_BUFFER_NON_EXTENSIBLE && classof$d(it) === 'ArrayBuffer') return true;
    return $isSealed ? $isSealed(it) : false;
  }
});

var $$2d = _export;
var toObject$b = toObject$y;
var nativeKeys = objectKeys$5;
var fails$J = fails$1z;

var FAILS_ON_PRIMITIVES$2 = fails$J(function () { nativeKeys(1); });

// `Object.keys` method
// https://tc39.es/ecma262/#sec-object.keys
$$2d({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES$2 }, {
  keys: function keys(it) {
    return nativeKeys(toObject$b(it));
  }
});

var $$2c = _export;
var DESCRIPTORS$m = descriptors;
var FORCED$b = objectPrototypeAccessorsForced;
var toObject$a = toObject$y;
var toPropertyKey$4 = toPropertyKey$9;
var getPrototypeOf$8 = objectGetPrototypeOf$2;
var getOwnPropertyDescriptor$8 = objectGetOwnPropertyDescriptor.f;

// `Object.prototype.__lookupGetter__` method
// https://tc39.es/ecma262/#sec-object.prototype.__lookupGetter__
if (DESCRIPTORS$m) {
  $$2c({ target: 'Object', proto: true, forced: FORCED$b }, {
    __lookupGetter__: function __lookupGetter__(P) {
      var O = toObject$a(this);
      var key = toPropertyKey$4(P);
      var desc;
      do {
        if (desc = getOwnPropertyDescriptor$8(O, key)) return desc.get;
      } while (O = getPrototypeOf$8(O));
    }
  });
}

var $$2b = _export;
var DESCRIPTORS$l = descriptors;
var FORCED$a = objectPrototypeAccessorsForced;
var toObject$9 = toObject$y;
var toPropertyKey$3 = toPropertyKey$9;
var getPrototypeOf$7 = objectGetPrototypeOf$2;
var getOwnPropertyDescriptor$7 = objectGetOwnPropertyDescriptor.f;

// `Object.prototype.__lookupSetter__` method
// https://tc39.es/ecma262/#sec-object.prototype.__lookupSetter__
if (DESCRIPTORS$l) {
  $$2b({ target: 'Object', proto: true, forced: FORCED$a }, {
    __lookupSetter__: function __lookupSetter__(P) {
      var O = toObject$9(this);
      var key = toPropertyKey$3(P);
      var desc;
      do {
        if (desc = getOwnPropertyDescriptor$7(O, key)) return desc.set;
      } while (O = getPrototypeOf$7(O));
    }
  });
}

var $$2a = _export;
var isObject$l = isObject$J;
var onFreeze$1 = internalMetadataExports.onFreeze;
var FREEZING$4 = freezing;
var fails$I = fails$1z;

// eslint-disable-next-line es/no-object-preventextensions -- safe
var $preventExtensions = Object.preventExtensions;
var FAILS_ON_PRIMITIVES$1 = fails$I(function () { $preventExtensions(1); });

// `Object.preventExtensions` method
// https://tc39.es/ecma262/#sec-object.preventextensions
$$2a({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES$1, sham: !FREEZING$4 }, {
  preventExtensions: function preventExtensions(it) {
    return $preventExtensions && isObject$l(it) ? $preventExtensions(onFreeze$1(it)) : it;
  }
});

var DESCRIPTORS$k = descriptors;
var defineBuiltInAccessor$c = defineBuiltInAccessor$l;
var isObject$k = isObject$J;
var isPossiblePrototype = isPossiblePrototype$2;
var toObject$8 = toObject$y;
var requireObjectCoercible$f = requireObjectCoercible$o;

// eslint-disable-next-line es/no-object-getprototypeof -- safe
var getPrototypeOf$6 = Object.getPrototypeOf;
// eslint-disable-next-line es/no-object-setprototypeof -- safe
var setPrototypeOf$4 = Object.setPrototypeOf;
var ObjectPrototype$1 = Object.prototype;
var PROTO = '__proto__';

// `Object.prototype.__proto__` accessor
// https://tc39.es/ecma262/#sec-object.prototype.__proto__
if (DESCRIPTORS$k && getPrototypeOf$6 && setPrototypeOf$4 && !(PROTO in ObjectPrototype$1)) try {
  defineBuiltInAccessor$c(ObjectPrototype$1, PROTO, {
    configurable: true,
    get: function __proto__() {
      return getPrototypeOf$6(toObject$8(this));
    },
    set: function __proto__(proto) {
      var O = requireObjectCoercible$f(this);
      if (isPossiblePrototype(proto) && isObject$k(O)) {
        setPrototypeOf$4(O, proto);
      }
    }
  });
} catch (error) { /* empty */ }

var $$29 = _export;
var isObject$j = isObject$J;
var onFreeze = internalMetadataExports.onFreeze;
var FREEZING$3 = freezing;
var fails$H = fails$1z;

// eslint-disable-next-line es/no-object-seal -- safe
var $seal = Object.seal;
var FAILS_ON_PRIMITIVES = fails$H(function () { $seal(1); });

// `Object.seal` method
// https://tc39.es/ecma262/#sec-object.seal
$$29({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES, sham: !FREEZING$3 }, {
  seal: function seal(it) {
    return $seal && isObject$j(it) ? $seal(onFreeze(it)) : it;
  }
});

var $$28 = _export;
var setPrototypeOf$3 = objectSetPrototypeOf$1;

// `Object.setPrototypeOf` method
// https://tc39.es/ecma262/#sec-object.setprototypeof
$$28({ target: 'Object', stat: true }, {
  setPrototypeOf: setPrototypeOf$3
});

var TO_STRING_TAG_SUPPORT$1 = toStringTagSupport;
var classof$c = classof$p;

// `Object.prototype.toString` method implementation
// https://tc39.es/ecma262/#sec-object.prototype.tostring
var objectToString = TO_STRING_TAG_SUPPORT$1 ? {}.toString : function toString() {
  return '[object ' + classof$c(this) + ']';
};

var TO_STRING_TAG_SUPPORT = toStringTagSupport;
var defineBuiltIn$h = defineBuiltIn$t;
var toString$t = objectToString;

// `Object.prototype.toString` method
// https://tc39.es/ecma262/#sec-object.prototype.tostring
if (!TO_STRING_TAG_SUPPORT) {
  defineBuiltIn$h(Object.prototype, 'toString', toString$t, { unsafe: true });
}

var $$27 = _export;
var $values = objectToArray.values;

// `Object.values` method
// https://tc39.es/ecma262/#sec-object.values
$$27({ target: 'Object', stat: true }, {
  values: function values(O) {
    return $values(O);
  }
});

var $$26 = _export;
var $parseFloat = numberParseFloat;

// `parseFloat` method
// https://tc39.es/ecma262/#sec-parsefloat-string
$$26({ global: true, forced: parseFloat !== $parseFloat }, {
  parseFloat: $parseFloat
});

var $$25 = _export;
var $parseInt$1 = numberParseInt;

// `parseInt` method
// https://tc39.es/ecma262/#sec-parseint-string-radix
$$25({ global: true, forced: parseInt !== $parseInt$1 }, {
  parseInt: $parseInt$1
});

var $TypeError$j = TypeError;

var validateArgumentsLength$c = function (passed, required) {
  if (passed < required) throw new $TypeError$j('Not enough arguments');
  return passed;
};

var userAgent$3 = environmentUserAgent;

// eslint-disable-next-line redos/no-vulnerable -- safe
var environmentIsIos = /(?:ipad|iphone|ipod).*applewebkit/i.test(userAgent$3);

var globalThis$O = globalThis_1;
var apply$6 = functionApply$1;
var bind$a = functionBindContext;
var isCallable$g = isCallable$D;
var hasOwn$i = hasOwnProperty_1;
var fails$G = fails$1z;
var html = html$2;
var arraySlice$4 = arraySlice$a;
var createElement = documentCreateElement$2;
var validateArgumentsLength$b = validateArgumentsLength$c;
var IS_IOS$1 = environmentIsIos;
var IS_NODE$2 = environmentIsNode;

var set$1 = globalThis$O.setImmediate;
var clear = globalThis$O.clearImmediate;
var process$2 = globalThis$O.process;
var Dispatch = globalThis$O.Dispatch;
var Function$2 = globalThis$O.Function;
var MessageChannel = globalThis$O.MessageChannel;
var String$1 = globalThis$O.String;
var counter = 0;
var queue$2 = {};
var ONREADYSTATECHANGE = 'onreadystatechange';
var $location, defer, channel, port;

fails$G(function () {
  // Deno throws a ReferenceError on `location` access without `--location` flag
  $location = globalThis$O.location;
});

var run = function (id) {
  if (hasOwn$i(queue$2, id)) {
    var fn = queue$2[id];
    delete queue$2[id];
    fn();
  }
};

var runner = function (id) {
  return function () {
    run(id);
  };
};

var eventListener = function (event) {
  run(event.data);
};

var globalPostMessageDefer = function (id) {
  // old engines have not location.origin
  globalThis$O.postMessage(String$1(id), $location.protocol + '//' + $location.host);
};

// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if (!set$1 || !clear) {
  set$1 = function setImmediate(handler) {
    validateArgumentsLength$b(arguments.length, 1);
    var fn = isCallable$g(handler) ? handler : Function$2(handler);
    var args = arraySlice$4(arguments, 1);
    queue$2[++counter] = function () {
      apply$6(fn, undefined, args);
    };
    defer(counter);
    return counter;
  };
  clear = function clearImmediate(id) {
    delete queue$2[id];
  };
  // Node.js 0.8-
  if (IS_NODE$2) {
    defer = function (id) {
      process$2.nextTick(runner(id));
    };
  // Sphere (JS game engine) Dispatch API
  } else if (Dispatch && Dispatch.now) {
    defer = function (id) {
      Dispatch.now(runner(id));
    };
  // Browsers with MessageChannel, includes WebWorkers
  // except iOS - https://github.com/zloirock/core-js/issues/624
  } else if (MessageChannel && !IS_IOS$1) {
    channel = new MessageChannel();
    port = channel.port2;
    channel.port1.onmessage = eventListener;
    defer = bind$a(port.postMessage, port);
  // Browsers with postMessage, skip WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
  } else if (
    globalThis$O.addEventListener &&
    isCallable$g(globalThis$O.postMessage) &&
    !globalThis$O.importScripts &&
    $location && $location.protocol !== 'file:' &&
    !fails$G(globalPostMessageDefer)
  ) {
    defer = globalPostMessageDefer;
    globalThis$O.addEventListener('message', eventListener, false);
  // IE8-
  } else if (ONREADYSTATECHANGE in createElement('script')) {
    defer = function (id) {
      html.appendChild(createElement('script'))[ONREADYSTATECHANGE] = function () {
        html.removeChild(this);
        run(id);
      };
    };
  // Rest old browsers
  } else {
    defer = function (id) {
      setTimeout(runner(id), 0);
    };
  }
}

var task$1 = {
  set: set$1,
  clear: clear
};

var globalThis$N = globalThis_1;
var DESCRIPTORS$j = descriptors;

// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var getOwnPropertyDescriptor$6 = Object.getOwnPropertyDescriptor;

// Avoid NodeJS experimental warning
var safeGetBuiltIn$2 = function (name) {
  if (!DESCRIPTORS$j) return globalThis$N[name];
  var descriptor = getOwnPropertyDescriptor$6(globalThis$N, name);
  return descriptor && descriptor.value;
};

var Queue$2 = function () {
  this.head = null;
  this.tail = null;
};

Queue$2.prototype = {
  add: function (item) {
    var entry = { item: item, next: null };
    var tail = this.tail;
    if (tail) tail.next = entry;
    else this.head = entry;
    this.tail = entry;
  },
  get: function () {
    var entry = this.head;
    if (entry) {
      var next = this.head = entry.next;
      if (next === null) this.tail = null;
      return entry.item;
    }
  }
};

var queue$1 = Queue$2;

var userAgent$2 = environmentUserAgent;

var environmentIsIosPebble = /ipad|iphone|ipod/i.test(userAgent$2) && typeof Pebble != 'undefined';

var userAgent$1 = environmentUserAgent;

var environmentIsWebosWebkit = /web0s(?!.*chrome)/i.test(userAgent$1);

var globalThis$M = globalThis_1;
var safeGetBuiltIn$1 = safeGetBuiltIn$2;
var bind$9 = functionBindContext;
var macrotask = task$1.set;
var Queue$1 = queue$1;
var IS_IOS = environmentIsIos;
var IS_IOS_PEBBLE = environmentIsIosPebble;
var IS_WEBOS_WEBKIT = environmentIsWebosWebkit;
var IS_NODE$1 = environmentIsNode;

var MutationObserver = globalThis$M.MutationObserver || globalThis$M.WebKitMutationObserver;
var document$2 = globalThis$M.document;
var process$1 = globalThis$M.process;
var Promise$7 = globalThis$M.Promise;
var microtask$2 = safeGetBuiltIn$1('queueMicrotask');
var notify$1, toggle, node, promise, then;

// modern engines have queueMicrotask method
if (!microtask$2) {
  var queue = new Queue$1();

  var flush = function () {
    var parent, fn;
    if (IS_NODE$1 && (parent = process$1.domain)) parent.exit();
    while (fn = queue.get()) try {
      fn();
    } catch (error) {
      if (queue.head) notify$1();
      throw error;
    }
    if (parent) parent.enter();
  };

  // browsers with MutationObserver, except iOS - https://github.com/zloirock/core-js/issues/339
  // also except WebOS Webkit https://github.com/zloirock/core-js/issues/898
  if (!IS_IOS && !IS_NODE$1 && !IS_WEBOS_WEBKIT && MutationObserver && document$2) {
    toggle = true;
    node = document$2.createTextNode('');
    new MutationObserver(flush).observe(node, { characterData: true });
    notify$1 = function () {
      node.data = toggle = !toggle;
    };
  // environments with maybe non-completely correct, but existent Promise
  } else if (!IS_IOS_PEBBLE && Promise$7 && Promise$7.resolve) {
    // Promise.resolve without an argument throws an error in LG WebOS 2
    promise = Promise$7.resolve(undefined);
    // workaround of WebKit ~ iOS Safari 10.1 bug
    promise.constructor = Promise$7;
    then = bind$9(promise.then, promise);
    notify$1 = function () {
      then(flush);
    };
  // Node.js without promises
  } else if (IS_NODE$1) {
    notify$1 = function () {
      process$1.nextTick(flush);
    };
  // for other environments - macrotask based on:
  // - setImmediate
  // - MessageChannel
  // - window.postMessage
  // - onreadystatechange
  // - setTimeout
  } else {
    // `webpack` dev server bug on IE global methods - use bind(fn, global)
    macrotask = bind$9(macrotask, globalThis$M);
    notify$1 = function () {
      macrotask(flush);
    };
  }

  microtask$2 = function (fn) {
    if (!queue.head) notify$1();
    queue.add(fn);
  };
}

var microtask_1 = microtask$2;

var hostReportErrors$1 = function (a, b) {
  try {
    // eslint-disable-next-line no-console -- safe
    arguments.length === 1 ? console.error(a) : console.error(a, b);
  } catch (error) { /* empty */ }
};

var perform$7 = function (exec) {
  try {
    return { error: false, value: exec() };
  } catch (error) {
    return { error: true, value: error };
  }
};

var globalThis$L = globalThis_1;

var promiseNativeConstructor = globalThis$L.Promise;

var globalThis$K = globalThis_1;
var NativePromiseConstructor$4 = promiseNativeConstructor;
var isCallable$f = isCallable$D;
var isForced$1 = isForced_1;
var inspectSource = inspectSource$3;
var wellKnownSymbol$q = wellKnownSymbol$O;
var ENVIRONMENT$1 = environment;
var V8_VERSION = environmentV8Version;

NativePromiseConstructor$4 && NativePromiseConstructor$4.prototype;
var SPECIES$1 = wellKnownSymbol$q('species');
var SUBCLASSING = false;
var NATIVE_PROMISE_REJECTION_EVENT$1 = isCallable$f(globalThis$K.PromiseRejectionEvent);

var FORCED_PROMISE_CONSTRUCTOR$5 = isForced$1('Promise', function () {
  var PROMISE_CONSTRUCTOR_SOURCE = inspectSource(NativePromiseConstructor$4);
  var GLOBAL_CORE_JS_PROMISE = PROMISE_CONSTRUCTOR_SOURCE !== String(NativePromiseConstructor$4);
  // V8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
  // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
  // We can't detect it synchronously, so just check versions
  if (!GLOBAL_CORE_JS_PROMISE && V8_VERSION === 66) return true;
  // We can't use @@species feature detection in V8 since it causes
  // deoptimization and performance degradation
  // https://github.com/zloirock/core-js/issues/679
  if (!V8_VERSION || V8_VERSION < 51 || !/native code/.test(PROMISE_CONSTRUCTOR_SOURCE)) {
    // Detect correctness of subclassing with @@species support
    var promise = new NativePromiseConstructor$4(function (resolve) { resolve(1); });
    var FakePromise = function (exec) {
      exec(function () { /* empty */ }, function () { /* empty */ });
    };
    var constructor = promise.constructor = {};
    constructor[SPECIES$1] = FakePromise;
    SUBCLASSING = promise.then(function () { /* empty */ }) instanceof FakePromise;
    if (!SUBCLASSING) return true;
  // Unhandled rejections tracking support, NodeJS Promise without it fails @@species test
  } return !GLOBAL_CORE_JS_PROMISE && (ENVIRONMENT$1 === 'BROWSER' || ENVIRONMENT$1 === 'DENO') && !NATIVE_PROMISE_REJECTION_EVENT$1;
});

var promiseConstructorDetection = {
  CONSTRUCTOR: FORCED_PROMISE_CONSTRUCTOR$5,
  REJECTION_EVENT: NATIVE_PROMISE_REJECTION_EVENT$1,
  SUBCLASSING: SUBCLASSING
};

var newPromiseCapability$2 = {};

var aCallable$r = aCallable$F;

var $TypeError$i = TypeError;

var PromiseCapability = function (C) {
  var resolve, reject;
  this.promise = new C(function ($$resolve, $$reject) {
    if (resolve !== undefined || reject !== undefined) throw new $TypeError$i('Bad Promise constructor');
    resolve = $$resolve;
    reject = $$reject;
  });
  this.resolve = aCallable$r(resolve);
  this.reject = aCallable$r(reject);
};

// `NewPromiseCapability` abstract operation
// https://tc39.es/ecma262/#sec-newpromisecapability
newPromiseCapability$2.f = function (C) {
  return new PromiseCapability(C);
};

var $$24 = _export;
var IS_NODE = environmentIsNode;
var globalThis$J = globalThis_1;
var call$S = functionCall;
var defineBuiltIn$g = defineBuiltIn$t;
var setPrototypeOf$2 = objectSetPrototypeOf$1;
var setToStringTag$5 = setToStringTag$e;
var setSpecies$2 = setSpecies$6;
var aCallable$q = aCallable$F;
var isCallable$e = isCallable$D;
var isObject$i = isObject$J;
var anInstance$a = anInstance$e;
var speciesConstructor$4 = speciesConstructor$6;
var task = task$1.set;
var microtask$1 = microtask_1;
var hostReportErrors = hostReportErrors$1;
var perform$6 = perform$7;
var Queue = queue$1;
var InternalStateModule$c = internalState;
var NativePromiseConstructor$3 = promiseNativeConstructor;
var PromiseConstructorDetection = promiseConstructorDetection;
var newPromiseCapabilityModule$7 = newPromiseCapability$2;

var PROMISE = 'Promise';
var FORCED_PROMISE_CONSTRUCTOR$4 = PromiseConstructorDetection.CONSTRUCTOR;
var NATIVE_PROMISE_REJECTION_EVENT = PromiseConstructorDetection.REJECTION_EVENT;
var NATIVE_PROMISE_SUBCLASSING = PromiseConstructorDetection.SUBCLASSING;
var getInternalPromiseState = InternalStateModule$c.getterFor(PROMISE);
var setInternalState$d = InternalStateModule$c.set;
var NativePromisePrototype$2 = NativePromiseConstructor$3 && NativePromiseConstructor$3.prototype;
var PromiseConstructor = NativePromiseConstructor$3;
var PromisePrototype = NativePromisePrototype$2;
var TypeError$5 = globalThis$J.TypeError;
var document$1 = globalThis$J.document;
var process = globalThis$J.process;
var newPromiseCapability$1 = newPromiseCapabilityModule$7.f;
var newGenericPromiseCapability = newPromiseCapability$1;

var DISPATCH_EVENT = !!(document$1 && document$1.createEvent && globalThis$J.dispatchEvent);
var UNHANDLED_REJECTION = 'unhandledrejection';
var REJECTION_HANDLED = 'rejectionhandled';
var PENDING$2 = 0;
var FULFILLED = 1;
var REJECTED = 2;
var HANDLED = 1;
var UNHANDLED = 2;

var Internal, OwnPromiseCapability, PromiseWrapper, nativeThen;

// helpers
var isThenable = function (it) {
  var then;
  return isObject$i(it) && isCallable$e(then = it.then) ? then : false;
};

var callReaction = function (reaction, state) {
  var value = state.value;
  var ok = state.state === FULFILLED;
  var handler = ok ? reaction.ok : reaction.fail;
  var resolve = reaction.resolve;
  var reject = reaction.reject;
  var domain = reaction.domain;
  var result, then, exited;
  try {
    if (handler) {
      if (!ok) {
        if (state.rejection === UNHANDLED) onHandleUnhandled(state);
        state.rejection = HANDLED;
      }
      if (handler === true) result = value;
      else {
        if (domain) domain.enter();
        result = handler(value); // can throw
        if (domain) {
          domain.exit();
          exited = true;
        }
      }
      if (result === reaction.promise) {
        reject(new TypeError$5('Promise-chain cycle'));
      } else if (then = isThenable(result)) {
        call$S(then, result, resolve, reject);
      } else resolve(result);
    } else reject(value);
  } catch (error) {
    if (domain && !exited) domain.exit();
    reject(error);
  }
};

var notify = function (state, isReject) {
  if (state.notified) return;
  state.notified = true;
  microtask$1(function () {
    var reactions = state.reactions;
    var reaction;
    while (reaction = reactions.get()) {
      callReaction(reaction, state);
    }
    state.notified = false;
    if (isReject && !state.rejection) onUnhandled(state);
  });
};

var dispatchEvent = function (name, promise, reason) {
  var event, handler;
  if (DISPATCH_EVENT) {
    event = document$1.createEvent('Event');
    event.promise = promise;
    event.reason = reason;
    event.initEvent(name, false, true);
    globalThis$J.dispatchEvent(event);
  } else event = { promise: promise, reason: reason };
  if (!NATIVE_PROMISE_REJECTION_EVENT && (handler = globalThis$J['on' + name])) handler(event);
  else if (name === UNHANDLED_REJECTION) hostReportErrors('Unhandled promise rejection', reason);
};

var onUnhandled = function (state) {
  call$S(task, globalThis$J, function () {
    var promise = state.facade;
    var value = state.value;
    var IS_UNHANDLED = isUnhandled(state);
    var result;
    if (IS_UNHANDLED) {
      result = perform$6(function () {
        if (IS_NODE) {
          process.emit('unhandledRejection', value, promise);
        } else dispatchEvent(UNHANDLED_REJECTION, promise, value);
      });
      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
      state.rejection = IS_NODE || isUnhandled(state) ? UNHANDLED : HANDLED;
      if (result.error) throw result.value;
    }
  });
};

var isUnhandled = function (state) {
  return state.rejection !== HANDLED && !state.parent;
};

var onHandleUnhandled = function (state) {
  call$S(task, globalThis$J, function () {
    var promise = state.facade;
    if (IS_NODE) {
      process.emit('rejectionHandled', promise);
    } else dispatchEvent(REJECTION_HANDLED, promise, state.value);
  });
};

var bind$8 = function (fn, state, unwrap) {
  return function (value) {
    fn(state, value, unwrap);
  };
};

var internalReject = function (state, value, unwrap) {
  if (state.done) return;
  state.done = true;
  if (unwrap) state = unwrap;
  state.value = value;
  state.state = REJECTED;
  notify(state, true);
};

var internalResolve = function (state, value, unwrap) {
  if (state.done) return;
  state.done = true;
  if (unwrap) state = unwrap;
  try {
    if (state.facade === value) throw new TypeError$5("Promise can't be resolved itself");
    var then = isThenable(value);
    if (then) {
      microtask$1(function () {
        var wrapper = { done: false };
        try {
          call$S(then, value,
            bind$8(internalResolve, wrapper, state),
            bind$8(internalReject, wrapper, state)
          );
        } catch (error) {
          internalReject(wrapper, error, state);
        }
      });
    } else {
      state.value = value;
      state.state = FULFILLED;
      notify(state, false);
    }
  } catch (error) {
    internalReject({ done: false }, error, state);
  }
};

// constructor polyfill
if (FORCED_PROMISE_CONSTRUCTOR$4) {
  // 25.4.3.1 Promise(executor)
  PromiseConstructor = function Promise(executor) {
    anInstance$a(this, PromisePrototype);
    aCallable$q(executor);
    call$S(Internal, this);
    var state = getInternalPromiseState(this);
    try {
      executor(bind$8(internalResolve, state), bind$8(internalReject, state));
    } catch (error) {
      internalReject(state, error);
    }
  };

  PromisePrototype = PromiseConstructor.prototype;

  // eslint-disable-next-line no-unused-vars -- required for `.length`
  Internal = function Promise(executor) {
    setInternalState$d(this, {
      type: PROMISE,
      done: false,
      notified: false,
      parent: false,
      reactions: new Queue(),
      rejection: false,
      state: PENDING$2,
      value: undefined
    });
  };

  // `Promise.prototype.then` method
  // https://tc39.es/ecma262/#sec-promise.prototype.then
  Internal.prototype = defineBuiltIn$g(PromisePrototype, 'then', function then(onFulfilled, onRejected) {
    var state = getInternalPromiseState(this);
    var reaction = newPromiseCapability$1(speciesConstructor$4(this, PromiseConstructor));
    state.parent = true;
    reaction.ok = isCallable$e(onFulfilled) ? onFulfilled : true;
    reaction.fail = isCallable$e(onRejected) && onRejected;
    reaction.domain = IS_NODE ? process.domain : undefined;
    if (state.state === PENDING$2) state.reactions.add(reaction);
    else microtask$1(function () {
      callReaction(reaction, state);
    });
    return reaction.promise;
  });

  OwnPromiseCapability = function () {
    var promise = new Internal();
    var state = getInternalPromiseState(promise);
    this.promise = promise;
    this.resolve = bind$8(internalResolve, state);
    this.reject = bind$8(internalReject, state);
  };

  newPromiseCapabilityModule$7.f = newPromiseCapability$1 = function (C) {
    return C === PromiseConstructor || C === PromiseWrapper
      ? new OwnPromiseCapability(C)
      : newGenericPromiseCapability(C);
  };

  if (isCallable$e(NativePromiseConstructor$3) && NativePromisePrototype$2 !== Object.prototype) {
    nativeThen = NativePromisePrototype$2.then;

    if (!NATIVE_PROMISE_SUBCLASSING) {
      // make `Promise#then` return a polyfilled `Promise` for native promise-based APIs
      defineBuiltIn$g(NativePromisePrototype$2, 'then', function then(onFulfilled, onRejected) {
        var that = this;
        return new PromiseConstructor(function (resolve, reject) {
          call$S(nativeThen, that, resolve, reject);
        }).then(onFulfilled, onRejected);
      // https://github.com/zloirock/core-js/issues/640
      }, { unsafe: true });
    }

    // make `.constructor === Promise` work for native promise-based APIs
    try {
      delete NativePromisePrototype$2.constructor;
    } catch (error) { /* empty */ }

    // make `instanceof Promise` work for native promise-based APIs
    if (setPrototypeOf$2) {
      setPrototypeOf$2(NativePromisePrototype$2, PromisePrototype);
    }
  }
}

$$24({ global: true, constructor: true, wrap: true, forced: FORCED_PROMISE_CONSTRUCTOR$4 }, {
  Promise: PromiseConstructor
});

setToStringTag$5(PromiseConstructor, PROMISE, false);
setSpecies$2(PROMISE);

var NativePromiseConstructor$2 = promiseNativeConstructor;
var checkCorrectnessOfIteration$1 = checkCorrectnessOfIteration$4;
var FORCED_PROMISE_CONSTRUCTOR$3 = promiseConstructorDetection.CONSTRUCTOR;

var promiseStaticsIncorrectIteration = FORCED_PROMISE_CONSTRUCTOR$3 || !checkCorrectnessOfIteration$1(function (iterable) {
  NativePromiseConstructor$2.all(iterable).then(undefined, function () { /* empty */ });
});

var $$23 = _export;
var call$R = functionCall;
var aCallable$p = aCallable$F;
var newPromiseCapabilityModule$6 = newPromiseCapability$2;
var perform$5 = perform$7;
var iterate$d = iterate$k;
var PROMISE_STATICS_INCORRECT_ITERATION$3 = promiseStaticsIncorrectIteration;

// `Promise.all` method
// https://tc39.es/ecma262/#sec-promise.all
$$23({ target: 'Promise', stat: true, forced: PROMISE_STATICS_INCORRECT_ITERATION$3 }, {
  all: function all(iterable) {
    var C = this;
    var capability = newPromiseCapabilityModule$6.f(C);
    var resolve = capability.resolve;
    var reject = capability.reject;
    var result = perform$5(function () {
      var $promiseResolve = aCallable$p(C.resolve);
      var values = [];
      var counter = 0;
      var remaining = 1;
      iterate$d(iterable, function (promise) {
        var index = counter++;
        var alreadyCalled = false;
        remaining++;
        call$R($promiseResolve, C, promise).then(function (value) {
          if (alreadyCalled) return;
          alreadyCalled = true;
          values[index] = value;
          --remaining || resolve(values);
        }, reject);
      });
      --remaining || resolve(values);
    });
    if (result.error) reject(result.value);
    return capability.promise;
  }
});

var $$22 = _export;
var FORCED_PROMISE_CONSTRUCTOR$2 = promiseConstructorDetection.CONSTRUCTOR;
var NativePromiseConstructor$1 = promiseNativeConstructor;
var getBuiltIn$p = getBuiltIn$C;
var isCallable$d = isCallable$D;
var defineBuiltIn$f = defineBuiltIn$t;

var NativePromisePrototype$1 = NativePromiseConstructor$1 && NativePromiseConstructor$1.prototype;

// `Promise.prototype.catch` method
// https://tc39.es/ecma262/#sec-promise.prototype.catch
$$22({ target: 'Promise', proto: true, forced: FORCED_PROMISE_CONSTRUCTOR$2, real: true }, {
  'catch': function (onRejected) {
    return this.then(undefined, onRejected);
  }
});

// makes sure that native promise-based APIs `Promise#catch` properly works with patched `Promise#then`
if (isCallable$d(NativePromiseConstructor$1)) {
  var method$1 = getBuiltIn$p('Promise').prototype['catch'];
  if (NativePromisePrototype$1['catch'] !== method$1) {
    defineBuiltIn$f(NativePromisePrototype$1, 'catch', method$1, { unsafe: true });
  }
}

var $$21 = _export;
var call$Q = functionCall;
var aCallable$o = aCallable$F;
var newPromiseCapabilityModule$5 = newPromiseCapability$2;
var perform$4 = perform$7;
var iterate$c = iterate$k;
var PROMISE_STATICS_INCORRECT_ITERATION$2 = promiseStaticsIncorrectIteration;

// `Promise.race` method
// https://tc39.es/ecma262/#sec-promise.race
$$21({ target: 'Promise', stat: true, forced: PROMISE_STATICS_INCORRECT_ITERATION$2 }, {
  race: function race(iterable) {
    var C = this;
    var capability = newPromiseCapabilityModule$5.f(C);
    var reject = capability.reject;
    var result = perform$4(function () {
      var $promiseResolve = aCallable$o(C.resolve);
      iterate$c(iterable, function (promise) {
        call$Q($promiseResolve, C, promise).then(capability.resolve, reject);
      });
    });
    if (result.error) reject(result.value);
    return capability.promise;
  }
});

var $$20 = _export;
var newPromiseCapabilityModule$4 = newPromiseCapability$2;
var FORCED_PROMISE_CONSTRUCTOR$1 = promiseConstructorDetection.CONSTRUCTOR;

// `Promise.reject` method
// https://tc39.es/ecma262/#sec-promise.reject
$$20({ target: 'Promise', stat: true, forced: FORCED_PROMISE_CONSTRUCTOR$1 }, {
  reject: function reject(r) {
    var capability = newPromiseCapabilityModule$4.f(this);
    var capabilityReject = capability.reject;
    capabilityReject(r);
    return capability.promise;
  }
});

var anObject$P = anObject$11;
var isObject$h = isObject$J;
var newPromiseCapability = newPromiseCapability$2;

var promiseResolve$2 = function (C, x) {
  anObject$P(C);
  if (isObject$h(x) && x.constructor === C) return x;
  var promiseCapability = newPromiseCapability.f(C);
  var resolve = promiseCapability.resolve;
  resolve(x);
  return promiseCapability.promise;
};

var $$1$ = _export;
var getBuiltIn$o = getBuiltIn$C;
var FORCED_PROMISE_CONSTRUCTOR = promiseConstructorDetection.CONSTRUCTOR;
var promiseResolve$1 = promiseResolve$2;

getBuiltIn$o('Promise');

// `Promise.resolve` method
// https://tc39.es/ecma262/#sec-promise.resolve
$$1$({ target: 'Promise', stat: true, forced: FORCED_PROMISE_CONSTRUCTOR }, {
  resolve: function resolve(x) {
    return promiseResolve$1(this, x);
  }
});

var $$1_ = _export;
var call$P = functionCall;
var aCallable$n = aCallable$F;
var newPromiseCapabilityModule$3 = newPromiseCapability$2;
var perform$3 = perform$7;
var iterate$b = iterate$k;
var PROMISE_STATICS_INCORRECT_ITERATION$1 = promiseStaticsIncorrectIteration;

// `Promise.allSettled` method
// https://tc39.es/ecma262/#sec-promise.allsettled
$$1_({ target: 'Promise', stat: true, forced: PROMISE_STATICS_INCORRECT_ITERATION$1 }, {
  allSettled: function allSettled(iterable) {
    var C = this;
    var capability = newPromiseCapabilityModule$3.f(C);
    var resolve = capability.resolve;
    var reject = capability.reject;
    var result = perform$3(function () {
      var promiseResolve = aCallable$n(C.resolve);
      var values = [];
      var counter = 0;
      var remaining = 1;
      iterate$b(iterable, function (promise) {
        var index = counter++;
        var alreadyCalled = false;
        remaining++;
        call$P(promiseResolve, C, promise).then(function (value) {
          if (alreadyCalled) return;
          alreadyCalled = true;
          values[index] = { status: 'fulfilled', value: value };
          --remaining || resolve(values);
        }, function (error) {
          if (alreadyCalled) return;
          alreadyCalled = true;
          values[index] = { status: 'rejected', reason: error };
          --remaining || resolve(values);
        });
      });
      --remaining || resolve(values);
    });
    if (result.error) reject(result.value);
    return capability.promise;
  }
});

var $$1Z = _export;
var call$O = functionCall;
var aCallable$m = aCallable$F;
var getBuiltIn$n = getBuiltIn$C;
var newPromiseCapabilityModule$2 = newPromiseCapability$2;
var perform$2 = perform$7;
var iterate$a = iterate$k;
var PROMISE_STATICS_INCORRECT_ITERATION = promiseStaticsIncorrectIteration;

var PROMISE_ANY_ERROR = 'No one promise resolved';

// `Promise.any` method
// https://tc39.es/ecma262/#sec-promise.any
$$1Z({ target: 'Promise', stat: true, forced: PROMISE_STATICS_INCORRECT_ITERATION }, {
  any: function any(iterable) {
    var C = this;
    var AggregateError = getBuiltIn$n('AggregateError');
    var capability = newPromiseCapabilityModule$2.f(C);
    var resolve = capability.resolve;
    var reject = capability.reject;
    var result = perform$2(function () {
      var promiseResolve = aCallable$m(C.resolve);
      var errors = [];
      var counter = 0;
      var remaining = 1;
      var alreadyResolved = false;
      iterate$a(iterable, function (promise) {
        var index = counter++;
        var alreadyRejected = false;
        remaining++;
        call$O(promiseResolve, C, promise).then(function (value) {
          if (alreadyRejected || alreadyResolved) return;
          alreadyResolved = true;
          resolve(value);
        }, function (error) {
          if (alreadyRejected || alreadyResolved) return;
          alreadyRejected = true;
          errors[index] = error;
          --remaining || reject(new AggregateError(errors, PROMISE_ANY_ERROR));
        });
      });
      --remaining || reject(new AggregateError(errors, PROMISE_ANY_ERROR));
    });
    if (result.error) reject(result.value);
    return capability.promise;
  }
});

var $$1Y = _export;
var NativePromiseConstructor = promiseNativeConstructor;
var fails$F = fails$1z;
var getBuiltIn$m = getBuiltIn$C;
var isCallable$c = isCallable$D;
var speciesConstructor$3 = speciesConstructor$6;
var promiseResolve = promiseResolve$2;
var defineBuiltIn$e = defineBuiltIn$t;

var NativePromisePrototype = NativePromiseConstructor && NativePromiseConstructor.prototype;

// Safari bug https://bugs.webkit.org/show_bug.cgi?id=200829
var NON_GENERIC = !!NativePromiseConstructor && fails$F(function () {
  // eslint-disable-next-line unicorn/no-thenable -- required for testing
  NativePromisePrototype['finally'].call({ then: function () { /* empty */ } }, function () { /* empty */ });
});

// `Promise.prototype.finally` method
// https://tc39.es/ecma262/#sec-promise.prototype.finally
$$1Y({ target: 'Promise', proto: true, real: true, forced: NON_GENERIC }, {
  'finally': function (onFinally) {
    var C = speciesConstructor$3(this, getBuiltIn$m('Promise'));
    var isFunction = isCallable$c(onFinally);
    return this.then(
      isFunction ? function (x) {
        return promiseResolve(C, onFinally()).then(function () { return x; });
      } : onFinally,
      isFunction ? function (e) {
        return promiseResolve(C, onFinally()).then(function () { throw e; });
      } : onFinally
    );
  }
});

// makes sure that native promise-based APIs `Promise#finally` properly works with patched `Promise#then`
if (isCallable$c(NativePromiseConstructor)) {
  var method = getBuiltIn$m('Promise').prototype['finally'];
  if (NativePromisePrototype['finally'] !== method) {
    defineBuiltIn$e(NativePromisePrototype, 'finally', method, { unsafe: true });
  }
}

var $$1X = _export;
var newPromiseCapabilityModule$1 = newPromiseCapability$2;

// `Promise.withResolvers` method
// https://github.com/tc39/proposal-promise-with-resolvers
$$1X({ target: 'Promise', stat: true }, {
  withResolvers: function withResolvers() {
    var promiseCapability = newPromiseCapabilityModule$1.f(this);
    return {
      promise: promiseCapability.promise,
      resolve: promiseCapability.resolve,
      reject: promiseCapability.reject
    };
  }
});

var $$1W = _export;
var functionApply = functionApply$1;
var aCallable$l = aCallable$F;
var anObject$O = anObject$11;
var fails$E = fails$1z;

// MS Edge argumentsList argument is optional
var OPTIONAL_ARGUMENTS_LIST = !fails$E(function () {
  // eslint-disable-next-line es/no-reflect -- required for testing
  Reflect.apply(function () { /* empty */ });
});

// `Reflect.apply` method
// https://tc39.es/ecma262/#sec-reflect.apply
$$1W({ target: 'Reflect', stat: true, forced: OPTIONAL_ARGUMENTS_LIST }, {
  apply: function apply(target, thisArgument, argumentsList) {
    return functionApply(aCallable$l(target), thisArgument, anObject$O(argumentsList));
  }
});

var $$1V = _export;
var getBuiltIn$l = getBuiltIn$C;
var apply$5 = functionApply$1;
var bind$7 = functionBind;
var aConstructor$1 = aConstructor$3;
var anObject$N = anObject$11;
var isObject$g = isObject$J;
var create$a = objectCreate$1;
var fails$D = fails$1z;

var nativeConstruct = getBuiltIn$l('Reflect', 'construct');
var ObjectPrototype = Object.prototype;
var push$e = [].push;

// `Reflect.construct` method
// https://tc39.es/ecma262/#sec-reflect.construct
// MS Edge supports only 2 arguments and argumentsList argument is optional
// FF Nightly sets third argument as `new.target`, but does not create `this` from it
var NEW_TARGET_BUG = fails$D(function () {
  function F() { /* empty */ }
  return !(nativeConstruct(function () { /* empty */ }, [], F) instanceof F);
});

var ARGS_BUG = !fails$D(function () {
  nativeConstruct(function () { /* empty */ });
});

var FORCED$9 = NEW_TARGET_BUG || ARGS_BUG;

$$1V({ target: 'Reflect', stat: true, forced: FORCED$9, sham: FORCED$9 }, {
  construct: function construct(Target, args /* , newTarget */) {
    aConstructor$1(Target);
    anObject$N(args);
    var newTarget = arguments.length < 3 ? Target : aConstructor$1(arguments[2]);
    if (ARGS_BUG && !NEW_TARGET_BUG) return nativeConstruct(Target, args, newTarget);
    if (Target === newTarget) {
      // w/o altered newTarget, optimization for 0-4 arguments
      switch (args.length) {
        case 0: return new Target();
        case 1: return new Target(args[0]);
        case 2: return new Target(args[0], args[1]);
        case 3: return new Target(args[0], args[1], args[2]);
        case 4: return new Target(args[0], args[1], args[2], args[3]);
      }
      // w/o altered newTarget, lot of arguments case
      var $args = [null];
      apply$5(push$e, $args, args);
      return new (apply$5(bind$7, Target, $args))();
    }
    // with altered newTarget, not support built-in constructors
    var proto = newTarget.prototype;
    var instance = create$a(isObject$g(proto) ? proto : ObjectPrototype);
    var result = apply$5(Target, instance, args);
    return isObject$g(result) ? result : instance;
  }
});

var $$1U = _export;
var DESCRIPTORS$i = descriptors;
var anObject$M = anObject$11;
var toPropertyKey$2 = toPropertyKey$9;
var definePropertyModule$2 = objectDefineProperty;
var fails$C = fails$1z;

// MS Edge has broken Reflect.defineProperty - throwing instead of returning false
var ERROR_INSTEAD_OF_FALSE = fails$C(function () {
  // eslint-disable-next-line es/no-reflect -- required for testing
  Reflect.defineProperty(definePropertyModule$2.f({}, 1, { value: 1 }), 1, { value: 2 });
});

// `Reflect.defineProperty` method
// https://tc39.es/ecma262/#sec-reflect.defineproperty
$$1U({ target: 'Reflect', stat: true, forced: ERROR_INSTEAD_OF_FALSE, sham: !DESCRIPTORS$i }, {
  defineProperty: function defineProperty(target, propertyKey, attributes) {
    anObject$M(target);
    var key = toPropertyKey$2(propertyKey);
    anObject$M(attributes);
    try {
      definePropertyModule$2.f(target, key, attributes);
      return true;
    } catch (error) {
      return false;
    }
  }
});

var $$1T = _export;
var anObject$L = anObject$11;
var getOwnPropertyDescriptor$5 = objectGetOwnPropertyDescriptor.f;

// `Reflect.deleteProperty` method
// https://tc39.es/ecma262/#sec-reflect.deleteproperty
$$1T({ target: 'Reflect', stat: true }, {
  deleteProperty: function deleteProperty(target, propertyKey) {
    var descriptor = getOwnPropertyDescriptor$5(anObject$L(target), propertyKey);
    return descriptor && !descriptor.configurable ? false : delete target[propertyKey];
  }
});

var hasOwn$h = hasOwnProperty_1;

var isDataDescriptor$2 = function (descriptor) {
  return descriptor !== undefined && (hasOwn$h(descriptor, 'value') || hasOwn$h(descriptor, 'writable'));
};

var $$1S = _export;
var call$N = functionCall;
var isObject$f = isObject$J;
var anObject$K = anObject$11;
var isDataDescriptor$1 = isDataDescriptor$2;
var getOwnPropertyDescriptorModule$3 = objectGetOwnPropertyDescriptor;
var getPrototypeOf$5 = objectGetPrototypeOf$2;

// `Reflect.get` method
// https://tc39.es/ecma262/#sec-reflect.get
function get(target, propertyKey /* , receiver */) {
  var receiver = arguments.length < 3 ? target : arguments[2];
  var descriptor, prototype;
  if (anObject$K(target) === receiver) return target[propertyKey];
  descriptor = getOwnPropertyDescriptorModule$3.f(target, propertyKey);
  if (descriptor) return isDataDescriptor$1(descriptor)
    ? descriptor.value
    : descriptor.get === undefined ? undefined : call$N(descriptor.get, receiver);
  if (isObject$f(prototype = getPrototypeOf$5(target))) return get(prototype, propertyKey, receiver);
}

$$1S({ target: 'Reflect', stat: true }, {
  get: get
});

var $$1R = _export;
var DESCRIPTORS$h = descriptors;
var anObject$J = anObject$11;
var getOwnPropertyDescriptorModule$2 = objectGetOwnPropertyDescriptor;

// `Reflect.getOwnPropertyDescriptor` method
// https://tc39.es/ecma262/#sec-reflect.getownpropertydescriptor
$$1R({ target: 'Reflect', stat: true, sham: !DESCRIPTORS$h }, {
  getOwnPropertyDescriptor: function getOwnPropertyDescriptor(target, propertyKey) {
    return getOwnPropertyDescriptorModule$2.f(anObject$J(target), propertyKey);
  }
});

var $$1Q = _export;
var anObject$I = anObject$11;
var objectGetPrototypeOf = objectGetPrototypeOf$2;
var CORRECT_PROTOTYPE_GETTER = correctPrototypeGetter;

// `Reflect.getPrototypeOf` method
// https://tc39.es/ecma262/#sec-reflect.getprototypeof
$$1Q({ target: 'Reflect', stat: true, sham: !CORRECT_PROTOTYPE_GETTER }, {
  getPrototypeOf: function getPrototypeOf(target) {
    return objectGetPrototypeOf(anObject$I(target));
  }
});

var $$1P = _export;

// `Reflect.has` method
// https://tc39.es/ecma262/#sec-reflect.has
$$1P({ target: 'Reflect', stat: true }, {
  has: function has(target, propertyKey) {
    return propertyKey in target;
  }
});

var $$1O = _export;
var anObject$H = anObject$11;
var $isExtensible = objectIsExtensible;

// `Reflect.isExtensible` method
// https://tc39.es/ecma262/#sec-reflect.isextensible
$$1O({ target: 'Reflect', stat: true }, {
  isExtensible: function isExtensible(target) {
    anObject$H(target);
    return $isExtensible(target);
  }
});

var $$1N = _export;
var ownKeys = ownKeys$3;

// `Reflect.ownKeys` method
// https://tc39.es/ecma262/#sec-reflect.ownkeys
$$1N({ target: 'Reflect', stat: true }, {
  ownKeys: ownKeys
});

var $$1M = _export;
var getBuiltIn$k = getBuiltIn$C;
var anObject$G = anObject$11;
var FREEZING$2 = freezing;

// `Reflect.preventExtensions` method
// https://tc39.es/ecma262/#sec-reflect.preventextensions
$$1M({ target: 'Reflect', stat: true, sham: !FREEZING$2 }, {
  preventExtensions: function preventExtensions(target) {
    anObject$G(target);
    try {
      var objectPreventExtensions = getBuiltIn$k('Object', 'preventExtensions');
      if (objectPreventExtensions) objectPreventExtensions(target);
      return true;
    } catch (error) {
      return false;
    }
  }
});

var $$1L = _export;
var call$M = functionCall;
var anObject$F = anObject$11;
var isObject$e = isObject$J;
var isDataDescriptor = isDataDescriptor$2;
var fails$B = fails$1z;
var definePropertyModule$1 = objectDefineProperty;
var getOwnPropertyDescriptorModule$1 = objectGetOwnPropertyDescriptor;
var getPrototypeOf$4 = objectGetPrototypeOf$2;
var createPropertyDescriptor$5 = createPropertyDescriptor$d;

// `Reflect.set` method
// https://tc39.es/ecma262/#sec-reflect.set
function set(target, propertyKey, V /* , receiver */) {
  var receiver = arguments.length < 4 ? target : arguments[3];
  var ownDescriptor = getOwnPropertyDescriptorModule$1.f(anObject$F(target), propertyKey);
  var existingDescriptor, prototype, setter;
  if (!ownDescriptor) {
    if (isObject$e(prototype = getPrototypeOf$4(target))) {
      return set(prototype, propertyKey, V, receiver);
    }
    ownDescriptor = createPropertyDescriptor$5(0);
  }
  if (isDataDescriptor(ownDescriptor)) {
    if (ownDescriptor.writable === false || !isObject$e(receiver)) return false;
    if (existingDescriptor = getOwnPropertyDescriptorModule$1.f(receiver, propertyKey)) {
      if (existingDescriptor.get || existingDescriptor.set || existingDescriptor.writable === false) return false;
      existingDescriptor.value = V;
      definePropertyModule$1.f(receiver, propertyKey, existingDescriptor);
    } else definePropertyModule$1.f(receiver, propertyKey, createPropertyDescriptor$5(0, V));
  } else {
    setter = ownDescriptor.set;
    if (setter === undefined) return false;
    call$M(setter, receiver, V);
  } return true;
}

// MS Edge 17-18 Reflect.set allows setting the property to object
// with non-writable property on the prototype
var MS_EDGE_BUG = fails$B(function () {
  var Constructor = function () { /* empty */ };
  var object = definePropertyModule$1.f(new Constructor(), 'a', { configurable: true });
  // eslint-disable-next-line es/no-reflect -- required for testing
  return Reflect.set(Constructor.prototype, 'a', 1, object) !== false;
});

$$1L({ target: 'Reflect', stat: true, forced: MS_EDGE_BUG }, {
  set: set
});

var $$1K = _export;
var anObject$E = anObject$11;
var aPossiblePrototype = aPossiblePrototype$2;
var objectSetPrototypeOf = objectSetPrototypeOf$1;

// `Reflect.setPrototypeOf` method
// https://tc39.es/ecma262/#sec-reflect.setprototypeof
if (objectSetPrototypeOf) $$1K({ target: 'Reflect', stat: true }, {
  setPrototypeOf: function setPrototypeOf(target, proto) {
    anObject$E(target);
    aPossiblePrototype(proto);
    try {
      objectSetPrototypeOf(target, proto);
      return true;
    } catch (error) {
      return false;
    }
  }
});

var $$1J = _export;
var globalThis$I = globalThis_1;
var setToStringTag$4 = setToStringTag$e;

$$1J({ global: true }, { Reflect: {} });

// Reflect[@@toStringTag] property
// https://tc39.es/ecma262/#sec-reflect-@@tostringtag
setToStringTag$4(globalThis$I.Reflect, 'Reflect', true);

var isObject$d = isObject$J;
var classof$b = classofRaw$2;
var wellKnownSymbol$p = wellKnownSymbol$O;

var MATCH$2 = wellKnownSymbol$p('match');

// `IsRegExp` abstract operation
// https://tc39.es/ecma262/#sec-isregexp
var isRegexp = function (it) {
  var isRegExp;
  return isObject$d(it) && ((isRegExp = it[MATCH$2]) !== undefined ? !!isRegExp : classof$b(it) === 'RegExp');
};

var anObject$D = anObject$11;

// `RegExp.prototype.flags` getter implementation
// https://tc39.es/ecma262/#sec-get-regexp.prototype.flags
var regexpFlags$1 = function () {
  var that = anObject$D(this);
  var result = '';
  if (that.hasIndices) result += 'd';
  if (that.global) result += 'g';
  if (that.ignoreCase) result += 'i';
  if (that.multiline) result += 'm';
  if (that.dotAll) result += 's';
  if (that.unicode) result += 'u';
  if (that.unicodeSets) result += 'v';
  if (that.sticky) result += 'y';
  return result;
};

var call$L = functionCall;
var hasOwn$g = hasOwnProperty_1;
var isPrototypeOf$5 = objectIsPrototypeOf;
var regExpFlags$1 = regexpFlags$1;

var RegExpPrototype$7 = RegExp.prototype;

var regexpGetFlags = function (R) {
  var flags = R.flags;
  return flags === undefined && !('flags' in RegExpPrototype$7) && !hasOwn$g(R, 'flags') && isPrototypeOf$5(RegExpPrototype$7, R)
    ? call$L(regExpFlags$1, R) : flags;
};

var fails$A = fails$1z;
var globalThis$H = globalThis_1;

// babel-minify and Closure Compiler transpiles RegExp('a', 'y') -> /a/y and it causes SyntaxError
var $RegExp$2 = globalThis$H.RegExp;

var UNSUPPORTED_Y$3 = fails$A(function () {
  var re = $RegExp$2('a', 'y');
  re.lastIndex = 2;
  return re.exec('abcd') !== null;
});

// UC Browser bug
// https://github.com/zloirock/core-js/issues/1008
var MISSED_STICKY$2 = UNSUPPORTED_Y$3 || fails$A(function () {
  return !$RegExp$2('a', 'y').sticky;
});

var BROKEN_CARET = UNSUPPORTED_Y$3 || fails$A(function () {
  // https://bugzilla.mozilla.org/show_bug.cgi?id=773687
  var re = $RegExp$2('^r', 'gy');
  re.lastIndex = 2;
  return re.exec('str') !== null;
});

var regexpStickyHelpers = {
  BROKEN_CARET: BROKEN_CARET,
  MISSED_STICKY: MISSED_STICKY$2,
  UNSUPPORTED_Y: UNSUPPORTED_Y$3
};

var fails$z = fails$1z;
var globalThis$G = globalThis_1;

// babel-minify and Closure Compiler transpiles RegExp('.', 's') -> /./s and it causes SyntaxError
var $RegExp$1 = globalThis$G.RegExp;

var regexpUnsupportedDotAll = fails$z(function () {
  var re = $RegExp$1('.', 's');
  return !(re.dotAll && re.test('\n') && re.flags === 's');
});

var fails$y = fails$1z;
var globalThis$F = globalThis_1;

// babel-minify and Closure Compiler transpiles RegExp('(?<a>b)', 'g') -> /(?<a>b)/g and it causes SyntaxError
var $RegExp = globalThis$F.RegExp;

var regexpUnsupportedNcg = fails$y(function () {
  var re = $RegExp('(?<a>b)', 'g');
  return re.exec('b').groups.a !== 'b' ||
    'b'.replace(re, '$<a>c') !== 'bc';
});

var DESCRIPTORS$g = descriptors;
var globalThis$E = globalThis_1;
var uncurryThis$Q = functionUncurryThis;
var isForced = isForced_1;
var inheritIfRequired$2 = inheritIfRequired$7;
var createNonEnumerableProperty$9 = createNonEnumerableProperty$j;
var create$9 = objectCreate$1;
var getOwnPropertyNames$1 = objectGetOwnPropertyNames.f;
var isPrototypeOf$4 = objectIsPrototypeOf;
var isRegExp$3 = isRegexp;
var toString$s = toString$F;
var getRegExpFlags$4 = regexpGetFlags;
var stickyHelpers$2 = regexpStickyHelpers;
var proxyAccessor = proxyAccessor$2;
var defineBuiltIn$d = defineBuiltIn$t;
var fails$x = fails$1z;
var hasOwn$f = hasOwnProperty_1;
var enforceInternalState$2 = internalState.enforce;
var setSpecies$1 = setSpecies$6;
var wellKnownSymbol$o = wellKnownSymbol$O;
var UNSUPPORTED_DOT_ALL$2 = regexpUnsupportedDotAll;
var UNSUPPORTED_NCG$1 = regexpUnsupportedNcg;

var MATCH$1 = wellKnownSymbol$o('match');
var NativeRegExp = globalThis$E.RegExp;
var RegExpPrototype$6 = NativeRegExp.prototype;
var SyntaxError$4 = globalThis$E.SyntaxError;
var exec$9 = uncurryThis$Q(RegExpPrototype$6.exec);
var charAt$e = uncurryThis$Q(''.charAt);
var replace$7 = uncurryThis$Q(''.replace);
var stringIndexOf$3 = uncurryThis$Q(''.indexOf);
var stringSlice$c = uncurryThis$Q(''.slice);
// TODO: Use only proper RegExpIdentifierName
var IS_NCG = /^\?<[^\s\d!#%&*+<=>@^][^\s!#%&*+<=>@^]*>/;
var re1 = /a/g;
var re2 = /a/g;

// "new" should create a new object, old webkit bug
var CORRECT_NEW = new NativeRegExp(re1) !== re1;

var MISSED_STICKY$1 = stickyHelpers$2.MISSED_STICKY;
var UNSUPPORTED_Y$2 = stickyHelpers$2.UNSUPPORTED_Y;

var BASE_FORCED = DESCRIPTORS$g &&
  (!CORRECT_NEW || MISSED_STICKY$1 || UNSUPPORTED_DOT_ALL$2 || UNSUPPORTED_NCG$1 || fails$x(function () {
    re2[MATCH$1] = false;
    // RegExp constructor can alter flags and IsRegExp works correct with @@match
    return NativeRegExp(re1) !== re1 || NativeRegExp(re2) === re2 || String(NativeRegExp(re1, 'i')) !== '/a/i';
  }));

var handleDotAll = function (string) {
  var length = string.length;
  var index = 0;
  var result = '';
  var brackets = false;
  var chr;
  for (; index <= length; index++) {
    chr = charAt$e(string, index);
    if (chr === '\\') {
      result += chr + charAt$e(string, ++index);
      continue;
    }
    if (!brackets && chr === '.') {
      result += '[\\s\\S]';
    } else {
      if (chr === '[') {
        brackets = true;
      } else if (chr === ']') {
        brackets = false;
      } result += chr;
    }
  } return result;
};

var handleNCG = function (string) {
  var length = string.length;
  var index = 0;
  var result = '';
  var named = [];
  var names = create$9(null);
  var brackets = false;
  var ncg = false;
  var groupid = 0;
  var groupname = '';
  var chr;
  for (; index <= length; index++) {
    chr = charAt$e(string, index);
    if (chr === '\\') {
      chr += charAt$e(string, ++index);
    } else if (chr === ']') {
      brackets = false;
    } else if (!brackets) switch (true) {
      case chr === '[':
        brackets = true;
        break;
      case chr === '(':
        result += chr;
        // ignore non-capturing groups
        if (stringSlice$c(string, index + 1, index + 3) === '?:') {
          continue;
        }
        if (exec$9(IS_NCG, stringSlice$c(string, index + 1))) {
          index += 2;
          ncg = true;
        }
        groupid++;
        continue;
      case chr === '>' && ncg:
        if (groupname === '' || hasOwn$f(names, groupname)) {
          throw new SyntaxError$4('Invalid capture group name');
        }
        names[groupname] = true;
        named[named.length] = [groupname, groupid];
        ncg = false;
        groupname = '';
        continue;
    }
    if (ncg) groupname += chr;
    else result += chr;
  } return [result, named];
};

// `RegExp` constructor
// https://tc39.es/ecma262/#sec-regexp-constructor
if (isForced('RegExp', BASE_FORCED)) {
  var RegExpWrapper = function RegExp(pattern, flags) {
    var thisIsRegExp = isPrototypeOf$4(RegExpPrototype$6, this);
    var patternIsRegExp = isRegExp$3(pattern);
    var flagsAreUndefined = flags === undefined;
    var groups = [];
    var rawPattern = pattern;
    var rawFlags, dotAll, sticky, handled, result, state;

    if (!thisIsRegExp && patternIsRegExp && flagsAreUndefined && pattern.constructor === RegExpWrapper) {
      return pattern;
    }

    if (patternIsRegExp || isPrototypeOf$4(RegExpPrototype$6, pattern)) {
      pattern = pattern.source;
      if (flagsAreUndefined) flags = getRegExpFlags$4(rawPattern);
    }

    pattern = pattern === undefined ? '' : toString$s(pattern);
    flags = flags === undefined ? '' : toString$s(flags);
    rawPattern = pattern;

    if (UNSUPPORTED_DOT_ALL$2 && 'dotAll' in re1) {
      dotAll = !!flags && stringIndexOf$3(flags, 's') > -1;
      if (dotAll) flags = replace$7(flags, /s/g, '');
    }

    rawFlags = flags;

    if (MISSED_STICKY$1 && 'sticky' in re1) {
      sticky = !!flags && stringIndexOf$3(flags, 'y') > -1;
      if (sticky && UNSUPPORTED_Y$2) flags = replace$7(flags, /y/g, '');
    }

    if (UNSUPPORTED_NCG$1) {
      handled = handleNCG(pattern);
      pattern = handled[0];
      groups = handled[1];
    }

    result = inheritIfRequired$2(NativeRegExp(pattern, flags), thisIsRegExp ? this : RegExpPrototype$6, RegExpWrapper);

    if (dotAll || sticky || groups.length) {
      state = enforceInternalState$2(result);
      if (dotAll) {
        state.dotAll = true;
        state.raw = RegExpWrapper(handleDotAll(pattern), rawFlags);
      }
      if (sticky) state.sticky = true;
      if (groups.length) state.groups = groups;
    }

    if (pattern !== rawPattern) try {
      // fails in old engines, but we have no alternatives for unsupported regex syntax
      createNonEnumerableProperty$9(result, 'source', rawPattern === '' ? '(?:)' : rawPattern);
    } catch (error) { /* empty */ }

    return result;
  };

  for (var keys$1 = getOwnPropertyNames$1(NativeRegExp), index = 0; keys$1.length > index;) {
    proxyAccessor(RegExpWrapper, NativeRegExp, keys$1[index++]);
  }

  RegExpPrototype$6.constructor = RegExpWrapper;
  RegExpWrapper.prototype = RegExpPrototype$6;
  defineBuiltIn$d(globalThis$E, 'RegExp', RegExpWrapper, { constructor: true });
}

// https://tc39.es/ecma262/#sec-get-regexp-@@species
setSpecies$1('RegExp');

var DESCRIPTORS$f = descriptors;
var UNSUPPORTED_DOT_ALL$1 = regexpUnsupportedDotAll;
var classof$a = classofRaw$2;
var defineBuiltInAccessor$b = defineBuiltInAccessor$l;
var getInternalState$8 = internalState.get;

var RegExpPrototype$5 = RegExp.prototype;
var $TypeError$h = TypeError;

// `RegExp.prototype.dotAll` getter
// https://tc39.es/ecma262/#sec-get-regexp.prototype.dotall
if (DESCRIPTORS$f && UNSUPPORTED_DOT_ALL$1) {
  defineBuiltInAccessor$b(RegExpPrototype$5, 'dotAll', {
    configurable: true,
    get: function dotAll() {
      if (this === RegExpPrototype$5) return;
      // We can't use InternalStateModule.getterFor because
      // we don't add metadata for regexps created by a literal.
      if (classof$a(this) === 'RegExp') {
        return !!getInternalState$8(this).dotAll;
      }
      throw new $TypeError$h('Incompatible receiver, RegExp required');
    }
  });
}

/* eslint-disable regexp/no-empty-capturing-group, regexp/no-empty-group, regexp/no-lazy-ends -- testing */
/* eslint-disable regexp/no-useless-quantifier -- testing */
var call$K = functionCall;
var uncurryThis$P = functionUncurryThis;
var toString$r = toString$F;
var regexpFlags = regexpFlags$1;
var stickyHelpers$1 = regexpStickyHelpers;
var shared$1 = shared$8;
var create$8 = objectCreate$1;
var getInternalState$7 = internalState.get;
var UNSUPPORTED_DOT_ALL = regexpUnsupportedDotAll;
var UNSUPPORTED_NCG = regexpUnsupportedNcg;

var nativeReplace = shared$1('native-string-replace', String.prototype.replace);
var nativeExec = RegExp.prototype.exec;
var patchedExec = nativeExec;
var charAt$d = uncurryThis$P(''.charAt);
var indexOf$1 = uncurryThis$P(''.indexOf);
var replace$6 = uncurryThis$P(''.replace);
var stringSlice$b = uncurryThis$P(''.slice);

var UPDATES_LAST_INDEX_WRONG = (function () {
  var re1 = /a/;
  var re2 = /b*/g;
  call$K(nativeExec, re1, 'a');
  call$K(nativeExec, re2, 'a');
  return re1.lastIndex !== 0 || re2.lastIndex !== 0;
})();

var UNSUPPORTED_Y$1 = stickyHelpers$1.BROKEN_CARET;

// nonparticipating capturing group, copied from es5-shim's String#split patch.
var NPCG_INCLUDED = /()??/.exec('')[1] !== undefined;

var PATCH$1 = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED || UNSUPPORTED_Y$1 || UNSUPPORTED_DOT_ALL || UNSUPPORTED_NCG;

if (PATCH$1) {
  patchedExec = function exec(string) {
    var re = this;
    var state = getInternalState$7(re);
    var str = toString$r(string);
    var raw = state.raw;
    var result, reCopy, lastIndex, match, i, object, group;

    if (raw) {
      raw.lastIndex = re.lastIndex;
      result = call$K(patchedExec, raw, str);
      re.lastIndex = raw.lastIndex;
      return result;
    }

    var groups = state.groups;
    var sticky = UNSUPPORTED_Y$1 && re.sticky;
    var flags = call$K(regexpFlags, re);
    var source = re.source;
    var charsAdded = 0;
    var strCopy = str;

    if (sticky) {
      flags = replace$6(flags, 'y', '');
      if (indexOf$1(flags, 'g') === -1) {
        flags += 'g';
      }

      strCopy = stringSlice$b(str, re.lastIndex);
      // Support anchored sticky behavior.
      if (re.lastIndex > 0 && (!re.multiline || re.multiline && charAt$d(str, re.lastIndex - 1) !== '\n')) {
        source = '(?: ' + source + ')';
        strCopy = ' ' + strCopy;
        charsAdded++;
      }
      // ^(? + rx + ) is needed, in combination with some str slicing, to
      // simulate the 'y' flag.
      reCopy = new RegExp('^(?:' + source + ')', flags);
    }

    if (NPCG_INCLUDED) {
      reCopy = new RegExp('^' + source + '$(?!\\s)', flags);
    }
    if (UPDATES_LAST_INDEX_WRONG) lastIndex = re.lastIndex;

    match = call$K(nativeExec, sticky ? reCopy : re, strCopy);

    if (sticky) {
      if (match) {
        match.input = stringSlice$b(match.input, charsAdded);
        match[0] = stringSlice$b(match[0], charsAdded);
        match.index = re.lastIndex;
        re.lastIndex += match[0].length;
      } else re.lastIndex = 0;
    } else if (UPDATES_LAST_INDEX_WRONG && match) {
      re.lastIndex = re.global ? match.index + match[0].length : lastIndex;
    }
    if (NPCG_INCLUDED && match && match.length > 1) {
      // Fix browsers whose `exec` methods don't consistently return `undefined`
      // for NPCG, like IE8. NOTE: This doesn't work for /(.?)?/
      call$K(nativeReplace, match[0], reCopy, function () {
        for (i = 1; i < arguments.length - 2; i++) {
          if (arguments[i] === undefined) match[i] = undefined;
        }
      });
    }

    if (match && groups) {
      match.groups = object = create$8(null);
      for (i = 0; i < groups.length; i++) {
        group = groups[i];
        object[group[0]] = match[group[1]];
      }
    }

    return match;
  };
}

var regexpExec$2 = patchedExec;

var $$1I = _export;
var exec$8 = regexpExec$2;

// `RegExp.prototype.exec` method
// https://tc39.es/ecma262/#sec-regexp.prototype.exec
$$1I({ target: 'RegExp', proto: true, forced: /./.exec !== exec$8 }, {
  exec: exec$8
});

var globalThis$D = globalThis_1;
var DESCRIPTORS$e = descriptors;
var defineBuiltInAccessor$a = defineBuiltInAccessor$l;
var regExpFlags = regexpFlags$1;
var fails$w = fails$1z;

// babel-minify and Closure Compiler transpiles RegExp('.', 'd') -> /./d and it causes SyntaxError
var RegExp$2 = globalThis$D.RegExp;
var RegExpPrototype$4 = RegExp$2.prototype;

var FORCED$8 = DESCRIPTORS$e && fails$w(function () {
  var INDICES_SUPPORT = true;
  try {
    RegExp$2('.', 'd');
  } catch (error) {
    INDICES_SUPPORT = false;
  }

  var O = {};
  // modern V8 bug
  var calls = '';
  var expected = INDICES_SUPPORT ? 'dgimsy' : 'gimsy';

  var addGetter = function (key, chr) {
    // eslint-disable-next-line es/no-object-defineproperty -- safe
    Object.defineProperty(O, key, { get: function () {
      calls += chr;
      return true;
    } });
  };

  var pairs = {
    dotAll: 's',
    global: 'g',
    ignoreCase: 'i',
    multiline: 'm',
    sticky: 'y'
  };

  if (INDICES_SUPPORT) pairs.hasIndices = 'd';

  for (var key in pairs) addGetter(key, pairs[key]);

  // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
  var result = Object.getOwnPropertyDescriptor(RegExpPrototype$4, 'flags').get.call(O);

  return result !== expected || calls !== expected;
});

// `RegExp.prototype.flags` getter
// https://tc39.es/ecma262/#sec-get-regexp.prototype.flags
if (FORCED$8) defineBuiltInAccessor$a(RegExpPrototype$4, 'flags', {
  configurable: true,
  get: regExpFlags
});

var DESCRIPTORS$d = descriptors;
var MISSED_STICKY = regexpStickyHelpers.MISSED_STICKY;
var classof$9 = classofRaw$2;
var defineBuiltInAccessor$9 = defineBuiltInAccessor$l;
var getInternalState$6 = internalState.get;

var RegExpPrototype$3 = RegExp.prototype;
var $TypeError$g = TypeError;

// `RegExp.prototype.sticky` getter
// https://tc39.es/ecma262/#sec-get-regexp.prototype.sticky
if (DESCRIPTORS$d && MISSED_STICKY) {
  defineBuiltInAccessor$9(RegExpPrototype$3, 'sticky', {
    configurable: true,
    get: function sticky() {
      if (this === RegExpPrototype$3) return;
      // We can't use InternalStateModule.getterFor because
      // we don't add metadata for regexps created by a literal.
      if (classof$9(this) === 'RegExp') {
        return !!getInternalState$6(this).sticky;
      }
      throw new $TypeError$g('Incompatible receiver, RegExp required');
    }
  });
}

// TODO: Remove from `core-js@4` since it's moved to entry points

var $$1H = _export;
var call$J = functionCall;
var isCallable$b = isCallable$D;
var anObject$C = anObject$11;
var toString$q = toString$F;

var DELEGATES_TO_EXEC = function () {
  var execCalled = false;
  var re = /[ac]/;
  re.exec = function () {
    execCalled = true;
    return /./.exec.apply(this, arguments);
  };
  return re.test('abc') === true && execCalled;
}();

var nativeTest = /./.test;

// `RegExp.prototype.test` method
// https://tc39.es/ecma262/#sec-regexp.prototype.test
$$1H({ target: 'RegExp', proto: true, forced: !DELEGATES_TO_EXEC }, {
  test: function (S) {
    var R = anObject$C(this);
    var string = toString$q(S);
    var exec = R.exec;
    if (!isCallable$b(exec)) return call$J(nativeTest, R, string);
    var result = call$J(exec, R, string);
    if (result === null) return false;
    anObject$C(result);
    return true;
  }
});

var PROPER_FUNCTION_NAME$1 = functionName.PROPER;
var defineBuiltIn$c = defineBuiltIn$t;
var anObject$B = anObject$11;
var $toString$2 = toString$F;
var fails$v = fails$1z;
var getRegExpFlags$3 = regexpGetFlags;

var TO_STRING = 'toString';
var RegExpPrototype$2 = RegExp.prototype;
var nativeToString = RegExpPrototype$2[TO_STRING];

var NOT_GENERIC = fails$v(function () { return nativeToString.call({ source: 'a', flags: 'b' }) !== '/a/b'; });
// FF44- RegExp#toString has a wrong name
var INCORRECT_NAME = PROPER_FUNCTION_NAME$1 && nativeToString.name !== TO_STRING;

// `RegExp.prototype.toString` method
// https://tc39.es/ecma262/#sec-regexp.prototype.tostring
if (NOT_GENERIC || INCORRECT_NAME) {
  defineBuiltIn$c(RegExpPrototype$2, TO_STRING, function toString() {
    var R = anObject$B(this);
    var pattern = $toString$2(R.source);
    var flags = $toString$2(getRegExpFlags$3(R));
    return '/' + pattern + '/' + flags;
  }, { unsafe: true });
}

var collection$2 = collection$4;
var collectionStrong = collectionStrong$2;

// `Set` constructor
// https://tc39.es/ecma262/#sec-set-objects
collection$2('Set', function (init) {
  return function Set() { return init(this, arguments.length ? arguments[0] : undefined); };
}, collectionStrong);

var uncurryThis$O = functionUncurryThis;

// eslint-disable-next-line es/no-set -- safe
var SetPrototype$1 = Set.prototype;

var setHelpers = {
  // eslint-disable-next-line es/no-set -- safe
  Set: Set,
  add: uncurryThis$O(SetPrototype$1.add),
  has: uncurryThis$O(SetPrototype$1.has),
  remove: uncurryThis$O(SetPrototype$1['delete']),
  proto: SetPrototype$1
};

var has$5 = setHelpers.has;

// Perform ? RequireInternalSlot(M, [[SetData]])
var aSet$7 = function (it) {
  has$5(it);
  return it;
};

var call$I = functionCall;

var iterateSimple$7 = function (record, fn, ITERATOR_INSTEAD_OF_RECORD) {
  var iterator = ITERATOR_INSTEAD_OF_RECORD ? record : record.iterator;
  var next = record.next;
  var step, result;
  while (!(step = call$I(next, iterator)).done) {
    result = fn(step.value);
    if (result !== undefined) return result;
  }
};

var uncurryThis$N = functionUncurryThis;
var iterateSimple$6 = iterateSimple$7;
var SetHelpers$6 = setHelpers;

var Set$4 = SetHelpers$6.Set;
var SetPrototype = SetHelpers$6.proto;
var forEach$4 = uncurryThis$N(SetPrototype.forEach);
var keys = uncurryThis$N(SetPrototype.keys);
var next = keys(new Set$4()).next;

var setIterate$1 = function (set, fn, interruptible) {
  return interruptible ? iterateSimple$6({ iterator: keys(set), next: next }, fn) : forEach$4(set, fn);
};

var SetHelpers$5 = setHelpers;
var iterate$9 = setIterate$1;

var Set$3 = SetHelpers$5.Set;
var add$3 = SetHelpers$5.add;

var setClone = function (set) {
  var result = new Set$3();
  iterate$9(set, function (it) {
    add$3(result, it);
  });
  return result;
};

var uncurryThisAccessor = functionUncurryThisAccessor;
var SetHelpers$4 = setHelpers;

var setSize = uncurryThisAccessor(SetHelpers$4.proto, 'size', 'get') || function (set) {
  return set.size;
};

// `GetIteratorDirect(obj)` abstract operation
// https://tc39.es/proposal-iterator-helpers/#sec-getiteratordirect
var getIteratorDirect$o = function (obj) {
  return {
    iterator: obj,
    next: obj.next,
    done: false
  };
};

var aCallable$k = aCallable$F;
var anObject$A = anObject$11;
var call$H = functionCall;
var toIntegerOrInfinity$8 = toIntegerOrInfinity$n;
var getIteratorDirect$n = getIteratorDirect$o;

var INVALID_SIZE = 'Invalid size';
var $RangeError$5 = RangeError;
var $TypeError$f = TypeError;
var max$4 = Math.max;

var SetRecord = function (set, intSize) {
  this.set = set;
  this.size = max$4(intSize, 0);
  this.has = aCallable$k(set.has);
  this.keys = aCallable$k(set.keys);
};

SetRecord.prototype = {
  getIterator: function () {
    return getIteratorDirect$n(anObject$A(call$H(this.keys, this.set)));
  },
  includes: function (it) {
    return call$H(this.has, this.set, it);
  }
};

// `GetSetRecord` abstract operation
// https://tc39.es/proposal-set-methods/#sec-getsetrecord
var getSetRecord$7 = function (obj) {
  anObject$A(obj);
  var numSize = +obj.size;
  // NOTE: If size is undefined, then numSize will be NaN
  // eslint-disable-next-line no-self-compare -- NaN check
  if (numSize !== numSize) throw new $TypeError$f(INVALID_SIZE);
  var intSize = toIntegerOrInfinity$8(numSize);
  if (intSize < 0) throw new $RangeError$5(INVALID_SIZE);
  return new SetRecord(obj, intSize);
};

var aSet$6 = aSet$7;
var SetHelpers$3 = setHelpers;
var clone$2 = setClone;
var size$4 = setSize;
var getSetRecord$6 = getSetRecord$7;
var iterateSet$2 = setIterate$1;
var iterateSimple$5 = iterateSimple$7;

var has$4 = SetHelpers$3.has;
var remove$1 = SetHelpers$3.remove;

// `Set.prototype.difference` method
// https://github.com/tc39/proposal-set-methods
var setDifference = function difference(other) {
  var O = aSet$6(this);
  var otherRec = getSetRecord$6(other);
  var result = clone$2(O);
  if (size$4(O) <= otherRec.size) iterateSet$2(O, function (e) {
    if (otherRec.includes(e)) remove$1(result, e);
  });
  else iterateSimple$5(otherRec.getIterator(), function (e) {
    if (has$4(O, e)) remove$1(result, e);
  });
  return result;
};

var getBuiltIn$j = getBuiltIn$C;

var createSetLike = function (size) {
  return {
    size: size,
    has: function () {
      return false;
    },
    keys: function () {
      return {
        next: function () {
          return { done: true };
        }
      };
    }
  };
};

var setMethodAcceptSetLike$7 = function (name) {
  var Set = getBuiltIn$j('Set');
  try {
    new Set()[name](createSetLike(0));
    try {
      // late spec change, early WebKit ~ Safari 17.0 beta implementation does not pass it
      // https://github.com/tc39/proposal-set-methods/pull/88
      new Set()[name](createSetLike(-1));
      return false;
    } catch (error2) {
      return true;
    }
  } catch (error) {
    return false;
  }
};

var $$1G = _export;
var difference = setDifference;
var setMethodAcceptSetLike$6 = setMethodAcceptSetLike$7;

// `Set.prototype.difference` method
// https://github.com/tc39/proposal-set-methods
$$1G({ target: 'Set', proto: true, real: true, forced: !setMethodAcceptSetLike$6('difference') }, {
  difference: difference
});

var aSet$5 = aSet$7;
var SetHelpers$2 = setHelpers;
var size$3 = setSize;
var getSetRecord$5 = getSetRecord$7;
var iterateSet$1 = setIterate$1;
var iterateSimple$4 = iterateSimple$7;

var Set$2 = SetHelpers$2.Set;
var add$2 = SetHelpers$2.add;
var has$3 = SetHelpers$2.has;

// `Set.prototype.intersection` method
// https://github.com/tc39/proposal-set-methods
var setIntersection = function intersection(other) {
  var O = aSet$5(this);
  var otherRec = getSetRecord$5(other);
  var result = new Set$2();

  if (size$3(O) > otherRec.size) {
    iterateSimple$4(otherRec.getIterator(), function (e) {
      if (has$3(O, e)) add$2(result, e);
    });
  } else {
    iterateSet$1(O, function (e) {
      if (otherRec.includes(e)) add$2(result, e);
    });
  }

  return result;
};

var $$1F = _export;
var fails$u = fails$1z;
var intersection = setIntersection;
var setMethodAcceptSetLike$5 = setMethodAcceptSetLike$7;

var INCORRECT = !setMethodAcceptSetLike$5('intersection') || fails$u(function () {
  // eslint-disable-next-line es/no-array-from, es/no-set -- testing
  return String(Array.from(new Set([1, 2, 3]).intersection(new Set([3, 2])))) !== '3,2';
});

// `Set.prototype.intersection` method
// https://github.com/tc39/proposal-set-methods
$$1F({ target: 'Set', proto: true, real: true, forced: INCORRECT }, {
  intersection: intersection
});

var aSet$4 = aSet$7;
var has$2 = setHelpers.has;
var size$2 = setSize;
var getSetRecord$4 = getSetRecord$7;
var iterateSet = setIterate$1;
var iterateSimple$3 = iterateSimple$7;
var iteratorClose$5 = iteratorClose$8;

// `Set.prototype.isDisjointFrom` method
// https://tc39.github.io/proposal-set-methods/#Set.prototype.isDisjointFrom
var setIsDisjointFrom = function isDisjointFrom(other) {
  var O = aSet$4(this);
  var otherRec = getSetRecord$4(other);
  if (size$2(O) <= otherRec.size) return iterateSet(O, function (e) {
    if (otherRec.includes(e)) return false;
  }, true) !== false;
  var iterator = otherRec.getIterator();
  return iterateSimple$3(iterator, function (e) {
    if (has$2(O, e)) return iteratorClose$5(iterator, 'normal', false);
  }) !== false;
};

var $$1E = _export;
var isDisjointFrom = setIsDisjointFrom;
var setMethodAcceptSetLike$4 = setMethodAcceptSetLike$7;

// `Set.prototype.isDisjointFrom` method
// https://github.com/tc39/proposal-set-methods
$$1E({ target: 'Set', proto: true, real: true, forced: !setMethodAcceptSetLike$4('isDisjointFrom') }, {
  isDisjointFrom: isDisjointFrom
});

var aSet$3 = aSet$7;
var size$1 = setSize;
var iterate$8 = setIterate$1;
var getSetRecord$3 = getSetRecord$7;

// `Set.prototype.isSubsetOf` method
// https://tc39.github.io/proposal-set-methods/#Set.prototype.isSubsetOf
var setIsSubsetOf = function isSubsetOf(other) {
  var O = aSet$3(this);
  var otherRec = getSetRecord$3(other);
  if (size$1(O) > otherRec.size) return false;
  return iterate$8(O, function (e) {
    if (!otherRec.includes(e)) return false;
  }, true) !== false;
};

var $$1D = _export;
var isSubsetOf = setIsSubsetOf;
var setMethodAcceptSetLike$3 = setMethodAcceptSetLike$7;

// `Set.prototype.isSubsetOf` method
// https://github.com/tc39/proposal-set-methods
$$1D({ target: 'Set', proto: true, real: true, forced: !setMethodAcceptSetLike$3('isSubsetOf') }, {
  isSubsetOf: isSubsetOf
});

var aSet$2 = aSet$7;
var has$1 = setHelpers.has;
var size = setSize;
var getSetRecord$2 = getSetRecord$7;
var iterateSimple$2 = iterateSimple$7;
var iteratorClose$4 = iteratorClose$8;

// `Set.prototype.isSupersetOf` method
// https://tc39.github.io/proposal-set-methods/#Set.prototype.isSupersetOf
var setIsSupersetOf = function isSupersetOf(other) {
  var O = aSet$2(this);
  var otherRec = getSetRecord$2(other);
  if (size(O) < otherRec.size) return false;
  var iterator = otherRec.getIterator();
  return iterateSimple$2(iterator, function (e) {
    if (!has$1(O, e)) return iteratorClose$4(iterator, 'normal', false);
  }) !== false;
};

var $$1C = _export;
var isSupersetOf = setIsSupersetOf;
var setMethodAcceptSetLike$2 = setMethodAcceptSetLike$7;

// `Set.prototype.isSupersetOf` method
// https://github.com/tc39/proposal-set-methods
$$1C({ target: 'Set', proto: true, real: true, forced: !setMethodAcceptSetLike$2('isSupersetOf') }, {
  isSupersetOf: isSupersetOf
});

var aSet$1 = aSet$7;
var SetHelpers$1 = setHelpers;
var clone$1 = setClone;
var getSetRecord$1 = getSetRecord$7;
var iterateSimple$1 = iterateSimple$7;

var add$1 = SetHelpers$1.add;
var has = SetHelpers$1.has;
var remove = SetHelpers$1.remove;

// `Set.prototype.symmetricDifference` method
// https://github.com/tc39/proposal-set-methods
var setSymmetricDifference = function symmetricDifference(other) {
  var O = aSet$1(this);
  var keysIter = getSetRecord$1(other).getIterator();
  var result = clone$1(O);
  iterateSimple$1(keysIter, function (e) {
    if (has(O, e)) remove(result, e);
    else add$1(result, e);
  });
  return result;
};

var $$1B = _export;
var symmetricDifference = setSymmetricDifference;
var setMethodAcceptSetLike$1 = setMethodAcceptSetLike$7;

// `Set.prototype.symmetricDifference` method
// https://github.com/tc39/proposal-set-methods
$$1B({ target: 'Set', proto: true, real: true, forced: !setMethodAcceptSetLike$1('symmetricDifference') }, {
  symmetricDifference: symmetricDifference
});

var aSet = aSet$7;
var add = setHelpers.add;
var clone = setClone;
var getSetRecord = getSetRecord$7;
var iterateSimple = iterateSimple$7;

// `Set.prototype.union` method
// https://github.com/tc39/proposal-set-methods
var setUnion = function union(other) {
  var O = aSet(this);
  var keysIter = getSetRecord(other).getIterator();
  var result = clone(O);
  iterateSimple(keysIter, function (it) {
    add(result, it);
  });
  return result;
};

var $$1A = _export;
var union = setUnion;
var setMethodAcceptSetLike = setMethodAcceptSetLike$7;

// `Set.prototype.union` method
// https://github.com/tc39/proposal-set-methods
$$1A({ target: 'Set', proto: true, real: true, forced: !setMethodAcceptSetLike('union') }, {
  union: union
});

var $$1z = _export;
var uncurryThis$M = functionUncurryThis;
var requireObjectCoercible$e = requireObjectCoercible$o;
var toIntegerOrInfinity$7 = toIntegerOrInfinity$n;
var toString$p = toString$F;
var fails$t = fails$1z;

var charAt$c = uncurryThis$M(''.charAt);

var FORCED$7 = fails$t(function () {
  // eslint-disable-next-line es/no-string-prototype-at -- safe
  return '𠮷'.at(-2) !== '\uD842';
});

// `String.prototype.at` method
// https://tc39.es/ecma262/#sec-string.prototype.at
$$1z({ target: 'String', proto: true, forced: FORCED$7 }, {
  at: function at(index) {
    var S = toString$p(requireObjectCoercible$e(this));
    var len = S.length;
    var relativeIndex = toIntegerOrInfinity$7(index);
    var k = relativeIndex >= 0 ? relativeIndex : len + relativeIndex;
    return (k < 0 || k >= len) ? undefined : charAt$c(S, k);
  }
});

var uncurryThis$L = functionUncurryThis;
var toIntegerOrInfinity$6 = toIntegerOrInfinity$n;
var toString$o = toString$F;
var requireObjectCoercible$d = requireObjectCoercible$o;

var charAt$b = uncurryThis$L(''.charAt);
var charCodeAt$5 = uncurryThis$L(''.charCodeAt);
var stringSlice$a = uncurryThis$L(''.slice);

var createMethod$1 = function (CONVERT_TO_STRING) {
  return function ($this, pos) {
    var S = toString$o(requireObjectCoercible$d($this));
    var position = toIntegerOrInfinity$6(pos);
    var size = S.length;
    var first, second;
    if (position < 0 || position >= size) return CONVERT_TO_STRING ? '' : undefined;
    first = charCodeAt$5(S, position);
    return first < 0xD800 || first > 0xDBFF || position + 1 === size
      || (second = charCodeAt$5(S, position + 1)) < 0xDC00 || second > 0xDFFF
        ? CONVERT_TO_STRING
          ? charAt$b(S, position)
          : first
        : CONVERT_TO_STRING
          ? stringSlice$a(S, position, position + 2)
          : (first - 0xD800 << 10) + (second - 0xDC00) + 0x10000;
  };
};

var stringMultibyte = {
  // `String.prototype.codePointAt` method
  // https://tc39.es/ecma262/#sec-string.prototype.codepointat
  codeAt: createMethod$1(false),
  // `String.prototype.at` method
  // https://github.com/mathiasbynens/String.prototype.at
  charAt: createMethod$1(true)
};

var $$1y = _export;
var codeAt$1 = stringMultibyte.codeAt;

// `String.prototype.codePointAt` method
// https://tc39.es/ecma262/#sec-string.prototype.codepointat
$$1y({ target: 'String', proto: true }, {
  codePointAt: function codePointAt(pos) {
    return codeAt$1(this, pos);
  }
});

var isRegExp$2 = isRegexp;

var $TypeError$e = TypeError;

var notARegexp = function (it) {
  if (isRegExp$2(it)) {
    throw new $TypeError$e("The method doesn't accept regular expressions");
  } return it;
};

var wellKnownSymbol$n = wellKnownSymbol$O;

var MATCH = wellKnownSymbol$n('match');

var correctIsRegexpLogic = function (METHOD_NAME) {
  var regexp = /./;
  try {
    '/./'[METHOD_NAME](regexp);
  } catch (error1) {
    try {
      regexp[MATCH] = false;
      return '/./'[METHOD_NAME](regexp);
    } catch (error2) { /* empty */ }
  } return false;
};

var $$1x = _export;
var uncurryThis$K = functionUncurryThisClause;
var getOwnPropertyDescriptor$4 = objectGetOwnPropertyDescriptor.f;
var toLength$7 = toLength$d;
var toString$n = toString$F;
var notARegExp$2 = notARegexp;
var requireObjectCoercible$c = requireObjectCoercible$o;
var correctIsRegExpLogic$2 = correctIsRegexpLogic;

var slice$5 = uncurryThis$K(''.slice);
var min$6 = Math.min;

var CORRECT_IS_REGEXP_LOGIC$1 = correctIsRegExpLogic$2('endsWith');
// https://github.com/zloirock/core-js/pull/702
var MDN_POLYFILL_BUG$1 = !CORRECT_IS_REGEXP_LOGIC$1 && !!function () {
  var descriptor = getOwnPropertyDescriptor$4(String.prototype, 'endsWith');
  return descriptor && !descriptor.writable;
}();

// `String.prototype.endsWith` method
// https://tc39.es/ecma262/#sec-string.prototype.endswith
$$1x({ target: 'String', proto: true, forced: !MDN_POLYFILL_BUG$1 && !CORRECT_IS_REGEXP_LOGIC$1 }, {
  endsWith: function endsWith(searchString /* , endPosition = @length */) {
    var that = toString$n(requireObjectCoercible$c(this));
    notARegExp$2(searchString);
    var endPosition = arguments.length > 1 ? arguments[1] : undefined;
    var len = that.length;
    var end = endPosition === undefined ? len : min$6(toLength$7(endPosition), len);
    var search = toString$n(searchString);
    return slice$5(that, end - search.length, end) === search;
  }
});

var $$1w = _export;
var uncurryThis$J = functionUncurryThis;
var toAbsoluteIndex$2 = toAbsoluteIndex$a;

var $RangeError$4 = RangeError;
var fromCharCode$4 = String.fromCharCode;
// eslint-disable-next-line es/no-string-fromcodepoint -- required for testing
var $fromCodePoint = String.fromCodePoint;
var join$7 = uncurryThis$J([].join);

// length should be 1, old FF problem
var INCORRECT_LENGTH = !!$fromCodePoint && $fromCodePoint.length !== 1;

// `String.fromCodePoint` method
// https://tc39.es/ecma262/#sec-string.fromcodepoint
$$1w({ target: 'String', stat: true, arity: 1, forced: INCORRECT_LENGTH }, {
  // eslint-disable-next-line no-unused-vars -- required for `.length`
  fromCodePoint: function fromCodePoint(x) {
    var elements = [];
    var length = arguments.length;
    var i = 0;
    var code;
    while (length > i) {
      code = +arguments[i++];
      if (toAbsoluteIndex$2(code, 0x10FFFF) !== code) throw new $RangeError$4(code + ' is not a valid code point');
      elements[i] = code < 0x10000
        ? fromCharCode$4(code)
        : fromCharCode$4(((code -= 0x10000) >> 10) + 0xD800, code % 0x400 + 0xDC00);
    } return join$7(elements, '');
  }
});

var $$1v = _export;
var uncurryThis$I = functionUncurryThis;
var notARegExp$1 = notARegexp;
var requireObjectCoercible$b = requireObjectCoercible$o;
var toString$m = toString$F;
var correctIsRegExpLogic$1 = correctIsRegexpLogic;

var stringIndexOf$2 = uncurryThis$I(''.indexOf);

// `String.prototype.includes` method
// https://tc39.es/ecma262/#sec-string.prototype.includes
$$1v({ target: 'String', proto: true, forced: !correctIsRegExpLogic$1('includes') }, {
  includes: function includes(searchString /* , position = 0 */) {
    return !!~stringIndexOf$2(
      toString$m(requireObjectCoercible$b(this)),
      toString$m(notARegExp$1(searchString)),
      arguments.length > 1 ? arguments[1] : undefined
    );
  }
});

var $$1u = _export;
var uncurryThis$H = functionUncurryThis;
var requireObjectCoercible$a = requireObjectCoercible$o;
var toString$l = toString$F;

var charCodeAt$4 = uncurryThis$H(''.charCodeAt);

// `String.prototype.isWellFormed` method
// https://github.com/tc39/proposal-is-usv-string
$$1u({ target: 'String', proto: true }, {
  isWellFormed: function isWellFormed() {
    var S = toString$l(requireObjectCoercible$a(this));
    var length = S.length;
    for (var i = 0; i < length; i++) {
      var charCode = charCodeAt$4(S, i);
      // single UTF-16 code unit
      if ((charCode & 0xF800) !== 0xD800) continue;
      // unpaired surrogate
      if (charCode >= 0xDC00 || ++i >= length || (charCodeAt$4(S, i) & 0xFC00) !== 0xDC00) return false;
    } return true;
  }
});

var charAt$a = stringMultibyte.charAt;
var toString$k = toString$F;
var InternalStateModule$b = internalState;
var defineIterator = iteratorDefine;
var createIterResultObject$a = createIterResultObject$d;

var STRING_ITERATOR = 'String Iterator';
var setInternalState$c = InternalStateModule$b.set;
var getInternalState$5 = InternalStateModule$b.getterFor(STRING_ITERATOR);

// `String.prototype[@@iterator]` method
// https://tc39.es/ecma262/#sec-string.prototype-@@iterator
defineIterator(String, 'String', function (iterated) {
  setInternalState$c(this, {
    type: STRING_ITERATOR,
    string: toString$k(iterated),
    index: 0
  });
// `%StringIteratorPrototype%.next` method
// https://tc39.es/ecma262/#sec-%stringiteratorprototype%.next
}, function next() {
  var state = getInternalState$5(this);
  var string = state.string;
  var index = state.index;
  var point;
  if (index >= string.length) return createIterResultObject$a(undefined, true);
  point = charAt$a(string, index);
  state.index += point.length;
  return createIterResultObject$a(point, false);
});

// TODO: Remove from `core-js@4` since it's moved to entry points

var call$G = functionCall;
var defineBuiltIn$b = defineBuiltIn$t;
var regexpExec$1 = regexpExec$2;
var fails$s = fails$1z;
var wellKnownSymbol$m = wellKnownSymbol$O;
var createNonEnumerableProperty$8 = createNonEnumerableProperty$j;

var SPECIES = wellKnownSymbol$m('species');
var RegExpPrototype$1 = RegExp.prototype;

var fixRegexpWellKnownSymbolLogic = function (KEY, exec, FORCED, SHAM) {
  var SYMBOL = wellKnownSymbol$m(KEY);

  var DELEGATES_TO_SYMBOL = !fails$s(function () {
    // String methods call symbol-named RegExp methods
    var O = {};
    O[SYMBOL] = function () { return 7; };
    return ''[KEY](O) !== 7;
  });

  var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL && !fails$s(function () {
    // Symbol-named RegExp methods call .exec
    var execCalled = false;
    var re = /a/;

    if (KEY === 'split') {
      // We can't use real regex here since it causes deoptimization
      // and serious performance degradation in V8
      // https://github.com/zloirock/core-js/issues/306
      re = {};
      // RegExp[@@split] doesn't call the regex's exec method, but first creates
      // a new one. We need to return the patched regex when creating the new one.
      re.constructor = {};
      re.constructor[SPECIES] = function () { return re; };
      re.flags = '';
      re[SYMBOL] = /./[SYMBOL];
    }

    re.exec = function () {
      execCalled = true;
      return null;
    };

    re[SYMBOL]('');
    return !execCalled;
  });

  if (
    !DELEGATES_TO_SYMBOL ||
    !DELEGATES_TO_EXEC ||
    FORCED
  ) {
    var nativeRegExpMethod = /./[SYMBOL];
    var methods = exec(SYMBOL, ''[KEY], function (nativeMethod, regexp, str, arg2, forceStringMethod) {
      var $exec = regexp.exec;
      if ($exec === regexpExec$1 || $exec === RegExpPrototype$1.exec) {
        if (DELEGATES_TO_SYMBOL && !forceStringMethod) {
          // The native String method already delegates to @@method (this
          // polyfilled function), leasing to infinite recursion.
          // We avoid it by directly calling the native @@method method.
          return { done: true, value: call$G(nativeRegExpMethod, regexp, str, arg2) };
        }
        return { done: true, value: call$G(nativeMethod, str, regexp, arg2) };
      }
      return { done: false };
    });

    defineBuiltIn$b(String.prototype, KEY, methods[0]);
    defineBuiltIn$b(RegExpPrototype$1, SYMBOL, methods[1]);
  }

  if (SHAM) createNonEnumerableProperty$8(RegExpPrototype$1[SYMBOL], 'sham', true);
};

var charAt$9 = stringMultibyte.charAt;

// `AdvanceStringIndex` abstract operation
// https://tc39.es/ecma262/#sec-advancestringindex
var advanceStringIndex$4 = function (S, index, unicode) {
  return index + (unicode ? charAt$9(S, index).length : 1);
};

var call$F = functionCall;
var anObject$z = anObject$11;
var isCallable$a = isCallable$D;
var classof$8 = classofRaw$2;
var regexpExec = regexpExec$2;

var $TypeError$d = TypeError;

// `RegExpExec` abstract operation
// https://tc39.es/ecma262/#sec-regexpexec
var regexpExecAbstract = function (R, S) {
  var exec = R.exec;
  if (isCallable$a(exec)) {
    var result = call$F(exec, R, S);
    if (result !== null) anObject$z(result);
    return result;
  }
  if (classof$8(R) === 'RegExp') return call$F(regexpExec, R, S);
  throw new $TypeError$d('RegExp#exec called on incompatible receiver');
};

var call$E = functionCall;
var fixRegExpWellKnownSymbolLogic$3 = fixRegexpWellKnownSymbolLogic;
var anObject$y = anObject$11;
var isNullOrUndefined$8 = isNullOrUndefined$f;
var toLength$6 = toLength$d;
var toString$j = toString$F;
var requireObjectCoercible$9 = requireObjectCoercible$o;
var getMethod$f = getMethod$j;
var advanceStringIndex$3 = advanceStringIndex$4;
var regExpExec$4 = regexpExecAbstract;

// @@match logic
fixRegExpWellKnownSymbolLogic$3('match', function (MATCH, nativeMatch, maybeCallNative) {
  return [
    // `String.prototype.match` method
    // https://tc39.es/ecma262/#sec-string.prototype.match
    function match(regexp) {
      var O = requireObjectCoercible$9(this);
      var matcher = isNullOrUndefined$8(regexp) ? undefined : getMethod$f(regexp, MATCH);
      return matcher ? call$E(matcher, regexp, O) : new RegExp(regexp)[MATCH](toString$j(O));
    },
    // `RegExp.prototype[@@match]` method
    // https://tc39.es/ecma262/#sec-regexp.prototype-@@match
    function (string) {
      var rx = anObject$y(this);
      var S = toString$j(string);
      var res = maybeCallNative(nativeMatch, rx, S);

      if (res.done) return res.value;

      if (!rx.global) return regExpExec$4(rx, S);

      var fullUnicode = rx.unicode;
      rx.lastIndex = 0;
      var A = [];
      var n = 0;
      var result;
      while ((result = regExpExec$4(rx, S)) !== null) {
        var matchStr = toString$j(result[0]);
        A[n] = matchStr;
        if (matchStr === '') rx.lastIndex = advanceStringIndex$3(S, toLength$6(rx.lastIndex), fullUnicode);
        n++;
      }
      return n === 0 ? null : A;
    }
  ];
});

/* eslint-disable es/no-string-prototype-matchall -- safe */
var $$1t = _export;
var call$D = functionCall;
var uncurryThis$G = functionUncurryThisClause;
var createIteratorConstructor$1 = iteratorCreateConstructor;
var createIterResultObject$9 = createIterResultObject$d;
var requireObjectCoercible$8 = requireObjectCoercible$o;
var toLength$5 = toLength$d;
var toString$i = toString$F;
var anObject$x = anObject$11;
var isNullOrUndefined$7 = isNullOrUndefined$f;
var classof$7 = classofRaw$2;
var isRegExp$1 = isRegexp;
var getRegExpFlags$2 = regexpGetFlags;
var getMethod$e = getMethod$j;
var defineBuiltIn$a = defineBuiltIn$t;
var fails$r = fails$1z;
var wellKnownSymbol$l = wellKnownSymbol$O;
var speciesConstructor$2 = speciesConstructor$6;
var advanceStringIndex$2 = advanceStringIndex$4;
var regExpExec$3 = regexpExecAbstract;
var InternalStateModule$a = internalState;
var IS_PURE$h = isPure;

var MATCH_ALL = wellKnownSymbol$l('matchAll');
var REGEXP_STRING = 'RegExp String';
var REGEXP_STRING_ITERATOR = REGEXP_STRING + ' Iterator';
var setInternalState$b = InternalStateModule$a.set;
var getInternalState$4 = InternalStateModule$a.getterFor(REGEXP_STRING_ITERATOR);
var RegExpPrototype = RegExp.prototype;
var $TypeError$c = TypeError;
var stringIndexOf$1 = uncurryThis$G(''.indexOf);
var nativeMatchAll = uncurryThis$G(''.matchAll);

var WORKS_WITH_NON_GLOBAL_REGEX = !!nativeMatchAll && !fails$r(function () {
  nativeMatchAll('a', /./);
});

var $RegExpStringIterator = createIteratorConstructor$1(function RegExpStringIterator(regexp, string, $global, fullUnicode) {
  setInternalState$b(this, {
    type: REGEXP_STRING_ITERATOR,
    regexp: regexp,
    string: string,
    global: $global,
    unicode: fullUnicode,
    done: false
  });
}, REGEXP_STRING, function next() {
  var state = getInternalState$4(this);
  if (state.done) return createIterResultObject$9(undefined, true);
  var R = state.regexp;
  var S = state.string;
  var match = regExpExec$3(R, S);
  if (match === null) {
    state.done = true;
    return createIterResultObject$9(undefined, true);
  }
  if (state.global) {
    if (toString$i(match[0]) === '') R.lastIndex = advanceStringIndex$2(S, toLength$5(R.lastIndex), state.unicode);
    return createIterResultObject$9(match, false);
  }
  state.done = true;
  return createIterResultObject$9(match, false);
});

var $matchAll = function (string) {
  var R = anObject$x(this);
  var S = toString$i(string);
  var C = speciesConstructor$2(R, RegExp);
  var flags = toString$i(getRegExpFlags$2(R));
  var matcher, $global, fullUnicode;
  matcher = new C(C === RegExp ? R.source : R, flags);
  $global = !!~stringIndexOf$1(flags, 'g');
  fullUnicode = !!~stringIndexOf$1(flags, 'u');
  matcher.lastIndex = toLength$5(R.lastIndex);
  return new $RegExpStringIterator(matcher, S, $global, fullUnicode);
};

// `String.prototype.matchAll` method
// https://tc39.es/ecma262/#sec-string.prototype.matchall
$$1t({ target: 'String', proto: true, forced: WORKS_WITH_NON_GLOBAL_REGEX }, {
  matchAll: function matchAll(regexp) {
    var O = requireObjectCoercible$8(this);
    var flags, S, matcher, rx;
    if (!isNullOrUndefined$7(regexp)) {
      if (isRegExp$1(regexp)) {
        flags = toString$i(requireObjectCoercible$8(getRegExpFlags$2(regexp)));
        if (!~stringIndexOf$1(flags, 'g')) throw new $TypeError$c('`.matchAll` does not allow non-global regexes');
      }
      if (WORKS_WITH_NON_GLOBAL_REGEX) return nativeMatchAll(O, regexp);
      matcher = getMethod$e(regexp, MATCH_ALL);
      if (matcher === undefined && IS_PURE$h && classof$7(regexp) === 'RegExp') matcher = $matchAll;
      if (matcher) return call$D(matcher, regexp, O);
    } else if (WORKS_WITH_NON_GLOBAL_REGEX) return nativeMatchAll(O, regexp);
    S = toString$i(O);
    rx = new RegExp(regexp, 'g');
    return rx[MATCH_ALL](S);
  }
});

MATCH_ALL in RegExpPrototype || defineBuiltIn$a(RegExpPrototype, MATCH_ALL, $matchAll);

// https://github.com/zloirock/core-js/issues/280
var userAgent = environmentUserAgent;

var stringPadWebkitBug = /Version\/10(?:\.\d+){1,2}(?: [\w./]+)?(?: Mobile\/\w+)? Safari\//.test(userAgent);

var $$1s = _export;
var $padEnd = stringPad.end;
var WEBKIT_BUG$1 = stringPadWebkitBug;

// `String.prototype.padEnd` method
// https://tc39.es/ecma262/#sec-string.prototype.padend
$$1s({ target: 'String', proto: true, forced: WEBKIT_BUG$1 }, {
  padEnd: function padEnd(maxLength /* , fillString = ' ' */) {
    return $padEnd(this, maxLength, arguments.length > 1 ? arguments[1] : undefined);
  }
});

var $$1r = _export;
var $padStart = stringPad.start;
var WEBKIT_BUG = stringPadWebkitBug;

// `String.prototype.padStart` method
// https://tc39.es/ecma262/#sec-string.prototype.padstart
$$1r({ target: 'String', proto: true, forced: WEBKIT_BUG }, {
  padStart: function padStart(maxLength /* , fillString = ' ' */) {
    return $padStart(this, maxLength, arguments.length > 1 ? arguments[1] : undefined);
  }
});

var $$1q = _export;
var uncurryThis$F = functionUncurryThis;
var toIndexedObject$1 = toIndexedObject$j;
var toObject$7 = toObject$y;
var toString$h = toString$F;
var lengthOfArrayLike$8 = lengthOfArrayLike$w;

var push$d = uncurryThis$F([].push);
var join$6 = uncurryThis$F([].join);

// `String.raw` method
// https://tc39.es/ecma262/#sec-string.raw
$$1q({ target: 'String', stat: true }, {
  raw: function raw(template) {
    var rawTemplate = toIndexedObject$1(toObject$7(template).raw);
    var literalSegments = lengthOfArrayLike$8(rawTemplate);
    if (!literalSegments) return '';
    var argumentsLength = arguments.length;
    var elements = [];
    var i = 0;
    while (true) {
      push$d(elements, toString$h(rawTemplate[i++]));
      if (i === literalSegments) return join$6(elements, '');
      if (i < argumentsLength) push$d(elements, toString$h(arguments[i]));
    }
  }
});

var $$1p = _export;
var repeat = stringRepeat;

// `String.prototype.repeat` method
// https://tc39.es/ecma262/#sec-string.prototype.repeat
$$1p({ target: 'String', proto: true }, {
  repeat: repeat
});

var uncurryThis$E = functionUncurryThis;
var toObject$6 = toObject$y;

var floor$3 = Math.floor;
var charAt$8 = uncurryThis$E(''.charAt);
var replace$5 = uncurryThis$E(''.replace);
var stringSlice$9 = uncurryThis$E(''.slice);
// eslint-disable-next-line redos/no-vulnerable -- safe
var SUBSTITUTION_SYMBOLS = /\$([$&'`]|\d{1,2}|<[^>]*>)/g;
var SUBSTITUTION_SYMBOLS_NO_NAMED = /\$([$&'`]|\d{1,2})/g;

// `GetSubstitution` abstract operation
// https://tc39.es/ecma262/#sec-getsubstitution
var getSubstitution$2 = function (matched, str, position, captures, namedCaptures, replacement) {
  var tailPos = position + matched.length;
  var m = captures.length;
  var symbols = SUBSTITUTION_SYMBOLS_NO_NAMED;
  if (namedCaptures !== undefined) {
    namedCaptures = toObject$6(namedCaptures);
    symbols = SUBSTITUTION_SYMBOLS;
  }
  return replace$5(replacement, symbols, function (match, ch) {
    var capture;
    switch (charAt$8(ch, 0)) {
      case '$': return '$';
      case '&': return matched;
      case '`': return stringSlice$9(str, 0, position);
      case "'": return stringSlice$9(str, tailPos);
      case '<':
        capture = namedCaptures[stringSlice$9(ch, 1, -1)];
        break;
      default: // \d\d?
        var n = +ch;
        if (n === 0) return match;
        if (n > m) {
          var f = floor$3(n / 10);
          if (f === 0) return match;
          if (f <= m) return captures[f - 1] === undefined ? charAt$8(ch, 1) : captures[f - 1] + charAt$8(ch, 1);
          return match;
        }
        capture = captures[n - 1];
    }
    return capture === undefined ? '' : capture;
  });
};

var apply$4 = functionApply$1;
var call$C = functionCall;
var uncurryThis$D = functionUncurryThis;
var fixRegExpWellKnownSymbolLogic$2 = fixRegexpWellKnownSymbolLogic;
var fails$q = fails$1z;
var anObject$w = anObject$11;
var isCallable$9 = isCallable$D;
var isNullOrUndefined$6 = isNullOrUndefined$f;
var toIntegerOrInfinity$5 = toIntegerOrInfinity$n;
var toLength$4 = toLength$d;
var toString$g = toString$F;
var requireObjectCoercible$7 = requireObjectCoercible$o;
var advanceStringIndex$1 = advanceStringIndex$4;
var getMethod$d = getMethod$j;
var getSubstitution$1 = getSubstitution$2;
var regExpExec$2 = regexpExecAbstract;
var wellKnownSymbol$k = wellKnownSymbol$O;

var REPLACE$1 = wellKnownSymbol$k('replace');
var max$3 = Math.max;
var min$5 = Math.min;
var concat = uncurryThis$D([].concat);
var push$c = uncurryThis$D([].push);
var stringIndexOf = uncurryThis$D(''.indexOf);
var stringSlice$8 = uncurryThis$D(''.slice);

var maybeToString = function (it) {
  return it === undefined ? it : String(it);
};

// IE <= 11 replaces $0 with the whole match, as if it was $&
// https://stackoverflow.com/questions/6024666/getting-ie-to-replace-a-regex-with-the-literal-string-0
var REPLACE_KEEPS_$0 = (function () {
  // eslint-disable-next-line regexp/prefer-escape-replacement-dollar-char -- required for testing
  return 'a'.replace(/./, '$0') === '$0';
})();

// Safari <= 13.0.3(?) substitutes nth capture where n>m with an empty string
var REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE = (function () {
  if (/./[REPLACE$1]) {
    return /./[REPLACE$1]('a', '$0') === '';
  }
  return false;
})();

var REPLACE_SUPPORTS_NAMED_GROUPS = !fails$q(function () {
  var re = /./;
  re.exec = function () {
    var result = [];
    result.groups = { a: '7' };
    return result;
  };
  // eslint-disable-next-line regexp/no-useless-dollar-replacements -- false positive
  return ''.replace(re, '$<a>') !== '7';
});

// @@replace logic
fixRegExpWellKnownSymbolLogic$2('replace', function (_, nativeReplace, maybeCallNative) {
  var UNSAFE_SUBSTITUTE = REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE ? '$' : '$0';

  return [
    // `String.prototype.replace` method
    // https://tc39.es/ecma262/#sec-string.prototype.replace
    function replace(searchValue, replaceValue) {
      var O = requireObjectCoercible$7(this);
      var replacer = isNullOrUndefined$6(searchValue) ? undefined : getMethod$d(searchValue, REPLACE$1);
      return replacer
        ? call$C(replacer, searchValue, O, replaceValue)
        : call$C(nativeReplace, toString$g(O), searchValue, replaceValue);
    },
    // `RegExp.prototype[@@replace]` method
    // https://tc39.es/ecma262/#sec-regexp.prototype-@@replace
    function (string, replaceValue) {
      var rx = anObject$w(this);
      var S = toString$g(string);

      if (
        typeof replaceValue == 'string' &&
        stringIndexOf(replaceValue, UNSAFE_SUBSTITUTE) === -1 &&
        stringIndexOf(replaceValue, '$<') === -1
      ) {
        var res = maybeCallNative(nativeReplace, rx, S, replaceValue);
        if (res.done) return res.value;
      }

      var functionalReplace = isCallable$9(replaceValue);
      if (!functionalReplace) replaceValue = toString$g(replaceValue);

      var global = rx.global;
      var fullUnicode;
      if (global) {
        fullUnicode = rx.unicode;
        rx.lastIndex = 0;
      }

      var results = [];
      var result;
      while (true) {
        result = regExpExec$2(rx, S);
        if (result === null) break;

        push$c(results, result);
        if (!global) break;

        var matchStr = toString$g(result[0]);
        if (matchStr === '') rx.lastIndex = advanceStringIndex$1(S, toLength$4(rx.lastIndex), fullUnicode);
      }

      var accumulatedResult = '';
      var nextSourcePosition = 0;
      for (var i = 0; i < results.length; i++) {
        result = results[i];

        var matched = toString$g(result[0]);
        var position = max$3(min$5(toIntegerOrInfinity$5(result.index), S.length), 0);
        var captures = [];
        var replacement;
        // NOTE: This is equivalent to
        //   captures = result.slice(1).map(maybeToString)
        // but for some reason `nativeSlice.call(result, 1, result.length)` (called in
        // the slice polyfill when slicing native arrays) "doesn't work" in safari 9 and
        // causes a crash (https://pastebin.com/N21QzeQA) when trying to debug it.
        for (var j = 1; j < result.length; j++) push$c(captures, maybeToString(result[j]));
        var namedCaptures = result.groups;
        if (functionalReplace) {
          var replacerArgs = concat([matched], captures, position, S);
          if (namedCaptures !== undefined) push$c(replacerArgs, namedCaptures);
          replacement = toString$g(apply$4(replaceValue, undefined, replacerArgs));
        } else {
          replacement = getSubstitution$1(matched, S, position, captures, namedCaptures, replaceValue);
        }
        if (position >= nextSourcePosition) {
          accumulatedResult += stringSlice$8(S, nextSourcePosition, position) + replacement;
          nextSourcePosition = position + matched.length;
        }
      }

      return accumulatedResult + stringSlice$8(S, nextSourcePosition);
    }
  ];
}, !REPLACE_SUPPORTS_NAMED_GROUPS || !REPLACE_KEEPS_$0 || REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE);

var $$1o = _export;
var call$B = functionCall;
var uncurryThis$C = functionUncurryThis;
var requireObjectCoercible$6 = requireObjectCoercible$o;
var isCallable$8 = isCallable$D;
var isNullOrUndefined$5 = isNullOrUndefined$f;
var isRegExp = isRegexp;
var toString$f = toString$F;
var getMethod$c = getMethod$j;
var getRegExpFlags$1 = regexpGetFlags;
var getSubstitution = getSubstitution$2;
var wellKnownSymbol$j = wellKnownSymbol$O;

var REPLACE = wellKnownSymbol$j('replace');
var $TypeError$b = TypeError;
var indexOf = uncurryThis$C(''.indexOf);
uncurryThis$C(''.replace);
var stringSlice$7 = uncurryThis$C(''.slice);
var max$2 = Math.max;

// `String.prototype.replaceAll` method
// https://tc39.es/ecma262/#sec-string.prototype.replaceall
$$1o({ target: 'String', proto: true }, {
  replaceAll: function replaceAll(searchValue, replaceValue) {
    var O = requireObjectCoercible$6(this);
    var IS_REG_EXP, flags, replacer, string, searchString, functionalReplace, searchLength, advanceBy, position, replacement;
    var endOfLastMatch = 0;
    var result = '';
    if (!isNullOrUndefined$5(searchValue)) {
      IS_REG_EXP = isRegExp(searchValue);
      if (IS_REG_EXP) {
        flags = toString$f(requireObjectCoercible$6(getRegExpFlags$1(searchValue)));
        if (!~indexOf(flags, 'g')) throw new $TypeError$b('`.replaceAll` does not allow non-global regexes');
      }
      replacer = getMethod$c(searchValue, REPLACE);
      if (replacer) return call$B(replacer, searchValue, O, replaceValue);
    }
    string = toString$f(O);
    searchString = toString$f(searchValue);
    functionalReplace = isCallable$8(replaceValue);
    if (!functionalReplace) replaceValue = toString$f(replaceValue);
    searchLength = searchString.length;
    advanceBy = max$2(1, searchLength);
    position = indexOf(string, searchString);
    while (position !== -1) {
      replacement = functionalReplace
        ? toString$f(replaceValue(searchString, position, string))
        : getSubstitution(searchString, string, position, [], undefined, replaceValue);
      result += stringSlice$7(string, endOfLastMatch, position) + replacement;
      endOfLastMatch = position + searchLength;
      position = position + advanceBy > string.length ? -1 : indexOf(string, searchString, position + advanceBy);
    }
    if (endOfLastMatch < string.length) {
      result += stringSlice$7(string, endOfLastMatch);
    }
    return result;
  }
});

var call$A = functionCall;
var fixRegExpWellKnownSymbolLogic$1 = fixRegexpWellKnownSymbolLogic;
var anObject$v = anObject$11;
var isNullOrUndefined$4 = isNullOrUndefined$f;
var requireObjectCoercible$5 = requireObjectCoercible$o;
var sameValue = sameValue$1;
var toString$e = toString$F;
var getMethod$b = getMethod$j;
var regExpExec$1 = regexpExecAbstract;

// @@search logic
fixRegExpWellKnownSymbolLogic$1('search', function (SEARCH, nativeSearch, maybeCallNative) {
  return [
    // `String.prototype.search` method
    // https://tc39.es/ecma262/#sec-string.prototype.search
    function search(regexp) {
      var O = requireObjectCoercible$5(this);
      var searcher = isNullOrUndefined$4(regexp) ? undefined : getMethod$b(regexp, SEARCH);
      return searcher ? call$A(searcher, regexp, O) : new RegExp(regexp)[SEARCH](toString$e(O));
    },
    // `RegExp.prototype[@@search]` method
    // https://tc39.es/ecma262/#sec-regexp.prototype-@@search
    function (string) {
      var rx = anObject$v(this);
      var S = toString$e(string);
      var res = maybeCallNative(nativeSearch, rx, S);

      if (res.done) return res.value;

      var previousLastIndex = rx.lastIndex;
      if (!sameValue(previousLastIndex, 0)) rx.lastIndex = 0;
      var result = regExpExec$1(rx, S);
      if (!sameValue(rx.lastIndex, previousLastIndex)) rx.lastIndex = previousLastIndex;
      return result === null ? -1 : result.index;
    }
  ];
});

var call$z = functionCall;
var uncurryThis$B = functionUncurryThis;
var fixRegExpWellKnownSymbolLogic = fixRegexpWellKnownSymbolLogic;
var anObject$u = anObject$11;
var isNullOrUndefined$3 = isNullOrUndefined$f;
var requireObjectCoercible$4 = requireObjectCoercible$o;
var speciesConstructor$1 = speciesConstructor$6;
var advanceStringIndex = advanceStringIndex$4;
var toLength$3 = toLength$d;
var toString$d = toString$F;
var getMethod$a = getMethod$j;
var regExpExec = regexpExecAbstract;
var stickyHelpers = regexpStickyHelpers;
var fails$p = fails$1z;

var UNSUPPORTED_Y = stickyHelpers.UNSUPPORTED_Y;
var MAX_UINT32 = 0xFFFFFFFF;
var min$4 = Math.min;
var push$b = uncurryThis$B([].push);
var stringSlice$6 = uncurryThis$B(''.slice);

// Chrome 51 has a buggy "split" implementation when RegExp#exec !== nativeExec
// Weex JS has frozen built-in prototypes, so use try / catch wrapper
var SPLIT_WORKS_WITH_OVERWRITTEN_EXEC = !fails$p(function () {
  // eslint-disable-next-line regexp/no-empty-group -- required for testing
  var re = /(?:)/;
  var originalExec = re.exec;
  re.exec = function () { return originalExec.apply(this, arguments); };
  var result = 'ab'.split(re);
  return result.length !== 2 || result[0] !== 'a' || result[1] !== 'b';
});

var BUGGY = 'abbc'.split(/(b)*/)[1] === 'c' ||
  // eslint-disable-next-line regexp/no-empty-group -- required for testing
  'test'.split(/(?:)/, -1).length !== 4 ||
  'ab'.split(/(?:ab)*/).length !== 2 ||
  '.'.split(/(.?)(.?)/).length !== 4 ||
  // eslint-disable-next-line regexp/no-empty-capturing-group, regexp/no-empty-group -- required for testing
  '.'.split(/()()/).length > 1 ||
  ''.split(/.?/).length;

// @@split logic
fixRegExpWellKnownSymbolLogic('split', function (SPLIT, nativeSplit, maybeCallNative) {
  var internalSplit = '0'.split(undefined, 0).length ? function (separator, limit) {
    return separator === undefined && limit === 0 ? [] : call$z(nativeSplit, this, separator, limit);
  } : nativeSplit;

  return [
    // `String.prototype.split` method
    // https://tc39.es/ecma262/#sec-string.prototype.split
    function split(separator, limit) {
      var O = requireObjectCoercible$4(this);
      var splitter = isNullOrUndefined$3(separator) ? undefined : getMethod$a(separator, SPLIT);
      return splitter
        ? call$z(splitter, separator, O, limit)
        : call$z(internalSplit, toString$d(O), separator, limit);
    },
    // `RegExp.prototype[@@split]` method
    // https://tc39.es/ecma262/#sec-regexp.prototype-@@split
    //
    // NOTE: This cannot be properly polyfilled in engines that don't support
    // the 'y' flag.
    function (string, limit) {
      var rx = anObject$u(this);
      var S = toString$d(string);

      if (!BUGGY) {
        var res = maybeCallNative(internalSplit, rx, S, limit, internalSplit !== nativeSplit);
        if (res.done) return res.value;
      }

      var C = speciesConstructor$1(rx, RegExp);
      var unicodeMatching = rx.unicode;
      var flags = (rx.ignoreCase ? 'i' : '') +
                  (rx.multiline ? 'm' : '') +
                  (rx.unicode ? 'u' : '') +
                  (UNSUPPORTED_Y ? 'g' : 'y');
      // ^(? + rx + ) is needed, in combination with some S slicing, to
      // simulate the 'y' flag.
      var splitter = new C(UNSUPPORTED_Y ? '^(?:' + rx.source + ')' : rx, flags);
      var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
      if (lim === 0) return [];
      if (S.length === 0) return regExpExec(splitter, S) === null ? [S] : [];
      var p = 0;
      var q = 0;
      var A = [];
      while (q < S.length) {
        splitter.lastIndex = UNSUPPORTED_Y ? 0 : q;
        var z = regExpExec(splitter, UNSUPPORTED_Y ? stringSlice$6(S, q) : S);
        var e;
        if (
          z === null ||
          (e = min$4(toLength$3(splitter.lastIndex + (UNSUPPORTED_Y ? q : 0)), S.length)) === p
        ) {
          q = advanceStringIndex(S, q, unicodeMatching);
        } else {
          push$b(A, stringSlice$6(S, p, q));
          if (A.length === lim) return A;
          for (var i = 1; i <= z.length - 1; i++) {
            push$b(A, z[i]);
            if (A.length === lim) return A;
          }
          q = p = e;
        }
      }
      push$b(A, stringSlice$6(S, p));
      return A;
    }
  ];
}, BUGGY || !SPLIT_WORKS_WITH_OVERWRITTEN_EXEC, UNSUPPORTED_Y);

var $$1n = _export;
var uncurryThis$A = functionUncurryThisClause;
var getOwnPropertyDescriptor$3 = objectGetOwnPropertyDescriptor.f;
var toLength$2 = toLength$d;
var toString$c = toString$F;
var notARegExp = notARegexp;
var requireObjectCoercible$3 = requireObjectCoercible$o;
var correctIsRegExpLogic = correctIsRegexpLogic;

var stringSlice$5 = uncurryThis$A(''.slice);
var min$3 = Math.min;

var CORRECT_IS_REGEXP_LOGIC = correctIsRegExpLogic('startsWith');
// https://github.com/zloirock/core-js/pull/702
var MDN_POLYFILL_BUG = !CORRECT_IS_REGEXP_LOGIC && !!function () {
  var descriptor = getOwnPropertyDescriptor$3(String.prototype, 'startsWith');
  return descriptor && !descriptor.writable;
}();

// `String.prototype.startsWith` method
// https://tc39.es/ecma262/#sec-string.prototype.startswith
$$1n({ target: 'String', proto: true, forced: !MDN_POLYFILL_BUG && !CORRECT_IS_REGEXP_LOGIC }, {
  startsWith: function startsWith(searchString /* , position = 0 */) {
    var that = toString$c(requireObjectCoercible$3(this));
    notARegExp(searchString);
    var index = toLength$2(min$3(arguments.length > 1 ? arguments[1] : undefined, that.length));
    var search = toString$c(searchString);
    return stringSlice$5(that, index, index + search.length) === search;
  }
});

var $$1m = _export;
var uncurryThis$z = functionUncurryThis;
var requireObjectCoercible$2 = requireObjectCoercible$o;
var toIntegerOrInfinity$4 = toIntegerOrInfinity$n;
var toString$b = toString$F;

var stringSlice$4 = uncurryThis$z(''.slice);
var max$1 = Math.max;
var min$2 = Math.min;

// eslint-disable-next-line unicorn/prefer-string-slice -- required for testing
var FORCED$6 = !''.substr || 'ab'.substr(-1) !== 'b';

// `String.prototype.substr` method
// https://tc39.es/ecma262/#sec-string.prototype.substr
$$1m({ target: 'String', proto: true, forced: FORCED$6 }, {
  substr: function substr(start, length) {
    var that = toString$b(requireObjectCoercible$2(this));
    var size = that.length;
    var intStart = toIntegerOrInfinity$4(start);
    var intLength, intEnd;
    if (intStart === Infinity) intStart = 0;
    if (intStart < 0) intStart = max$1(size + intStart, 0);
    intLength = length === undefined ? size : toIntegerOrInfinity$4(length);
    if (intLength <= 0 || intLength === Infinity) return '';
    intEnd = min$2(intStart + intLength, size);
    return intStart >= intEnd ? '' : stringSlice$4(that, intStart, intEnd);
  }
});

var $$1l = _export;
var call$y = functionCall;
var uncurryThis$y = functionUncurryThis;
var requireObjectCoercible$1 = requireObjectCoercible$o;
var toString$a = toString$F;
var fails$o = fails$1z;

var $Array$2 = Array;
var charAt$7 = uncurryThis$y(''.charAt);
var charCodeAt$3 = uncurryThis$y(''.charCodeAt);
var join$5 = uncurryThis$y([].join);
// eslint-disable-next-line es/no-string-prototype-towellformed -- safe
var $toWellFormed = ''.toWellFormed;
var REPLACEMENT_CHARACTER = '\uFFFD';

// Safari bug
var TO_STRING_CONVERSION_BUG = $toWellFormed && fails$o(function () {
  return call$y($toWellFormed, 1) !== '1';
});

// `String.prototype.toWellFormed` method
// https://github.com/tc39/proposal-is-usv-string
$$1l({ target: 'String', proto: true, forced: TO_STRING_CONVERSION_BUG }, {
  toWellFormed: function toWellFormed() {
    var S = toString$a(requireObjectCoercible$1(this));
    if (TO_STRING_CONVERSION_BUG) return call$y($toWellFormed, S);
    var length = S.length;
    var result = $Array$2(length);
    for (var i = 0; i < length; i++) {
      var charCode = charCodeAt$3(S, i);
      // single UTF-16 code unit
      if ((charCode & 0xF800) !== 0xD800) result[i] = charAt$7(S, i);
      // unpaired surrogate
      else if (charCode >= 0xDC00 || i + 1 >= length || (charCodeAt$3(S, i + 1) & 0xFC00) !== 0xDC00) result[i] = REPLACEMENT_CHARACTER;
      // surrogate pair
      else {
        result[i] = charAt$7(S, i);
        result[++i] = charAt$7(S, i);
      }
    } return join$5(result, '');
  }
});

var PROPER_FUNCTION_NAME = functionName.PROPER;
var fails$n = fails$1z;
var whitespaces$1 = whitespaces$5;

var non = '\u200B\u0085\u180E';

// check that a method works with the correct list
// of whitespaces and has a correct name
var stringTrimForced = function (METHOD_NAME) {
  return fails$n(function () {
    return !!whitespaces$1[METHOD_NAME]()
      || non[METHOD_NAME]() !== non
      || (PROPER_FUNCTION_NAME && whitespaces$1[METHOD_NAME].name !== METHOD_NAME);
  });
};

var $$1k = _export;
var $trim = stringTrim.trim;
var forcedStringTrimMethod$2 = stringTrimForced;

// `String.prototype.trim` method
// https://tc39.es/ecma262/#sec-string.prototype.trim
$$1k({ target: 'String', proto: true, forced: forcedStringTrimMethod$2('trim') }, {
  trim: function trim() {
    return $trim(this);
  }
});

var $trimEnd = stringTrim.end;
var forcedStringTrimMethod$1 = stringTrimForced;

// `String.prototype.{ trimEnd, trimRight }` method
// https://tc39.es/ecma262/#sec-string.prototype.trimend
// https://tc39.es/ecma262/#String.prototype.trimright
var stringTrimEnd = forcedStringTrimMethod$1('trimEnd') ? function trimEnd() {
  return $trimEnd(this);
// eslint-disable-next-line es/no-string-prototype-trimstart-trimend -- safe
} : ''.trimEnd;

var $$1j = _export;
var trimEnd$1 = stringTrimEnd;

// `String.prototype.trimRight` method
// https://tc39.es/ecma262/#sec-string.prototype.trimend
// eslint-disable-next-line es/no-string-prototype-trimleft-trimright -- safe
$$1j({ target: 'String', proto: true, name: 'trimEnd', forced: ''.trimRight !== trimEnd$1 }, {
  trimRight: trimEnd$1
});

// TODO: Remove this line from `core-js@4`

var $$1i = _export;
var trimEnd = stringTrimEnd;

// `String.prototype.trimEnd` method
// https://tc39.es/ecma262/#sec-string.prototype.trimend
// eslint-disable-next-line es/no-string-prototype-trimstart-trimend -- safe
$$1i({ target: 'String', proto: true, name: 'trimEnd', forced: ''.trimEnd !== trimEnd }, {
  trimEnd: trimEnd
});

var $trimStart = stringTrim.start;
var forcedStringTrimMethod = stringTrimForced;

// `String.prototype.{ trimStart, trimLeft }` method
// https://tc39.es/ecma262/#sec-string.prototype.trimstart
// https://tc39.es/ecma262/#String.prototype.trimleft
var stringTrimStart = forcedStringTrimMethod('trimStart') ? function trimStart() {
  return $trimStart(this);
// eslint-disable-next-line es/no-string-prototype-trimstart-trimend -- safe
} : ''.trimStart;

var $$1h = _export;
var trimStart$1 = stringTrimStart;

// `String.prototype.trimLeft` method
// https://tc39.es/ecma262/#sec-string.prototype.trimleft
// eslint-disable-next-line es/no-string-prototype-trimleft-trimright -- safe
$$1h({ target: 'String', proto: true, name: 'trimStart', forced: ''.trimLeft !== trimStart$1 }, {
  trimLeft: trimStart$1
});

// TODO: Remove this line from `core-js@4`

var $$1g = _export;
var trimStart = stringTrimStart;

// `String.prototype.trimStart` method
// https://tc39.es/ecma262/#sec-string.prototype.trimstart
// eslint-disable-next-line es/no-string-prototype-trimstart-trimend -- safe
$$1g({ target: 'String', proto: true, name: 'trimStart', forced: ''.trimStart !== trimStart }, {
  trimStart: trimStart
});

var uncurryThis$x = functionUncurryThis;
var requireObjectCoercible = requireObjectCoercible$o;
var toString$9 = toString$F;

var quot = /"/g;
var replace$4 = uncurryThis$x(''.replace);

// `CreateHTML` abstract operation
// https://tc39.es/ecma262/#sec-createhtml
var createHtml = function (string, tag, attribute, value) {
  var S = toString$9(requireObjectCoercible(string));
  var p1 = '<' + tag;
  if (attribute !== '') p1 += ' ' + attribute + '="' + replace$4(toString$9(value), quot, '&quot;') + '"';
  return p1 + '>' + S + '</' + tag + '>';
};

var fails$m = fails$1z;

// check the existence of a method, lowercase
// of a tag and escaping quotes in arguments
var stringHtmlForced = function (METHOD_NAME) {
  return fails$m(function () {
    var test = ''[METHOD_NAME]('"');
    return test !== test.toLowerCase() || test.split('"').length > 3;
  });
};

var $$1f = _export;
var createHTML$c = createHtml;
var forcedStringHTMLMethod$c = stringHtmlForced;

// `String.prototype.anchor` method
// https://tc39.es/ecma262/#sec-string.prototype.anchor
$$1f({ target: 'String', proto: true, forced: forcedStringHTMLMethod$c('anchor') }, {
  anchor: function anchor(name) {
    return createHTML$c(this, 'a', 'name', name);
  }
});

var $$1e = _export;
var createHTML$b = createHtml;
var forcedStringHTMLMethod$b = stringHtmlForced;

// `String.prototype.big` method
// https://tc39.es/ecma262/#sec-string.prototype.big
$$1e({ target: 'String', proto: true, forced: forcedStringHTMLMethod$b('big') }, {
  big: function big() {
    return createHTML$b(this, 'big', '', '');
  }
});

var $$1d = _export;
var createHTML$a = createHtml;
var forcedStringHTMLMethod$a = stringHtmlForced;

// `String.prototype.blink` method
// https://tc39.es/ecma262/#sec-string.prototype.blink
$$1d({ target: 'String', proto: true, forced: forcedStringHTMLMethod$a('blink') }, {
  blink: function blink() {
    return createHTML$a(this, 'blink', '', '');
  }
});

var $$1c = _export;
var createHTML$9 = createHtml;
var forcedStringHTMLMethod$9 = stringHtmlForced;

// `String.prototype.bold` method
// https://tc39.es/ecma262/#sec-string.prototype.bold
$$1c({ target: 'String', proto: true, forced: forcedStringHTMLMethod$9('bold') }, {
  bold: function bold() {
    return createHTML$9(this, 'b', '', '');
  }
});

var $$1b = _export;
var createHTML$8 = createHtml;
var forcedStringHTMLMethod$8 = stringHtmlForced;

// `String.prototype.fixed` method
// https://tc39.es/ecma262/#sec-string.prototype.fixed
$$1b({ target: 'String', proto: true, forced: forcedStringHTMLMethod$8('fixed') }, {
  fixed: function fixed() {
    return createHTML$8(this, 'tt', '', '');
  }
});

var $$1a = _export;
var createHTML$7 = createHtml;
var forcedStringHTMLMethod$7 = stringHtmlForced;

// `String.prototype.fontcolor` method
// https://tc39.es/ecma262/#sec-string.prototype.fontcolor
$$1a({ target: 'String', proto: true, forced: forcedStringHTMLMethod$7('fontcolor') }, {
  fontcolor: function fontcolor(color) {
    return createHTML$7(this, 'font', 'color', color);
  }
});

var $$19 = _export;
var createHTML$6 = createHtml;
var forcedStringHTMLMethod$6 = stringHtmlForced;

// `String.prototype.fontsize` method
// https://tc39.es/ecma262/#sec-string.prototype.fontsize
$$19({ target: 'String', proto: true, forced: forcedStringHTMLMethod$6('fontsize') }, {
  fontsize: function fontsize(size) {
    return createHTML$6(this, 'font', 'size', size);
  }
});

var $$18 = _export;
var createHTML$5 = createHtml;
var forcedStringHTMLMethod$5 = stringHtmlForced;

// `String.prototype.italics` method
// https://tc39.es/ecma262/#sec-string.prototype.italics
$$18({ target: 'String', proto: true, forced: forcedStringHTMLMethod$5('italics') }, {
  italics: function italics() {
    return createHTML$5(this, 'i', '', '');
  }
});

var $$17 = _export;
var createHTML$4 = createHtml;
var forcedStringHTMLMethod$4 = stringHtmlForced;

// `String.prototype.link` method
// https://tc39.es/ecma262/#sec-string.prototype.link
$$17({ target: 'String', proto: true, forced: forcedStringHTMLMethod$4('link') }, {
  link: function link(url) {
    return createHTML$4(this, 'a', 'href', url);
  }
});

var $$16 = _export;
var createHTML$3 = createHtml;
var forcedStringHTMLMethod$3 = stringHtmlForced;

// `String.prototype.small` method
// https://tc39.es/ecma262/#sec-string.prototype.small
$$16({ target: 'String', proto: true, forced: forcedStringHTMLMethod$3('small') }, {
  small: function small() {
    return createHTML$3(this, 'small', '', '');
  }
});

var $$15 = _export;
var createHTML$2 = createHtml;
var forcedStringHTMLMethod$2 = stringHtmlForced;

// `String.prototype.strike` method
// https://tc39.es/ecma262/#sec-string.prototype.strike
$$15({ target: 'String', proto: true, forced: forcedStringHTMLMethod$2('strike') }, {
  strike: function strike() {
    return createHTML$2(this, 'strike', '', '');
  }
});

var $$14 = _export;
var createHTML$1 = createHtml;
var forcedStringHTMLMethod$1 = stringHtmlForced;

// `String.prototype.sub` method
// https://tc39.es/ecma262/#sec-string.prototype.sub
$$14({ target: 'String', proto: true, forced: forcedStringHTMLMethod$1('sub') }, {
  sub: function sub() {
    return createHTML$1(this, 'sub', '', '');
  }
});

var $$13 = _export;
var createHTML = createHtml;
var forcedStringHTMLMethod = stringHtmlForced;

// `String.prototype.sup` method
// https://tc39.es/ecma262/#sec-string.prototype.sup
$$13({ target: 'String', proto: true, forced: forcedStringHTMLMethod('sup') }, {
  sup: function sup() {
    return createHTML(this, 'sup', '', '');
  }
});

var typedArrayConstructor = {exports: {}};

/* eslint-disable no-new -- required for testing */
var globalThis$C = globalThis_1;
var fails$l = fails$1z;
var checkCorrectnessOfIteration = checkCorrectnessOfIteration$4;
var NATIVE_ARRAY_BUFFER_VIEWS$1 = arrayBufferViewCore.NATIVE_ARRAY_BUFFER_VIEWS;

var ArrayBuffer$2 = globalThis$C.ArrayBuffer;
var Int8Array$3 = globalThis$C.Int8Array;

var typedArrayConstructorsRequireWrappers = !NATIVE_ARRAY_BUFFER_VIEWS$1 || !fails$l(function () {
  Int8Array$3(1);
}) || !fails$l(function () {
  new Int8Array$3(-1);
}) || !checkCorrectnessOfIteration(function (iterable) {
  new Int8Array$3();
  new Int8Array$3(null);
  new Int8Array$3(1.5);
  new Int8Array$3(iterable);
}, true) || fails$l(function () {
  // Safari (11+) bug - a reason why even Safari 13 should load a typed array polyfill
  return new Int8Array$3(new ArrayBuffer$2(2), 1, undefined).length !== 1;
});

var toIntegerOrInfinity$3 = toIntegerOrInfinity$n;

var $RangeError$3 = RangeError;

var toPositiveInteger$5 = function (it) {
  var result = toIntegerOrInfinity$3(it);
  if (result < 0) throw new $RangeError$3("The argument can't be less than 0");
  return result;
};

var toPositiveInteger$4 = toPositiveInteger$5;

var $RangeError$2 = RangeError;

var toOffset$2 = function (it, BYTES) {
  var offset = toPositiveInteger$4(it);
  if (offset % BYTES) throw new $RangeError$2('Wrong offset');
  return offset;
};

var round = Math.round;

var toUint8Clamped$1 = function (it) {
  var value = round(it);
  return value < 0 ? 0 : value > 0xFF ? 0xFF : value & 0xFF;
};

var classof$6 = classof$p;

var isBigIntArray$3 = function (it) {
  var klass = classof$6(it);
  return klass === 'BigInt64Array' || klass === 'BigUint64Array';
};

var toPrimitive = toPrimitive$4;

var $TypeError$a = TypeError;

// `ToBigInt` abstract operation
// https://tc39.es/ecma262/#sec-tobigint
var toBigInt$4 = function (argument) {
  var prim = toPrimitive(argument, 'number');
  if (typeof prim == 'number') throw new $TypeError$a("Can't convert number to bigint");
  // eslint-disable-next-line es/no-bigint -- safe
  return BigInt(prim);
};

var bind$6 = functionBindContext;
var call$x = functionCall;
var aConstructor = aConstructor$3;
var toObject$5 = toObject$y;
var lengthOfArrayLike$7 = lengthOfArrayLike$w;
var getIterator$3 = getIterator$6;
var getIteratorMethod$4 = getIteratorMethod$8;
var isArrayIteratorMethod = isArrayIteratorMethod$3;
var isBigIntArray$2 = isBigIntArray$3;
var aTypedArrayConstructor$2 = arrayBufferViewCore.aTypedArrayConstructor;
var toBigInt$3 = toBigInt$4;

var typedArrayFrom$2 = function from(source /* , mapfn, thisArg */) {
  var C = aConstructor(this);
  var O = toObject$5(source);
  var argumentsLength = arguments.length;
  var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
  var mapping = mapfn !== undefined;
  var iteratorMethod = getIteratorMethod$4(O);
  var i, length, result, thisIsBigIntArray, value, step, iterator, next;
  if (iteratorMethod && !isArrayIteratorMethod(iteratorMethod)) {
    iterator = getIterator$3(O, iteratorMethod);
    next = iterator.next;
    O = [];
    while (!(step = call$x(next, iterator)).done) {
      O.push(step.value);
    }
  }
  if (mapping && argumentsLength > 2) {
    mapfn = bind$6(mapfn, arguments[2]);
  }
  length = lengthOfArrayLike$7(O);
  result = new (aTypedArrayConstructor$2(C))(length);
  thisIsBigIntArray = isBigIntArray$2(result);
  for (i = 0; length > i; i++) {
    value = mapping ? mapfn(O[i], i) : O[i];
    // FF30- typed arrays doesn't properly convert objects to typed array values
    result[i] = thisIsBigIntArray ? toBigInt$3(value) : +value;
  }
  return result;
};

var $$12 = _export;
var globalThis$B = globalThis_1;
var call$w = functionCall;
var DESCRIPTORS$c = descriptors;
var TYPED_ARRAYS_CONSTRUCTORS_REQUIRES_WRAPPERS$2 = typedArrayConstructorsRequireWrappers;
var ArrayBufferViewCore$v = arrayBufferViewCore;
var ArrayBufferModule = arrayBuffer;
var anInstance$9 = anInstance$e;
var createPropertyDescriptor$4 = createPropertyDescriptor$d;
var createNonEnumerableProperty$7 = createNonEnumerableProperty$j;
var isIntegralNumber = isIntegralNumber$3;
var toLength$1 = toLength$d;
var toIndex$1 = toIndex$4;
var toOffset$1 = toOffset$2;
var toUint8Clamped = toUint8Clamped$1;
var toPropertyKey$1 = toPropertyKey$9;
var hasOwn$e = hasOwnProperty_1;
var classof$5 = classof$p;
var isObject$c = isObject$J;
var isSymbol$1 = isSymbol$7;
var create$7 = objectCreate$1;
var isPrototypeOf$3 = objectIsPrototypeOf;
var setPrototypeOf$1 = objectSetPrototypeOf$1;
var getOwnPropertyNames = objectGetOwnPropertyNames.f;
var typedArrayFrom$1 = typedArrayFrom$2;
var forEach$3 = arrayIteration.forEach;
var setSpecies = setSpecies$6;
var defineBuiltInAccessor$8 = defineBuiltInAccessor$l;
var definePropertyModule = objectDefineProperty;
var getOwnPropertyDescriptorModule = objectGetOwnPropertyDescriptor;
var arrayFromConstructorAndList$4 = arrayFromConstructorAndList$6;
var InternalStateModule$9 = internalState;
var inheritIfRequired$1 = inheritIfRequired$7;

var getInternalState$3 = InternalStateModule$9.get;
var setInternalState$a = InternalStateModule$9.set;
var enforceInternalState$1 = InternalStateModule$9.enforce;
var nativeDefineProperty = definePropertyModule.f;
var nativeGetOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
var RangeError$2 = globalThis$B.RangeError;
var ArrayBuffer$1 = ArrayBufferModule.ArrayBuffer;
var ArrayBufferPrototype = ArrayBuffer$1.prototype;
var DataView$1 = ArrayBufferModule.DataView;
var NATIVE_ARRAY_BUFFER_VIEWS = ArrayBufferViewCore$v.NATIVE_ARRAY_BUFFER_VIEWS;
var TYPED_ARRAY_TAG = ArrayBufferViewCore$v.TYPED_ARRAY_TAG;
var TypedArray = ArrayBufferViewCore$v.TypedArray;
var TypedArrayPrototype$1 = ArrayBufferViewCore$v.TypedArrayPrototype;
var isTypedArray = ArrayBufferViewCore$v.isTypedArray;
var BYTES_PER_ELEMENT = 'BYTES_PER_ELEMENT';
var WRONG_LENGTH = 'Wrong length';

var addGetter = function (it, key) {
  defineBuiltInAccessor$8(it, key, {
    configurable: true,
    get: function () {
      return getInternalState$3(this)[key];
    }
  });
};

var isArrayBuffer = function (it) {
  var klass;
  return isPrototypeOf$3(ArrayBufferPrototype, it) || (klass = classof$5(it)) === 'ArrayBuffer' || klass === 'SharedArrayBuffer';
};

var isTypedArrayIndex = function (target, key) {
  return isTypedArray(target)
    && !isSymbol$1(key)
    && key in target
    && isIntegralNumber(+key)
    && key >= 0;
};

var wrappedGetOwnPropertyDescriptor = function getOwnPropertyDescriptor(target, key) {
  key = toPropertyKey$1(key);
  return isTypedArrayIndex(target, key)
    ? createPropertyDescriptor$4(2, target[key])
    : nativeGetOwnPropertyDescriptor(target, key);
};

var wrappedDefineProperty = function defineProperty(target, key, descriptor) {
  key = toPropertyKey$1(key);
  if (isTypedArrayIndex(target, key)
    && isObject$c(descriptor)
    && hasOwn$e(descriptor, 'value')
    && !hasOwn$e(descriptor, 'get')
    && !hasOwn$e(descriptor, 'set')
    // TODO: add validation descriptor w/o calling accessors
    && !descriptor.configurable
    && (!hasOwn$e(descriptor, 'writable') || descriptor.writable)
    && (!hasOwn$e(descriptor, 'enumerable') || descriptor.enumerable)
  ) {
    target[key] = descriptor.value;
    return target;
  } return nativeDefineProperty(target, key, descriptor);
};

if (DESCRIPTORS$c) {
  if (!NATIVE_ARRAY_BUFFER_VIEWS) {
    getOwnPropertyDescriptorModule.f = wrappedGetOwnPropertyDescriptor;
    definePropertyModule.f = wrappedDefineProperty;
    addGetter(TypedArrayPrototype$1, 'buffer');
    addGetter(TypedArrayPrototype$1, 'byteOffset');
    addGetter(TypedArrayPrototype$1, 'byteLength');
    addGetter(TypedArrayPrototype$1, 'length');
  }

  $$12({ target: 'Object', stat: true, forced: !NATIVE_ARRAY_BUFFER_VIEWS }, {
    getOwnPropertyDescriptor: wrappedGetOwnPropertyDescriptor,
    defineProperty: wrappedDefineProperty
  });

  typedArrayConstructor.exports = function (TYPE, wrapper, CLAMPED) {
    var BYTES = TYPE.match(/\d+/)[0] / 8;
    var CONSTRUCTOR_NAME = TYPE + (CLAMPED ? 'Clamped' : '') + 'Array';
    var GETTER = 'get' + TYPE;
    var SETTER = 'set' + TYPE;
    var NativeTypedArrayConstructor = globalThis$B[CONSTRUCTOR_NAME];
    var TypedArrayConstructor = NativeTypedArrayConstructor;
    var TypedArrayConstructorPrototype = TypedArrayConstructor && TypedArrayConstructor.prototype;
    var exported = {};

    var getter = function (that, index) {
      var data = getInternalState$3(that);
      return data.view[GETTER](index * BYTES + data.byteOffset, true);
    };

    var setter = function (that, index, value) {
      var data = getInternalState$3(that);
      data.view[SETTER](index * BYTES + data.byteOffset, CLAMPED ? toUint8Clamped(value) : value, true);
    };

    var addElement = function (that, index) {
      nativeDefineProperty(that, index, {
        get: function () {
          return getter(this, index);
        },
        set: function (value) {
          return setter(this, index, value);
        },
        enumerable: true
      });
    };

    if (!NATIVE_ARRAY_BUFFER_VIEWS) {
      TypedArrayConstructor = wrapper(function (that, data, offset, $length) {
        anInstance$9(that, TypedArrayConstructorPrototype);
        var index = 0;
        var byteOffset = 0;
        var buffer, byteLength, length;
        if (!isObject$c(data)) {
          length = toIndex$1(data);
          byteLength = length * BYTES;
          buffer = new ArrayBuffer$1(byteLength);
        } else if (isArrayBuffer(data)) {
          buffer = data;
          byteOffset = toOffset$1(offset, BYTES);
          var $len = data.byteLength;
          if ($length === undefined) {
            if ($len % BYTES) throw new RangeError$2(WRONG_LENGTH);
            byteLength = $len - byteOffset;
            if (byteLength < 0) throw new RangeError$2(WRONG_LENGTH);
          } else {
            byteLength = toLength$1($length) * BYTES;
            if (byteLength + byteOffset > $len) throw new RangeError$2(WRONG_LENGTH);
          }
          length = byteLength / BYTES;
        } else if (isTypedArray(data)) {
          return arrayFromConstructorAndList$4(TypedArrayConstructor, data);
        } else {
          return call$w(typedArrayFrom$1, TypedArrayConstructor, data);
        }
        setInternalState$a(that, {
          buffer: buffer,
          byteOffset: byteOffset,
          byteLength: byteLength,
          length: length,
          view: new DataView$1(buffer)
        });
        while (index < length) addElement(that, index++);
      });

      if (setPrototypeOf$1) setPrototypeOf$1(TypedArrayConstructor, TypedArray);
      TypedArrayConstructorPrototype = TypedArrayConstructor.prototype = create$7(TypedArrayPrototype$1);
    } else if (TYPED_ARRAYS_CONSTRUCTORS_REQUIRES_WRAPPERS$2) {
      TypedArrayConstructor = wrapper(function (dummy, data, typedArrayOffset, $length) {
        anInstance$9(dummy, TypedArrayConstructorPrototype);
        return inheritIfRequired$1(function () {
          if (!isObject$c(data)) return new NativeTypedArrayConstructor(toIndex$1(data));
          if (isArrayBuffer(data)) return $length !== undefined
            ? new NativeTypedArrayConstructor(data, toOffset$1(typedArrayOffset, BYTES), $length)
            : typedArrayOffset !== undefined
              ? new NativeTypedArrayConstructor(data, toOffset$1(typedArrayOffset, BYTES))
              : new NativeTypedArrayConstructor(data);
          if (isTypedArray(data)) return arrayFromConstructorAndList$4(TypedArrayConstructor, data);
          return call$w(typedArrayFrom$1, TypedArrayConstructor, data);
        }(), dummy, TypedArrayConstructor);
      });

      if (setPrototypeOf$1) setPrototypeOf$1(TypedArrayConstructor, TypedArray);
      forEach$3(getOwnPropertyNames(NativeTypedArrayConstructor), function (key) {
        if (!(key in TypedArrayConstructor)) {
          createNonEnumerableProperty$7(TypedArrayConstructor, key, NativeTypedArrayConstructor[key]);
        }
      });
      TypedArrayConstructor.prototype = TypedArrayConstructorPrototype;
    }

    if (TypedArrayConstructorPrototype.constructor !== TypedArrayConstructor) {
      createNonEnumerableProperty$7(TypedArrayConstructorPrototype, 'constructor', TypedArrayConstructor);
    }

    enforceInternalState$1(TypedArrayConstructorPrototype).TypedArrayConstructor = TypedArrayConstructor;

    if (TYPED_ARRAY_TAG) {
      createNonEnumerableProperty$7(TypedArrayConstructorPrototype, TYPED_ARRAY_TAG, CONSTRUCTOR_NAME);
    }

    var FORCED = TypedArrayConstructor !== NativeTypedArrayConstructor;

    exported[CONSTRUCTOR_NAME] = TypedArrayConstructor;

    $$12({ global: true, constructor: true, forced: FORCED, sham: !NATIVE_ARRAY_BUFFER_VIEWS }, exported);

    if (!(BYTES_PER_ELEMENT in TypedArrayConstructor)) {
      createNonEnumerableProperty$7(TypedArrayConstructor, BYTES_PER_ELEMENT, BYTES);
    }

    if (!(BYTES_PER_ELEMENT in TypedArrayConstructorPrototype)) {
      createNonEnumerableProperty$7(TypedArrayConstructorPrototype, BYTES_PER_ELEMENT, BYTES);
    }

    setSpecies(CONSTRUCTOR_NAME);
  };
} else typedArrayConstructor.exports = function () { /* empty */ };

var typedArrayConstructorExports = typedArrayConstructor.exports;

var createTypedArrayConstructor$8 = typedArrayConstructorExports;

// `Float32Array` constructor
// https://tc39.es/ecma262/#sec-typedarray-objects
createTypedArrayConstructor$8('Float32', function (init) {
  return function Float32Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

var createTypedArrayConstructor$7 = typedArrayConstructorExports;

// `Float64Array` constructor
// https://tc39.es/ecma262/#sec-typedarray-objects
createTypedArrayConstructor$7('Float64', function (init) {
  return function Float64Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

var createTypedArrayConstructor$6 = typedArrayConstructorExports;

// `Int8Array` constructor
// https://tc39.es/ecma262/#sec-typedarray-objects
createTypedArrayConstructor$6('Int8', function (init) {
  return function Int8Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

var createTypedArrayConstructor$5 = typedArrayConstructorExports;

// `Int16Array` constructor
// https://tc39.es/ecma262/#sec-typedarray-objects
createTypedArrayConstructor$5('Int16', function (init) {
  return function Int16Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

var createTypedArrayConstructor$4 = typedArrayConstructorExports;

// `Int32Array` constructor
// https://tc39.es/ecma262/#sec-typedarray-objects
createTypedArrayConstructor$4('Int32', function (init) {
  return function Int32Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

var createTypedArrayConstructor$3 = typedArrayConstructorExports;

// `Uint8Array` constructor
// https://tc39.es/ecma262/#sec-typedarray-objects
createTypedArrayConstructor$3('Uint8', function (init) {
  return function Uint8Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

var createTypedArrayConstructor$2 = typedArrayConstructorExports;

// `Uint8ClampedArray` constructor
// https://tc39.es/ecma262/#sec-typedarray-objects
createTypedArrayConstructor$2('Uint8', function (init) {
  return function Uint8ClampedArray(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
}, true);

var createTypedArrayConstructor$1 = typedArrayConstructorExports;

// `Uint16Array` constructor
// https://tc39.es/ecma262/#sec-typedarray-objects
createTypedArrayConstructor$1('Uint16', function (init) {
  return function Uint16Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

var createTypedArrayConstructor = typedArrayConstructorExports;

// `Uint32Array` constructor
// https://tc39.es/ecma262/#sec-typedarray-objects
createTypedArrayConstructor('Uint32', function (init) {
  return function Uint32Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

var ArrayBufferViewCore$u = arrayBufferViewCore;
var lengthOfArrayLike$6 = lengthOfArrayLike$w;
var toIntegerOrInfinity$2 = toIntegerOrInfinity$n;

var aTypedArray$s = ArrayBufferViewCore$u.aTypedArray;
var exportTypedArrayMethod$t = ArrayBufferViewCore$u.exportTypedArrayMethod;

// `%TypedArray%.prototype.at` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.at
exportTypedArrayMethod$t('at', function at(index) {
  var O = aTypedArray$s(this);
  var len = lengthOfArrayLike$6(O);
  var relativeIndex = toIntegerOrInfinity$2(index);
  var k = relativeIndex >= 0 ? relativeIndex : len + relativeIndex;
  return (k < 0 || k >= len) ? undefined : O[k];
});

var uncurryThis$w = functionUncurryThis;
var ArrayBufferViewCore$t = arrayBufferViewCore;
var $ArrayCopyWithin = arrayCopyWithin;

var u$ArrayCopyWithin = uncurryThis$w($ArrayCopyWithin);
var aTypedArray$r = ArrayBufferViewCore$t.aTypedArray;
var exportTypedArrayMethod$s = ArrayBufferViewCore$t.exportTypedArrayMethod;

// `%TypedArray%.prototype.copyWithin` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.copywithin
exportTypedArrayMethod$s('copyWithin', function copyWithin(target, start /* , end */) {
  return u$ArrayCopyWithin(aTypedArray$r(this), target, start, arguments.length > 2 ? arguments[2] : undefined);
});

var ArrayBufferViewCore$s = arrayBufferViewCore;
var $every$1 = arrayIteration.every;

var aTypedArray$q = ArrayBufferViewCore$s.aTypedArray;
var exportTypedArrayMethod$r = ArrayBufferViewCore$s.exportTypedArrayMethod;

// `%TypedArray%.prototype.every` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.every
exportTypedArrayMethod$r('every', function every(callbackfn /* , thisArg */) {
  return $every$1(aTypedArray$q(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
});

var ArrayBufferViewCore$r = arrayBufferViewCore;
var $fill = arrayFill$1;
var toBigInt$2 = toBigInt$4;
var classof$4 = classof$p;
var call$v = functionCall;
var uncurryThis$v = functionUncurryThis;
var fails$k = fails$1z;

var aTypedArray$p = ArrayBufferViewCore$r.aTypedArray;
var exportTypedArrayMethod$q = ArrayBufferViewCore$r.exportTypedArrayMethod;
var slice$4 = uncurryThis$v(''.slice);

// V8 ~ Chrome < 59, Safari < 14.1, FF < 55, Edge <=18
var CONVERSION_BUG = fails$k(function () {
  var count = 0;
  // eslint-disable-next-line es/no-typed-arrays -- safe
  new Int8Array(2).fill({ valueOf: function () { return count++; } });
  return count !== 1;
});

// `%TypedArray%.prototype.fill` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.fill
exportTypedArrayMethod$q('fill', function fill(value /* , start, end */) {
  var length = arguments.length;
  aTypedArray$p(this);
  var actualValue = slice$4(classof$4(this), 0, 3) === 'Big' ? toBigInt$2(value) : +value;
  return call$v($fill, this, actualValue, length > 1 ? arguments[1] : undefined, length > 2 ? arguments[2] : undefined);
}, CONVERSION_BUG);

var ArrayBufferViewCore$q = arrayBufferViewCore;
var speciesConstructor = speciesConstructor$6;

var aTypedArrayConstructor$1 = ArrayBufferViewCore$q.aTypedArrayConstructor;
var getTypedArrayConstructor$4 = ArrayBufferViewCore$q.getTypedArrayConstructor;

// a part of `TypedArraySpeciesCreate` abstract operation
// https://tc39.es/ecma262/#typedarray-species-create
var typedArraySpeciesConstructor$4 = function (originalArray) {
  return aTypedArrayConstructor$1(speciesConstructor(originalArray, getTypedArrayConstructor$4(originalArray)));
};

var arrayFromConstructorAndList$3 = arrayFromConstructorAndList$6;
var typedArraySpeciesConstructor$3 = typedArraySpeciesConstructor$4;

var typedArrayFromSpeciesAndList = function (instance, list) {
  return arrayFromConstructorAndList$3(typedArraySpeciesConstructor$3(instance), list);
};

var ArrayBufferViewCore$p = arrayBufferViewCore;
var $filter = arrayIteration.filter;
var fromSpeciesAndList = typedArrayFromSpeciesAndList;

var aTypedArray$o = ArrayBufferViewCore$p.aTypedArray;
var exportTypedArrayMethod$p = ArrayBufferViewCore$p.exportTypedArrayMethod;

// `%TypedArray%.prototype.filter` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.filter
exportTypedArrayMethod$p('filter', function filter(callbackfn /* , thisArg */) {
  var list = $filter(aTypedArray$o(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  return fromSpeciesAndList(this, list);
});

var ArrayBufferViewCore$o = arrayBufferViewCore;
var $find$1 = arrayIteration.find;

var aTypedArray$n = ArrayBufferViewCore$o.aTypedArray;
var exportTypedArrayMethod$o = ArrayBufferViewCore$o.exportTypedArrayMethod;

// `%TypedArray%.prototype.find` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.find
exportTypedArrayMethod$o('find', function find(predicate /* , thisArg */) {
  return $find$1(aTypedArray$n(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
});

var ArrayBufferViewCore$n = arrayBufferViewCore;
var $findIndex = arrayIteration.findIndex;

var aTypedArray$m = ArrayBufferViewCore$n.aTypedArray;
var exportTypedArrayMethod$n = ArrayBufferViewCore$n.exportTypedArrayMethod;

// `%TypedArray%.prototype.findIndex` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.findindex
exportTypedArrayMethod$n('findIndex', function findIndex(predicate /* , thisArg */) {
  return $findIndex(aTypedArray$m(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
});

var ArrayBufferViewCore$m = arrayBufferViewCore;
var $findLast = arrayIterationFromLast.findLast;

var aTypedArray$l = ArrayBufferViewCore$m.aTypedArray;
var exportTypedArrayMethod$m = ArrayBufferViewCore$m.exportTypedArrayMethod;

// `%TypedArray%.prototype.findLast` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.findlast
exportTypedArrayMethod$m('findLast', function findLast(predicate /* , thisArg */) {
  return $findLast(aTypedArray$l(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
});

var ArrayBufferViewCore$l = arrayBufferViewCore;
var $findLastIndex = arrayIterationFromLast.findLastIndex;

var aTypedArray$k = ArrayBufferViewCore$l.aTypedArray;
var exportTypedArrayMethod$l = ArrayBufferViewCore$l.exportTypedArrayMethod;

// `%TypedArray%.prototype.findLastIndex` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.findlastindex
exportTypedArrayMethod$l('findLastIndex', function findLastIndex(predicate /* , thisArg */) {
  return $findLastIndex(aTypedArray$k(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
});

var ArrayBufferViewCore$k = arrayBufferViewCore;
var $forEach$1 = arrayIteration.forEach;

var aTypedArray$j = ArrayBufferViewCore$k.aTypedArray;
var exportTypedArrayMethod$k = ArrayBufferViewCore$k.exportTypedArrayMethod;

// `%TypedArray%.prototype.forEach` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.foreach
exportTypedArrayMethod$k('forEach', function forEach(callbackfn /* , thisArg */) {
  $forEach$1(aTypedArray$j(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
});

var TYPED_ARRAYS_CONSTRUCTORS_REQUIRES_WRAPPERS$1 = typedArrayConstructorsRequireWrappers;
var exportTypedArrayStaticMethod$1 = arrayBufferViewCore.exportTypedArrayStaticMethod;
var typedArrayFrom = typedArrayFrom$2;

// `%TypedArray%.from` method
// https://tc39.es/ecma262/#sec-%typedarray%.from
exportTypedArrayStaticMethod$1('from', typedArrayFrom, TYPED_ARRAYS_CONSTRUCTORS_REQUIRES_WRAPPERS$1);

var ArrayBufferViewCore$j = arrayBufferViewCore;
var $includes = arrayIncludes.includes;

var aTypedArray$i = ArrayBufferViewCore$j.aTypedArray;
var exportTypedArrayMethod$j = ArrayBufferViewCore$j.exportTypedArrayMethod;

// `%TypedArray%.prototype.includes` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.includes
exportTypedArrayMethod$j('includes', function includes(searchElement /* , fromIndex */) {
  return $includes(aTypedArray$i(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
});

var ArrayBufferViewCore$i = arrayBufferViewCore;
var $indexOf = arrayIncludes.indexOf;

var aTypedArray$h = ArrayBufferViewCore$i.aTypedArray;
var exportTypedArrayMethod$i = ArrayBufferViewCore$i.exportTypedArrayMethod;

// `%TypedArray%.prototype.indexOf` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.indexof
exportTypedArrayMethod$i('indexOf', function indexOf(searchElement /* , fromIndex */) {
  return $indexOf(aTypedArray$h(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
});

var globalThis$A = globalThis_1;
var fails$j = fails$1z;
var uncurryThis$u = functionUncurryThis;
var ArrayBufferViewCore$h = arrayBufferViewCore;
var ArrayIterators = es_array_iterator;
var wellKnownSymbol$i = wellKnownSymbol$O;

var ITERATOR$4 = wellKnownSymbol$i('iterator');
var Uint8Array$4 = globalThis$A.Uint8Array;
var arrayValues = uncurryThis$u(ArrayIterators.values);
var arrayKeys = uncurryThis$u(ArrayIterators.keys);
var arrayEntries = uncurryThis$u(ArrayIterators.entries);
var aTypedArray$g = ArrayBufferViewCore$h.aTypedArray;
var exportTypedArrayMethod$h = ArrayBufferViewCore$h.exportTypedArrayMethod;
var TypedArrayPrototype = Uint8Array$4 && Uint8Array$4.prototype;

var GENERIC = !fails$j(function () {
  TypedArrayPrototype[ITERATOR$4].call([1]);
});

var ITERATOR_IS_VALUES = !!TypedArrayPrototype
  && TypedArrayPrototype.values
  && TypedArrayPrototype[ITERATOR$4] === TypedArrayPrototype.values
  && TypedArrayPrototype.values.name === 'values';

var typedArrayValues = function values() {
  return arrayValues(aTypedArray$g(this));
};

// `%TypedArray%.prototype.entries` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.entries
exportTypedArrayMethod$h('entries', function entries() {
  return arrayEntries(aTypedArray$g(this));
}, GENERIC);
// `%TypedArray%.prototype.keys` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.keys
exportTypedArrayMethod$h('keys', function keys() {
  return arrayKeys(aTypedArray$g(this));
}, GENERIC);
// `%TypedArray%.prototype.values` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.values
exportTypedArrayMethod$h('values', typedArrayValues, GENERIC || !ITERATOR_IS_VALUES, { name: 'values' });
// `%TypedArray%.prototype[@@iterator]` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype-@@iterator
exportTypedArrayMethod$h(ITERATOR$4, typedArrayValues, GENERIC || !ITERATOR_IS_VALUES, { name: 'values' });

var ArrayBufferViewCore$g = arrayBufferViewCore;
var uncurryThis$t = functionUncurryThis;

var aTypedArray$f = ArrayBufferViewCore$g.aTypedArray;
var exportTypedArrayMethod$g = ArrayBufferViewCore$g.exportTypedArrayMethod;
var $join = uncurryThis$t([].join);

// `%TypedArray%.prototype.join` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.join
exportTypedArrayMethod$g('join', function join(separator) {
  return $join(aTypedArray$f(this), separator);
});

var ArrayBufferViewCore$f = arrayBufferViewCore;
var apply$3 = functionApply$1;
var $lastIndexOf = arrayLastIndexOf;

var aTypedArray$e = ArrayBufferViewCore$f.aTypedArray;
var exportTypedArrayMethod$f = ArrayBufferViewCore$f.exportTypedArrayMethod;

// `%TypedArray%.prototype.lastIndexOf` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.lastindexof
exportTypedArrayMethod$f('lastIndexOf', function lastIndexOf(searchElement /* , fromIndex */) {
  var length = arguments.length;
  return apply$3($lastIndexOf, aTypedArray$e(this), length > 1 ? [searchElement, arguments[1]] : [searchElement]);
});

var ArrayBufferViewCore$e = arrayBufferViewCore;
var $map = arrayIteration.map;
var typedArraySpeciesConstructor$2 = typedArraySpeciesConstructor$4;

var aTypedArray$d = ArrayBufferViewCore$e.aTypedArray;
var exportTypedArrayMethod$e = ArrayBufferViewCore$e.exportTypedArrayMethod;

// `%TypedArray%.prototype.map` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.map
exportTypedArrayMethod$e('map', function map(mapfn /* , thisArg */) {
  return $map(aTypedArray$d(this), mapfn, arguments.length > 1 ? arguments[1] : undefined, function (O, length) {
    return new (typedArraySpeciesConstructor$2(O))(length);
  });
});

var ArrayBufferViewCore$d = arrayBufferViewCore;
var TYPED_ARRAYS_CONSTRUCTORS_REQUIRES_WRAPPERS = typedArrayConstructorsRequireWrappers;

var aTypedArrayConstructor = ArrayBufferViewCore$d.aTypedArrayConstructor;
var exportTypedArrayStaticMethod = ArrayBufferViewCore$d.exportTypedArrayStaticMethod;

// `%TypedArray%.of` method
// https://tc39.es/ecma262/#sec-%typedarray%.of
exportTypedArrayStaticMethod('of', function of(/* ...items */) {
  var index = 0;
  var length = arguments.length;
  var result = new (aTypedArrayConstructor(this))(length);
  while (length > index) result[index] = arguments[index++];
  return result;
}, TYPED_ARRAYS_CONSTRUCTORS_REQUIRES_WRAPPERS);

var ArrayBufferViewCore$c = arrayBufferViewCore;
var $reduce = arrayReduce.left;

var aTypedArray$c = ArrayBufferViewCore$c.aTypedArray;
var exportTypedArrayMethod$d = ArrayBufferViewCore$c.exportTypedArrayMethod;

// `%TypedArray%.prototype.reduce` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.reduce
exportTypedArrayMethod$d('reduce', function reduce(callbackfn /* , initialValue */) {
  var length = arguments.length;
  return $reduce(aTypedArray$c(this), callbackfn, length, length > 1 ? arguments[1] : undefined);
});

var ArrayBufferViewCore$b = arrayBufferViewCore;
var $reduceRight = arrayReduce.right;

var aTypedArray$b = ArrayBufferViewCore$b.aTypedArray;
var exportTypedArrayMethod$c = ArrayBufferViewCore$b.exportTypedArrayMethod;

// `%TypedArray%.prototype.reduceRight` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.reduceright
exportTypedArrayMethod$c('reduceRight', function reduceRight(callbackfn /* , initialValue */) {
  var length = arguments.length;
  return $reduceRight(aTypedArray$b(this), callbackfn, length, length > 1 ? arguments[1] : undefined);
});

var ArrayBufferViewCore$a = arrayBufferViewCore;

var aTypedArray$a = ArrayBufferViewCore$a.aTypedArray;
var exportTypedArrayMethod$b = ArrayBufferViewCore$a.exportTypedArrayMethod;
var floor$2 = Math.floor;

// `%TypedArray%.prototype.reverse` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.reverse
exportTypedArrayMethod$b('reverse', function reverse() {
  var that = this;
  var length = aTypedArray$a(that).length;
  var middle = floor$2(length / 2);
  var index = 0;
  var value;
  while (index < middle) {
    value = that[index];
    that[index++] = that[--length];
    that[length] = value;
  } return that;
});

var globalThis$z = globalThis_1;
var call$u = functionCall;
var ArrayBufferViewCore$9 = arrayBufferViewCore;
var lengthOfArrayLike$5 = lengthOfArrayLike$w;
var toOffset = toOffset$2;
var toIndexedObject = toObject$y;
var fails$i = fails$1z;

var RangeError$1 = globalThis$z.RangeError;
var Int8Array$2 = globalThis$z.Int8Array;
var Int8ArrayPrototype = Int8Array$2 && Int8Array$2.prototype;
var $set = Int8ArrayPrototype && Int8ArrayPrototype.set;
var aTypedArray$9 = ArrayBufferViewCore$9.aTypedArray;
var exportTypedArrayMethod$a = ArrayBufferViewCore$9.exportTypedArrayMethod;

var WORKS_WITH_OBJECTS_AND_GENERIC_ON_TYPED_ARRAYS = !fails$i(function () {
  // eslint-disable-next-line es/no-typed-arrays -- required for testing
  var array = new Uint8ClampedArray(2);
  call$u($set, array, { length: 1, 0: 3 }, 1);
  return array[1] !== 3;
});

// https://bugs.chromium.org/p/v8/issues/detail?id=11294 and other
var TO_OBJECT_BUG = WORKS_WITH_OBJECTS_AND_GENERIC_ON_TYPED_ARRAYS && ArrayBufferViewCore$9.NATIVE_ARRAY_BUFFER_VIEWS && fails$i(function () {
  var array = new Int8Array$2(2);
  array.set(1);
  array.set('2', 1);
  return array[0] !== 0 || array[1] !== 2;
});

// `%TypedArray%.prototype.set` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.set
exportTypedArrayMethod$a('set', function set(arrayLike /* , offset */) {
  aTypedArray$9(this);
  var offset = toOffset(arguments.length > 1 ? arguments[1] : undefined, 1);
  var src = toIndexedObject(arrayLike);
  if (WORKS_WITH_OBJECTS_AND_GENERIC_ON_TYPED_ARRAYS) return call$u($set, this, src, offset);
  var length = this.length;
  var len = lengthOfArrayLike$5(src);
  var index = 0;
  if (len + offset > length) throw new RangeError$1('Wrong length');
  while (index < len) this[offset + index] = src[index++];
}, !WORKS_WITH_OBJECTS_AND_GENERIC_ON_TYPED_ARRAYS || TO_OBJECT_BUG);

var ArrayBufferViewCore$8 = arrayBufferViewCore;
var typedArraySpeciesConstructor$1 = typedArraySpeciesConstructor$4;
var fails$h = fails$1z;
var arraySlice$3 = arraySlice$a;

var aTypedArray$8 = ArrayBufferViewCore$8.aTypedArray;
var exportTypedArrayMethod$9 = ArrayBufferViewCore$8.exportTypedArrayMethod;

var FORCED$5 = fails$h(function () {
  // eslint-disable-next-line es/no-typed-arrays -- required for testing
  new Int8Array(1).slice();
});

// `%TypedArray%.prototype.slice` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.slice
exportTypedArrayMethod$9('slice', function slice(start, end) {
  var list = arraySlice$3(aTypedArray$8(this), start, end);
  var C = typedArraySpeciesConstructor$1(this);
  var index = 0;
  var length = list.length;
  var result = new C(length);
  while (length > index) result[index] = list[index++];
  return result;
}, FORCED$5);

var ArrayBufferViewCore$7 = arrayBufferViewCore;
var $some$1 = arrayIteration.some;

var aTypedArray$7 = ArrayBufferViewCore$7.aTypedArray;
var exportTypedArrayMethod$8 = ArrayBufferViewCore$7.exportTypedArrayMethod;

// `%TypedArray%.prototype.some` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.some
exportTypedArrayMethod$8('some', function some(callbackfn /* , thisArg */) {
  return $some$1(aTypedArray$7(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
});

var globalThis$y = globalThis_1;
var uncurryThis$s = functionUncurryThisClause;
var fails$g = fails$1z;
var aCallable$j = aCallable$F;
var internalSort = arraySort$1;
var ArrayBufferViewCore$6 = arrayBufferViewCore;
var FF = environmentFfVersion;
var IE_OR_EDGE = environmentIsIeOrEdge;
var V8 = environmentV8Version;
var WEBKIT = environmentWebkitVersion;

var aTypedArray$6 = ArrayBufferViewCore$6.aTypedArray;
var exportTypedArrayMethod$7 = ArrayBufferViewCore$6.exportTypedArrayMethod;
var Uint16Array = globalThis$y.Uint16Array;
var nativeSort = Uint16Array && uncurryThis$s(Uint16Array.prototype.sort);

// WebKit
var ACCEPT_INCORRECT_ARGUMENTS = !!nativeSort && !(fails$g(function () {
  nativeSort(new Uint16Array(2), null);
}) && fails$g(function () {
  nativeSort(new Uint16Array(2), {});
}));

var STABLE_SORT = !!nativeSort && !fails$g(function () {
  // feature detection can be too slow, so check engines versions
  if (V8) return V8 < 74;
  if (FF) return FF < 67;
  if (IE_OR_EDGE) return true;
  if (WEBKIT) return WEBKIT < 602;

  var array = new Uint16Array(516);
  var expected = Array(516);
  var index, mod;

  for (index = 0; index < 516; index++) {
    mod = index % 4;
    array[index] = 515 - index;
    expected[index] = index - 2 * mod + 3;
  }

  nativeSort(array, function (a, b) {
    return (a / 4 | 0) - (b / 4 | 0);
  });

  for (index = 0; index < 516; index++) {
    if (array[index] !== expected[index]) return true;
  }
});

var getSortCompare = function (comparefn) {
  return function (x, y) {
    if (comparefn !== undefined) return +comparefn(x, y) || 0;
    // eslint-disable-next-line no-self-compare -- NaN check
    if (y !== y) return -1;
    // eslint-disable-next-line no-self-compare -- NaN check
    if (x !== x) return 1;
    if (x === 0 && y === 0) return 1 / x > 0 && 1 / y < 0 ? 1 : -1;
    return x > y;
  };
};

// `%TypedArray%.prototype.sort` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.sort
exportTypedArrayMethod$7('sort', function sort(comparefn) {
  if (comparefn !== undefined) aCallable$j(comparefn);
  if (STABLE_SORT) return nativeSort(this, comparefn);

  return internalSort(aTypedArray$6(this), getSortCompare(comparefn));
}, !STABLE_SORT || ACCEPT_INCORRECT_ARGUMENTS);

var ArrayBufferViewCore$5 = arrayBufferViewCore;
var toLength = toLength$d;
var toAbsoluteIndex$1 = toAbsoluteIndex$a;
var typedArraySpeciesConstructor = typedArraySpeciesConstructor$4;

var aTypedArray$5 = ArrayBufferViewCore$5.aTypedArray;
var exportTypedArrayMethod$6 = ArrayBufferViewCore$5.exportTypedArrayMethod;

// `%TypedArray%.prototype.subarray` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.subarray
exportTypedArrayMethod$6('subarray', function subarray(begin, end) {
  var O = aTypedArray$5(this);
  var length = O.length;
  var beginIndex = toAbsoluteIndex$1(begin, length);
  var C = typedArraySpeciesConstructor(O);
  return new C(
    O.buffer,
    O.byteOffset + beginIndex * O.BYTES_PER_ELEMENT,
    toLength((end === undefined ? length : toAbsoluteIndex$1(end, length)) - beginIndex)
  );
});

var globalThis$x = globalThis_1;
var apply$2 = functionApply$1;
var ArrayBufferViewCore$4 = arrayBufferViewCore;
var fails$f = fails$1z;
var arraySlice$2 = arraySlice$a;

var Int8Array$1 = globalThis$x.Int8Array;
var aTypedArray$4 = ArrayBufferViewCore$4.aTypedArray;
var exportTypedArrayMethod$5 = ArrayBufferViewCore$4.exportTypedArrayMethod;
var $toLocaleString = [].toLocaleString;

// iOS Safari 6.x fails here
var TO_LOCALE_STRING_BUG = !!Int8Array$1 && fails$f(function () {
  $toLocaleString.call(new Int8Array$1(1));
});

var FORCED$4 = fails$f(function () {
  return [1, 2].toLocaleString() !== new Int8Array$1([1, 2]).toLocaleString();
}) || !fails$f(function () {
  Int8Array$1.prototype.toLocaleString.call([1, 2]);
});

// `%TypedArray%.prototype.toLocaleString` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.tolocalestring
exportTypedArrayMethod$5('toLocaleString', function toLocaleString() {
  return apply$2(
    $toLocaleString,
    TO_LOCALE_STRING_BUG ? arraySlice$2(aTypedArray$4(this)) : aTypedArray$4(this),
    arraySlice$2(arguments)
  );
}, FORCED$4);

var arrayToReversed = arrayToReversed$2;
var ArrayBufferViewCore$3 = arrayBufferViewCore;

var aTypedArray$3 = ArrayBufferViewCore$3.aTypedArray;
var exportTypedArrayMethod$4 = ArrayBufferViewCore$3.exportTypedArrayMethod;
var getTypedArrayConstructor$3 = ArrayBufferViewCore$3.getTypedArrayConstructor;

// `%TypedArray%.prototype.toReversed` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.toreversed
exportTypedArrayMethod$4('toReversed', function toReversed() {
  return arrayToReversed(aTypedArray$3(this), getTypedArrayConstructor$3(this));
});

var ArrayBufferViewCore$2 = arrayBufferViewCore;
var uncurryThis$r = functionUncurryThis;
var aCallable$i = aCallable$F;
var arrayFromConstructorAndList$2 = arrayFromConstructorAndList$6;

var aTypedArray$2 = ArrayBufferViewCore$2.aTypedArray;
var getTypedArrayConstructor$2 = ArrayBufferViewCore$2.getTypedArrayConstructor;
var exportTypedArrayMethod$3 = ArrayBufferViewCore$2.exportTypedArrayMethod;
var sort = uncurryThis$r(ArrayBufferViewCore$2.TypedArrayPrototype.sort);

// `%TypedArray%.prototype.toSorted` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.tosorted
exportTypedArrayMethod$3('toSorted', function toSorted(compareFn) {
  if (compareFn !== undefined) aCallable$i(compareFn);
  var O = aTypedArray$2(this);
  var A = arrayFromConstructorAndList$2(getTypedArrayConstructor$2(O), O);
  return sort(A, compareFn);
});

var exportTypedArrayMethod$2 = arrayBufferViewCore.exportTypedArrayMethod;
var fails$e = fails$1z;
var globalThis$w = globalThis_1;
var uncurryThis$q = functionUncurryThis;

var Uint8Array$3 = globalThis$w.Uint8Array;
var Uint8ArrayPrototype = Uint8Array$3 && Uint8Array$3.prototype || {};
var arrayToString = [].toString;
var join$4 = uncurryThis$q([].join);

if (fails$e(function () { arrayToString.call({}); })) {
  arrayToString = function toString() {
    return join$4(this);
  };
}

var IS_NOT_ARRAY_METHOD = Uint8ArrayPrototype.toString !== arrayToString;

// `%TypedArray%.prototype.toString` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.tostring
exportTypedArrayMethod$2('toString', arrayToString, IS_NOT_ARRAY_METHOD);

var arrayWith = arrayWith$2;
var ArrayBufferViewCore$1 = arrayBufferViewCore;
var isBigIntArray$1 = isBigIntArray$3;
var toIntegerOrInfinity$1 = toIntegerOrInfinity$n;
var toBigInt$1 = toBigInt$4;

var aTypedArray$1 = ArrayBufferViewCore$1.aTypedArray;
var getTypedArrayConstructor$1 = ArrayBufferViewCore$1.getTypedArrayConstructor;
var exportTypedArrayMethod$1 = ArrayBufferViewCore$1.exportTypedArrayMethod;

var PROPER_ORDER$1 = !!function () {
  try {
    // eslint-disable-next-line no-throw-literal, es/no-typed-arrays, es/no-array-prototype-with -- required for testing
    new Int8Array(1)['with'](2, { valueOf: function () { throw 8; } });
  } catch (error) {
    // some early implementations, like WebKit, does not follow the final semantic
    // https://github.com/tc39/proposal-change-array-by-copy/pull/86
    return error === 8;
  }
}();

// `%TypedArray%.prototype.with` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.with
exportTypedArrayMethod$1('with', { 'with': function (index, value) {
  var O = aTypedArray$1(this);
  var relativeIndex = toIntegerOrInfinity$1(index);
  var actualValue = isBigIntArray$1(O) ? toBigInt$1(value) : +value;
  return arrayWith(O, getTypedArrayConstructor$1(O), relativeIndex, actualValue);
} }['with'], !PROPER_ORDER$1);

var $$11 = _export;
var uncurryThis$p = functionUncurryThis;
var toString$8 = toString$F;

var fromCharCode$3 = String.fromCharCode;
var charAt$6 = uncurryThis$p(''.charAt);
var exec$7 = uncurryThis$p(/./.exec);
var stringSlice$3 = uncurryThis$p(''.slice);

var hex2 = /^[\da-f]{2}$/i;
var hex4 = /^[\da-f]{4}$/i;

// `unescape` method
// https://tc39.es/ecma262/#sec-unescape-string
$$11({ global: true }, {
  unescape: function unescape(string) {
    var str = toString$8(string);
    var result = '';
    var length = str.length;
    var index = 0;
    var chr, part;
    while (index < length) {
      chr = charAt$6(str, index++);
      if (chr === '%') {
        if (charAt$6(str, index) === 'u') {
          part = stringSlice$3(str, index + 1, index + 5);
          if (exec$7(hex4, part)) {
            result += fromCharCode$3(parseInt(part, 16));
            index += 5;
            continue;
          }
        } else {
          part = stringSlice$3(str, index, index + 2);
          if (exec$7(hex2, part)) {
            result += fromCharCode$3(parseInt(part, 16));
            index += 2;
            continue;
          }
        }
      }
      result += chr;
    } return result;
  }
});

var uncurryThis$o = functionUncurryThis;
var defineBuiltIns$7 = defineBuiltIns$a;
var getWeakData = internalMetadataExports.getWeakData;
var anInstance$8 = anInstance$e;
var anObject$t = anObject$11;
var isNullOrUndefined$2 = isNullOrUndefined$f;
var isObject$b = isObject$J;
var iterate$7 = iterate$k;
var ArrayIterationModule = arrayIteration;
var hasOwn$d = hasOwnProperty_1;
var InternalStateModule$8 = internalState;

var setInternalState$9 = InternalStateModule$8.set;
var internalStateGetterFor = InternalStateModule$8.getterFor;
var find$1 = ArrayIterationModule.find;
var findIndex = ArrayIterationModule.findIndex;
var splice$1 = uncurryThis$o([].splice);
var id = 0;

// fallback for uncaught frozen keys
var uncaughtFrozenStore = function (state) {
  return state.frozen || (state.frozen = new UncaughtFrozenStore());
};

var UncaughtFrozenStore = function () {
  this.entries = [];
};

var findUncaughtFrozen = function (store, key) {
  return find$1(store.entries, function (it) {
    return it[0] === key;
  });
};

UncaughtFrozenStore.prototype = {
  get: function (key) {
    var entry = findUncaughtFrozen(this, key);
    if (entry) return entry[1];
  },
  has: function (key) {
    return !!findUncaughtFrozen(this, key);
  },
  set: function (key, value) {
    var entry = findUncaughtFrozen(this, key);
    if (entry) entry[1] = value;
    else this.entries.push([key, value]);
  },
  'delete': function (key) {
    var index = findIndex(this.entries, function (it) {
      return it[0] === key;
    });
    if (~index) splice$1(this.entries, index, 1);
    return !!~index;
  }
};

var collectionWeak$2 = {
  getConstructor: function (wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER) {
    var Constructor = wrapper(function (that, iterable) {
      anInstance$8(that, Prototype);
      setInternalState$9(that, {
        type: CONSTRUCTOR_NAME,
        id: id++,
        frozen: undefined
      });
      if (!isNullOrUndefined$2(iterable)) iterate$7(iterable, that[ADDER], { that: that, AS_ENTRIES: IS_MAP });
    });

    var Prototype = Constructor.prototype;

    var getInternalState = internalStateGetterFor(CONSTRUCTOR_NAME);

    var define = function (that, key, value) {
      var state = getInternalState(that);
      var data = getWeakData(anObject$t(key), true);
      if (data === true) uncaughtFrozenStore(state).set(key, value);
      else data[state.id] = value;
      return that;
    };

    defineBuiltIns$7(Prototype, {
      // `{ WeakMap, WeakSet }.prototype.delete(key)` methods
      // https://tc39.es/ecma262/#sec-weakmap.prototype.delete
      // https://tc39.es/ecma262/#sec-weakset.prototype.delete
      'delete': function (key) {
        var state = getInternalState(this);
        if (!isObject$b(key)) return false;
        var data = getWeakData(key);
        if (data === true) return uncaughtFrozenStore(state)['delete'](key);
        return data && hasOwn$d(data, state.id) && delete data[state.id];
      },
      // `{ WeakMap, WeakSet }.prototype.has(key)` methods
      // https://tc39.es/ecma262/#sec-weakmap.prototype.has
      // https://tc39.es/ecma262/#sec-weakset.prototype.has
      has: function has(key) {
        var state = getInternalState(this);
        if (!isObject$b(key)) return false;
        var data = getWeakData(key);
        if (data === true) return uncaughtFrozenStore(state).has(key);
        return data && hasOwn$d(data, state.id);
      }
    });

    defineBuiltIns$7(Prototype, IS_MAP ? {
      // `WeakMap.prototype.get(key)` method
      // https://tc39.es/ecma262/#sec-weakmap.prototype.get
      get: function get(key) {
        var state = getInternalState(this);
        if (isObject$b(key)) {
          var data = getWeakData(key);
          if (data === true) return uncaughtFrozenStore(state).get(key);
          return data ? data[state.id] : undefined;
        }
      },
      // `WeakMap.prototype.set(key, value)` method
      // https://tc39.es/ecma262/#sec-weakmap.prototype.set
      set: function set(key, value) {
        return define(this, key, value);
      }
    } : {
      // `WeakSet.prototype.add(value)` method
      // https://tc39.es/ecma262/#sec-weakset.prototype.add
      add: function add(value) {
        return define(this, value, true);
      }
    });

    return Constructor;
  }
};

var FREEZING$1 = freezing;
var globalThis$v = globalThis_1;
var uncurryThis$n = functionUncurryThis;
var defineBuiltIns$6 = defineBuiltIns$a;
var InternalMetadataModule = internalMetadataExports;
var collection$1 = collection$4;
var collectionWeak$1 = collectionWeak$2;
var isObject$a = isObject$J;
var enforceInternalState = internalState.enforce;
var fails$d = fails$1z;
var NATIVE_WEAK_MAP = weakMapBasicDetection;

var $Object = Object;
// eslint-disable-next-line es/no-array-isarray -- safe
var isArray$1 = Array.isArray;
// eslint-disable-next-line es/no-object-isextensible -- safe
var isExtensible = $Object.isExtensible;
// eslint-disable-next-line es/no-object-isfrozen -- safe
var isFrozen = $Object.isFrozen;
// eslint-disable-next-line es/no-object-issealed -- safe
var isSealed = $Object.isSealed;
// eslint-disable-next-line es/no-object-freeze -- safe
var freeze$1 = $Object.freeze;
// eslint-disable-next-line es/no-object-seal -- safe
var seal = $Object.seal;

var IS_IE11 = !globalThis$v.ActiveXObject && 'ActiveXObject' in globalThis$v;
var InternalWeakMap;

var wrapper = function (init) {
  return function WeakMap() {
    return init(this, arguments.length ? arguments[0] : undefined);
  };
};

// `WeakMap` constructor
// https://tc39.es/ecma262/#sec-weakmap-constructor
var $WeakMap = collection$1('WeakMap', wrapper, collectionWeak$1);
var WeakMapPrototype = $WeakMap.prototype;
var nativeSet = uncurryThis$n(WeakMapPrototype.set);

// Chakra Edge bug: adding frozen arrays to WeakMap unfreeze them
var hasMSEdgeFreezingBug = function () {
  return FREEZING$1 && fails$d(function () {
    var frozenArray = freeze$1([]);
    nativeSet(new $WeakMap(), frozenArray, 1);
    return !isFrozen(frozenArray);
  });
};

// IE11 WeakMap frozen keys fix
// We can't use feature detection because it crash some old IE builds
// https://github.com/zloirock/core-js/issues/485
if (NATIVE_WEAK_MAP) if (IS_IE11) {
  InternalWeakMap = collectionWeak$1.getConstructor(wrapper, 'WeakMap', true);
  InternalMetadataModule.enable();
  var nativeDelete = uncurryThis$n(WeakMapPrototype['delete']);
  var nativeHas = uncurryThis$n(WeakMapPrototype.has);
  var nativeGet = uncurryThis$n(WeakMapPrototype.get);
  defineBuiltIns$6(WeakMapPrototype, {
    'delete': function (key) {
      if (isObject$a(key) && !isExtensible(key)) {
        var state = enforceInternalState(this);
        if (!state.frozen) state.frozen = new InternalWeakMap();
        return nativeDelete(this, key) || state.frozen['delete'](key);
      } return nativeDelete(this, key);
    },
    has: function has(key) {
      if (isObject$a(key) && !isExtensible(key)) {
        var state = enforceInternalState(this);
        if (!state.frozen) state.frozen = new InternalWeakMap();
        return nativeHas(this, key) || state.frozen.has(key);
      } return nativeHas(this, key);
    },
    get: function get(key) {
      if (isObject$a(key) && !isExtensible(key)) {
        var state = enforceInternalState(this);
        if (!state.frozen) state.frozen = new InternalWeakMap();
        return nativeHas(this, key) ? nativeGet(this, key) : state.frozen.get(key);
      } return nativeGet(this, key);
    },
    set: function set(key, value) {
      if (isObject$a(key) && !isExtensible(key)) {
        var state = enforceInternalState(this);
        if (!state.frozen) state.frozen = new InternalWeakMap();
        nativeHas(this, key) ? nativeSet(this, key, value) : state.frozen.set(key, value);
      } else nativeSet(this, key, value);
      return this;
    }
  });
// Chakra Edge frozen keys fix
} else if (hasMSEdgeFreezingBug()) {
  defineBuiltIns$6(WeakMapPrototype, {
    set: function set(key, value) {
      var arrayIntegrityLevel;
      if (isArray$1(key)) {
        if (isFrozen(key)) arrayIntegrityLevel = freeze$1;
        else if (isSealed(key)) arrayIntegrityLevel = seal;
      }
      nativeSet(this, key, value);
      if (arrayIntegrityLevel) arrayIntegrityLevel(key);
      return this;
    }
  });
}

var collection = collection$4;
var collectionWeak = collectionWeak$2;

// `WeakSet` constructor
// https://tc39.es/ecma262/#sec-weakset-constructor
collection('WeakSet', function (init) {
  return function WeakSet() { return init(this, arguments.length ? arguments[0] : undefined); };
}, collectionWeak);

var commonAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
var base64Alphabet$2 = commonAlphabet + '+/';
var base64UrlAlphabet$2 = commonAlphabet + '-_';

var inverse = function (characters) {
  // TODO: use `Object.create(null)` in `core-js@4`
  var result = {};
  var index = 0;
  for (; index < 64; index++) result[characters.charAt(index)] = index;
  return result;
};

var base64Map$2 = {
  i2c: base64Alphabet$2,
  c2i: inverse(base64Alphabet$2),
  i2cUrl: base64UrlAlphabet$2,
  c2iUrl: inverse(base64UrlAlphabet$2)
};

var $$10 = _export;
var globalThis$u = globalThis_1;
var getBuiltIn$i = getBuiltIn$C;
var uncurryThis$m = functionUncurryThis;
var call$t = functionCall;
var fails$c = fails$1z;
var toString$7 = toString$F;
var validateArgumentsLength$a = validateArgumentsLength$c;
var c2i = base64Map$2.c2i;

var disallowed = /[^\d+/a-z]/i;
var whitespaces = /[\t\n\f\r ]+/g;
var finalEq = /[=]{1,2}$/;

var $atob = getBuiltIn$i('atob');
var fromCharCode$2 = String.fromCharCode;
var charAt$5 = uncurryThis$m(''.charAt);
var replace$3 = uncurryThis$m(''.replace);
var exec$6 = uncurryThis$m(disallowed.exec);

var BASIC$1 = !!$atob && !fails$c(function () {
  return $atob('aGk=') !== 'hi';
});

var NO_SPACES_IGNORE = BASIC$1 && fails$c(function () {
  return $atob(' ') !== '';
});

var NO_ENCODING_CHECK = BASIC$1 && !fails$c(function () {
  $atob('a');
});

var NO_ARG_RECEIVING_CHECK$1 = BASIC$1 && !fails$c(function () {
  $atob();
});

var WRONG_ARITY$4 = BASIC$1 && $atob.length !== 1;

var FORCED$3 = !BASIC$1 || NO_SPACES_IGNORE || NO_ENCODING_CHECK || NO_ARG_RECEIVING_CHECK$1 || WRONG_ARITY$4;

// `atob` method
// https://html.spec.whatwg.org/multipage/webappapis.html#dom-atob
$$10({ global: true, bind: true, enumerable: true, forced: FORCED$3 }, {
  atob: function atob(data) {
    validateArgumentsLength$a(arguments.length, 1);
    // `webpack` dev server bug on IE global methods - use call(fn, global, ...)
    if (BASIC$1 && !NO_SPACES_IGNORE && !NO_ENCODING_CHECK) return call$t($atob, globalThis$u, data);
    var string = replace$3(toString$7(data), whitespaces, '');
    var output = '';
    var position = 0;
    var bc = 0;
    var length, chr, bs;
    if (string.length % 4 === 0) {
      string = replace$3(string, finalEq, '');
    }
    length = string.length;
    if (length % 4 === 1 || exec$6(disallowed, string)) {
      throw new (getBuiltIn$i('DOMException'))('The string is not correctly encoded', 'InvalidCharacterError');
    }
    while (position < length) {
      chr = charAt$5(string, position++);
      bs = bc % 4 ? bs * 64 + c2i[chr] : c2i[chr];
      if (bc++ % 4) output += fromCharCode$2(255 & bs >> (-2 * bc & 6));
    } return output;
  }
});

var $$$ = _export;
var globalThis$t = globalThis_1;
var getBuiltIn$h = getBuiltIn$C;
var uncurryThis$l = functionUncurryThis;
var call$s = functionCall;
var fails$b = fails$1z;
var toString$6 = toString$F;
var validateArgumentsLength$9 = validateArgumentsLength$c;
var i2c = base64Map$2.i2c;

var $btoa = getBuiltIn$h('btoa');
var charAt$4 = uncurryThis$l(''.charAt);
var charCodeAt$2 = uncurryThis$l(''.charCodeAt);

var BASIC = !!$btoa && !fails$b(function () {
  return $btoa('hi') !== 'aGk=';
});

var NO_ARG_RECEIVING_CHECK = BASIC && !fails$b(function () {
  $btoa();
});

var WRONG_ARG_CONVERSION = BASIC && fails$b(function () {
  return $btoa(null) !== 'bnVsbA==';
});

var WRONG_ARITY$3 = BASIC && $btoa.length !== 1;

// `btoa` method
// https://html.spec.whatwg.org/multipage/webappapis.html#dom-btoa
$$$({ global: true, bind: true, enumerable: true, forced: !BASIC || NO_ARG_RECEIVING_CHECK || WRONG_ARG_CONVERSION || WRONG_ARITY$3 }, {
  btoa: function btoa(data) {
    validateArgumentsLength$9(arguments.length, 1);
    // `webpack` dev server bug on IE global methods - use call(fn, global, ...)
    if (BASIC) return call$s($btoa, globalThis$t, toString$6(data));
    var string = toString$6(data);
    var output = '';
    var position = 0;
    var map = i2c;
    var block, charCode;
    while (charAt$4(string, position) || (map = '=', position % 1)) {
      charCode = charCodeAt$2(string, position += 3 / 4);
      if (charCode > 0xFF) {
        throw new (getBuiltIn$h('DOMException'))('The string contains characters outside of the Latin1 range', 'InvalidCharacterError');
      }
      block = block << 8 | charCode;
      output += charAt$4(map, 63 & block >> 8 - position % 1 * 8);
    } return output;
  }
});

// iterable DOM collections
// flag - `iterable` interface - 'entries', 'keys', 'values', 'forEach' methods
var domIterables = {
  CSSRuleList: 0,
  CSSStyleDeclaration: 0,
  CSSValueList: 0,
  ClientRectList: 0,
  DOMRectList: 0,
  DOMStringList: 0,
  DOMTokenList: 1,
  DataTransferItemList: 0,
  FileList: 0,
  HTMLAllCollection: 0,
  HTMLCollection: 0,
  HTMLFormElement: 0,
  HTMLSelectElement: 0,
  MediaList: 0,
  MimeTypeArray: 0,
  NamedNodeMap: 0,
  NodeList: 1,
  PaintRequestList: 0,
  Plugin: 0,
  PluginArray: 0,
  SVGLengthList: 0,
  SVGNumberList: 0,
  SVGPathSegList: 0,
  SVGPointList: 0,
  SVGStringList: 0,
  SVGTransformList: 0,
  SourceBufferList: 0,
  StyleSheetList: 0,
  TextTrackCueList: 0,
  TextTrackList: 0,
  TouchList: 0
};

// in old WebKit versions, `element.classList` is not an instance of global `DOMTokenList`
var documentCreateElement = documentCreateElement$2;

var classList = documentCreateElement('span').classList;
var DOMTokenListPrototype$2 = classList && classList.constructor && classList.constructor.prototype;

var domTokenListPrototype = DOMTokenListPrototype$2 === Object.prototype ? undefined : DOMTokenListPrototype$2;

var globalThis$s = globalThis_1;
var DOMIterables$1 = domIterables;
var DOMTokenListPrototype$1 = domTokenListPrototype;
var forEach$2 = arrayForEach;
var createNonEnumerableProperty$6 = createNonEnumerableProperty$j;

var handlePrototype$1 = function (CollectionPrototype) {
  // some Chrome versions have non-configurable methods on DOMTokenList
  if (CollectionPrototype && CollectionPrototype.forEach !== forEach$2) try {
    createNonEnumerableProperty$6(CollectionPrototype, 'forEach', forEach$2);
  } catch (error) {
    CollectionPrototype.forEach = forEach$2;
  }
};

for (var COLLECTION_NAME$1 in DOMIterables$1) {
  if (DOMIterables$1[COLLECTION_NAME$1]) {
    handlePrototype$1(globalThis$s[COLLECTION_NAME$1] && globalThis$s[COLLECTION_NAME$1].prototype);
  }
}

handlePrototype$1(DOMTokenListPrototype$1);

var globalThis$r = globalThis_1;
var DOMIterables = domIterables;
var DOMTokenListPrototype = domTokenListPrototype;
var ArrayIteratorMethods = es_array_iterator;
var createNonEnumerableProperty$5 = createNonEnumerableProperty$j;
var setToStringTag$3 = setToStringTag$e;
var wellKnownSymbol$h = wellKnownSymbol$O;

var ITERATOR$3 = wellKnownSymbol$h('iterator');
var ArrayValues = ArrayIteratorMethods.values;

var handlePrototype = function (CollectionPrototype, COLLECTION_NAME) {
  if (CollectionPrototype) {
    // some Chrome versions have non-configurable methods on DOMTokenList
    if (CollectionPrototype[ITERATOR$3] !== ArrayValues) try {
      createNonEnumerableProperty$5(CollectionPrototype, ITERATOR$3, ArrayValues);
    } catch (error) {
      CollectionPrototype[ITERATOR$3] = ArrayValues;
    }
    setToStringTag$3(CollectionPrototype, COLLECTION_NAME, true);
    if (DOMIterables[COLLECTION_NAME]) for (var METHOD_NAME in ArrayIteratorMethods) {
      // some Chrome versions have non-configurable methods on DOMTokenList
      if (CollectionPrototype[METHOD_NAME] !== ArrayIteratorMethods[METHOD_NAME]) try {
        createNonEnumerableProperty$5(CollectionPrototype, METHOD_NAME, ArrayIteratorMethods[METHOD_NAME]);
      } catch (error) {
        CollectionPrototype[METHOD_NAME] = ArrayIteratorMethods[METHOD_NAME];
      }
    }
  }
};

for (var COLLECTION_NAME in DOMIterables) {
  handlePrototype(globalThis$r[COLLECTION_NAME] && globalThis$r[COLLECTION_NAME].prototype, COLLECTION_NAME);
}

handlePrototype(DOMTokenListPrototype, 'DOMTokenList');

var domExceptionConstants = {
  IndexSizeError: { s: 'INDEX_SIZE_ERR', c: 1, m: 1 },
  DOMStringSizeError: { s: 'DOMSTRING_SIZE_ERR', c: 2, m: 0 },
  HierarchyRequestError: { s: 'HIERARCHY_REQUEST_ERR', c: 3, m: 1 },
  WrongDocumentError: { s: 'WRONG_DOCUMENT_ERR', c: 4, m: 1 },
  InvalidCharacterError: { s: 'INVALID_CHARACTER_ERR', c: 5, m: 1 },
  NoDataAllowedError: { s: 'NO_DATA_ALLOWED_ERR', c: 6, m: 0 },
  NoModificationAllowedError: { s: 'NO_MODIFICATION_ALLOWED_ERR', c: 7, m: 1 },
  NotFoundError: { s: 'NOT_FOUND_ERR', c: 8, m: 1 },
  NotSupportedError: { s: 'NOT_SUPPORTED_ERR', c: 9, m: 1 },
  InUseAttributeError: { s: 'INUSE_ATTRIBUTE_ERR', c: 10, m: 1 },
  InvalidStateError: { s: 'INVALID_STATE_ERR', c: 11, m: 1 },
  SyntaxError: { s: 'SYNTAX_ERR', c: 12, m: 1 },
  InvalidModificationError: { s: 'INVALID_MODIFICATION_ERR', c: 13, m: 1 },
  NamespaceError: { s: 'NAMESPACE_ERR', c: 14, m: 1 },
  InvalidAccessError: { s: 'INVALID_ACCESS_ERR', c: 15, m: 1 },
  ValidationError: { s: 'VALIDATION_ERR', c: 16, m: 0 },
  TypeMismatchError: { s: 'TYPE_MISMATCH_ERR', c: 17, m: 1 },
  SecurityError: { s: 'SECURITY_ERR', c: 18, m: 1 },
  NetworkError: { s: 'NETWORK_ERR', c: 19, m: 1 },
  AbortError: { s: 'ABORT_ERR', c: 20, m: 1 },
  URLMismatchError: { s: 'URL_MISMATCH_ERR', c: 21, m: 1 },
  QuotaExceededError: { s: 'QUOTA_EXCEEDED_ERR', c: 22, m: 1 },
  TimeoutError: { s: 'TIMEOUT_ERR', c: 23, m: 1 },
  InvalidNodeTypeError: { s: 'INVALID_NODE_TYPE_ERR', c: 24, m: 1 },
  DataCloneError: { s: 'DATA_CLONE_ERR', c: 25, m: 1 }
};

var $$_ = _export;
var getBuiltIn$g = getBuiltIn$C;
var getBuiltInNodeModule = getBuiltInNodeModule$2;
var fails$a = fails$1z;
var create$6 = objectCreate$1;
var createPropertyDescriptor$3 = createPropertyDescriptor$d;
var defineProperty$5 = objectDefineProperty.f;
var defineBuiltIn$9 = defineBuiltIn$t;
var defineBuiltInAccessor$7 = defineBuiltInAccessor$l;
var hasOwn$c = hasOwnProperty_1;
var anInstance$7 = anInstance$e;
var anObject$s = anObject$11;
var errorToString = errorToString$2;
var normalizeStringArgument$2 = normalizeStringArgument$6;
var DOMExceptionConstants$1 = domExceptionConstants;
var clearErrorStack$1 = errorStackClear;
var InternalStateModule$7 = internalState;
var DESCRIPTORS$b = descriptors;

var DOM_EXCEPTION$2 = 'DOMException';
var DATA_CLONE_ERR = 'DATA_CLONE_ERR';
var Error$3 = getBuiltIn$g('Error');
// NodeJS < 17.0 does not expose `DOMException` to global
var NativeDOMException$1 = getBuiltIn$g(DOM_EXCEPTION$2) || (function () {
  try {
    // NodeJS < 15.0 does not expose `MessageChannel` to global
    var MessageChannel = getBuiltIn$g('MessageChannel') || getBuiltInNodeModule('worker_threads').MessageChannel;
    // eslint-disable-next-line es/no-weak-map, unicorn/require-post-message-target-origin -- safe
    new MessageChannel().port1.postMessage(new WeakMap());
  } catch (error) {
    if (error.name === DATA_CLONE_ERR && error.code === 25) return error.constructor;
  }
})();
var NativeDOMExceptionPrototype = NativeDOMException$1 && NativeDOMException$1.prototype;
var ErrorPrototype = Error$3.prototype;
var setInternalState$8 = InternalStateModule$7.set;
var getInternalState$2 = InternalStateModule$7.getterFor(DOM_EXCEPTION$2);
var HAS_STACK = 'stack' in new Error$3(DOM_EXCEPTION$2);

var codeFor = function (name) {
  return hasOwn$c(DOMExceptionConstants$1, name) && DOMExceptionConstants$1[name].m ? DOMExceptionConstants$1[name].c : 0;
};

var $DOMException$1 = function DOMException() {
  anInstance$7(this, DOMExceptionPrototype$1);
  var argumentsLength = arguments.length;
  var message = normalizeStringArgument$2(argumentsLength < 1 ? undefined : arguments[0]);
  var name = normalizeStringArgument$2(argumentsLength < 2 ? undefined : arguments[1], 'Error');
  var code = codeFor(name);
  setInternalState$8(this, {
    type: DOM_EXCEPTION$2,
    name: name,
    message: message,
    code: code
  });
  if (!DESCRIPTORS$b) {
    this.name = name;
    this.message = message;
    this.code = code;
  }
  if (HAS_STACK) {
    var error = new Error$3(message);
    error.name = DOM_EXCEPTION$2;
    defineProperty$5(this, 'stack', createPropertyDescriptor$3(1, clearErrorStack$1(error.stack, 1)));
  }
};

var DOMExceptionPrototype$1 = $DOMException$1.prototype = create$6(ErrorPrototype);

var createGetterDescriptor = function (get) {
  return { enumerable: true, configurable: true, get: get };
};

var getterFor = function (key) {
  return createGetterDescriptor(function () {
    return getInternalState$2(this)[key];
  });
};

if (DESCRIPTORS$b) {
  // `DOMException.prototype.code` getter
  defineBuiltInAccessor$7(DOMExceptionPrototype$1, 'code', getterFor('code'));
  // `DOMException.prototype.message` getter
  defineBuiltInAccessor$7(DOMExceptionPrototype$1, 'message', getterFor('message'));
  // `DOMException.prototype.name` getter
  defineBuiltInAccessor$7(DOMExceptionPrototype$1, 'name', getterFor('name'));
}

defineProperty$5(DOMExceptionPrototype$1, 'constructor', createPropertyDescriptor$3(1, $DOMException$1));

// FF36- DOMException is a function, but can't be constructed
var INCORRECT_CONSTRUCTOR = fails$a(function () {
  return !(new NativeDOMException$1() instanceof Error$3);
});

// Safari 10.1 / Chrome 32- / IE8- DOMException.prototype.toString bugs
var INCORRECT_TO_STRING = INCORRECT_CONSTRUCTOR || fails$a(function () {
  return ErrorPrototype.toString !== errorToString || String(new NativeDOMException$1(1, 2)) !== '2: 1';
});

// Deno 1.6.3- DOMException.prototype.code just missed
var INCORRECT_CODE = INCORRECT_CONSTRUCTOR || fails$a(function () {
  return new NativeDOMException$1(1, 'DataCloneError').code !== 25;
});

// Deno 1.6.3- DOMException constants just missed
INCORRECT_CONSTRUCTOR
  || NativeDOMException$1[DATA_CLONE_ERR] !== 25
  || NativeDOMExceptionPrototype[DATA_CLONE_ERR] !== 25;

var FORCED_CONSTRUCTOR$1 = INCORRECT_CONSTRUCTOR;

// `DOMException` constructor
// https://webidl.spec.whatwg.org/#idl-DOMException
$$_({ global: true, constructor: true, forced: FORCED_CONSTRUCTOR$1 }, {
  DOMException: FORCED_CONSTRUCTOR$1 ? $DOMException$1 : NativeDOMException$1
});

var PolyfilledDOMException$1 = getBuiltIn$g(DOM_EXCEPTION$2);
var PolyfilledDOMExceptionPrototype$1 = PolyfilledDOMException$1.prototype;

if (INCORRECT_TO_STRING && (NativeDOMException$1 === PolyfilledDOMException$1)) {
  defineBuiltIn$9(PolyfilledDOMExceptionPrototype$1, 'toString', errorToString);
}

if (INCORRECT_CODE && DESCRIPTORS$b && NativeDOMException$1 === PolyfilledDOMException$1) {
  defineBuiltInAccessor$7(PolyfilledDOMExceptionPrototype$1, 'code', createGetterDescriptor(function () {
    return codeFor(anObject$s(this).name);
  }));
}

// `DOMException` constants
for (var key$1 in DOMExceptionConstants$1) if (hasOwn$c(DOMExceptionConstants$1, key$1)) {
  var constant$1 = DOMExceptionConstants$1[key$1];
  var constantName$1 = constant$1.s;
  var descriptor$4 = createPropertyDescriptor$3(6, constant$1.c);
  if (!hasOwn$c(PolyfilledDOMException$1, constantName$1)) {
    defineProperty$5(PolyfilledDOMException$1, constantName$1, descriptor$4);
  }
  if (!hasOwn$c(PolyfilledDOMExceptionPrototype$1, constantName$1)) {
    defineProperty$5(PolyfilledDOMExceptionPrototype$1, constantName$1, descriptor$4);
  }
}

var $$Z = _export;
var globalThis$q = globalThis_1;
var getBuiltIn$f = getBuiltIn$C;
var createPropertyDescriptor$2 = createPropertyDescriptor$d;
var defineProperty$4 = objectDefineProperty.f;
var hasOwn$b = hasOwnProperty_1;
var anInstance$6 = anInstance$e;
var inheritIfRequired = inheritIfRequired$7;
var normalizeStringArgument$1 = normalizeStringArgument$6;
var DOMExceptionConstants = domExceptionConstants;
var clearErrorStack = errorStackClear;
var DESCRIPTORS$a = descriptors;

var DOM_EXCEPTION$1 = 'DOMException';
var Error$2 = getBuiltIn$f('Error');
var NativeDOMException = getBuiltIn$f(DOM_EXCEPTION$1);

var $DOMException = function DOMException() {
  anInstance$6(this, DOMExceptionPrototype);
  var argumentsLength = arguments.length;
  var message = normalizeStringArgument$1(argumentsLength < 1 ? undefined : arguments[0]);
  var name = normalizeStringArgument$1(argumentsLength < 2 ? undefined : arguments[1], 'Error');
  var that = new NativeDOMException(message, name);
  var error = new Error$2(message);
  error.name = DOM_EXCEPTION$1;
  defineProperty$4(that, 'stack', createPropertyDescriptor$2(1, clearErrorStack(error.stack, 1)));
  inheritIfRequired(that, this, $DOMException);
  return that;
};

var DOMExceptionPrototype = $DOMException.prototype = NativeDOMException.prototype;

var ERROR_HAS_STACK = 'stack' in new Error$2(DOM_EXCEPTION$1);
var DOM_EXCEPTION_HAS_STACK = 'stack' in new NativeDOMException(1, 2);

// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var descriptor$3 = NativeDOMException && DESCRIPTORS$a && Object.getOwnPropertyDescriptor(globalThis$q, DOM_EXCEPTION$1);

// Bun ~ 0.1.1 DOMException have incorrect descriptor and we can't redefine it
// https://github.com/Jarred-Sumner/bun/issues/399
var BUGGY_DESCRIPTOR = !!descriptor$3 && !(descriptor$3.writable && descriptor$3.configurable);

var FORCED_CONSTRUCTOR = ERROR_HAS_STACK && !BUGGY_DESCRIPTOR && !DOM_EXCEPTION_HAS_STACK;

// `DOMException` constructor patch for `.stack` where it's required
// https://webidl.spec.whatwg.org/#es-DOMException-specialness
$$Z({ global: true, constructor: true, forced: FORCED_CONSTRUCTOR }, { // TODO: fix export logic
  DOMException: FORCED_CONSTRUCTOR ? $DOMException : NativeDOMException
});

var PolyfilledDOMException = getBuiltIn$f(DOM_EXCEPTION$1);
var PolyfilledDOMExceptionPrototype = PolyfilledDOMException.prototype;

if (PolyfilledDOMExceptionPrototype.constructor !== PolyfilledDOMException) {
  {
    defineProperty$4(PolyfilledDOMExceptionPrototype, 'constructor', createPropertyDescriptor$2(1, PolyfilledDOMException));
  }

  for (var key in DOMExceptionConstants) if (hasOwn$b(DOMExceptionConstants, key)) {
    var constant = DOMExceptionConstants[key];
    var constantName = constant.s;
    if (!hasOwn$b(PolyfilledDOMException, constantName)) {
      defineProperty$4(PolyfilledDOMException, constantName, createPropertyDescriptor$2(6, constant.c));
    }
  }
}

var getBuiltIn$e = getBuiltIn$C;
var setToStringTag$2 = setToStringTag$e;

var DOM_EXCEPTION = 'DOMException';

// `DOMException.prototype[@@toStringTag]` property
setToStringTag$2(getBuiltIn$e(DOM_EXCEPTION), DOM_EXCEPTION);

var $$Y = _export;
var globalThis$p = globalThis_1;
var clearImmediate = task$1.clear;

// `clearImmediate` method
// http://w3c.github.io/setImmediate/#si-clearImmediate
$$Y({ global: true, bind: true, enumerable: true, forced: globalThis$p.clearImmediate !== clearImmediate }, {
  clearImmediate: clearImmediate
});

var globalThis$o = globalThis_1;
var apply$1 = functionApply$1;
var isCallable$7 = isCallable$D;
var ENVIRONMENT = environment;
var USER_AGENT = environmentUserAgent;
var arraySlice$1 = arraySlice$a;
var validateArgumentsLength$8 = validateArgumentsLength$c;

var Function$1 = globalThis$o.Function;
// dirty IE9- and Bun 0.3.0- checks
var WRAP = /MSIE .\./.test(USER_AGENT) || ENVIRONMENT === 'BUN' && (function () {
  var version = globalThis$o.Bun.version.split('.');
  return version.length < 3 || version[0] === '0' && (version[1] < 3 || version[1] === '3' && version[2] === '0');
})();

// IE9- / Bun 0.3.0- setTimeout / setInterval / setImmediate additional parameters fix
// https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#timers
// https://github.com/oven-sh/bun/issues/1633
var schedulersFix$3 = function (scheduler, hasTimeArg) {
  var firstParamIndex = hasTimeArg ? 2 : 1;
  return WRAP ? function (handler, timeout /* , ...arguments */) {
    var boundArgs = validateArgumentsLength$8(arguments.length, 1) > firstParamIndex;
    var fn = isCallable$7(handler) ? handler : Function$1(handler);
    var params = boundArgs ? arraySlice$1(arguments, firstParamIndex) : [];
    var callback = boundArgs ? function () {
      apply$1(fn, this, params);
    } : fn;
    return hasTimeArg ? scheduler(callback, timeout) : scheduler(callback);
  } : scheduler;
};

var $$X = _export;
var globalThis$n = globalThis_1;
var setTask = task$1.set;
var schedulersFix$2 = schedulersFix$3;

// https://github.com/oven-sh/bun/issues/1633
var setImmediate = globalThis$n.setImmediate ? schedulersFix$2(setTask, false) : setTask;

// `setImmediate` method
// http://w3c.github.io/setImmediate/#si-setImmediate
$$X({ global: true, bind: true, enumerable: true, forced: globalThis$n.setImmediate !== setImmediate }, {
  setImmediate: setImmediate
});

var $$W = _export;
var globalThis$m = globalThis_1;
var microtask = microtask_1;
var aCallable$h = aCallable$F;
var validateArgumentsLength$7 = validateArgumentsLength$c;
var fails$9 = fails$1z;
var DESCRIPTORS$9 = descriptors;

// Bun ~ 1.0.30 bug
// https://github.com/oven-sh/bun/issues/9249
var WRONG_ARITY$2 = fails$9(function () {
  // getOwnPropertyDescriptor for prevent experimental warning in Node 11
  // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
  return DESCRIPTORS$9 && Object.getOwnPropertyDescriptor(globalThis$m, 'queueMicrotask').value.length !== 1;
});

// `queueMicrotask` method
// https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#dom-queuemicrotask
$$W({ global: true, enumerable: true, dontCallGetSet: true, forced: WRONG_ARITY$2 }, {
  queueMicrotask: function queueMicrotask(fn) {
    validateArgumentsLength$7(arguments.length, 1);
    microtask(aCallable$h(fn));
  }
});

var $$V = _export;
var globalThis$l = globalThis_1;
var defineBuiltInAccessor$6 = defineBuiltInAccessor$l;
var DESCRIPTORS$8 = descriptors;

var $TypeError$9 = TypeError;
// eslint-disable-next-line es/no-object-defineproperty -- safe
var defineProperty$3 = Object.defineProperty;
var INCORRECT_VALUE = globalThis$l.self !== globalThis$l;

// `self` getter
// https://html.spec.whatwg.org/multipage/window-object.html#dom-self
try {
  if (DESCRIPTORS$8) {
    // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
    var descriptor$2 = Object.getOwnPropertyDescriptor(globalThis$l, 'self');
    // some engines have `self`, but with incorrect descriptor
    // https://github.com/denoland/deno/issues/15765
    if (INCORRECT_VALUE || !descriptor$2 || !descriptor$2.get || !descriptor$2.enumerable) {
      defineBuiltInAccessor$6(globalThis$l, 'self', {
        get: function self() {
          return globalThis$l;
        },
        set: function self(value) {
          if (this !== globalThis$l) throw new $TypeError$9('Illegal invocation');
          defineProperty$3(globalThis$l, 'self', {
            value: value,
            writable: true,
            configurable: true,
            enumerable: true
          });
        },
        configurable: true,
        enumerable: true
      });
    }
  } else $$V({ global: true, simple: true, forced: INCORRECT_VALUE }, {
    self: globalThis$l
  });
} catch (error) { /* empty */ }

var $$U = _export;
var globalThis$k = globalThis_1;
var getBuiltIn$d = getBuiltIn$C;
var uncurryThis$k = functionUncurryThis;
var fails$8 = fails$1z;
var uid$1 = uid$7;
var isCallable$6 = isCallable$D;
var isConstructor$1 = isConstructor$7;
var isNullOrUndefined$1 = isNullOrUndefined$f;
var isObject$9 = isObject$J;
var isSymbol = isSymbol$7;
var iterate$6 = iterate$k;
var anObject$r = anObject$11;
var classof$3 = classof$p;
var hasOwn$a = hasOwnProperty_1;
var createProperty$3 = createProperty$b;
var createNonEnumerableProperty$4 = createNonEnumerableProperty$j;
var lengthOfArrayLike$4 = lengthOfArrayLike$w;
var validateArgumentsLength$6 = validateArgumentsLength$c;
var getRegExpFlags = regexpGetFlags;
var MapHelpers$1 = mapHelpers;
var SetHelpers = setHelpers;
var setIterate = setIterate$1;
var detachTransferable = detachTransferable$2;
var ERROR_STACK_INSTALLABLE = errorStackInstallable;
var PROPER_STRUCTURED_CLONE_TRANSFER = structuredCloneProperTransfer;

var Object$1 = globalThis$k.Object;
var Array$1 = globalThis$k.Array;
var Date$1 = globalThis$k.Date;
var Error$1 = globalThis$k.Error;
var TypeError$4 = globalThis$k.TypeError;
var PerformanceMark = globalThis$k.PerformanceMark;
var DOMException = getBuiltIn$d('DOMException');
var Map$2 = MapHelpers$1.Map;
var mapHas$1 = MapHelpers$1.has;
var mapGet$1 = MapHelpers$1.get;
var mapSet$1 = MapHelpers$1.set;
var Set$1 = SetHelpers.Set;
var setAdd = SetHelpers.add;
var setHas = SetHelpers.has;
var objectKeys = getBuiltIn$d('Object', 'keys');
var push$a = uncurryThis$k([].push);
var thisBooleanValue = uncurryThis$k(true.valueOf);
var thisNumberValue = uncurryThis$k(1.0.valueOf);
var thisStringValue = uncurryThis$k(''.valueOf);
var thisTimeValue = uncurryThis$k(Date$1.prototype.getTime);
var PERFORMANCE_MARK = uid$1('structuredClone');
var DATA_CLONE_ERROR = 'DataCloneError';
var TRANSFERRING = 'Transferring';

var checkBasicSemantic = function (structuredCloneImplementation) {
  return !fails$8(function () {
    var set1 = new globalThis$k.Set([7]);
    var set2 = structuredCloneImplementation(set1);
    var number = structuredCloneImplementation(Object$1(7));
    return set2 === set1 || !set2.has(7) || !isObject$9(number) || +number !== 7;
  }) && structuredCloneImplementation;
};

var checkErrorsCloning = function (structuredCloneImplementation, $Error) {
  return !fails$8(function () {
    var error = new $Error();
    var test = structuredCloneImplementation({ a: error, b: error });
    return !(test && test.a === test.b && test.a instanceof $Error && test.a.stack === error.stack);
  });
};

// https://github.com/whatwg/html/pull/5749
var checkNewErrorsCloningSemantic = function (structuredCloneImplementation) {
  return !fails$8(function () {
    var test = structuredCloneImplementation(new globalThis$k.AggregateError([1], PERFORMANCE_MARK, { cause: 3 }));
    return test.name !== 'AggregateError' || test.errors[0] !== 1 || test.message !== PERFORMANCE_MARK || test.cause !== 3;
  });
};

// FF94+, Safari 15.4+, Chrome 98+, NodeJS 17.0+, Deno 1.13+
// FF<103 and Safari implementations can't clone errors
// https://bugzilla.mozilla.org/show_bug.cgi?id=1556604
// FF103 can clone errors, but `.stack` of clone is an empty string
// https://bugzilla.mozilla.org/show_bug.cgi?id=1778762
// FF104+ fixed it on usual errors, but not on DOMExceptions
// https://bugzilla.mozilla.org/show_bug.cgi?id=1777321
// Chrome <102 returns `null` if cloned object contains multiple references to one error
// https://bugs.chromium.org/p/v8/issues/detail?id=12542
// NodeJS implementation can't clone DOMExceptions
// https://github.com/nodejs/node/issues/41038
// only FF103+ supports new (html/5749) error cloning semantic
var nativeStructuredClone = globalThis$k.structuredClone;

var FORCED_REPLACEMENT = !checkErrorsCloning(nativeStructuredClone, Error$1)
  || !checkErrorsCloning(nativeStructuredClone, DOMException)
  || !checkNewErrorsCloningSemantic(nativeStructuredClone);

// Chrome 82+, Safari 14.1+, Deno 1.11+
// Chrome 78-81 implementation swaps `.name` and `.message` of cloned `DOMException`
// Chrome returns `null` if cloned object contains multiple references to one error
// Safari 14.1 implementation doesn't clone some `RegExp` flags, so requires a workaround
// Safari implementation can't clone errors
// Deno 1.2-1.10 implementations too naive
// NodeJS 16.0+ does not have `PerformanceMark` constructor
// NodeJS <17.2 structured cloning implementation from `performance.mark` is too naive
// and can't clone, for example, `RegExp` or some boxed primitives
// https://github.com/nodejs/node/issues/40840
// no one of those implementations supports new (html/5749) error cloning semantic
var structuredCloneFromMark = !nativeStructuredClone && checkBasicSemantic(function (value) {
  return new PerformanceMark(PERFORMANCE_MARK, { detail: value }).detail;
});

var nativeRestrictedStructuredClone = checkBasicSemantic(nativeStructuredClone) || structuredCloneFromMark;

var throwUncloneable = function (type) {
  throw new DOMException('Uncloneable type: ' + type, DATA_CLONE_ERROR);
};

var throwUnpolyfillable = function (type, action) {
  throw new DOMException((action || 'Cloning') + ' of ' + type + ' cannot be properly polyfilled in this engine', DATA_CLONE_ERROR);
};

var tryNativeRestrictedStructuredClone = function (value, type) {
  if (!nativeRestrictedStructuredClone) throwUnpolyfillable(type);
  return nativeRestrictedStructuredClone(value);
};

var createDataTransfer = function () {
  var dataTransfer;
  try {
    dataTransfer = new globalThis$k.DataTransfer();
  } catch (error) {
    try {
      dataTransfer = new globalThis$k.ClipboardEvent('').clipboardData;
    } catch (error2) { /* empty */ }
  }
  return dataTransfer && dataTransfer.items && dataTransfer.files ? dataTransfer : null;
};

var cloneBuffer = function (value, map, $type) {
  if (mapHas$1(map, value)) return mapGet$1(map, value);

  var type = $type || classof$3(value);
  var clone, length, options, source, target, i;

  if (type === 'SharedArrayBuffer') {
    if (nativeRestrictedStructuredClone) clone = nativeRestrictedStructuredClone(value);
    // SharedArrayBuffer should use shared memory, we can't polyfill it, so return the original
    else clone = value;
  } else {
    var DataView = globalThis$k.DataView;

    // `ArrayBuffer#slice` is not available in IE10
    // `ArrayBuffer#slice` and `DataView` are not available in old FF
    if (!DataView && !isCallable$6(value.slice)) throwUnpolyfillable('ArrayBuffer');
    // detached buffers throws in `DataView` and `.slice`
    try {
      if (isCallable$6(value.slice) && !value.resizable) {
        clone = value.slice(0);
      } else {
        length = value.byteLength;
        options = 'maxByteLength' in value ? { maxByteLength: value.maxByteLength } : undefined;
        // eslint-disable-next-line es/no-resizable-and-growable-arraybuffers -- safe
        clone = new ArrayBuffer(length, options);
        source = new DataView(value);
        target = new DataView(clone);
        for (i = 0; i < length; i++) {
          target.setUint8(i, source.getUint8(i));
        }
      }
    } catch (error) {
      throw new DOMException('ArrayBuffer is detached', DATA_CLONE_ERROR);
    }
  }

  mapSet$1(map, value, clone);

  return clone;
};

var cloneView = function (value, type, offset, length, map) {
  var C = globalThis$k[type];
  // in some old engines like Safari 9, typeof C is 'object'
  // on Uint8ClampedArray or some other constructors
  if (!isObject$9(C)) throwUnpolyfillable(type);
  return new C(cloneBuffer(value.buffer, map), offset, length);
};

var structuredCloneInternal = function (value, map) {
  if (isSymbol(value)) throwUncloneable('Symbol');
  if (!isObject$9(value)) return value;
  // effectively preserves circular references
  if (map) {
    if (mapHas$1(map, value)) return mapGet$1(map, value);
  } else map = new Map$2();

  var type = classof$3(value);
  var C, name, cloned, dataTransfer, i, length, keys, key;

  switch (type) {
    case 'Array':
      cloned = Array$1(lengthOfArrayLike$4(value));
      break;
    case 'Object':
      cloned = {};
      break;
    case 'Map':
      cloned = new Map$2();
      break;
    case 'Set':
      cloned = new Set$1();
      break;
    case 'RegExp':
      // in this block because of a Safari 14.1 bug
      // old FF does not clone regexes passed to the constructor, so get the source and flags directly
      cloned = new RegExp(value.source, getRegExpFlags(value));
      break;
    case 'Error':
      name = value.name;
      switch (name) {
        case 'AggregateError':
          cloned = new (getBuiltIn$d(name))([]);
          break;
        case 'EvalError':
        case 'RangeError':
        case 'ReferenceError':
        case 'SuppressedError':
        case 'SyntaxError':
        case 'TypeError':
        case 'URIError':
          cloned = new (getBuiltIn$d(name))();
          break;
        case 'CompileError':
        case 'LinkError':
        case 'RuntimeError':
          cloned = new (getBuiltIn$d('WebAssembly', name))();
          break;
        default:
          cloned = new Error$1();
      }
      break;
    case 'DOMException':
      cloned = new DOMException(value.message, value.name);
      break;
    case 'ArrayBuffer':
    case 'SharedArrayBuffer':
      cloned = cloneBuffer(value, map, type);
      break;
    case 'DataView':
    case 'Int8Array':
    case 'Uint8Array':
    case 'Uint8ClampedArray':
    case 'Int16Array':
    case 'Uint16Array':
    case 'Int32Array':
    case 'Uint32Array':
    case 'Float16Array':
    case 'Float32Array':
    case 'Float64Array':
    case 'BigInt64Array':
    case 'BigUint64Array':
      length = type === 'DataView' ? value.byteLength : value.length;
      cloned = cloneView(value, type, value.byteOffset, length, map);
      break;
    case 'DOMQuad':
      try {
        cloned = new DOMQuad(
          structuredCloneInternal(value.p1, map),
          structuredCloneInternal(value.p2, map),
          structuredCloneInternal(value.p3, map),
          structuredCloneInternal(value.p4, map)
        );
      } catch (error) {
        cloned = tryNativeRestrictedStructuredClone(value, type);
      }
      break;
    case 'File':
      if (nativeRestrictedStructuredClone) try {
        cloned = nativeRestrictedStructuredClone(value);
        // NodeJS 20.0.0 bug, https://github.com/nodejs/node/issues/47612
        if (classof$3(cloned) !== type) cloned = undefined;
      } catch (error) { /* empty */ }
      if (!cloned) try {
        cloned = new File([value], value.name, value);
      } catch (error) { /* empty */ }
      if (!cloned) throwUnpolyfillable(type);
      break;
    case 'FileList':
      dataTransfer = createDataTransfer();
      if (dataTransfer) {
        for (i = 0, length = lengthOfArrayLike$4(value); i < length; i++) {
          dataTransfer.items.add(structuredCloneInternal(value[i], map));
        }
        cloned = dataTransfer.files;
      } else cloned = tryNativeRestrictedStructuredClone(value, type);
      break;
    case 'ImageData':
      // Safari 9 ImageData is a constructor, but typeof ImageData is 'object'
      try {
        cloned = new ImageData(
          structuredCloneInternal(value.data, map),
          value.width,
          value.height,
          { colorSpace: value.colorSpace }
        );
      } catch (error) {
        cloned = tryNativeRestrictedStructuredClone(value, type);
      } break;
    default:
      if (nativeRestrictedStructuredClone) {
        cloned = nativeRestrictedStructuredClone(value);
      } else switch (type) {
        case 'BigInt':
          // can be a 3rd party polyfill
          cloned = Object$1(value.valueOf());
          break;
        case 'Boolean':
          cloned = Object$1(thisBooleanValue(value));
          break;
        case 'Number':
          cloned = Object$1(thisNumberValue(value));
          break;
        case 'String':
          cloned = Object$1(thisStringValue(value));
          break;
        case 'Date':
          cloned = new Date$1(thisTimeValue(value));
          break;
        case 'Blob':
          try {
            cloned = value.slice(0, value.size, value.type);
          } catch (error) {
            throwUnpolyfillable(type);
          } break;
        case 'DOMPoint':
        case 'DOMPointReadOnly':
          C = globalThis$k[type];
          try {
            cloned = C.fromPoint
              ? C.fromPoint(value)
              : new C(value.x, value.y, value.z, value.w);
          } catch (error) {
            throwUnpolyfillable(type);
          } break;
        case 'DOMRect':
        case 'DOMRectReadOnly':
          C = globalThis$k[type];
          try {
            cloned = C.fromRect
              ? C.fromRect(value)
              : new C(value.x, value.y, value.width, value.height);
          } catch (error) {
            throwUnpolyfillable(type);
          } break;
        case 'DOMMatrix':
        case 'DOMMatrixReadOnly':
          C = globalThis$k[type];
          try {
            cloned = C.fromMatrix
              ? C.fromMatrix(value)
              : new C(value);
          } catch (error) {
            throwUnpolyfillable(type);
          } break;
        case 'AudioData':
        case 'VideoFrame':
          if (!isCallable$6(value.clone)) throwUnpolyfillable(type);
          try {
            cloned = value.clone();
          } catch (error) {
            throwUncloneable(type);
          } break;
        case 'CropTarget':
        case 'CryptoKey':
        case 'FileSystemDirectoryHandle':
        case 'FileSystemFileHandle':
        case 'FileSystemHandle':
        case 'GPUCompilationInfo':
        case 'GPUCompilationMessage':
        case 'ImageBitmap':
        case 'RTCCertificate':
        case 'WebAssembly.Module':
          throwUnpolyfillable(type);
          // break omitted
        default:
          throwUncloneable(type);
      }
  }

  mapSet$1(map, value, cloned);

  switch (type) {
    case 'Array':
    case 'Object':
      keys = objectKeys(value);
      for (i = 0, length = lengthOfArrayLike$4(keys); i < length; i++) {
        key = keys[i];
        createProperty$3(cloned, key, structuredCloneInternal(value[key], map));
      } break;
    case 'Map':
      value.forEach(function (v, k) {
        mapSet$1(cloned, structuredCloneInternal(k, map), structuredCloneInternal(v, map));
      });
      break;
    case 'Set':
      value.forEach(function (v) {
        setAdd(cloned, structuredCloneInternal(v, map));
      });
      break;
    case 'Error':
      createNonEnumerableProperty$4(cloned, 'message', structuredCloneInternal(value.message, map));
      if (hasOwn$a(value, 'cause')) {
        createNonEnumerableProperty$4(cloned, 'cause', structuredCloneInternal(value.cause, map));
      }
      if (name === 'AggregateError') {
        cloned.errors = structuredCloneInternal(value.errors, map);
      } else if (name === 'SuppressedError') {
        cloned.error = structuredCloneInternal(value.error, map);
        cloned.suppressed = structuredCloneInternal(value.suppressed, map);
      } // break omitted
    case 'DOMException':
      if (ERROR_STACK_INSTALLABLE) {
        createNonEnumerableProperty$4(cloned, 'stack', structuredCloneInternal(value.stack, map));
      }
  }

  return cloned;
};

var tryToTransfer = function (rawTransfer, map) {
  if (!isObject$9(rawTransfer)) throw new TypeError$4('Transfer option cannot be converted to a sequence');

  var transfer = [];

  iterate$6(rawTransfer, function (value) {
    push$a(transfer, anObject$r(value));
  });

  var i = 0;
  var length = lengthOfArrayLike$4(transfer);
  var buffers = new Set$1();
  var value, type, C, transferred, canvas, context;

  while (i < length) {
    value = transfer[i++];

    type = classof$3(value);

    if (type === 'ArrayBuffer' ? setHas(buffers, value) : mapHas$1(map, value)) {
      throw new DOMException('Duplicate transferable', DATA_CLONE_ERROR);
    }

    if (type === 'ArrayBuffer') {
      setAdd(buffers, value);
      continue;
    }

    if (PROPER_STRUCTURED_CLONE_TRANSFER) {
      transferred = nativeStructuredClone(value, { transfer: [value] });
    } else switch (type) {
      case 'ImageBitmap':
        C = globalThis$k.OffscreenCanvas;
        if (!isConstructor$1(C)) throwUnpolyfillable(type, TRANSFERRING);
        try {
          canvas = new C(value.width, value.height);
          context = canvas.getContext('bitmaprenderer');
          context.transferFromImageBitmap(value);
          transferred = canvas.transferToImageBitmap();
        } catch (error) { /* empty */ }
        break;
      case 'AudioData':
      case 'VideoFrame':
        if (!isCallable$6(value.clone) || !isCallable$6(value.close)) throwUnpolyfillable(type, TRANSFERRING);
        try {
          transferred = value.clone();
          value.close();
        } catch (error) { /* empty */ }
        break;
      case 'MediaSourceHandle':
      case 'MessagePort':
      case 'OffscreenCanvas':
      case 'ReadableStream':
      case 'TransformStream':
      case 'WritableStream':
        throwUnpolyfillable(type, TRANSFERRING);
    }

    if (transferred === undefined) throw new DOMException('This object cannot be transferred: ' + type, DATA_CLONE_ERROR);

    mapSet$1(map, value, transferred);
  }

  return buffers;
};

var detachBuffers = function (buffers) {
  setIterate(buffers, function (buffer) {
    if (PROPER_STRUCTURED_CLONE_TRANSFER) {
      nativeRestrictedStructuredClone(buffer, { transfer: [buffer] });
    } else if (isCallable$6(buffer.transfer)) {
      buffer.transfer();
    } else if (detachTransferable) {
      detachTransferable(buffer);
    } else {
      throwUnpolyfillable('ArrayBuffer', TRANSFERRING);
    }
  });
};

// `structuredClone` method
// https://html.spec.whatwg.org/multipage/structured-data.html#dom-structuredclone
$$U({ global: true, enumerable: true, sham: !PROPER_STRUCTURED_CLONE_TRANSFER, forced: FORCED_REPLACEMENT }, {
  structuredClone: function structuredClone(value /* , { transfer } */) {
    var options = validateArgumentsLength$6(arguments.length, 1) > 1 && !isNullOrUndefined$1(arguments[1]) ? anObject$r(arguments[1]) : undefined;
    var transfer = options ? options.transfer : undefined;
    var map, buffers;

    if (transfer !== undefined) {
      map = new Map$2();
      buffers = tryToTransfer(transfer, map);
    }

    var clone = structuredCloneInternal(value, map);

    // since of an issue with cloning views of transferred buffers, we a forced to detach them later
    // https://github.com/zloirock/core-js/issues/1265
    if (buffers) detachBuffers(buffers);

    return clone;
  }
});

var $$T = _export;
var globalThis$j = globalThis_1;
var schedulersFix$1 = schedulersFix$3;

var setInterval$1 = schedulersFix$1(globalThis$j.setInterval, true);

// Bun / IE9- setInterval additional parameters fix
// https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#dom-setinterval
$$T({ global: true, bind: true, forced: globalThis$j.setInterval !== setInterval$1 }, {
  setInterval: setInterval$1
});

var $$S = _export;
var globalThis$i = globalThis_1;
var schedulersFix = schedulersFix$3;

var setTimeout$1 = schedulersFix(globalThis$i.setTimeout, true);

// Bun / IE9- setTimeout additional parameters fix
// https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#dom-settimeout
$$S({ global: true, bind: true, forced: globalThis$i.setTimeout !== setTimeout$1 }, {
  setTimeout: setTimeout$1
});

var fails$7 = fails$1z;
var wellKnownSymbol$g = wellKnownSymbol$O;
var DESCRIPTORS$7 = descriptors;
var IS_PURE$g = isPure;

var ITERATOR$2 = wellKnownSymbol$g('iterator');

var urlConstructorDetection = !fails$7(function () {
  // eslint-disable-next-line unicorn/relative-url-style -- required for testing
  var url = new URL('b?a=1&b=2&c=3', 'https://a');
  var params = url.searchParams;
  var params2 = new URLSearchParams('a=1&a=2&b=3');
  var result = '';
  url.pathname = 'c%20d';
  params.forEach(function (value, key) {
    params['delete']('b');
    result += key + value;
  });
  params2['delete']('a', 2);
  // `undefined` case is a Chromium 117 bug
  // https://bugs.chromium.org/p/v8/issues/detail?id=14222
  params2['delete']('b', undefined);
  return (IS_PURE$g && (!url.toJSON || !params2.has('a', 1) || params2.has('a', 2) || !params2.has('a', undefined) || params2.has('b')))
    || (!params.size && (IS_PURE$g || !DESCRIPTORS$7))
    || !params.sort
    || url.href !== 'https://a/c%20d?a=1&c=3'
    || params.get('c') !== '3'
    || String(new URLSearchParams('?a=1')) !== 'a=1'
    || !params[ITERATOR$2]
    // throws in Edge
    || new URL('https://a@b').username !== 'a'
    || new URLSearchParams(new URLSearchParams('a=b')).get('a') !== 'b'
    // not punycoded in Edge
    || new URL('https://тест').host !== 'xn--e1aybc'
    // not escaped in Chrome 62-
    || new URL('https://a#б').hash !== '#%D0%B1'
    // fails in Chrome 66-
    || result !== 'a1c3'
    // throws in Safari
    || new URL('https://x', undefined).host !== 'x';
});

// based on https://github.com/bestiejs/punycode.js/blob/master/punycode.js
var uncurryThis$j = functionUncurryThis;

var maxInt = 2147483647; // aka. 0x7FFFFFFF or 2^31-1
var base = 36;
var tMin = 1;
var tMax = 26;
var skew = 38;
var damp = 700;
var initialBias = 72;
var initialN = 128; // 0x80
var delimiter = '-'; // '\x2D'
var regexNonASCII = /[^\0-\u007E]/; // non-ASCII chars
var regexSeparators = /[.\u3002\uFF0E\uFF61]/g; // RFC 3490 separators
var OVERFLOW_ERROR = 'Overflow: input needs wider integers to process';
var baseMinusTMin = base - tMin;

var $RangeError$1 = RangeError;
var exec$5 = uncurryThis$j(regexSeparators.exec);
var floor$1 = Math.floor;
var fromCharCode$1 = String.fromCharCode;
var charCodeAt$1 = uncurryThis$j(''.charCodeAt);
var join$3 = uncurryThis$j([].join);
var push$9 = uncurryThis$j([].push);
var replace$2 = uncurryThis$j(''.replace);
var split$2 = uncurryThis$j(''.split);
var toLowerCase$1 = uncurryThis$j(''.toLowerCase);

/**
 * Creates an array containing the numeric code points of each Unicode
 * character in the string. While JavaScript uses UCS-2 internally,
 * this function will convert a pair of surrogate halves (each of which
 * UCS-2 exposes as separate characters) into a single code point,
 * matching UTF-16.
 */
var ucs2decode = function (string) {
  var output = [];
  var counter = 0;
  var length = string.length;
  while (counter < length) {
    var value = charCodeAt$1(string, counter++);
    if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
      // It's a high surrogate, and there is a next character.
      var extra = charCodeAt$1(string, counter++);
      if ((extra & 0xFC00) === 0xDC00) { // Low surrogate.
        push$9(output, ((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
      } else {
        // It's an unmatched surrogate; only append this code unit, in case the
        // next code unit is the high surrogate of a surrogate pair.
        push$9(output, value);
        counter--;
      }
    } else {
      push$9(output, value);
    }
  }
  return output;
};

/**
 * Converts a digit/integer into a basic code point.
 */
var digitToBasic = function (digit) {
  //  0..25 map to ASCII a..z or A..Z
  // 26..35 map to ASCII 0..9
  return digit + 22 + 75 * (digit < 26);
};

/**
 * Bias adaptation function as per section 3.4 of RFC 3492.
 * https://tools.ietf.org/html/rfc3492#section-3.4
 */
var adapt = function (delta, numPoints, firstTime) {
  var k = 0;
  delta = firstTime ? floor$1(delta / damp) : delta >> 1;
  delta += floor$1(delta / numPoints);
  while (delta > baseMinusTMin * tMax >> 1) {
    delta = floor$1(delta / baseMinusTMin);
    k += base;
  }
  return floor$1(k + (baseMinusTMin + 1) * delta / (delta + skew));
};

/**
 * Converts a string of Unicode symbols (e.g. a domain name label) to a
 * Punycode string of ASCII-only symbols.
 */
var encode = function (input) {
  var output = [];

  // Convert the input in UCS-2 to an array of Unicode code points.
  input = ucs2decode(input);

  // Cache the length.
  var inputLength = input.length;

  // Initialize the state.
  var n = initialN;
  var delta = 0;
  var bias = initialBias;
  var i, currentValue;

  // Handle the basic code points.
  for (i = 0; i < input.length; i++) {
    currentValue = input[i];
    if (currentValue < 0x80) {
      push$9(output, fromCharCode$1(currentValue));
    }
  }

  var basicLength = output.length; // number of basic code points.
  var handledCPCount = basicLength; // number of code points that have been handled;

  // Finish the basic string with a delimiter unless it's empty.
  if (basicLength) {
    push$9(output, delimiter);
  }

  // Main encoding loop:
  while (handledCPCount < inputLength) {
    // All non-basic code points < n have been handled already. Find the next larger one:
    var m = maxInt;
    for (i = 0; i < input.length; i++) {
      currentValue = input[i];
      if (currentValue >= n && currentValue < m) {
        m = currentValue;
      }
    }

    // Increase `delta` enough to advance the decoder's <n,i> state to <m,0>, but guard against overflow.
    var handledCPCountPlusOne = handledCPCount + 1;
    if (m - n > floor$1((maxInt - delta) / handledCPCountPlusOne)) {
      throw new $RangeError$1(OVERFLOW_ERROR);
    }

    delta += (m - n) * handledCPCountPlusOne;
    n = m;

    for (i = 0; i < input.length; i++) {
      currentValue = input[i];
      if (currentValue < n && ++delta > maxInt) {
        throw new $RangeError$1(OVERFLOW_ERROR);
      }
      if (currentValue === n) {
        // Represent delta as a generalized variable-length integer.
        var q = delta;
        var k = base;
        while (true) {
          var t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
          if (q < t) break;
          var qMinusT = q - t;
          var baseMinusT = base - t;
          push$9(output, fromCharCode$1(digitToBasic(t + qMinusT % baseMinusT)));
          q = floor$1(qMinusT / baseMinusT);
          k += base;
        }

        push$9(output, fromCharCode$1(digitToBasic(q)));
        bias = adapt(delta, handledCPCountPlusOne, handledCPCount === basicLength);
        delta = 0;
        handledCPCount++;
      }
    }

    delta++;
    n++;
  }
  return join$3(output, '');
};

var stringPunycodeToAscii = function (input) {
  var encoded = [];
  var labels = split$2(replace$2(toLowerCase$1(input), regexSeparators, '\u002E'), '.');
  var i, label;
  for (i = 0; i < labels.length; i++) {
    label = labels[i];
    push$9(encoded, exec$5(regexNonASCII, label) ? 'xn--' + encode(label) : label);
  }
  return join$3(encoded, '.');
};

// TODO: in core-js@4, move /modules/ dependencies to public entries for better optimization by tools like `preset-env`

var $$R = _export;
var globalThis$h = globalThis_1;
var safeGetBuiltIn = safeGetBuiltIn$2;
var call$r = functionCall;
var uncurryThis$i = functionUncurryThis;
var DESCRIPTORS$6 = descriptors;
var USE_NATIVE_URL$3 = urlConstructorDetection;
var defineBuiltIn$8 = defineBuiltIn$t;
var defineBuiltInAccessor$5 = defineBuiltInAccessor$l;
var defineBuiltIns$5 = defineBuiltIns$a;
var setToStringTag$1 = setToStringTag$e;
var createIteratorConstructor = iteratorCreateConstructor;
var InternalStateModule$6 = internalState;
var anInstance$5 = anInstance$e;
var isCallable$5 = isCallable$D;
var hasOwn$9 = hasOwnProperty_1;
var bind$5 = functionBindContext;
var classof$2 = classof$p;
var anObject$q = anObject$11;
var isObject$8 = isObject$J;
var $toString$1 = toString$F;
var create$5 = objectCreate$1;
var createPropertyDescriptor$1 = createPropertyDescriptor$d;
var getIterator$2 = getIterator$6;
var getIteratorMethod$3 = getIteratorMethod$8;
var createIterResultObject$8 = createIterResultObject$d;
var validateArgumentsLength$5 = validateArgumentsLength$c;
var wellKnownSymbol$f = wellKnownSymbol$O;
var arraySort = arraySort$1;

var ITERATOR$1 = wellKnownSymbol$f('iterator');
var URL_SEARCH_PARAMS = 'URLSearchParams';
var URL_SEARCH_PARAMS_ITERATOR = URL_SEARCH_PARAMS + 'Iterator';
var setInternalState$7 = InternalStateModule$6.set;
var getInternalParamsState = InternalStateModule$6.getterFor(URL_SEARCH_PARAMS);
var getInternalIteratorState = InternalStateModule$6.getterFor(URL_SEARCH_PARAMS_ITERATOR);

var nativeFetch = safeGetBuiltIn('fetch');
var NativeRequest = safeGetBuiltIn('Request');
var Headers = safeGetBuiltIn('Headers');
var RequestPrototype = NativeRequest && NativeRequest.prototype;
var HeadersPrototype = Headers && Headers.prototype;
var RegExp$1 = globalThis$h.RegExp;
var TypeError$3 = globalThis$h.TypeError;
var decodeURIComponent = globalThis$h.decodeURIComponent;
var encodeURIComponent$1 = globalThis$h.encodeURIComponent;
var charAt$3 = uncurryThis$i(''.charAt);
var join$2 = uncurryThis$i([].join);
var push$8 = uncurryThis$i([].push);
var replace$1 = uncurryThis$i(''.replace);
var shift$1 = uncurryThis$i([].shift);
var splice = uncurryThis$i([].splice);
var split$1 = uncurryThis$i(''.split);
var stringSlice$2 = uncurryThis$i(''.slice);

var plus = /\+/g;
var sequences = Array(4);

var percentSequence = function (bytes) {
  return sequences[bytes - 1] || (sequences[bytes - 1] = RegExp$1('((?:%[\\da-f]{2}){' + bytes + '})', 'gi'));
};

var percentDecode = function (sequence) {
  try {
    return decodeURIComponent(sequence);
  } catch (error) {
    return sequence;
  }
};

var deserialize = function (it) {
  var result = replace$1(it, plus, ' ');
  var bytes = 4;
  try {
    return decodeURIComponent(result);
  } catch (error) {
    while (bytes) {
      result = replace$1(result, percentSequence(bytes--), percentDecode);
    }
    return result;
  }
};

var find = /[!'()~]|%20/g;

var replacements = {
  '!': '%21',
  "'": '%27',
  '(': '%28',
  ')': '%29',
  '~': '%7E',
  '%20': '+'
};

var replacer = function (match) {
  return replacements[match];
};

var serialize = function (it) {
  return replace$1(encodeURIComponent$1(it), find, replacer);
};

var URLSearchParamsIterator = createIteratorConstructor(function Iterator(params, kind) {
  setInternalState$7(this, {
    type: URL_SEARCH_PARAMS_ITERATOR,
    target: getInternalParamsState(params).entries,
    index: 0,
    kind: kind
  });
}, URL_SEARCH_PARAMS, function next() {
  var state = getInternalIteratorState(this);
  var target = state.target;
  var index = state.index++;
  if (!target || index >= target.length) {
    state.target = undefined;
    return createIterResultObject$8(undefined, true);
  }
  var entry = target[index];
  switch (state.kind) {
    case 'keys': return createIterResultObject$8(entry.key, false);
    case 'values': return createIterResultObject$8(entry.value, false);
  } return createIterResultObject$8([entry.key, entry.value], false);
}, true);

var URLSearchParamsState = function (init) {
  this.entries = [];
  this.url = null;

  if (init !== undefined) {
    if (isObject$8(init)) this.parseObject(init);
    else this.parseQuery(typeof init == 'string' ? charAt$3(init, 0) === '?' ? stringSlice$2(init, 1) : init : $toString$1(init));
  }
};

URLSearchParamsState.prototype = {
  type: URL_SEARCH_PARAMS,
  bindURL: function (url) {
    this.url = url;
    this.update();
  },
  parseObject: function (object) {
    var entries = this.entries;
    var iteratorMethod = getIteratorMethod$3(object);
    var iterator, next, step, entryIterator, entryNext, first, second;

    if (iteratorMethod) {
      iterator = getIterator$2(object, iteratorMethod);
      next = iterator.next;
      while (!(step = call$r(next, iterator)).done) {
        entryIterator = getIterator$2(anObject$q(step.value));
        entryNext = entryIterator.next;
        if (
          (first = call$r(entryNext, entryIterator)).done ||
          (second = call$r(entryNext, entryIterator)).done ||
          !call$r(entryNext, entryIterator).done
        ) throw new TypeError$3('Expected sequence with length 2');
        push$8(entries, { key: $toString$1(first.value), value: $toString$1(second.value) });
      }
    } else for (var key in object) if (hasOwn$9(object, key)) {
      push$8(entries, { key: key, value: $toString$1(object[key]) });
    }
  },
  parseQuery: function (query) {
    if (query) {
      var entries = this.entries;
      var attributes = split$1(query, '&');
      var index = 0;
      var attribute, entry;
      while (index < attributes.length) {
        attribute = attributes[index++];
        if (attribute.length) {
          entry = split$1(attribute, '=');
          push$8(entries, {
            key: deserialize(shift$1(entry)),
            value: deserialize(join$2(entry, '='))
          });
        }
      }
    }
  },
  serialize: function () {
    var entries = this.entries;
    var result = [];
    var index = 0;
    var entry;
    while (index < entries.length) {
      entry = entries[index++];
      push$8(result, serialize(entry.key) + '=' + serialize(entry.value));
    } return join$2(result, '&');
  },
  update: function () {
    this.entries.length = 0;
    this.parseQuery(this.url.query);
  },
  updateURL: function () {
    if (this.url) this.url.update();
  }
};

// `URLSearchParams` constructor
// https://url.spec.whatwg.org/#interface-urlsearchparams
var URLSearchParamsConstructor = function URLSearchParams(/* init */) {
  anInstance$5(this, URLSearchParamsPrototype$3);
  var init = arguments.length > 0 ? arguments[0] : undefined;
  var state = setInternalState$7(this, new URLSearchParamsState(init));
  if (!DESCRIPTORS$6) this.size = state.entries.length;
};

var URLSearchParamsPrototype$3 = URLSearchParamsConstructor.prototype;

defineBuiltIns$5(URLSearchParamsPrototype$3, {
  // `URLSearchParams.prototype.append` method
  // https://url.spec.whatwg.org/#dom-urlsearchparams-append
  append: function append(name, value) {
    var state = getInternalParamsState(this);
    validateArgumentsLength$5(arguments.length, 2);
    push$8(state.entries, { key: $toString$1(name), value: $toString$1(value) });
    if (!DESCRIPTORS$6) this.length++;
    state.updateURL();
  },
  // `URLSearchParams.prototype.delete` method
  // https://url.spec.whatwg.org/#dom-urlsearchparams-delete
  'delete': function (name /* , value */) {
    var state = getInternalParamsState(this);
    var length = validateArgumentsLength$5(arguments.length, 1);
    var entries = state.entries;
    var key = $toString$1(name);
    var $value = length < 2 ? undefined : arguments[1];
    var value = $value === undefined ? $value : $toString$1($value);
    var index = 0;
    while (index < entries.length) {
      var entry = entries[index];
      if (entry.key === key && (value === undefined || entry.value === value)) {
        splice(entries, index, 1);
        if (value !== undefined) break;
      } else index++;
    }
    if (!DESCRIPTORS$6) this.size = entries.length;
    state.updateURL();
  },
  // `URLSearchParams.prototype.get` method
  // https://url.spec.whatwg.org/#dom-urlsearchparams-get
  get: function get(name) {
    var entries = getInternalParamsState(this).entries;
    validateArgumentsLength$5(arguments.length, 1);
    var key = $toString$1(name);
    var index = 0;
    for (; index < entries.length; index++) {
      if (entries[index].key === key) return entries[index].value;
    }
    return null;
  },
  // `URLSearchParams.prototype.getAll` method
  // https://url.spec.whatwg.org/#dom-urlsearchparams-getall
  getAll: function getAll(name) {
    var entries = getInternalParamsState(this).entries;
    validateArgumentsLength$5(arguments.length, 1);
    var key = $toString$1(name);
    var result = [];
    var index = 0;
    for (; index < entries.length; index++) {
      if (entries[index].key === key) push$8(result, entries[index].value);
    }
    return result;
  },
  // `URLSearchParams.prototype.has` method
  // https://url.spec.whatwg.org/#dom-urlsearchparams-has
  has: function has(name /* , value */) {
    var entries = getInternalParamsState(this).entries;
    var length = validateArgumentsLength$5(arguments.length, 1);
    var key = $toString$1(name);
    var $value = length < 2 ? undefined : arguments[1];
    var value = $value === undefined ? $value : $toString$1($value);
    var index = 0;
    while (index < entries.length) {
      var entry = entries[index++];
      if (entry.key === key && (value === undefined || entry.value === value)) return true;
    }
    return false;
  },
  // `URLSearchParams.prototype.set` method
  // https://url.spec.whatwg.org/#dom-urlsearchparams-set
  set: function set(name, value) {
    var state = getInternalParamsState(this);
    validateArgumentsLength$5(arguments.length, 1);
    var entries = state.entries;
    var found = false;
    var key = $toString$1(name);
    var val = $toString$1(value);
    var index = 0;
    var entry;
    for (; index < entries.length; index++) {
      entry = entries[index];
      if (entry.key === key) {
        if (found) splice(entries, index--, 1);
        else {
          found = true;
          entry.value = val;
        }
      }
    }
    if (!found) push$8(entries, { key: key, value: val });
    if (!DESCRIPTORS$6) this.size = entries.length;
    state.updateURL();
  },
  // `URLSearchParams.prototype.sort` method
  // https://url.spec.whatwg.org/#dom-urlsearchparams-sort
  sort: function sort() {
    var state = getInternalParamsState(this);
    arraySort(state.entries, function (a, b) {
      return a.key > b.key ? 1 : -1;
    });
    state.updateURL();
  },
  // `URLSearchParams.prototype.forEach` method
  forEach: function forEach(callback /* , thisArg */) {
    var entries = getInternalParamsState(this).entries;
    var boundFunction = bind$5(callback, arguments.length > 1 ? arguments[1] : undefined);
    var index = 0;
    var entry;
    while (index < entries.length) {
      entry = entries[index++];
      boundFunction(entry.value, entry.key, this);
    }
  },
  // `URLSearchParams.prototype.keys` method
  keys: function keys() {
    return new URLSearchParamsIterator(this, 'keys');
  },
  // `URLSearchParams.prototype.values` method
  values: function values() {
    return new URLSearchParamsIterator(this, 'values');
  },
  // `URLSearchParams.prototype.entries` method
  entries: function entries() {
    return new URLSearchParamsIterator(this, 'entries');
  }
}, { enumerable: true });

// `URLSearchParams.prototype[@@iterator]` method
defineBuiltIn$8(URLSearchParamsPrototype$3, ITERATOR$1, URLSearchParamsPrototype$3.entries, { name: 'entries' });

// `URLSearchParams.prototype.toString` method
// https://url.spec.whatwg.org/#urlsearchparams-stringification-behavior
defineBuiltIn$8(URLSearchParamsPrototype$3, 'toString', function toString() {
  return getInternalParamsState(this).serialize();
}, { enumerable: true });

// `URLSearchParams.prototype.size` getter
// https://github.com/whatwg/url/pull/734
if (DESCRIPTORS$6) defineBuiltInAccessor$5(URLSearchParamsPrototype$3, 'size', {
  get: function size() {
    return getInternalParamsState(this).entries.length;
  },
  configurable: true,
  enumerable: true
});

setToStringTag$1(URLSearchParamsConstructor, URL_SEARCH_PARAMS);

$$R({ global: true, constructor: true, forced: !USE_NATIVE_URL$3 }, {
  URLSearchParams: URLSearchParamsConstructor
});

// Wrap `fetch` and `Request` for correct work with polyfilled `URLSearchParams`
if (!USE_NATIVE_URL$3 && isCallable$5(Headers)) {
  var headersHas = uncurryThis$i(HeadersPrototype.has);
  var headersSet = uncurryThis$i(HeadersPrototype.set);

  var wrapRequestOptions = function (init) {
    if (isObject$8(init)) {
      var body = init.body;
      var headers;
      if (classof$2(body) === URL_SEARCH_PARAMS) {
        headers = init.headers ? new Headers(init.headers) : new Headers();
        if (!headersHas(headers, 'content-type')) {
          headersSet(headers, 'content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
        }
        return create$5(init, {
          body: createPropertyDescriptor$1(0, $toString$1(body)),
          headers: createPropertyDescriptor$1(0, headers)
        });
      }
    } return init;
  };

  if (isCallable$5(nativeFetch)) {
    $$R({ global: true, enumerable: true, dontCallGetSet: true, forced: true }, {
      fetch: function fetch(input /* , init */) {
        return nativeFetch(input, arguments.length > 1 ? wrapRequestOptions(arguments[1]) : {});
      }
    });
  }

  if (isCallable$5(NativeRequest)) {
    var RequestConstructor = function Request(input /* , init */) {
      anInstance$5(this, RequestPrototype);
      return new NativeRequest(input, arguments.length > 1 ? wrapRequestOptions(arguments[1]) : {});
    };

    RequestPrototype.constructor = RequestConstructor;
    RequestConstructor.prototype = RequestPrototype;

    $$R({ global: true, constructor: true, dontCallGetSet: true, forced: true }, {
      Request: RequestConstructor
    });
  }
}

var web_urlSearchParams_constructor = {
  URLSearchParams: URLSearchParamsConstructor,
  getState: getInternalParamsState
};

// TODO: in core-js@4, move /modules/ dependencies to public entries for better optimization by tools like `preset-env`

var $$Q = _export;
var DESCRIPTORS$5 = descriptors;
var USE_NATIVE_URL$2 = urlConstructorDetection;
var globalThis$g = globalThis_1;
var bind$4 = functionBindContext;
var uncurryThis$h = functionUncurryThis;
var defineBuiltIn$7 = defineBuiltIn$t;
var defineBuiltInAccessor$4 = defineBuiltInAccessor$l;
var anInstance$4 = anInstance$e;
var hasOwn$8 = hasOwnProperty_1;
var assign = objectAssign;
var arrayFrom = arrayFrom$1;
var arraySlice = arraySlice$a;
var codeAt = stringMultibyte.codeAt;
var toASCII = stringPunycodeToAscii;
var $toString = toString$F;
var setToStringTag = setToStringTag$e;
var validateArgumentsLength$4 = validateArgumentsLength$c;
var URLSearchParamsModule = web_urlSearchParams_constructor;
var InternalStateModule$5 = internalState;

var setInternalState$6 = InternalStateModule$5.set;
var getInternalURLState = InternalStateModule$5.getterFor('URL');
var URLSearchParams$1 = URLSearchParamsModule.URLSearchParams;
var getInternalSearchParamsState = URLSearchParamsModule.getState;

var NativeURL = globalThis$g.URL;
var TypeError$2 = globalThis$g.TypeError;
var parseInt$2 = globalThis$g.parseInt;
var floor = Math.floor;
var pow = Math.pow;
var charAt$2 = uncurryThis$h(''.charAt);
var exec$4 = uncurryThis$h(/./.exec);
var join$1 = uncurryThis$h([].join);
var numberToString$2 = uncurryThis$h(1.0.toString);
var pop = uncurryThis$h([].pop);
var push$7 = uncurryThis$h([].push);
var replace = uncurryThis$h(''.replace);
var shift = uncurryThis$h([].shift);
var split = uncurryThis$h(''.split);
var stringSlice$1 = uncurryThis$h(''.slice);
var toLowerCase = uncurryThis$h(''.toLowerCase);
var unshift = uncurryThis$h([].unshift);

var INVALID_AUTHORITY = 'Invalid authority';
var INVALID_SCHEME = 'Invalid scheme';
var INVALID_HOST = 'Invalid host';
var INVALID_PORT = 'Invalid port';

var ALPHA = /[a-z]/i;
// eslint-disable-next-line regexp/no-obscure-range -- safe
var ALPHANUMERIC = /[\d+-.a-z]/i;
var DIGIT = /\d/;
var HEX_START = /^0x/i;
var OCT = /^[0-7]+$/;
var DEC = /^\d+$/;
var HEX = /^[\da-f]+$/i;
/* eslint-disable regexp/no-control-character -- safe */
var FORBIDDEN_HOST_CODE_POINT = /[\0\t\n\r #%/:<>?@[\\\]^|]/;
var FORBIDDEN_HOST_CODE_POINT_EXCLUDING_PERCENT = /[\0\t\n\r #/:<>?@[\\\]^|]/;
var LEADING_C0_CONTROL_OR_SPACE = /^[\u0000-\u0020]+/;
var TRAILING_C0_CONTROL_OR_SPACE = /(^|[^\u0000-\u0020])[\u0000-\u0020]+$/;
var TAB_AND_NEW_LINE = /[\t\n\r]/g;
/* eslint-enable regexp/no-control-character -- safe */
var EOF;

// https://url.spec.whatwg.org/#ipv4-number-parser
var parseIPv4 = function (input) {
  var parts = split(input, '.');
  var partsLength, numbers, index, part, radix, number, ipv4;
  if (parts.length && parts[parts.length - 1] === '') {
    parts.length--;
  }
  partsLength = parts.length;
  if (partsLength > 4) return input;
  numbers = [];
  for (index = 0; index < partsLength; index++) {
    part = parts[index];
    if (part === '') return input;
    radix = 10;
    if (part.length > 1 && charAt$2(part, 0) === '0') {
      radix = exec$4(HEX_START, part) ? 16 : 8;
      part = stringSlice$1(part, radix === 8 ? 1 : 2);
    }
    if (part === '') {
      number = 0;
    } else {
      if (!exec$4(radix === 10 ? DEC : radix === 8 ? OCT : HEX, part)) return input;
      number = parseInt$2(part, radix);
    }
    push$7(numbers, number);
  }
  for (index = 0; index < partsLength; index++) {
    number = numbers[index];
    if (index === partsLength - 1) {
      if (number >= pow(256, 5 - partsLength)) return null;
    } else if (number > 255) return null;
  }
  ipv4 = pop(numbers);
  for (index = 0; index < numbers.length; index++) {
    ipv4 += numbers[index] * pow(256, 3 - index);
  }
  return ipv4;
};

// https://url.spec.whatwg.org/#concept-ipv6-parser
// eslint-disable-next-line max-statements -- TODO
var parseIPv6 = function (input) {
  var address = [0, 0, 0, 0, 0, 0, 0, 0];
  var pieceIndex = 0;
  var compress = null;
  var pointer = 0;
  var value, length, numbersSeen, ipv4Piece, number, swaps, swap;

  var chr = function () {
    return charAt$2(input, pointer);
  };

  if (chr() === ':') {
    if (charAt$2(input, 1) !== ':') return;
    pointer += 2;
    pieceIndex++;
    compress = pieceIndex;
  }
  while (chr()) {
    if (pieceIndex === 8) return;
    if (chr() === ':') {
      if (compress !== null) return;
      pointer++;
      pieceIndex++;
      compress = pieceIndex;
      continue;
    }
    value = length = 0;
    while (length < 4 && exec$4(HEX, chr())) {
      value = value * 16 + parseInt$2(chr(), 16);
      pointer++;
      length++;
    }
    if (chr() === '.') {
      if (length === 0) return;
      pointer -= length;
      if (pieceIndex > 6) return;
      numbersSeen = 0;
      while (chr()) {
        ipv4Piece = null;
        if (numbersSeen > 0) {
          if (chr() === '.' && numbersSeen < 4) pointer++;
          else return;
        }
        if (!exec$4(DIGIT, chr())) return;
        while (exec$4(DIGIT, chr())) {
          number = parseInt$2(chr(), 10);
          if (ipv4Piece === null) ipv4Piece = number;
          else if (ipv4Piece === 0) return;
          else ipv4Piece = ipv4Piece * 10 + number;
          if (ipv4Piece > 255) return;
          pointer++;
        }
        address[pieceIndex] = address[pieceIndex] * 256 + ipv4Piece;
        numbersSeen++;
        if (numbersSeen === 2 || numbersSeen === 4) pieceIndex++;
      }
      if (numbersSeen !== 4) return;
      break;
    } else if (chr() === ':') {
      pointer++;
      if (!chr()) return;
    } else if (chr()) return;
    address[pieceIndex++] = value;
  }
  if (compress !== null) {
    swaps = pieceIndex - compress;
    pieceIndex = 7;
    while (pieceIndex !== 0 && swaps > 0) {
      swap = address[pieceIndex];
      address[pieceIndex--] = address[compress + swaps - 1];
      address[compress + --swaps] = swap;
    }
  } else if (pieceIndex !== 8) return;
  return address;
};

var findLongestZeroSequence = function (ipv6) {
  var maxIndex = null;
  var maxLength = 1;
  var currStart = null;
  var currLength = 0;
  var index = 0;
  for (; index < 8; index++) {
    if (ipv6[index] !== 0) {
      if (currLength > maxLength) {
        maxIndex = currStart;
        maxLength = currLength;
      }
      currStart = null;
      currLength = 0;
    } else {
      if (currStart === null) currStart = index;
      ++currLength;
    }
  }
  return currLength > maxLength ? currStart : maxIndex;
};

// https://url.spec.whatwg.org/#host-serializing
var serializeHost = function (host) {
  var result, index, compress, ignore0;

  // ipv4
  if (typeof host == 'number') {
    result = [];
    for (index = 0; index < 4; index++) {
      unshift(result, host % 256);
      host = floor(host / 256);
    }
    return join$1(result, '.');
  }

  // ipv6
  if (typeof host == 'object') {
    result = '';
    compress = findLongestZeroSequence(host);
    for (index = 0; index < 8; index++) {
      if (ignore0 && host[index] === 0) continue;
      if (ignore0) ignore0 = false;
      if (compress === index) {
        result += index ? ':' : '::';
        ignore0 = true;
      } else {
        result += numberToString$2(host[index], 16);
        if (index < 7) result += ':';
      }
    }
    return '[' + result + ']';
  }

  return host;
};

var C0ControlPercentEncodeSet = {};
var fragmentPercentEncodeSet = assign({}, C0ControlPercentEncodeSet, {
  ' ': 1, '"': 1, '<': 1, '>': 1, '`': 1
});
var pathPercentEncodeSet = assign({}, fragmentPercentEncodeSet, {
  '#': 1, '?': 1, '{': 1, '}': 1
});
var userinfoPercentEncodeSet = assign({}, pathPercentEncodeSet, {
  '/': 1, ':': 1, ';': 1, '=': 1, '@': 1, '[': 1, '\\': 1, ']': 1, '^': 1, '|': 1
});

var percentEncode = function (chr, set) {
  var code = codeAt(chr, 0);
  return code > 0x20 && code < 0x7F && !hasOwn$8(set, chr) ? chr : encodeURIComponent(chr);
};

// https://url.spec.whatwg.org/#special-scheme
var specialSchemes = {
  ftp: 21,
  file: null,
  http: 80,
  https: 443,
  ws: 80,
  wss: 443
};

// https://url.spec.whatwg.org/#windows-drive-letter
var isWindowsDriveLetter = function (string, normalized) {
  var second;
  return string.length === 2 && exec$4(ALPHA, charAt$2(string, 0))
    && ((second = charAt$2(string, 1)) === ':' || (!normalized && second === '|'));
};

// https://url.spec.whatwg.org/#start-with-a-windows-drive-letter
var startsWithWindowsDriveLetter = function (string) {
  var third;
  return string.length > 1 && isWindowsDriveLetter(stringSlice$1(string, 0, 2)) && (
    string.length === 2 ||
    ((third = charAt$2(string, 2)) === '/' || third === '\\' || third === '?' || third === '#')
  );
};

// https://url.spec.whatwg.org/#single-dot-path-segment
var isSingleDot = function (segment) {
  return segment === '.' || toLowerCase(segment) === '%2e';
};

// https://url.spec.whatwg.org/#double-dot-path-segment
var isDoubleDot = function (segment) {
  segment = toLowerCase(segment);
  return segment === '..' || segment === '%2e.' || segment === '.%2e' || segment === '%2e%2e';
};

// States:
var SCHEME_START = {};
var SCHEME = {};
var NO_SCHEME = {};
var SPECIAL_RELATIVE_OR_AUTHORITY = {};
var PATH_OR_AUTHORITY = {};
var RELATIVE = {};
var RELATIVE_SLASH = {};
var SPECIAL_AUTHORITY_SLASHES = {};
var SPECIAL_AUTHORITY_IGNORE_SLASHES = {};
var AUTHORITY = {};
var HOST = {};
var HOSTNAME = {};
var PORT = {};
var FILE = {};
var FILE_SLASH = {};
var FILE_HOST = {};
var PATH_START = {};
var PATH = {};
var CANNOT_BE_A_BASE_URL_PATH = {};
var QUERY = {};
var FRAGMENT = {};

var URLState = function (url, isBase, base) {
  var urlString = $toString(url);
  var baseState, failure, searchParams;
  if (isBase) {
    failure = this.parse(urlString);
    if (failure) throw new TypeError$2(failure);
    this.searchParams = null;
  } else {
    if (base !== undefined) baseState = new URLState(base, true);
    failure = this.parse(urlString, null, baseState);
    if (failure) throw new TypeError$2(failure);
    searchParams = getInternalSearchParamsState(new URLSearchParams$1());
    searchParams.bindURL(this);
    this.searchParams = searchParams;
  }
};

URLState.prototype = {
  type: 'URL',
  // https://url.spec.whatwg.org/#url-parsing
  // eslint-disable-next-line max-statements -- TODO
  parse: function (input, stateOverride, base) {
    var url = this;
    var state = stateOverride || SCHEME_START;
    var pointer = 0;
    var buffer = '';
    var seenAt = false;
    var seenBracket = false;
    var seenPasswordToken = false;
    var codePoints, chr, bufferCodePoints, failure;

    input = $toString(input);

    if (!stateOverride) {
      url.scheme = '';
      url.username = '';
      url.password = '';
      url.host = null;
      url.port = null;
      url.path = [];
      url.query = null;
      url.fragment = null;
      url.cannotBeABaseURL = false;
      input = replace(input, LEADING_C0_CONTROL_OR_SPACE, '');
      input = replace(input, TRAILING_C0_CONTROL_OR_SPACE, '$1');
    }

    input = replace(input, TAB_AND_NEW_LINE, '');

    codePoints = arrayFrom(input);

    while (pointer <= codePoints.length) {
      chr = codePoints[pointer];
      switch (state) {
        case SCHEME_START:
          if (chr && exec$4(ALPHA, chr)) {
            buffer += toLowerCase(chr);
            state = SCHEME;
          } else if (!stateOverride) {
            state = NO_SCHEME;
            continue;
          } else return INVALID_SCHEME;
          break;

        case SCHEME:
          if (chr && (exec$4(ALPHANUMERIC, chr) || chr === '+' || chr === '-' || chr === '.')) {
            buffer += toLowerCase(chr);
          } else if (chr === ':') {
            if (stateOverride && (
              (url.isSpecial() !== hasOwn$8(specialSchemes, buffer)) ||
              (buffer === 'file' && (url.includesCredentials() || url.port !== null)) ||
              (url.scheme === 'file' && !url.host)
            )) return;
            url.scheme = buffer;
            if (stateOverride) {
              if (url.isSpecial() && specialSchemes[url.scheme] === url.port) url.port = null;
              return;
            }
            buffer = '';
            if (url.scheme === 'file') {
              state = FILE;
            } else if (url.isSpecial() && base && base.scheme === url.scheme) {
              state = SPECIAL_RELATIVE_OR_AUTHORITY;
            } else if (url.isSpecial()) {
              state = SPECIAL_AUTHORITY_SLASHES;
            } else if (codePoints[pointer + 1] === '/') {
              state = PATH_OR_AUTHORITY;
              pointer++;
            } else {
              url.cannotBeABaseURL = true;
              push$7(url.path, '');
              state = CANNOT_BE_A_BASE_URL_PATH;
            }
          } else if (!stateOverride) {
            buffer = '';
            state = NO_SCHEME;
            pointer = 0;
            continue;
          } else return INVALID_SCHEME;
          break;

        case NO_SCHEME:
          if (!base || (base.cannotBeABaseURL && chr !== '#')) return INVALID_SCHEME;
          if (base.cannotBeABaseURL && chr === '#') {
            url.scheme = base.scheme;
            url.path = arraySlice(base.path);
            url.query = base.query;
            url.fragment = '';
            url.cannotBeABaseURL = true;
            state = FRAGMENT;
            break;
          }
          state = base.scheme === 'file' ? FILE : RELATIVE;
          continue;

        case SPECIAL_RELATIVE_OR_AUTHORITY:
          if (chr === '/' && codePoints[pointer + 1] === '/') {
            state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
            pointer++;
          } else {
            state = RELATIVE;
            continue;
          } break;

        case PATH_OR_AUTHORITY:
          if (chr === '/') {
            state = AUTHORITY;
            break;
          } else {
            state = PATH;
            continue;
          }

        case RELATIVE:
          url.scheme = base.scheme;
          if (chr === EOF) {
            url.username = base.username;
            url.password = base.password;
            url.host = base.host;
            url.port = base.port;
            url.path = arraySlice(base.path);
            url.query = base.query;
          } else if (chr === '/' || (chr === '\\' && url.isSpecial())) {
            state = RELATIVE_SLASH;
          } else if (chr === '?') {
            url.username = base.username;
            url.password = base.password;
            url.host = base.host;
            url.port = base.port;
            url.path = arraySlice(base.path);
            url.query = '';
            state = QUERY;
          } else if (chr === '#') {
            url.username = base.username;
            url.password = base.password;
            url.host = base.host;
            url.port = base.port;
            url.path = arraySlice(base.path);
            url.query = base.query;
            url.fragment = '';
            state = FRAGMENT;
          } else {
            url.username = base.username;
            url.password = base.password;
            url.host = base.host;
            url.port = base.port;
            url.path = arraySlice(base.path);
            url.path.length--;
            state = PATH;
            continue;
          } break;

        case RELATIVE_SLASH:
          if (url.isSpecial() && (chr === '/' || chr === '\\')) {
            state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
          } else if (chr === '/') {
            state = AUTHORITY;
          } else {
            url.username = base.username;
            url.password = base.password;
            url.host = base.host;
            url.port = base.port;
            state = PATH;
            continue;
          } break;

        case SPECIAL_AUTHORITY_SLASHES:
          state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
          if (chr !== '/' || charAt$2(buffer, pointer + 1) !== '/') continue;
          pointer++;
          break;

        case SPECIAL_AUTHORITY_IGNORE_SLASHES:
          if (chr !== '/' && chr !== '\\') {
            state = AUTHORITY;
            continue;
          } break;

        case AUTHORITY:
          if (chr === '@') {
            if (seenAt) buffer = '%40' + buffer;
            seenAt = true;
            bufferCodePoints = arrayFrom(buffer);
            for (var i = 0; i < bufferCodePoints.length; i++) {
              var codePoint = bufferCodePoints[i];
              if (codePoint === ':' && !seenPasswordToken) {
                seenPasswordToken = true;
                continue;
              }
              var encodedCodePoints = percentEncode(codePoint, userinfoPercentEncodeSet);
              if (seenPasswordToken) url.password += encodedCodePoints;
              else url.username += encodedCodePoints;
            }
            buffer = '';
          } else if (
            chr === EOF || chr === '/' || chr === '?' || chr === '#' ||
            (chr === '\\' && url.isSpecial())
          ) {
            if (seenAt && buffer === '') return INVALID_AUTHORITY;
            pointer -= arrayFrom(buffer).length + 1;
            buffer = '';
            state = HOST;
          } else buffer += chr;
          break;

        case HOST:
        case HOSTNAME:
          if (stateOverride && url.scheme === 'file') {
            state = FILE_HOST;
            continue;
          } else if (chr === ':' && !seenBracket) {
            if (buffer === '') return INVALID_HOST;
            failure = url.parseHost(buffer);
            if (failure) return failure;
            buffer = '';
            state = PORT;
            if (stateOverride === HOSTNAME) return;
          } else if (
            chr === EOF || chr === '/' || chr === '?' || chr === '#' ||
            (chr === '\\' && url.isSpecial())
          ) {
            if (url.isSpecial() && buffer === '') return INVALID_HOST;
            if (stateOverride && buffer === '' && (url.includesCredentials() || url.port !== null)) return;
            failure = url.parseHost(buffer);
            if (failure) return failure;
            buffer = '';
            state = PATH_START;
            if (stateOverride) return;
            continue;
          } else {
            if (chr === '[') seenBracket = true;
            else if (chr === ']') seenBracket = false;
            buffer += chr;
          } break;

        case PORT:
          if (exec$4(DIGIT, chr)) {
            buffer += chr;
          } else if (
            chr === EOF || chr === '/' || chr === '?' || chr === '#' ||
            (chr === '\\' && url.isSpecial()) ||
            stateOverride
          ) {
            if (buffer !== '') {
              var port = parseInt$2(buffer, 10);
              if (port > 0xFFFF) return INVALID_PORT;
              url.port = (url.isSpecial() && port === specialSchemes[url.scheme]) ? null : port;
              buffer = '';
            }
            if (stateOverride) return;
            state = PATH_START;
            continue;
          } else return INVALID_PORT;
          break;

        case FILE:
          url.scheme = 'file';
          if (chr === '/' || chr === '\\') state = FILE_SLASH;
          else if (base && base.scheme === 'file') {
            switch (chr) {
              case EOF:
                url.host = base.host;
                url.path = arraySlice(base.path);
                url.query = base.query;
                break;
              case '?':
                url.host = base.host;
                url.path = arraySlice(base.path);
                url.query = '';
                state = QUERY;
                break;
              case '#':
                url.host = base.host;
                url.path = arraySlice(base.path);
                url.query = base.query;
                url.fragment = '';
                state = FRAGMENT;
                break;
              default:
                if (!startsWithWindowsDriveLetter(join$1(arraySlice(codePoints, pointer), ''))) {
                  url.host = base.host;
                  url.path = arraySlice(base.path);
                  url.shortenPath();
                }
                state = PATH;
                continue;
            }
          } else {
            state = PATH;
            continue;
          } break;

        case FILE_SLASH:
          if (chr === '/' || chr === '\\') {
            state = FILE_HOST;
            break;
          }
          if (base && base.scheme === 'file' && !startsWithWindowsDriveLetter(join$1(arraySlice(codePoints, pointer), ''))) {
            if (isWindowsDriveLetter(base.path[0], true)) push$7(url.path, base.path[0]);
            else url.host = base.host;
          }
          state = PATH;
          continue;

        case FILE_HOST:
          if (chr === EOF || chr === '/' || chr === '\\' || chr === '?' || chr === '#') {
            if (!stateOverride && isWindowsDriveLetter(buffer)) {
              state = PATH;
            } else if (buffer === '') {
              url.host = '';
              if (stateOverride) return;
              state = PATH_START;
            } else {
              failure = url.parseHost(buffer);
              if (failure) return failure;
              if (url.host === 'localhost') url.host = '';
              if (stateOverride) return;
              buffer = '';
              state = PATH_START;
            } continue;
          } else buffer += chr;
          break;

        case PATH_START:
          if (url.isSpecial()) {
            state = PATH;
            if (chr !== '/' && chr !== '\\') continue;
          } else if (!stateOverride && chr === '?') {
            url.query = '';
            state = QUERY;
          } else if (!stateOverride && chr === '#') {
            url.fragment = '';
            state = FRAGMENT;
          } else if (chr !== EOF) {
            state = PATH;
            if (chr !== '/') continue;
          } break;

        case PATH:
          if (
            chr === EOF || chr === '/' ||
            (chr === '\\' && url.isSpecial()) ||
            (!stateOverride && (chr === '?' || chr === '#'))
          ) {
            if (isDoubleDot(buffer)) {
              url.shortenPath();
              if (chr !== '/' && !(chr === '\\' && url.isSpecial())) {
                push$7(url.path, '');
              }
            } else if (isSingleDot(buffer)) {
              if (chr !== '/' && !(chr === '\\' && url.isSpecial())) {
                push$7(url.path, '');
              }
            } else {
              if (url.scheme === 'file' && !url.path.length && isWindowsDriveLetter(buffer)) {
                if (url.host) url.host = '';
                buffer = charAt$2(buffer, 0) + ':'; // normalize windows drive letter
              }
              push$7(url.path, buffer);
            }
            buffer = '';
            if (url.scheme === 'file' && (chr === EOF || chr === '?' || chr === '#')) {
              while (url.path.length > 1 && url.path[0] === '') {
                shift(url.path);
              }
            }
            if (chr === '?') {
              url.query = '';
              state = QUERY;
            } else if (chr === '#') {
              url.fragment = '';
              state = FRAGMENT;
            }
          } else {
            buffer += percentEncode(chr, pathPercentEncodeSet);
          } break;

        case CANNOT_BE_A_BASE_URL_PATH:
          if (chr === '?') {
            url.query = '';
            state = QUERY;
          } else if (chr === '#') {
            url.fragment = '';
            state = FRAGMENT;
          } else if (chr !== EOF) {
            url.path[0] += percentEncode(chr, C0ControlPercentEncodeSet);
          } break;

        case QUERY:
          if (!stateOverride && chr === '#') {
            url.fragment = '';
            state = FRAGMENT;
          } else if (chr !== EOF) {
            if (chr === "'" && url.isSpecial()) url.query += '%27';
            else if (chr === '#') url.query += '%23';
            else url.query += percentEncode(chr, C0ControlPercentEncodeSet);
          } break;

        case FRAGMENT:
          if (chr !== EOF) url.fragment += percentEncode(chr, fragmentPercentEncodeSet);
          break;
      }

      pointer++;
    }
  },
  // https://url.spec.whatwg.org/#host-parsing
  parseHost: function (input) {
    var result, codePoints, index;
    if (charAt$2(input, 0) === '[') {
      if (charAt$2(input, input.length - 1) !== ']') return INVALID_HOST;
      result = parseIPv6(stringSlice$1(input, 1, -1));
      if (!result) return INVALID_HOST;
      this.host = result;
    // opaque host
    } else if (!this.isSpecial()) {
      if (exec$4(FORBIDDEN_HOST_CODE_POINT_EXCLUDING_PERCENT, input)) return INVALID_HOST;
      result = '';
      codePoints = arrayFrom(input);
      for (index = 0; index < codePoints.length; index++) {
        result += percentEncode(codePoints[index], C0ControlPercentEncodeSet);
      }
      this.host = result;
    } else {
      input = toASCII(input);
      if (exec$4(FORBIDDEN_HOST_CODE_POINT, input)) return INVALID_HOST;
      result = parseIPv4(input);
      if (result === null) return INVALID_HOST;
      this.host = result;
    }
  },
  // https://url.spec.whatwg.org/#cannot-have-a-username-password-port
  cannotHaveUsernamePasswordPort: function () {
    return !this.host || this.cannotBeABaseURL || this.scheme === 'file';
  },
  // https://url.spec.whatwg.org/#include-credentials
  includesCredentials: function () {
    return this.username !== '' || this.password !== '';
  },
  // https://url.spec.whatwg.org/#is-special
  isSpecial: function () {
    return hasOwn$8(specialSchemes, this.scheme);
  },
  // https://url.spec.whatwg.org/#shorten-a-urls-path
  shortenPath: function () {
    var path = this.path;
    var pathSize = path.length;
    if (pathSize && (this.scheme !== 'file' || pathSize !== 1 || !isWindowsDriveLetter(path[0], true))) {
      path.length--;
    }
  },
  // https://url.spec.whatwg.org/#concept-url-serializer
  serialize: function () {
    var url = this;
    var scheme = url.scheme;
    var username = url.username;
    var password = url.password;
    var host = url.host;
    var port = url.port;
    var path = url.path;
    var query = url.query;
    var fragment = url.fragment;
    var output = scheme + ':';
    if (host !== null) {
      output += '//';
      if (url.includesCredentials()) {
        output += username + (password ? ':' + password : '') + '@';
      }
      output += serializeHost(host);
      if (port !== null) output += ':' + port;
    } else if (scheme === 'file') output += '//';
    output += url.cannotBeABaseURL ? path[0] : path.length ? '/' + join$1(path, '/') : '';
    if (query !== null) output += '?' + query;
    if (fragment !== null) output += '#' + fragment;
    return output;
  },
  // https://url.spec.whatwg.org/#dom-url-href
  setHref: function (href) {
    var failure = this.parse(href);
    if (failure) throw new TypeError$2(failure);
    this.searchParams.update();
  },
  // https://url.spec.whatwg.org/#dom-url-origin
  getOrigin: function () {
    var scheme = this.scheme;
    var port = this.port;
    if (scheme === 'blob') try {
      return new URLConstructor(scheme.path[0]).origin;
    } catch (error) {
      return 'null';
    }
    if (scheme === 'file' || !this.isSpecial()) return 'null';
    return scheme + '://' + serializeHost(this.host) + (port !== null ? ':' + port : '');
  },
  // https://url.spec.whatwg.org/#dom-url-protocol
  getProtocol: function () {
    return this.scheme + ':';
  },
  setProtocol: function (protocol) {
    this.parse($toString(protocol) + ':', SCHEME_START);
  },
  // https://url.spec.whatwg.org/#dom-url-username
  getUsername: function () {
    return this.username;
  },
  setUsername: function (username) {
    var codePoints = arrayFrom($toString(username));
    if (this.cannotHaveUsernamePasswordPort()) return;
    this.username = '';
    for (var i = 0; i < codePoints.length; i++) {
      this.username += percentEncode(codePoints[i], userinfoPercentEncodeSet);
    }
  },
  // https://url.spec.whatwg.org/#dom-url-password
  getPassword: function () {
    return this.password;
  },
  setPassword: function (password) {
    var codePoints = arrayFrom($toString(password));
    if (this.cannotHaveUsernamePasswordPort()) return;
    this.password = '';
    for (var i = 0; i < codePoints.length; i++) {
      this.password += percentEncode(codePoints[i], userinfoPercentEncodeSet);
    }
  },
  // https://url.spec.whatwg.org/#dom-url-host
  getHost: function () {
    var host = this.host;
    var port = this.port;
    return host === null ? ''
      : port === null ? serializeHost(host)
      : serializeHost(host) + ':' + port;
  },
  setHost: function (host) {
    if (this.cannotBeABaseURL) return;
    this.parse(host, HOST);
  },
  // https://url.spec.whatwg.org/#dom-url-hostname
  getHostname: function () {
    var host = this.host;
    return host === null ? '' : serializeHost(host);
  },
  setHostname: function (hostname) {
    if (this.cannotBeABaseURL) return;
    this.parse(hostname, HOSTNAME);
  },
  // https://url.spec.whatwg.org/#dom-url-port
  getPort: function () {
    var port = this.port;
    return port === null ? '' : $toString(port);
  },
  setPort: function (port) {
    if (this.cannotHaveUsernamePasswordPort()) return;
    port = $toString(port);
    if (port === '') this.port = null;
    else this.parse(port, PORT);
  },
  // https://url.spec.whatwg.org/#dom-url-pathname
  getPathname: function () {
    var path = this.path;
    return this.cannotBeABaseURL ? path[0] : path.length ? '/' + join$1(path, '/') : '';
  },
  setPathname: function (pathname) {
    if (this.cannotBeABaseURL) return;
    this.path = [];
    this.parse(pathname, PATH_START);
  },
  // https://url.spec.whatwg.org/#dom-url-search
  getSearch: function () {
    var query = this.query;
    return query ? '?' + query : '';
  },
  setSearch: function (search) {
    search = $toString(search);
    if (search === '') {
      this.query = null;
    } else {
      if (charAt$2(search, 0) === '?') search = stringSlice$1(search, 1);
      this.query = '';
      this.parse(search, QUERY);
    }
    this.searchParams.update();
  },
  // https://url.spec.whatwg.org/#dom-url-searchparams
  getSearchParams: function () {
    return this.searchParams.facade;
  },
  // https://url.spec.whatwg.org/#dom-url-hash
  getHash: function () {
    var fragment = this.fragment;
    return fragment ? '#' + fragment : '';
  },
  setHash: function (hash) {
    hash = $toString(hash);
    if (hash === '') {
      this.fragment = null;
      return;
    }
    if (charAt$2(hash, 0) === '#') hash = stringSlice$1(hash, 1);
    this.fragment = '';
    this.parse(hash, FRAGMENT);
  },
  update: function () {
    this.query = this.searchParams.serialize() || null;
  }
};

// `URL` constructor
// https://url.spec.whatwg.org/#url-class
var URLConstructor = function URL(url /* , base */) {
  var that = anInstance$4(this, URLPrototype);
  var base = validateArgumentsLength$4(arguments.length, 1) > 1 ? arguments[1] : undefined;
  var state = setInternalState$6(that, new URLState(url, false, base));
  if (!DESCRIPTORS$5) {
    that.href = state.serialize();
    that.origin = state.getOrigin();
    that.protocol = state.getProtocol();
    that.username = state.getUsername();
    that.password = state.getPassword();
    that.host = state.getHost();
    that.hostname = state.getHostname();
    that.port = state.getPort();
    that.pathname = state.getPathname();
    that.search = state.getSearch();
    that.searchParams = state.getSearchParams();
    that.hash = state.getHash();
  }
};

var URLPrototype = URLConstructor.prototype;

var accessorDescriptor = function (getter, setter) {
  return {
    get: function () {
      return getInternalURLState(this)[getter]();
    },
    set: setter && function (value) {
      return getInternalURLState(this)[setter](value);
    },
    configurable: true,
    enumerable: true
  };
};

if (DESCRIPTORS$5) {
  // `URL.prototype.href` accessors pair
  // https://url.spec.whatwg.org/#dom-url-href
  defineBuiltInAccessor$4(URLPrototype, 'href', accessorDescriptor('serialize', 'setHref'));
  // `URL.prototype.origin` getter
  // https://url.spec.whatwg.org/#dom-url-origin
  defineBuiltInAccessor$4(URLPrototype, 'origin', accessorDescriptor('getOrigin'));
  // `URL.prototype.protocol` accessors pair
  // https://url.spec.whatwg.org/#dom-url-protocol
  defineBuiltInAccessor$4(URLPrototype, 'protocol', accessorDescriptor('getProtocol', 'setProtocol'));
  // `URL.prototype.username` accessors pair
  // https://url.spec.whatwg.org/#dom-url-username
  defineBuiltInAccessor$4(URLPrototype, 'username', accessorDescriptor('getUsername', 'setUsername'));
  // `URL.prototype.password` accessors pair
  // https://url.spec.whatwg.org/#dom-url-password
  defineBuiltInAccessor$4(URLPrototype, 'password', accessorDescriptor('getPassword', 'setPassword'));
  // `URL.prototype.host` accessors pair
  // https://url.spec.whatwg.org/#dom-url-host
  defineBuiltInAccessor$4(URLPrototype, 'host', accessorDescriptor('getHost', 'setHost'));
  // `URL.prototype.hostname` accessors pair
  // https://url.spec.whatwg.org/#dom-url-hostname
  defineBuiltInAccessor$4(URLPrototype, 'hostname', accessorDescriptor('getHostname', 'setHostname'));
  // `URL.prototype.port` accessors pair
  // https://url.spec.whatwg.org/#dom-url-port
  defineBuiltInAccessor$4(URLPrototype, 'port', accessorDescriptor('getPort', 'setPort'));
  // `URL.prototype.pathname` accessors pair
  // https://url.spec.whatwg.org/#dom-url-pathname
  defineBuiltInAccessor$4(URLPrototype, 'pathname', accessorDescriptor('getPathname', 'setPathname'));
  // `URL.prototype.search` accessors pair
  // https://url.spec.whatwg.org/#dom-url-search
  defineBuiltInAccessor$4(URLPrototype, 'search', accessorDescriptor('getSearch', 'setSearch'));
  // `URL.prototype.searchParams` getter
  // https://url.spec.whatwg.org/#dom-url-searchparams
  defineBuiltInAccessor$4(URLPrototype, 'searchParams', accessorDescriptor('getSearchParams'));
  // `URL.prototype.hash` accessors pair
  // https://url.spec.whatwg.org/#dom-url-hash
  defineBuiltInAccessor$4(URLPrototype, 'hash', accessorDescriptor('getHash', 'setHash'));
}

// `URL.prototype.toJSON` method
// https://url.spec.whatwg.org/#dom-url-tojson
defineBuiltIn$7(URLPrototype, 'toJSON', function toJSON() {
  return getInternalURLState(this).serialize();
}, { enumerable: true });

// `URL.prototype.toString` method
// https://url.spec.whatwg.org/#URL-stringification-behavior
defineBuiltIn$7(URLPrototype, 'toString', function toString() {
  return getInternalURLState(this).serialize();
}, { enumerable: true });

if (NativeURL) {
  var nativeCreateObjectURL = NativeURL.createObjectURL;
  var nativeRevokeObjectURL = NativeURL.revokeObjectURL;
  // `URL.createObjectURL` method
  // https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL
  if (nativeCreateObjectURL) defineBuiltIn$7(URLConstructor, 'createObjectURL', bind$4(nativeCreateObjectURL, NativeURL));
  // `URL.revokeObjectURL` method
  // https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL
  if (nativeRevokeObjectURL) defineBuiltIn$7(URLConstructor, 'revokeObjectURL', bind$4(nativeRevokeObjectURL, NativeURL));
}

setToStringTag(URLConstructor, 'URL');

$$Q({ global: true, constructor: true, forced: !USE_NATIVE_URL$2, sham: !DESCRIPTORS$5 }, {
  URL: URLConstructor
});

var $$P = _export;
var getBuiltIn$c = getBuiltIn$C;
var fails$6 = fails$1z;
var validateArgumentsLength$3 = validateArgumentsLength$c;
var toString$5 = toString$F;
var USE_NATIVE_URL$1 = urlConstructorDetection;

var URL$2 = getBuiltIn$c('URL');

// https://github.com/nodejs/node/issues/47505
// https://github.com/denoland/deno/issues/18893
var THROWS_WITHOUT_ARGUMENTS = USE_NATIVE_URL$1 && fails$6(function () {
  URL$2.canParse();
});

// Bun ~ 1.0.30 bug
// https://github.com/oven-sh/bun/issues/9250
var WRONG_ARITY$1 = fails$6(function () {
  return URL$2.canParse.length !== 1;
});

// `URL.canParse` method
// https://url.spec.whatwg.org/#dom-url-canparse
$$P({ target: 'URL', stat: true, forced: !THROWS_WITHOUT_ARGUMENTS || WRONG_ARITY$1 }, {
  canParse: function canParse(url) {
    var length = validateArgumentsLength$3(arguments.length, 1);
    var urlString = toString$5(url);
    var base = length < 2 || arguments[1] === undefined ? undefined : toString$5(arguments[1]);
    try {
      return !!new URL$2(urlString, base);
    } catch (error) {
      return false;
    }
  }
});

var $$O = _export;
var getBuiltIn$b = getBuiltIn$C;
var validateArgumentsLength$2 = validateArgumentsLength$c;
var toString$4 = toString$F;
var USE_NATIVE_URL = urlConstructorDetection;

var URL$1 = getBuiltIn$b('URL');

// `URL.parse` method
// https://url.spec.whatwg.org/#dom-url-canparse
$$O({ target: 'URL', stat: true, forced: !USE_NATIVE_URL }, {
  parse: function parse(url) {
    var length = validateArgumentsLength$2(arguments.length, 1);
    var urlString = toString$4(url);
    var base = length < 2 || arguments[1] === undefined ? undefined : toString$4(arguments[1]);
    try {
      return new URL$1(urlString, base);
    } catch (error) {
      return null;
    }
  }
});

var $$N = _export;
var call$q = functionCall;

// `URL.prototype.toJSON` method
// https://url.spec.whatwg.org/#dom-url-tojson
$$N({ target: 'URL', proto: true, enumerable: true }, {
  toJSON: function toJSON() {
    return call$q(URL.prototype.toString, this);
  }
});

var defineBuiltIn$6 = defineBuiltIn$t;
var uncurryThis$g = functionUncurryThis;
var toString$3 = toString$F;
var validateArgumentsLength$1 = validateArgumentsLength$c;

var $URLSearchParams$1 = URLSearchParams;
var URLSearchParamsPrototype$2 = $URLSearchParams$1.prototype;
var append = uncurryThis$g(URLSearchParamsPrototype$2.append);
var $delete = uncurryThis$g(URLSearchParamsPrototype$2['delete']);
var forEach$1 = uncurryThis$g(URLSearchParamsPrototype$2.forEach);
var push$6 = uncurryThis$g([].push);
var params$1 = new $URLSearchParams$1('a=1&a=2&b=3');

params$1['delete']('a', 1);
// `undefined` case is a Chromium 117 bug
// https://bugs.chromium.org/p/v8/issues/detail?id=14222
params$1['delete']('b', undefined);

if (params$1 + '' !== 'a=2') {
  defineBuiltIn$6(URLSearchParamsPrototype$2, 'delete', function (name /* , value */) {
    var length = arguments.length;
    var $value = length < 2 ? undefined : arguments[1];
    if (length && $value === undefined) return $delete(this, name);
    var entries = [];
    forEach$1(this, function (v, k) { // also validates `this`
      push$6(entries, { key: k, value: v });
    });
    validateArgumentsLength$1(length, 1);
    var key = toString$3(name);
    var value = toString$3($value);
    var index = 0;
    var dindex = 0;
    var found = false;
    var entriesLength = entries.length;
    var entry;
    while (index < entriesLength) {
      entry = entries[index++];
      if (found || entry.key === key) {
        found = true;
        $delete(this, entry.key);
      } else dindex++;
    }
    while (dindex < entriesLength) {
      entry = entries[dindex++];
      if (!(entry.key === key && entry.value === value)) append(this, entry.key, entry.value);
    }
  }, { enumerable: true, unsafe: true });
}

var defineBuiltIn$5 = defineBuiltIn$t;
var uncurryThis$f = functionUncurryThis;
var toString$2 = toString$F;
var validateArgumentsLength = validateArgumentsLength$c;

var $URLSearchParams = URLSearchParams;
var URLSearchParamsPrototype$1 = $URLSearchParams.prototype;
var getAll = uncurryThis$f(URLSearchParamsPrototype$1.getAll);
var $has = uncurryThis$f(URLSearchParamsPrototype$1.has);
var params = new $URLSearchParams('a=1');

// `undefined` case is a Chromium 117 bug
// https://bugs.chromium.org/p/v8/issues/detail?id=14222
if (params.has('a', 2) || !params.has('a', undefined)) {
  defineBuiltIn$5(URLSearchParamsPrototype$1, 'has', function has(name /* , value */) {
    var length = arguments.length;
    var $value = length < 2 ? undefined : arguments[1];
    if (length && $value === undefined) return $has(this, name);
    var values = getAll(this, name); // also validates `this`
    validateArgumentsLength(length, 1);
    var value = toString$2($value);
    var index = 0;
    while (index < values.length) {
      if (values[index++] === value) return true;
    } return false;
  }, { enumerable: true, unsafe: true });
}

var DESCRIPTORS$4 = descriptors;
var uncurryThis$e = functionUncurryThis;
var defineBuiltInAccessor$3 = defineBuiltInAccessor$l;

var URLSearchParamsPrototype = URLSearchParams.prototype;
var forEach = uncurryThis$e(URLSearchParamsPrototype.forEach);

// `URLSearchParams.prototype.size` getter
// https://github.com/whatwg/url/pull/734
if (DESCRIPTORS$4 && !('size' in URLSearchParamsPrototype)) {
  defineBuiltInAccessor$3(URLSearchParamsPrototype, 'size', {
    get: function size() {
      var count = 0;
      forEach(this, function () { count++; });
      return count;
    },
    configurable: true,
    enumerable: true
  });
}

var isObject$7 = isObject$J;

var $String$1 = String;
var $TypeError$8 = TypeError;

var anObjectOrUndefined$2 = function (argument) {
  if (argument === undefined || isObject$7(argument)) return argument;
  throw new $TypeError$8($String$1(argument) + ' is not an object or undefined');
};

var $TypeError$7 = TypeError;

var aString$4 = function (argument) {
  if (typeof argument == 'string') return argument;
  throw new $TypeError$7('Argument is not a string');
};

var $TypeError$6 = TypeError;

var getAlphabetOption$2 = function (options) {
  var alphabet = options && options.alphabet;
  if (alphabet === undefined || alphabet === 'base64' || alphabet === 'base64url') return alphabet || 'base64';
  throw new $TypeError$6('Incorrect `alphabet` option');
};

var globalThis$f = globalThis_1;
var uncurryThis$d = functionUncurryThis;
var anObjectOrUndefined$1 = anObjectOrUndefined$2;
var aString$3 = aString$4;
var hasOwn$7 = hasOwnProperty_1;
var base64Map$1 = base64Map$2;
var getAlphabetOption$1 = getAlphabetOption$2;
var notDetached$3 = arrayBufferNotDetached;

var base64Alphabet$1 = base64Map$1.c2i;
var base64UrlAlphabet$1 = base64Map$1.c2iUrl;

var SyntaxError$3 = globalThis$f.SyntaxError;
var TypeError$1 = globalThis$f.TypeError;
var at$3 = uncurryThis$d(''.charAt);

var skipAsciiWhitespace = function (string, index) {
  var length = string.length;
  for (;index < length; index++) {
    var chr = at$3(string, index);
    if (chr !== ' ' && chr !== '\t' && chr !== '\n' && chr !== '\f' && chr !== '\r') break;
  } return index;
};

var decodeBase64Chunk = function (chunk, alphabet, throwOnExtraBits) {
  var chunkLength = chunk.length;

  if (chunkLength < 4) {
    chunk += chunkLength === 2 ? 'AA' : 'A';
  }

  var triplet = (alphabet[at$3(chunk, 0)] << 18)
    + (alphabet[at$3(chunk, 1)] << 12)
    + (alphabet[at$3(chunk, 2)] << 6)
    + alphabet[at$3(chunk, 3)];

  var chunkBytes = [
    (triplet >> 16) & 255,
    (triplet >> 8) & 255,
    triplet & 255
  ];

  if (chunkLength === 2) {
    if (throwOnExtraBits && chunkBytes[1] !== 0) {
      throw new SyntaxError$3('Extra bits');
    }
    return [chunkBytes[0]];
  }

  if (chunkLength === 3) {
    if (throwOnExtraBits && chunkBytes[2] !== 0) {
      throw new SyntaxError$3('Extra bits');
    }
    return [chunkBytes[0], chunkBytes[1]];
  }

  return chunkBytes;
};

var writeBytes = function (bytes, elements, written) {
  var elementsLength = elements.length;
  for (var index = 0; index < elementsLength; index++) {
    bytes[written + index] = elements[index];
  }
  return written + elementsLength;
};

/* eslint-disable max-statements, max-depth -- TODO */
var uint8FromBase64 = function (string, options, into, maxLength) {
  aString$3(string);
  anObjectOrUndefined$1(options);
  var alphabet = getAlphabetOption$1(options) === 'base64' ? base64Alphabet$1 : base64UrlAlphabet$1;
  var lastChunkHandling = options ? options.lastChunkHandling : undefined;

  if (lastChunkHandling === undefined) lastChunkHandling = 'loose';

  if (lastChunkHandling !== 'loose' && lastChunkHandling !== 'strict' && lastChunkHandling !== 'stop-before-partial') {
    throw new TypeError$1('Incorrect `lastChunkHandling` option');
  }

  if (into) notDetached$3(into.buffer);

  var bytes = into || [];
  var written = 0;
  var read = 0;
  var chunk = '';
  var index = 0;

  if (maxLength) while (true) {
    index = skipAsciiWhitespace(string, index);
    if (index === string.length) {
      if (chunk.length > 0) {
        if (lastChunkHandling === 'stop-before-partial') {
          break;
        }
        if (lastChunkHandling === 'loose') {
          if (chunk.length === 1) {
            throw new SyntaxError$3('Malformed padding: exactly one additional character');
          }
          written = writeBytes(bytes, decodeBase64Chunk(chunk, alphabet, false), written);
        } else {
          throw new SyntaxError$3('Missing padding');
        }
      }
      read = string.length;
      break;
    }
    var chr = at$3(string, index);
    ++index;
    if (chr === '=') {
      if (chunk.length < 2) {
        throw new SyntaxError$3('Padding is too early');
      }
      index = skipAsciiWhitespace(string, index);
      if (chunk.length === 2) {
        if (index === string.length) {
          if (lastChunkHandling === 'stop-before-partial') {
            break;
          }
          throw new SyntaxError$3('Malformed padding: only one =');
        }
        if (at$3(string, index) === '=') {
          ++index;
          index = skipAsciiWhitespace(string, index);
        }
      }
      if (index < string.length) {
        throw new SyntaxError$3('Unexpected character after padding');
      }
      written = writeBytes(bytes, decodeBase64Chunk(chunk, alphabet, lastChunkHandling === 'strict'), written);
      read = string.length;
      break;
    }
    if (!hasOwn$7(alphabet, chr)) {
      throw new SyntaxError$3('Unexpected character');
    }
    var remainingBytes = maxLength - written;
    if (remainingBytes === 1 && chunk.length === 2 || remainingBytes === 2 && chunk.length === 3) {
      // special case: we can fit exactly the number of bytes currently represented by chunk, so we were just checking for `=`
      break;
    }

    chunk += chr;
    if (chunk.length === 4) {
      written = writeBytes(bytes, decodeBase64Chunk(chunk, alphabet, false), written);
      chunk = '';
      read = index;
      if (written === maxLength) {
        break;
      }
    }
  }

  return { bytes: bytes, read: read, written: written };
};

var $$M = _export;
var globalThis$e = globalThis_1;
var arrayFromConstructorAndList$1 = arrayFromConstructorAndList$6;
var $fromBase64$1 = uint8FromBase64;

var Uint8Array$2 = globalThis$e.Uint8Array;

// `Uint8Array.fromBase64` method
// https://github.com/tc39/proposal-arraybuffer-base64
if (Uint8Array$2) $$M({ target: 'Uint8Array', stat: true }, {
  fromBase64: function fromBase64(string /* , options */) {
    var result = $fromBase64$1(string, arguments.length > 1 ? arguments[1] : undefined, null, 0x1FFFFFFFFFFFFF);
    return arrayFromConstructorAndList$1(Uint8Array$2, result.bytes);
  }
});

var globalThis$d = globalThis_1;
var uncurryThis$c = functionUncurryThis;

var Uint8Array$1 = globalThis$d.Uint8Array;
var SyntaxError$2 = globalThis$d.SyntaxError;
var parseInt$1 = globalThis$d.parseInt;
var min$1 = Math.min;
var NOT_HEX = /[^\da-f]/i;
var exec$3 = uncurryThis$c(NOT_HEX.exec);
var stringSlice = uncurryThis$c(''.slice);

var uint8FromHex = function (string, into) {
  var stringLength = string.length;
  if (stringLength % 2 !== 0) throw new SyntaxError$2('String should be an even number of characters');
  var maxLength = into ? min$1(into.length, stringLength / 2) : stringLength / 2;
  var bytes = into || new Uint8Array$1(maxLength);
  var read = 0;
  var written = 0;
  while (written < maxLength) {
    var hexits = stringSlice(string, read, read += 2);
    if (exec$3(NOT_HEX, hexits)) throw new SyntaxError$2('String should only contain hex characters');
    bytes[written++] = parseInt$1(hexits, 16);
  }
  return { bytes: bytes, read: read };
};

var $$L = _export;
var globalThis$c = globalThis_1;
var aString$2 = aString$4;
var $fromHex$1 = uint8FromHex;

// `Uint8Array.fromHex` method
// https://github.com/tc39/proposal-arraybuffer-base64
if (globalThis$c.Uint8Array) $$L({ target: 'Uint8Array', stat: true }, {
  fromHex: function fromHex(string) {
    return $fromHex$1(aString$2(string)).bytes;
  }
});

var classof$1 = classof$p;

var $TypeError$5 = TypeError;

// Perform ? RequireInternalSlot(argument, [[TypedArrayName]])
// If argument.[[TypedArrayName]] is not "Uint8Array", throw a TypeError exception
var anUint8Array$4 = function (argument) {
  if (classof$1(argument) === 'Uint8Array') return argument;
  throw new $TypeError$5('Argument is not an Uint8Array');
};

var $$K = _export;
var globalThis$b = globalThis_1;
var $fromBase64 = uint8FromBase64;
var anUint8Array$3 = anUint8Array$4;

var Uint8Array = globalThis$b.Uint8Array;

// `Uint8Array.prototype.setFromBase64` method
// https://github.com/tc39/proposal-arraybuffer-base64
if (Uint8Array) $$K({ target: 'Uint8Array', proto: true }, {
  setFromBase64: function setFromBase64(string /* , options */) {
    anUint8Array$3(this);

    var result = $fromBase64(string, arguments.length > 1 ? arguments[1] : undefined, this, this.length);

    return { read: result.read, written: result.written };
  }
});

var $$J = _export;
var globalThis$a = globalThis_1;
var aString$1 = aString$4;
var anUint8Array$2 = anUint8Array$4;
var notDetached$2 = arrayBufferNotDetached;
var $fromHex = uint8FromHex;

// `Uint8Array.prototype.setFromHex` method
// https://github.com/tc39/proposal-arraybuffer-base64
if (globalThis$a.Uint8Array) $$J({ target: 'Uint8Array', proto: true }, {
  setFromHex: function setFromHex(string) {
    anUint8Array$2(this);
    aString$1(string);
    notDetached$2(this.buffer);
    var read = $fromHex(string, this).read;
    return { read: read, written: read / 2 };
  }
});

var $$I = _export;
var globalThis$9 = globalThis_1;
var uncurryThis$b = functionUncurryThis;
var anObjectOrUndefined = anObjectOrUndefined$2;
var anUint8Array$1 = anUint8Array$4;
var notDetached$1 = arrayBufferNotDetached;
var base64Map = base64Map$2;
var getAlphabetOption = getAlphabetOption$2;

var base64Alphabet = base64Map.i2c;
var base64UrlAlphabet = base64Map.i2cUrl;

var charAt$1 = uncurryThis$b(''.charAt);

// `Uint8Array.prototype.toBase64` method
// https://github.com/tc39/proposal-arraybuffer-base64
if (globalThis$9.Uint8Array) $$I({ target: 'Uint8Array', proto: true }, {
  toBase64: function toBase64(/* options */) {
    var array = anUint8Array$1(this);
    var options = arguments.length ? anObjectOrUndefined(arguments[0]) : undefined;
    var alphabet = getAlphabetOption(options) === 'base64' ? base64Alphabet : base64UrlAlphabet;
    var omitPadding = !!options && !!options.omitPadding;
    notDetached$1(this.buffer);

    var result = '';
    var i = 0;
    var length = array.length;
    var triplet;

    var at = function (shift) {
      return charAt$1(alphabet, (triplet >> (6 * shift)) & 63);
    };

    for (; i + 2 < length; i += 3) {
      triplet = (array[i] << 16) + (array[i + 1] << 8) + array[i + 2];
      result += at(3) + at(2) + at(1) + at(0);
    }
    if (i + 2 === length) {
      triplet = (array[i] << 16) + (array[i + 1] << 8);
      result += at(3) + at(2) + at(1) + (omitPadding ? '' : '=');
    } else if (i + 1 === length) {
      triplet = array[i] << 16;
      result += at(3) + at(2) + (omitPadding ? '' : '==');
    }

    return result;
  }
});

var $$H = _export;
var globalThis$8 = globalThis_1;
var uncurryThis$a = functionUncurryThis;
var anUint8Array = anUint8Array$4;
var notDetached = arrayBufferNotDetached;

var numberToString$1 = uncurryThis$a(1.0.toString);

// `Uint8Array.prototype.toHex` method
// https://github.com/tc39/proposal-arraybuffer-base64
if (globalThis$8.Uint8Array) $$H({ target: 'Uint8Array', proto: true }, {
  toHex: function toHex() {
    anUint8Array(this);
    notDetached(this.buffer);
    var result = '';
    for (var i = 0, length = this.length; i < length; i++) {
      var hex = numberToString$1(this[i], 16);
      result += hex.length === 1 ? '0' + hex : hex;
    }
    return result;
  }
});

var globalThis$7 = globalThis_1;
var shared = sharedStoreExports;
var isCallable$4 = isCallable$D;
var getPrototypeOf$3 = objectGetPrototypeOf$2;
var defineBuiltIn$4 = defineBuiltIn$t;
var wellKnownSymbol$e = wellKnownSymbol$O;

var USE_FUNCTION_CONSTRUCTOR = 'USE_FUNCTION_CONSTRUCTOR';
var ASYNC_ITERATOR$3 = wellKnownSymbol$e('asyncIterator');
var AsyncIterator = globalThis$7.AsyncIterator;
var PassedAsyncIteratorPrototype = shared.AsyncIteratorPrototype;
var AsyncIteratorPrototype$5, prototype;

if (PassedAsyncIteratorPrototype) {
  AsyncIteratorPrototype$5 = PassedAsyncIteratorPrototype;
} else if (isCallable$4(AsyncIterator)) {
  AsyncIteratorPrototype$5 = AsyncIterator.prototype;
} else if (shared[USE_FUNCTION_CONSTRUCTOR] || globalThis$7[USE_FUNCTION_CONSTRUCTOR]) {
  try {
    // eslint-disable-next-line no-new-func -- we have no alternatives without usage of modern syntax
    prototype = getPrototypeOf$3(getPrototypeOf$3(getPrototypeOf$3(Function('return async function*(){}()')())));
    if (getPrototypeOf$3(prototype) === Object.prototype) AsyncIteratorPrototype$5 = prototype;
  } catch (error) { /* empty */ }
}

if (!AsyncIteratorPrototype$5) AsyncIteratorPrototype$5 = {};

if (!isCallable$4(AsyncIteratorPrototype$5[ASYNC_ITERATOR$3])) {
  defineBuiltIn$4(AsyncIteratorPrototype$5, ASYNC_ITERATOR$3, function () {
    return this;
  });
}

var asyncIteratorPrototype = AsyncIteratorPrototype$5;

var call$p = functionCall;
var anObject$p = anObject$11;
var create$4 = objectCreate$1;
var getMethod$9 = getMethod$j;
var defineBuiltIns$4 = defineBuiltIns$a;
var InternalStateModule$4 = internalState;
var getBuiltIn$a = getBuiltIn$C;
var AsyncIteratorPrototype$4 = asyncIteratorPrototype;
var createIterResultObject$7 = createIterResultObject$d;

var Promise$6 = getBuiltIn$a('Promise');

var ASYNC_FROM_SYNC_ITERATOR = 'AsyncFromSyncIterator';
var setInternalState$5 = InternalStateModule$4.set;
var getInternalState$1 = InternalStateModule$4.getterFor(ASYNC_FROM_SYNC_ITERATOR);

var asyncFromSyncIteratorContinuation = function (result, resolve, reject) {
  var done = result.done;
  Promise$6.resolve(result.value).then(function (value) {
    resolve(createIterResultObject$7(value, done));
  }, reject);
};

var AsyncFromSyncIterator$4 = function AsyncIterator(iteratorRecord) {
  iteratorRecord.type = ASYNC_FROM_SYNC_ITERATOR;
  setInternalState$5(this, iteratorRecord);
};

AsyncFromSyncIterator$4.prototype = defineBuiltIns$4(create$4(AsyncIteratorPrototype$4), {
  next: function next() {
    var state = getInternalState$1(this);
    return new Promise$6(function (resolve, reject) {
      var result = anObject$p(call$p(state.next, state.iterator));
      asyncFromSyncIteratorContinuation(result, resolve, reject);
    });
  },
  'return': function () {
    var iterator = getInternalState$1(this).iterator;
    return new Promise$6(function (resolve, reject) {
      var $return = getMethod$9(iterator, 'return');
      if ($return === undefined) return resolve(createIterResultObject$7(undefined, true));
      var result = anObject$p(call$p($return, iterator));
      asyncFromSyncIteratorContinuation(result, resolve, reject);
    });
  }
});

var asyncFromSyncIterator = AsyncFromSyncIterator$4;

var call$o = functionCall;
var AsyncFromSyncIterator$3 = asyncFromSyncIterator;
var anObject$o = anObject$11;
var getIterator$1 = getIterator$6;
var getIteratorDirect$m = getIteratorDirect$o;
var getMethod$8 = getMethod$j;
var wellKnownSymbol$d = wellKnownSymbol$O;

var ASYNC_ITERATOR$2 = wellKnownSymbol$d('asyncIterator');

var getAsyncIterator$1 = function (it, usingIterator) {
  var method = arguments.length < 2 ? getMethod$8(it, ASYNC_ITERATOR$2) : usingIterator;
  return method ? anObject$o(call$o(method, it)) : new AsyncFromSyncIterator$3(getIteratorDirect$m(getIterator$1(it)));
};

var call$n = functionCall;
var getBuiltIn$9 = getBuiltIn$C;
var getMethod$7 = getMethod$j;

var asyncIteratorClose = function (iterator, method, argument, reject) {
  try {
    var returnMethod = getMethod$7(iterator, 'return');
    if (returnMethod) {
      return getBuiltIn$9('Promise').resolve(call$n(returnMethod, iterator)).then(function () {
        method(argument);
      }, function (error) {
        reject(error);
      });
    }
  } catch (error2) {
    return reject(error2);
  } method(argument);
};

// https://github.com/tc39/proposal-iterator-helpers
// https://github.com/tc39/proposal-array-from-async
var call$m = functionCall;
var aCallable$g = aCallable$F;
var anObject$n = anObject$11;
var isObject$6 = isObject$J;
var doesNotExceedSafeInteger = doesNotExceedSafeInteger$7;
var getBuiltIn$8 = getBuiltIn$C;
var getIteratorDirect$l = getIteratorDirect$o;
var closeAsyncIteration$4 = asyncIteratorClose;

var createMethod = function (TYPE) {
  var IS_TO_ARRAY = TYPE === 0;
  var IS_FOR_EACH = TYPE === 1;
  var IS_EVERY = TYPE === 2;
  var IS_SOME = TYPE === 3;
  return function (object, fn, target) {
    anObject$n(object);
    var MAPPING = fn !== undefined;
    if (MAPPING || !IS_TO_ARRAY) aCallable$g(fn);
    var record = getIteratorDirect$l(object);
    var Promise = getBuiltIn$8('Promise');
    var iterator = record.iterator;
    var next = record.next;
    var counter = 0;

    return new Promise(function (resolve, reject) {
      var ifAbruptCloseAsyncIterator = function (error) {
        closeAsyncIteration$4(iterator, reject, error, reject);
      };

      var loop = function () {
        try {
          if (MAPPING) try {
            doesNotExceedSafeInteger(counter);
          } catch (error5) { ifAbruptCloseAsyncIterator(error5); }
          Promise.resolve(anObject$n(call$m(next, iterator))).then(function (step) {
            try {
              if (anObject$n(step).done) {
                if (IS_TO_ARRAY) {
                  target.length = counter;
                  resolve(target);
                } else resolve(IS_SOME ? false : IS_EVERY || undefined);
              } else {
                var value = step.value;
                try {
                  if (MAPPING) {
                    var result = fn(value, counter);

                    var handler = function ($result) {
                      if (IS_FOR_EACH) {
                        loop();
                      } else if (IS_EVERY) {
                        $result ? loop() : closeAsyncIteration$4(iterator, resolve, false, reject);
                      } else if (IS_TO_ARRAY) {
                        try {
                          target[counter++] = $result;
                          loop();
                        } catch (error4) { ifAbruptCloseAsyncIterator(error4); }
                      } else {
                        $result ? closeAsyncIteration$4(iterator, resolve, IS_SOME || value, reject) : loop();
                      }
                    };

                    if (isObject$6(result)) Promise.resolve(result).then(handler, ifAbruptCloseAsyncIterator);
                    else handler(result);
                  } else {
                    target[counter++] = value;
                    loop();
                  }
                } catch (error3) { ifAbruptCloseAsyncIterator(error3); }
              }
            } catch (error2) { reject(error2); }
          }, reject);
        } catch (error) { reject(error); }
      };

      loop();
    });
  };
};

var asyncIteratorIteration = {
  toArray: createMethod(0),
  forEach: createMethod(1),
  every: createMethod(2),
  some: createMethod(3),
  find: createMethod(4)
};

var bind$3 = functionBindContext;
var uncurryThis$9 = functionUncurryThis;
var toObject$4 = toObject$y;
var isConstructor = isConstructor$7;
var getAsyncIterator = getAsyncIterator$1;
var getIterator = getIterator$6;
var getIteratorDirect$k = getIteratorDirect$o;
var getIteratorMethod$2 = getIteratorMethod$8;
var getMethod$6 = getMethod$j;
var getBuiltIn$7 = getBuiltIn$C;
var getBuiltInPrototypeMethod = getBuiltInPrototypeMethod$2;
var wellKnownSymbol$c = wellKnownSymbol$O;
var AsyncFromSyncIterator$2 = asyncFromSyncIterator;
var toArray = asyncIteratorIteration.toArray;

var ASYNC_ITERATOR$1 = wellKnownSymbol$c('asyncIterator');
var arrayIterator = uncurryThis$9(getBuiltInPrototypeMethod('Array', 'values'));
var arrayIteratorNext = uncurryThis$9(arrayIterator([]).next);

var safeArrayIterator = function () {
  return new SafeArrayIterator(this);
};

var SafeArrayIterator = function (O) {
  this.iterator = arrayIterator(O);
};

SafeArrayIterator.prototype.next = function () {
  return arrayIteratorNext(this.iterator);
};

// `Array.fromAsync` method implementation
// https://github.com/tc39/proposal-array-from-async
var arrayFromAsync = function fromAsync(asyncItems /* , mapfn = undefined, thisArg = undefined */) {
  var C = this;
  var argumentsLength = arguments.length;
  var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
  var thisArg = argumentsLength > 2 ? arguments[2] : undefined;
  return new (getBuiltIn$7('Promise'))(function (resolve) {
    var O = toObject$4(asyncItems);
    if (mapfn !== undefined) mapfn = bind$3(mapfn, thisArg);
    var usingAsyncIterator = getMethod$6(O, ASYNC_ITERATOR$1);
    var usingSyncIterator = usingAsyncIterator ? undefined : getIteratorMethod$2(O) || safeArrayIterator;
    var A = isConstructor(C) ? new C() : [];
    var iterator = usingAsyncIterator
      ? getAsyncIterator(O, usingAsyncIterator)
      : new AsyncFromSyncIterator$2(getIteratorDirect$k(getIterator(O, usingSyncIterator)));
    resolve(toArray(iterator, mapfn, A));
  });
};

var $$G = _export;
var fromAsync = arrayFromAsync;
var fails$5 = fails$1z;

var nativeFromAsync = Array.fromAsync;
// https://bugs.webkit.org/show_bug.cgi?id=271703
var INCORRECT_CONSTRUCTURING = !nativeFromAsync || fails$5(function () {
  var counter = 0;
  nativeFromAsync.call(function () {
    counter++;
    return [];
  }, { length: 0 });
  return counter !== 1;
});

// `Array.fromAsync` method
// https://github.com/tc39/proposal-array-from-async
$$G({ target: 'Array', stat: true, forced: INCORRECT_CONSTRUCTURING }, {
  fromAsync: fromAsync
});

var wellKnownSymbol$b = wellKnownSymbol$O;
var defineProperty$2 = objectDefineProperty.f;

var METADATA = wellKnownSymbol$b('metadata');
var FunctionPrototype = Function.prototype;

// Function.prototype[@@metadata]
// https://github.com/tc39/proposal-decorator-metadata
if (FunctionPrototype[METADATA] === undefined) {
  defineProperty$2(FunctionPrototype, METADATA, {
    value: null
  });
}

var defineWellKnownSymbol$2 = wellKnownSymbolDefine;

// `Symbol.metadata` well-known symbol
// https://github.com/tc39/proposal-decorators
defineWellKnownSymbol$2('metadata');

var $$F = _export;
var globalThis$6 = globalThis_1;
var isPrototypeOf$2 = objectIsPrototypeOf;
var getPrototypeOf$2 = objectGetPrototypeOf$2;
var setPrototypeOf = objectSetPrototypeOf$1;
var copyConstructorProperties = copyConstructorProperties$7;
var create$3 = objectCreate$1;
var createNonEnumerableProperty$3 = createNonEnumerableProperty$j;
var createPropertyDescriptor = createPropertyDescriptor$d;
var installErrorStack = errorStackInstall;
var normalizeStringArgument = normalizeStringArgument$6;
var wellKnownSymbol$a = wellKnownSymbol$O;
var fails$4 = fails$1z;
var IS_PURE$f = isPure;

var NativeSuppressedError = globalThis$6.SuppressedError;
var TO_STRING_TAG$6 = wellKnownSymbol$a('toStringTag');
var $Error = Error;

// https://github.com/oven-sh/bun/issues/9282
var WRONG_ARITY = !!NativeSuppressedError && NativeSuppressedError.length !== 3;

// https://github.com/oven-sh/bun/issues/9283
var EXTRA_ARGS_SUPPORT = !!NativeSuppressedError && fails$4(function () {
  return new NativeSuppressedError(1, 2, 3, { cause: 4 }).cause === 4;
});

var PATCH = WRONG_ARITY || EXTRA_ARGS_SUPPORT;

var $SuppressedError = function SuppressedError(error, suppressed, message) {
  var isInstance = isPrototypeOf$2(SuppressedErrorPrototype, this);
  var that;
  if (setPrototypeOf) {
    that = PATCH && (!isInstance || getPrototypeOf$2(this) === SuppressedErrorPrototype)
      ? new NativeSuppressedError()
      : setPrototypeOf(new $Error(), isInstance ? getPrototypeOf$2(this) : SuppressedErrorPrototype);
  } else {
    that = isInstance ? this : create$3(SuppressedErrorPrototype);
    createNonEnumerableProperty$3(that, TO_STRING_TAG$6, 'Error');
  }
  if (message !== undefined) createNonEnumerableProperty$3(that, 'message', normalizeStringArgument(message));
  installErrorStack(that, $SuppressedError, that.stack, 1);
  createNonEnumerableProperty$3(that, 'error', error);
  createNonEnumerableProperty$3(that, 'suppressed', suppressed);
  return that;
};

if (setPrototypeOf) setPrototypeOf($SuppressedError, $Error);
else copyConstructorProperties($SuppressedError, $Error, { name: true });

var SuppressedErrorPrototype = $SuppressedError.prototype = PATCH ? NativeSuppressedError.prototype : create$3($Error.prototype, {
  constructor: createPropertyDescriptor(1, $SuppressedError),
  message: createPropertyDescriptor(1, ''),
  name: createPropertyDescriptor(1, 'SuppressedError')
});

if (PATCH && !IS_PURE$f) SuppressedErrorPrototype.constructor = $SuppressedError;

// `SuppressedError` constructor
// https://github.com/tc39/proposal-explicit-resource-management
$$F({ global: true, constructor: true, arity: 3, forced: PATCH }, {
  SuppressedError: $SuppressedError
});

var call$l = functionCall;
var uncurryThis$8 = functionUncurryThis;
var bind$2 = functionBindContext;
var anObject$m = anObject$11;
var aCallable$f = aCallable$F;
var isNullOrUndefined = isNullOrUndefined$f;
var getMethod$5 = getMethod$j;
var wellKnownSymbol$9 = wellKnownSymbol$O;

var ASYNC_DISPOSE$2 = wellKnownSymbol$9('asyncDispose');
var DISPOSE$2 = wellKnownSymbol$9('dispose');

var push$5 = uncurryThis$8([].push);

// `GetDisposeMethod` abstract operation
// https://tc39.es/proposal-explicit-resource-management/#sec-getdisposemethod
var getDisposeMethod = function (V, hint) {
  if (hint === 'async-dispose') {
    var method = getMethod$5(V, ASYNC_DISPOSE$2);
    if (method !== undefined) return method;
    method = getMethod$5(V, DISPOSE$2);
    if (method === undefined) return method;
    return function () {
      call$l(method, this);
    };
  } return getMethod$5(V, DISPOSE$2);
};

// `CreateDisposableResource` abstract operation
// https://tc39.es/proposal-explicit-resource-management/#sec-createdisposableresource
var createDisposableResource = function (V, hint, method) {
  if (arguments.length < 3 && !isNullOrUndefined(V)) {
    method = aCallable$f(getDisposeMethod(anObject$m(V), hint));
  }

  return method === undefined ? function () {
    return undefined;
  } : bind$2(method, V);
};

// `AddDisposableResource` abstract operation
// https://tc39.es/proposal-explicit-resource-management/#sec-adddisposableresource
var addDisposableResource$2 = function (disposable, V, hint, method) {
  var resource;
  if (arguments.length < 4) {
    // When `V`` is either `null` or `undefined` and hint is `async-dispose`,
    // we record that the resource was evaluated to ensure we will still perform an `Await` when resources are later disposed.
    if (isNullOrUndefined(V) && hint === 'sync-dispose') return;
    resource = createDisposableResource(V, hint);
  } else {
    resource = createDisposableResource(undefined, hint, method);
  }

  push$5(disposable.stack, resource);
};

// https://github.com/tc39/proposal-async-explicit-resource-management
var $$E = _export;
var DESCRIPTORS$3 = descriptors;
var getBuiltIn$6 = getBuiltIn$C;
var aCallable$e = aCallable$F;
var anInstance$3 = anInstance$e;
var defineBuiltIn$3 = defineBuiltIn$t;
var defineBuiltIns$3 = defineBuiltIns$a;
var defineBuiltInAccessor$2 = defineBuiltInAccessor$l;
var wellKnownSymbol$8 = wellKnownSymbol$O;
var InternalStateModule$3 = internalState;
var addDisposableResource$1 = addDisposableResource$2;

var Promise$5 = getBuiltIn$6('Promise');
var SuppressedError$1 = getBuiltIn$6('SuppressedError');
var $ReferenceError$1 = ReferenceError;

var ASYNC_DISPOSE$1 = wellKnownSymbol$8('asyncDispose');
var TO_STRING_TAG$5 = wellKnownSymbol$8('toStringTag');

var ASYNC_DISPOSABLE_STACK = 'AsyncDisposableStack';
var setInternalState$4 = InternalStateModule$3.set;
var getAsyncDisposableStackInternalState = InternalStateModule$3.getterFor(ASYNC_DISPOSABLE_STACK);

var HINT$1 = 'async-dispose';
var DISPOSED$1 = 'disposed';
var PENDING$1 = 'pending';

var getPendingAsyncDisposableStackInternalState = function (stack) {
  var internalState = getAsyncDisposableStackInternalState(stack);
  if (internalState.state === DISPOSED$1) throw new $ReferenceError$1(ASYNC_DISPOSABLE_STACK + ' already disposed');
  return internalState;
};

var $AsyncDisposableStack = function AsyncDisposableStack() {
  setInternalState$4(anInstance$3(this, AsyncDisposableStackPrototype), {
    type: ASYNC_DISPOSABLE_STACK,
    state: PENDING$1,
    stack: []
  });

  if (!DESCRIPTORS$3) this.disposed = false;
};

var AsyncDisposableStackPrototype = $AsyncDisposableStack.prototype;

defineBuiltIns$3(AsyncDisposableStackPrototype, {
  disposeAsync: function disposeAsync() {
    var asyncDisposableStack = this;
    return new Promise$5(function (resolve, reject) {
      var internalState = getAsyncDisposableStackInternalState(asyncDisposableStack);
      if (internalState.state === DISPOSED$1) return resolve(undefined);
      internalState.state = DISPOSED$1;
      if (!DESCRIPTORS$3) asyncDisposableStack.disposed = true;
      var stack = internalState.stack;
      var i = stack.length;
      var thrown = false;
      var suppressed;

      var handleError = function (result) {
        if (thrown) {
          suppressed = new SuppressedError$1(result, suppressed);
        } else {
          thrown = true;
          suppressed = result;
        }

        loop();
      };

      var loop = function () {
        if (i) {
          var disposeMethod = stack[--i];
          stack[i] = undefined;
          try {
            Promise$5.resolve(disposeMethod()).then(loop, handleError);
          } catch (error) {
            handleError(error);
          }
        } else {
          internalState.stack = undefined;
          thrown ? reject(suppressed) : resolve(undefined);
        }
      };

      loop();
    });
  },
  use: function use(value) {
    addDisposableResource$1(getPendingAsyncDisposableStackInternalState(this), value, HINT$1);
    return value;
  },
  adopt: function adopt(value, onDispose) {
    var internalState = getPendingAsyncDisposableStackInternalState(this);
    aCallable$e(onDispose);
    addDisposableResource$1(internalState, undefined, HINT$1, function () {
      return onDispose(value);
    });
    return value;
  },
  defer: function defer(onDispose) {
    var internalState = getPendingAsyncDisposableStackInternalState(this);
    aCallable$e(onDispose);
    addDisposableResource$1(internalState, undefined, HINT$1, onDispose);
  },
  move: function move() {
    var internalState = getPendingAsyncDisposableStackInternalState(this);
    var newAsyncDisposableStack = new $AsyncDisposableStack();
    getAsyncDisposableStackInternalState(newAsyncDisposableStack).stack = internalState.stack;
    internalState.stack = [];
    internalState.state = DISPOSED$1;
    if (!DESCRIPTORS$3) this.disposed = true;
    return newAsyncDisposableStack;
  }
});

if (DESCRIPTORS$3) defineBuiltInAccessor$2(AsyncDisposableStackPrototype, 'disposed', {
  configurable: true,
  get: function disposed() {
    return getAsyncDisposableStackInternalState(this).state === DISPOSED$1;
  }
});

defineBuiltIn$3(AsyncDisposableStackPrototype, ASYNC_DISPOSE$1, AsyncDisposableStackPrototype.disposeAsync, { name: 'disposeAsync' });
defineBuiltIn$3(AsyncDisposableStackPrototype, TO_STRING_TAG$5, ASYNC_DISPOSABLE_STACK, { nonWritable: true });

$$E({ global: true, constructor: true }, {
  AsyncDisposableStack: $AsyncDisposableStack
});

// https://github.com/tc39/proposal-async-explicit-resource-management
var call$k = functionCall;
var defineBuiltIn$2 = defineBuiltIn$t;
var getBuiltIn$5 = getBuiltIn$C;
var getMethod$4 = getMethod$j;
var hasOwn$6 = hasOwnProperty_1;
var wellKnownSymbol$7 = wellKnownSymbol$O;
var AsyncIteratorPrototype$3 = asyncIteratorPrototype;

var ASYNC_DISPOSE = wellKnownSymbol$7('asyncDispose');
var Promise$4 = getBuiltIn$5('Promise');

if (!hasOwn$6(AsyncIteratorPrototype$3, ASYNC_DISPOSE)) {
  defineBuiltIn$2(AsyncIteratorPrototype$3, ASYNC_DISPOSE, function () {
    var O = this;
    return new Promise$4(function (resolve, reject) {
      var $return = getMethod$4(O, 'return');
      if ($return) {
        Promise$4.resolve(call$k($return, O)).then(function () {
          resolve(undefined);
        }, reject);
      } else resolve(undefined);
    });
  });
}

// https://github.com/tc39/proposal-explicit-resource-management
var $$D = _export;
var DESCRIPTORS$2 = descriptors;
var getBuiltIn$4 = getBuiltIn$C;
var aCallable$d = aCallable$F;
var anInstance$2 = anInstance$e;
var defineBuiltIn$1 = defineBuiltIn$t;
var defineBuiltIns$2 = defineBuiltIns$a;
var defineBuiltInAccessor$1 = defineBuiltInAccessor$l;
var wellKnownSymbol$6 = wellKnownSymbol$O;
var InternalStateModule$2 = internalState;
var addDisposableResource = addDisposableResource$2;

var SuppressedError = getBuiltIn$4('SuppressedError');
var $ReferenceError = ReferenceError;

var DISPOSE$1 = wellKnownSymbol$6('dispose');
var TO_STRING_TAG$4 = wellKnownSymbol$6('toStringTag');

var DISPOSABLE_STACK = 'DisposableStack';
var setInternalState$3 = InternalStateModule$2.set;
var getDisposableStackInternalState = InternalStateModule$2.getterFor(DISPOSABLE_STACK);

var HINT = 'sync-dispose';
var DISPOSED = 'disposed';
var PENDING = 'pending';

var getPendingDisposableStackInternalState = function (stack) {
  var internalState = getDisposableStackInternalState(stack);
  if (internalState.state === DISPOSED) throw new $ReferenceError(DISPOSABLE_STACK + ' already disposed');
  return internalState;
};

var $DisposableStack = function DisposableStack() {
  setInternalState$3(anInstance$2(this, DisposableStackPrototype), {
    type: DISPOSABLE_STACK,
    state: PENDING,
    stack: []
  });

  if (!DESCRIPTORS$2) this.disposed = false;
};

var DisposableStackPrototype = $DisposableStack.prototype;

defineBuiltIns$2(DisposableStackPrototype, {
  dispose: function dispose() {
    var internalState = getDisposableStackInternalState(this);
    if (internalState.state === DISPOSED) return;
    internalState.state = DISPOSED;
    if (!DESCRIPTORS$2) this.disposed = true;
    var stack = internalState.stack;
    var i = stack.length;
    var thrown = false;
    var suppressed;
    while (i) {
      var disposeMethod = stack[--i];
      stack[i] = undefined;
      try {
        disposeMethod();
      } catch (errorResult) {
        if (thrown) {
          suppressed = new SuppressedError(errorResult, suppressed);
        } else {
          thrown = true;
          suppressed = errorResult;
        }
      }
    }
    internalState.stack = undefined;
    if (thrown) throw suppressed;
  },
  use: function use(value) {
    addDisposableResource(getPendingDisposableStackInternalState(this), value, HINT);
    return value;
  },
  adopt: function adopt(value, onDispose) {
    var internalState = getPendingDisposableStackInternalState(this);
    aCallable$d(onDispose);
    addDisposableResource(internalState, undefined, HINT, function () {
      onDispose(value);
    });
    return value;
  },
  defer: function defer(onDispose) {
    var internalState = getPendingDisposableStackInternalState(this);
    aCallable$d(onDispose);
    addDisposableResource(internalState, undefined, HINT, onDispose);
  },
  move: function move() {
    var internalState = getPendingDisposableStackInternalState(this);
    var newDisposableStack = new $DisposableStack();
    getDisposableStackInternalState(newDisposableStack).stack = internalState.stack;
    internalState.stack = [];
    internalState.state = DISPOSED;
    if (!DESCRIPTORS$2) this.disposed = true;
    return newDisposableStack;
  }
});

if (DESCRIPTORS$2) defineBuiltInAccessor$1(DisposableStackPrototype, 'disposed', {
  configurable: true,
  get: function disposed() {
    return getDisposableStackInternalState(this).state === DISPOSED;
  }
});

defineBuiltIn$1(DisposableStackPrototype, DISPOSE$1, DisposableStackPrototype.dispose, { name: 'dispose' });
defineBuiltIn$1(DisposableStackPrototype, TO_STRING_TAG$4, DISPOSABLE_STACK, { nonWritable: true });

$$D({ global: true, constructor: true }, {
  DisposableStack: $DisposableStack
});

// https://github.com/tc39/proposal-explicit-resource-management
var call$j = functionCall;
var defineBuiltIn = defineBuiltIn$t;
var getMethod$3 = getMethod$j;
var hasOwn$5 = hasOwnProperty_1;
var wellKnownSymbol$5 = wellKnownSymbol$O;
var IteratorPrototype$3 = iteratorsCore.IteratorPrototype;

var DISPOSE = wellKnownSymbol$5('dispose');

if (!hasOwn$5(IteratorPrototype$3, DISPOSE)) {
  defineBuiltIn(IteratorPrototype$3, DISPOSE, function () {
    var $return = getMethod$3(this, 'return');
    if ($return) call$j($return, this);
  });
}

var globalThis$5 = globalThis_1;
var defineWellKnownSymbol$1 = wellKnownSymbolDefine;
var defineProperty$1 = objectDefineProperty.f;
var getOwnPropertyDescriptor$2 = objectGetOwnPropertyDescriptor.f;

var Symbol$2 = globalThis$5.Symbol;

// `Symbol.asyncDispose` well-known symbol
// https://github.com/tc39/proposal-async-explicit-resource-management
defineWellKnownSymbol$1('asyncDispose');

if (Symbol$2) {
  var descriptor$1 = getOwnPropertyDescriptor$2(Symbol$2, 'asyncDispose');
  // workaround of NodeJS 20.4 bug
  // https://github.com/nodejs/node/issues/48699
  // and incorrect descriptor from some transpilers and userland helpers
  if (descriptor$1.enumerable && descriptor$1.configurable && descriptor$1.writable) {
    defineProperty$1(Symbol$2, 'asyncDispose', { value: descriptor$1.value, enumerable: false, configurable: false, writable: false });
  }
}

var globalThis$4 = globalThis_1;
var defineWellKnownSymbol = wellKnownSymbolDefine;
var defineProperty = objectDefineProperty.f;
var getOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;

var Symbol$1 = globalThis$4.Symbol;

// `Symbol.dispose` well-known symbol
// https://github.com/tc39/proposal-explicit-resource-management
defineWellKnownSymbol('dispose');

if (Symbol$1) {
  var descriptor = getOwnPropertyDescriptor$1(Symbol$1, 'dispose');
  // workaround of NodeJS 20.4 bug
  // https://github.com/nodejs/node/issues/48699
  // and incorrect descriptor from some transpilers and userland helpers
  if (descriptor.enumerable && descriptor.configurable && descriptor.writable) {
    defineProperty(Symbol$1, 'dispose', { value: descriptor.value, enumerable: false, configurable: false, writable: false });
  }
}

var $$C = _export;
var uncurryThis$7 = functionUncurryThis;
var unpackIEEE754 = ieee754.unpack;

// eslint-disable-next-line es/no-typed-arrays -- safe
var getUint16 = uncurryThis$7(DataView.prototype.getUint16);

// `DataView.prototype.getFloat16` method
// https://github.com/tc39/proposal-float16array
$$C({ target: 'DataView', proto: true }, {
  getFloat16: function getFloat16(byteOffset /* , littleEndian */) {
    var uint16 = getUint16(this, byteOffset, arguments.length > 1 ? arguments[1] : false);
    return unpackIEEE754([uint16 & 0xFF, uint16 >> 8 & 0xFF], 10);
  }
});

var classof = classof$p;

var $TypeError$4 = TypeError;

var aDataView$1 = function (argument) {
  if (classof(argument) === 'DataView') return argument;
  throw new $TypeError$4('Argument is not a DataView');
};

var floatRound = mathFloatRound;

var FLOAT16_EPSILON = 0.0009765625;
var FLOAT16_MAX_VALUE = 65504;
var FLOAT16_MIN_VALUE = 6.103515625e-05;

// `Math.f16round` method implementation
// https://github.com/tc39/proposal-float16array
var mathF16round = Math.f16round || function f16round(x) {
  return floatRound(x, FLOAT16_EPSILON, FLOAT16_MAX_VALUE, FLOAT16_MIN_VALUE);
};

var $$B = _export;
var uncurryThis$6 = functionUncurryThis;
var aDataView = aDataView$1;
var toIndex = toIndex$4;
var packIEEE754 = ieee754.pack;
var f16round$1 = mathF16round;

// eslint-disable-next-line es/no-typed-arrays -- safe
var setUint16 = uncurryThis$6(DataView.prototype.setUint16);

// `DataView.prototype.setFloat16` method
// https://github.com/tc39/proposal-float16array
$$B({ target: 'DataView', proto: true }, {
  setFloat16: function setFloat16(byteOffset, value /* , littleEndian */) {
    aDataView(this);
    var offset = toIndex(byteOffset);
    var bytes = packIEEE754(f16round$1(value), 10, 2);
    return setUint16(this, offset, bytes[1] << 8 | bytes[0], arguments.length > 2 ? arguments[2] : false);
  }
});

var $$A = _export;
var f16round = mathF16round;

// `Math.f16round` method
// https://github.com/tc39/proposal-float16array
$$A({ target: 'Math', stat: true }, { f16round: f16round });

var $$z = _export;
var globalThis$3 = globalThis_1;
var anInstance$1 = anInstance$e;
var anObject$l = anObject$11;
var isCallable$3 = isCallable$D;
var getPrototypeOf$1 = objectGetPrototypeOf$2;
var defineBuiltInAccessor = defineBuiltInAccessor$l;
var createProperty$2 = createProperty$b;
var fails$3 = fails$1z;
var hasOwn$4 = hasOwnProperty_1;
var wellKnownSymbol$4 = wellKnownSymbol$O;
var IteratorPrototype$2 = iteratorsCore.IteratorPrototype;
var DESCRIPTORS$1 = descriptors;

var CONSTRUCTOR = 'constructor';
var ITERATOR = 'Iterator';
var TO_STRING_TAG$3 = wellKnownSymbol$4('toStringTag');

var $TypeError$3 = TypeError;
var NativeIterator = globalThis$3[ITERATOR];

// FF56- have non-standard global helper `Iterator`
var FORCED$2 = !isCallable$3(NativeIterator)
  || NativeIterator.prototype !== IteratorPrototype$2
  // FF44- non-standard `Iterator` passes previous tests
  || !fails$3(function () { NativeIterator({}); });

var IteratorConstructor = function Iterator() {
  anInstance$1(this, IteratorPrototype$2);
  if (getPrototypeOf$1(this) === IteratorPrototype$2) throw new $TypeError$3('Abstract class Iterator not directly constructable');
};

var defineIteratorPrototypeAccessor = function (key, value) {
  if (DESCRIPTORS$1) {
    defineBuiltInAccessor(IteratorPrototype$2, key, {
      configurable: true,
      get: function () {
        return value;
      },
      set: function (replacement) {
        anObject$l(this);
        if (this === IteratorPrototype$2) throw new $TypeError$3("You can't redefine this property");
        if (hasOwn$4(this, key)) this[key] = replacement;
        else createProperty$2(this, key, replacement);
      }
    });
  } else IteratorPrototype$2[key] = value;
};

if (!hasOwn$4(IteratorPrototype$2, TO_STRING_TAG$3)) defineIteratorPrototypeAccessor(TO_STRING_TAG$3, ITERATOR);

if (FORCED$2 || !hasOwn$4(IteratorPrototype$2, CONSTRUCTOR) || IteratorPrototype$2[CONSTRUCTOR] === Object) {
  defineIteratorPrototypeAccessor(CONSTRUCTOR, IteratorConstructor);
}

IteratorConstructor.prototype = IteratorPrototype$2;

// `Iterator` constructor
// https://github.com/tc39/proposal-iterator-helpers
$$z({ global: true, constructor: true, forced: FORCED$2 }, {
  Iterator: IteratorConstructor
});

var $RangeError = RangeError;

var notANan = function (it) {
  // eslint-disable-next-line no-self-compare -- NaN check
  if (it === it) return it;
  throw new $RangeError('NaN is not allowed');
};

var call$i = functionCall;
var create$2 = objectCreate$1;
var createNonEnumerableProperty$2 = createNonEnumerableProperty$j;
var defineBuiltIns$1 = defineBuiltIns$a;
var wellKnownSymbol$3 = wellKnownSymbol$O;
var InternalStateModule$1 = internalState;
var getMethod$2 = getMethod$j;
var IteratorPrototype$1 = iteratorsCore.IteratorPrototype;
var createIterResultObject$6 = createIterResultObject$d;
var iteratorClose$3 = iteratorClose$8;

var TO_STRING_TAG$2 = wellKnownSymbol$3('toStringTag');
var ITERATOR_HELPER = 'IteratorHelper';
var WRAP_FOR_VALID_ITERATOR = 'WrapForValidIterator';
var setInternalState$2 = InternalStateModule$1.set;

var createIteratorProxyPrototype = function (IS_ITERATOR) {
  var getInternalState = InternalStateModule$1.getterFor(IS_ITERATOR ? WRAP_FOR_VALID_ITERATOR : ITERATOR_HELPER);

  return defineBuiltIns$1(create$2(IteratorPrototype$1), {
    next: function next() {
      var state = getInternalState(this);
      // for simplification:
      //   for `%WrapForValidIteratorPrototype%.next` our `nextHandler` returns `IterResultObject`
      //   for `%IteratorHelperPrototype%.next` - just a value
      if (IS_ITERATOR) return state.nextHandler();
      try {
        var result = state.done ? undefined : state.nextHandler();
        return createIterResultObject$6(result, state.done);
      } catch (error) {
        state.done = true;
        throw error;
      }
    },
    'return': function () {
      var state = getInternalState(this);
      var iterator = state.iterator;
      state.done = true;
      if (IS_ITERATOR) {
        var returnMethod = getMethod$2(iterator, 'return');
        return returnMethod ? call$i(returnMethod, iterator) : createIterResultObject$6(undefined, true);
      }
      if (state.inner) try {
        iteratorClose$3(state.inner.iterator, 'normal');
      } catch (error) {
        return iteratorClose$3(iterator, 'throw', error);
      }
      iteratorClose$3(iterator, 'normal');
      return createIterResultObject$6(undefined, true);
    }
  });
};

var WrapForValidIteratorPrototype = createIteratorProxyPrototype(true);
var IteratorHelperPrototype = createIteratorProxyPrototype(false);

createNonEnumerableProperty$2(IteratorHelperPrototype, TO_STRING_TAG$2, 'Iterator Helper');

var iteratorCreateProxy = function (nextHandler, IS_ITERATOR) {
  var IteratorProxy = function Iterator(record, state) {
    if (state) {
      state.iterator = record.iterator;
      state.next = record.next;
    } else state = record;
    state.type = IS_ITERATOR ? WRAP_FOR_VALID_ITERATOR : ITERATOR_HELPER;
    state.nextHandler = nextHandler;
    state.counter = 0;
    state.done = false;
    setInternalState$2(this, state);
  };

  IteratorProxy.prototype = IS_ITERATOR ? WrapForValidIteratorPrototype : IteratorHelperPrototype;

  return IteratorProxy;
};

var $$y = _export;
var call$h = functionCall;
var anObject$k = anObject$11;
var getIteratorDirect$j = getIteratorDirect$o;
var notANaN$3 = notANan;
var toPositiveInteger$3 = toPositiveInteger$5;
var createIteratorProxy$5 = iteratorCreateProxy;
var IS_PURE$e = isPure;

var IteratorProxy$5 = createIteratorProxy$5(function () {
  var iterator = this.iterator;
  var next = this.next;
  var result, done;
  while (this.remaining) {
    this.remaining--;
    result = anObject$k(call$h(next, iterator));
    done = this.done = !!result.done;
    if (done) return;
  }
  result = anObject$k(call$h(next, iterator));
  done = this.done = !!result.done;
  if (!done) return result.value;
});

// `Iterator.prototype.drop` method
// https://github.com/tc39/proposal-iterator-helpers
$$y({ target: 'Iterator', proto: true, real: true, forced: IS_PURE$e }, {
  drop: function drop(limit) {
    anObject$k(this);
    var remaining = toPositiveInteger$3(notANaN$3(+limit));
    return new IteratorProxy$5(getIteratorDirect$j(this), {
      remaining: remaining
    });
  }
});

var $$x = _export;
var iterate$5 = iterate$k;
var aCallable$c = aCallable$F;
var anObject$j = anObject$11;
var getIteratorDirect$i = getIteratorDirect$o;

// `Iterator.prototype.every` method
// https://github.com/tc39/proposal-iterator-helpers
$$x({ target: 'Iterator', proto: true, real: true }, {
  every: function every(predicate) {
    anObject$j(this);
    aCallable$c(predicate);
    var record = getIteratorDirect$i(this);
    var counter = 0;
    return !iterate$5(record, function (value, stop) {
      if (!predicate(value, counter++)) return stop();
    }, { IS_RECORD: true, INTERRUPTED: true }).stopped;
  }
});

var $$w = _export;
var call$g = functionCall;
var aCallable$b = aCallable$F;
var anObject$i = anObject$11;
var getIteratorDirect$h = getIteratorDirect$o;
var createIteratorProxy$4 = iteratorCreateProxy;
var callWithSafeIterationClosing$1 = callWithSafeIterationClosing$3;
var IS_PURE$d = isPure;

var IteratorProxy$4 = createIteratorProxy$4(function () {
  var iterator = this.iterator;
  var predicate = this.predicate;
  var next = this.next;
  var result, done, value;
  while (true) {
    result = anObject$i(call$g(next, iterator));
    done = this.done = !!result.done;
    if (done) return;
    value = result.value;
    if (callWithSafeIterationClosing$1(iterator, predicate, [value, this.counter++], true)) return value;
  }
});

// `Iterator.prototype.filter` method
// https://github.com/tc39/proposal-iterator-helpers
$$w({ target: 'Iterator', proto: true, real: true, forced: IS_PURE$d }, {
  filter: function filter(predicate) {
    anObject$i(this);
    aCallable$b(predicate);
    return new IteratorProxy$4(getIteratorDirect$h(this), {
      predicate: predicate
    });
  }
});

var $$v = _export;
var iterate$4 = iterate$k;
var aCallable$a = aCallable$F;
var anObject$h = anObject$11;
var getIteratorDirect$g = getIteratorDirect$o;

// `Iterator.prototype.find` method
// https://github.com/tc39/proposal-iterator-helpers
$$v({ target: 'Iterator', proto: true, real: true }, {
  find: function find(predicate) {
    anObject$h(this);
    aCallable$a(predicate);
    var record = getIteratorDirect$g(this);
    var counter = 0;
    return iterate$4(record, function (value, stop) {
      if (predicate(value, counter++)) return stop(value);
    }, { IS_RECORD: true, INTERRUPTED: true }).result;
  }
});

var call$f = functionCall;
var anObject$g = anObject$11;
var getIteratorDirect$f = getIteratorDirect$o;
var getIteratorMethod$1 = getIteratorMethod$8;

var getIteratorFlattenable$2 = function (obj, stringHandling) {
  if (!stringHandling || typeof obj !== 'string') anObject$g(obj);
  var method = getIteratorMethod$1(obj);
  return getIteratorDirect$f(anObject$g(method !== undefined ? call$f(method, obj) : obj));
};

var $$u = _export;
var call$e = functionCall;
var aCallable$9 = aCallable$F;
var anObject$f = anObject$11;
var getIteratorDirect$e = getIteratorDirect$o;
var getIteratorFlattenable$1 = getIteratorFlattenable$2;
var createIteratorProxy$3 = iteratorCreateProxy;
var iteratorClose$2 = iteratorClose$8;
var IS_PURE$c = isPure;

var IteratorProxy$3 = createIteratorProxy$3(function () {
  var iterator = this.iterator;
  var mapper = this.mapper;
  var result, inner;

  while (true) {
    if (inner = this.inner) try {
      result = anObject$f(call$e(inner.next, inner.iterator));
      if (!result.done) return result.value;
      this.inner = null;
    } catch (error) { iteratorClose$2(iterator, 'throw', error); }

    result = anObject$f(call$e(this.next, iterator));

    if (this.done = !!result.done) return;

    try {
      this.inner = getIteratorFlattenable$1(mapper(result.value, this.counter++), false);
    } catch (error) { iteratorClose$2(iterator, 'throw', error); }
  }
});

// `Iterator.prototype.flatMap` method
// https://github.com/tc39/proposal-iterator-helpers
$$u({ target: 'Iterator', proto: true, real: true, forced: IS_PURE$c }, {
  flatMap: function flatMap(mapper) {
    anObject$f(this);
    aCallable$9(mapper);
    return new IteratorProxy$3(getIteratorDirect$e(this), {
      mapper: mapper,
      inner: null
    });
  }
});

var $$t = _export;
var iterate$3 = iterate$k;
var aCallable$8 = aCallable$F;
var anObject$e = anObject$11;
var getIteratorDirect$d = getIteratorDirect$o;

// `Iterator.prototype.forEach` method
// https://github.com/tc39/proposal-iterator-helpers
$$t({ target: 'Iterator', proto: true, real: true }, {
  forEach: function forEach(fn) {
    anObject$e(this);
    aCallable$8(fn);
    var record = getIteratorDirect$d(this);
    var counter = 0;
    iterate$3(record, function (value) {
      fn(value, counter++);
    }, { IS_RECORD: true });
  }
});

var $$s = _export;
var call$d = functionCall;
var toObject$3 = toObject$y;
var isPrototypeOf$1 = objectIsPrototypeOf;
var IteratorPrototype = iteratorsCore.IteratorPrototype;
var createIteratorProxy$2 = iteratorCreateProxy;
var getIteratorFlattenable = getIteratorFlattenable$2;
var IS_PURE$b = isPure;

var IteratorProxy$2 = createIteratorProxy$2(function () {
  return call$d(this.next, this.iterator);
}, true);

// `Iterator.from` method
// https://github.com/tc39/proposal-iterator-helpers
$$s({ target: 'Iterator', stat: true, forced: IS_PURE$b }, {
  from: function from(O) {
    var iteratorRecord = getIteratorFlattenable(typeof O == 'string' ? toObject$3(O) : O, true);
    return isPrototypeOf$1(IteratorPrototype, iteratorRecord.iterator)
      ? iteratorRecord.iterator
      : new IteratorProxy$2(iteratorRecord);
  }
});

var call$c = functionCall;
var aCallable$7 = aCallable$F;
var anObject$d = anObject$11;
var getIteratorDirect$c = getIteratorDirect$o;
var createIteratorProxy$1 = iteratorCreateProxy;
var callWithSafeIterationClosing = callWithSafeIterationClosing$3;

var IteratorProxy$1 = createIteratorProxy$1(function () {
  var iterator = this.iterator;
  var result = anObject$d(call$c(this.next, iterator));
  var done = this.done = !!result.done;
  if (!done) return callWithSafeIterationClosing(iterator, this.mapper, [result.value, this.counter++], true);
});

// `Iterator.prototype.map` method
// https://github.com/tc39/proposal-iterator-helpers
var iteratorMap = function map(mapper) {
  anObject$d(this);
  aCallable$7(mapper);
  return new IteratorProxy$1(getIteratorDirect$c(this), {
    mapper: mapper
  });
};

var $$r = _export;
var map$1 = iteratorMap;
var IS_PURE$a = isPure;

// `Iterator.prototype.map` method
// https://github.com/tc39/proposal-iterator-helpers
$$r({ target: 'Iterator', proto: true, real: true, forced: IS_PURE$a }, {
  map: map$1
});

var $$q = _export;
var iterate$2 = iterate$k;
var aCallable$6 = aCallable$F;
var anObject$c = anObject$11;
var getIteratorDirect$b = getIteratorDirect$o;

var $TypeError$2 = TypeError;

// `Iterator.prototype.reduce` method
// https://github.com/tc39/proposal-iterator-helpers
$$q({ target: 'Iterator', proto: true, real: true }, {
  reduce: function reduce(reducer /* , initialValue */) {
    anObject$c(this);
    aCallable$6(reducer);
    var record = getIteratorDirect$b(this);
    var noInitial = arguments.length < 2;
    var accumulator = noInitial ? undefined : arguments[1];
    var counter = 0;
    iterate$2(record, function (value) {
      if (noInitial) {
        noInitial = false;
        accumulator = value;
      } else {
        accumulator = reducer(accumulator, value, counter);
      }
      counter++;
    }, { IS_RECORD: true });
    if (noInitial) throw new $TypeError$2('Reduce of empty iterator with no initial value');
    return accumulator;
  }
});

var $$p = _export;
var iterate$1 = iterate$k;
var aCallable$5 = aCallable$F;
var anObject$b = anObject$11;
var getIteratorDirect$a = getIteratorDirect$o;

// `Iterator.prototype.some` method
// https://github.com/tc39/proposal-iterator-helpers
$$p({ target: 'Iterator', proto: true, real: true }, {
  some: function some(predicate) {
    anObject$b(this);
    aCallable$5(predicate);
    var record = getIteratorDirect$a(this);
    var counter = 0;
    return iterate$1(record, function (value, stop) {
      if (predicate(value, counter++)) return stop();
    }, { IS_RECORD: true, INTERRUPTED: true }).stopped;
  }
});

var $$o = _export;
var call$b = functionCall;
var anObject$a = anObject$11;
var getIteratorDirect$9 = getIteratorDirect$o;
var notANaN$2 = notANan;
var toPositiveInteger$2 = toPositiveInteger$5;
var createIteratorProxy = iteratorCreateProxy;
var iteratorClose$1 = iteratorClose$8;
var IS_PURE$9 = isPure;

var IteratorProxy = createIteratorProxy(function () {
  var iterator = this.iterator;
  if (!this.remaining--) {
    this.done = true;
    return iteratorClose$1(iterator, 'normal', undefined);
  }
  var result = anObject$a(call$b(this.next, iterator));
  var done = this.done = !!result.done;
  if (!done) return result.value;
});

// `Iterator.prototype.take` method
// https://github.com/tc39/proposal-iterator-helpers
$$o({ target: 'Iterator', proto: true, real: true, forced: IS_PURE$9 }, {
  take: function take(limit) {
    anObject$a(this);
    var remaining = toPositiveInteger$2(notANaN$2(+limit));
    return new IteratorProxy(getIteratorDirect$9(this), {
      remaining: remaining
    });
  }
});

var $$n = _export;
var anObject$9 = anObject$11;
var iterate = iterate$k;
var getIteratorDirect$8 = getIteratorDirect$o;

var push$4 = [].push;

// `Iterator.prototype.toArray` method
// https://github.com/tc39/proposal-iterator-helpers
$$n({ target: 'Iterator', proto: true, real: true }, {
  toArray: function toArray() {
    var result = [];
    iterate(getIteratorDirect$8(anObject$9(this)), push$4, { that: result, IS_RECORD: true });
    return result;
  }
});

/* eslint-disable es/no-json -- safe */
var fails$2 = fails$1z;

var nativeRawJson = !fails$2(function () {
  var unsafeInt = '9007199254740993';
  var raw = JSON.rawJSON(unsafeInt);
  return !JSON.isRawJSON(raw) || JSON.stringify(raw) !== unsafeInt;
});

var isObject$5 = isObject$J;
var getInternalState = internalState.get;

var isRawJson = function isRawJSON(O) {
  if (!isObject$5(O)) return false;
  var state = getInternalState(O);
  return !!state && state.type === 'RawJSON';
};

var $$m = _export;
var NATIVE_RAW_JSON$1 = nativeRawJson;
var isRawJSON$1 = isRawJson;

// `JSON.parse` method
// https://tc39.es/proposal-json-parse-with-source/#sec-json.israwjson
// https://github.com/tc39/proposal-json-parse-with-source
$$m({ target: 'JSON', stat: true, forced: !NATIVE_RAW_JSON$1 }, {
  isRawJSON: isRawJSON$1
});

var uncurryThis$5 = functionUncurryThis;
var hasOwn$3 = hasOwnProperty_1;

var $SyntaxError$1 = SyntaxError;
var $parseInt = parseInt;
var fromCharCode = String.fromCharCode;
var at$2 = uncurryThis$5(''.charAt);
var slice$3 = uncurryThis$5(''.slice);
var exec$2 = uncurryThis$5(/./.exec);

var codePoints = {
  '\\"': '"',
  '\\\\': '\\',
  '\\/': '/',
  '\\b': '\b',
  '\\f': '\f',
  '\\n': '\n',
  '\\r': '\r',
  '\\t': '\t'
};

var IS_4_HEX_DIGITS = /^[\da-f]{4}$/i;
// eslint-disable-next-line regexp/no-control-character -- safe
var IS_C0_CONTROL_CODE = /^[\u0000-\u001F]$/;

var parseJsonString = function (source, i) {
  var unterminated = true;
  var value = '';
  while (i < source.length) {
    var chr = at$2(source, i);
    if (chr === '\\') {
      var twoChars = slice$3(source, i, i + 2);
      if (hasOwn$3(codePoints, twoChars)) {
        value += codePoints[twoChars];
        i += 2;
      } else if (twoChars === '\\u') {
        i += 2;
        var fourHexDigits = slice$3(source, i, i + 4);
        if (!exec$2(IS_4_HEX_DIGITS, fourHexDigits)) throw new $SyntaxError$1('Bad Unicode escape at: ' + i);
        value += fromCharCode($parseInt(fourHexDigits, 16));
        i += 4;
      } else throw new $SyntaxError$1('Unknown escape sequence: "' + twoChars + '"');
    } else if (chr === '"') {
      unterminated = false;
      i++;
      break;
    } else {
      if (exec$2(IS_C0_CONTROL_CODE, chr)) throw new $SyntaxError$1('Bad control character in string literal at: ' + i);
      value += chr;
      i++;
    }
  }
  if (unterminated) throw new $SyntaxError$1('Unterminated string at: ' + i);
  return { value: value, end: i };
};

var $$l = _export;
var DESCRIPTORS = descriptors;
var globalThis$2 = globalThis_1;
var getBuiltIn$3 = getBuiltIn$C;
var uncurryThis$4 = functionUncurryThis;
var call$a = functionCall;
var isCallable$2 = isCallable$D;
var isObject$4 = isObject$J;
var isArray = isArray$a;
var hasOwn$2 = hasOwnProperty_1;
var toString$1 = toString$F;
var lengthOfArrayLike$3 = lengthOfArrayLike$w;
var createProperty$1 = createProperty$b;
var fails$1 = fails$1z;
var parseJSONString$1 = parseJsonString;
var NATIVE_SYMBOL = symbolConstructorDetection;

var JSON$1 = globalThis$2.JSON;
var Number$1 = globalThis$2.Number;
var SyntaxError$1 = globalThis$2.SyntaxError;
var nativeParse = JSON$1 && JSON$1.parse;
var enumerableOwnProperties = getBuiltIn$3('Object', 'keys');
// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
var at$1 = uncurryThis$4(''.charAt);
var slice$2 = uncurryThis$4(''.slice);
var exec$1 = uncurryThis$4(/./.exec);
var push$3 = uncurryThis$4([].push);

var IS_DIGIT = /^\d$/;
var IS_NON_ZERO_DIGIT = /^[1-9]$/;
var IS_NUMBER_START = /^[\d-]$/;
var IS_WHITESPACE = /^[\t\n\r ]$/;

var PRIMITIVE = 0;
var OBJECT = 1;

var $parse = function (source, reviver) {
  source = toString$1(source);
  var context = new Context(source, 0);
  var root = context.parse();
  var value = root.value;
  var endIndex = context.skip(IS_WHITESPACE, root.end);
  if (endIndex < source.length) {
    throw new SyntaxError$1('Unexpected extra character: "' + at$1(source, endIndex) + '" after the parsed data at: ' + endIndex);
  }
  return isCallable$2(reviver) ? internalize({ '': value }, '', reviver, root) : value;
};

var internalize = function (holder, name, reviver, node) {
  var val = holder[name];
  var unmodified = node && val === node.value;
  var context = unmodified && typeof node.source == 'string' ? { source: node.source } : {};
  var elementRecordsLen, keys, len, i, P;
  if (isObject$4(val)) {
    var nodeIsArray = isArray(val);
    var nodes = unmodified ? node.nodes : nodeIsArray ? [] : {};
    if (nodeIsArray) {
      elementRecordsLen = nodes.length;
      len = lengthOfArrayLike$3(val);
      for (i = 0; i < len; i++) {
        internalizeProperty(val, i, internalize(val, '' + i, reviver, i < elementRecordsLen ? nodes[i] : undefined));
      }
    } else {
      keys = enumerableOwnProperties(val);
      len = lengthOfArrayLike$3(keys);
      for (i = 0; i < len; i++) {
        P = keys[i];
        internalizeProperty(val, P, internalize(val, P, reviver, hasOwn$2(nodes, P) ? nodes[P] : undefined));
      }
    }
  }
  return call$a(reviver, holder, name, val, context);
};

var internalizeProperty = function (object, key, value) {
  if (DESCRIPTORS) {
    var descriptor = getOwnPropertyDescriptor(object, key);
    if (descriptor && !descriptor.configurable) return;
  }
  if (value === undefined) delete object[key];
  else createProperty$1(object, key, value);
};

var Node = function (value, end, source, nodes) {
  this.value = value;
  this.end = end;
  this.source = source;
  this.nodes = nodes;
};

var Context = function (source, index) {
  this.source = source;
  this.index = index;
};

// https://www.json.org/json-en.html
Context.prototype = {
  fork: function (nextIndex) {
    return new Context(this.source, nextIndex);
  },
  parse: function () {
    var source = this.source;
    var i = this.skip(IS_WHITESPACE, this.index);
    var fork = this.fork(i);
    var chr = at$1(source, i);
    if (exec$1(IS_NUMBER_START, chr)) return fork.number();
    switch (chr) {
      case '{':
        return fork.object();
      case '[':
        return fork.array();
      case '"':
        return fork.string();
      case 't':
        return fork.keyword(true);
      case 'f':
        return fork.keyword(false);
      case 'n':
        return fork.keyword(null);
    } throw new SyntaxError$1('Unexpected character: "' + chr + '" at: ' + i);
  },
  node: function (type, value, start, end, nodes) {
    return new Node(value, end, type ? null : slice$2(this.source, start, end), nodes);
  },
  object: function () {
    var source = this.source;
    var i = this.index + 1;
    var expectKeypair = false;
    var object = {};
    var nodes = {};
    while (i < source.length) {
      i = this.until(['"', '}'], i);
      if (at$1(source, i) === '}' && !expectKeypair) {
        i++;
        break;
      }
      // Parsing the key
      var result = this.fork(i).string();
      var key = result.value;
      i = result.end;
      i = this.until([':'], i) + 1;
      // Parsing value
      i = this.skip(IS_WHITESPACE, i);
      result = this.fork(i).parse();
      createProperty$1(nodes, key, result);
      createProperty$1(object, key, result.value);
      i = this.until([',', '}'], result.end);
      var chr = at$1(source, i);
      if (chr === ',') {
        expectKeypair = true;
        i++;
      } else if (chr === '}') {
        i++;
        break;
      }
    }
    return this.node(OBJECT, object, this.index, i, nodes);
  },
  array: function () {
    var source = this.source;
    var i = this.index + 1;
    var expectElement = false;
    var array = [];
    var nodes = [];
    while (i < source.length) {
      i = this.skip(IS_WHITESPACE, i);
      if (at$1(source, i) === ']' && !expectElement) {
        i++;
        break;
      }
      var result = this.fork(i).parse();
      push$3(nodes, result);
      push$3(array, result.value);
      i = this.until([',', ']'], result.end);
      if (at$1(source, i) === ',') {
        expectElement = true;
        i++;
      } else if (at$1(source, i) === ']') {
        i++;
        break;
      }
    }
    return this.node(OBJECT, array, this.index, i, nodes);
  },
  string: function () {
    var index = this.index;
    var parsed = parseJSONString$1(this.source, this.index + 1);
    return this.node(PRIMITIVE, parsed.value, index, parsed.end);
  },
  number: function () {
    var source = this.source;
    var startIndex = this.index;
    var i = startIndex;
    if (at$1(source, i) === '-') i++;
    if (at$1(source, i) === '0') i++;
    else if (exec$1(IS_NON_ZERO_DIGIT, at$1(source, i))) i = this.skip(IS_DIGIT, i + 1);
    else throw new SyntaxError$1('Failed to parse number at: ' + i);
    if (at$1(source, i) === '.') i = this.skip(IS_DIGIT, i + 1);
    if (at$1(source, i) === 'e' || at$1(source, i) === 'E') {
      i++;
      if (at$1(source, i) === '+' || at$1(source, i) === '-') i++;
      var exponentStartIndex = i;
      i = this.skip(IS_DIGIT, i);
      if (exponentStartIndex === i) throw new SyntaxError$1("Failed to parse number's exponent value at: " + i);
    }
    return this.node(PRIMITIVE, Number$1(slice$2(source, startIndex, i)), startIndex, i);
  },
  keyword: function (value) {
    var keyword = '' + value;
    var index = this.index;
    var endIndex = index + keyword.length;
    if (slice$2(this.source, index, endIndex) !== keyword) throw new SyntaxError$1('Failed to parse value at: ' + index);
    return this.node(PRIMITIVE, value, index, endIndex);
  },
  skip: function (regex, i) {
    var source = this.source;
    for (; i < source.length; i++) if (!exec$1(regex, at$1(source, i))) break;
    return i;
  },
  until: function (array, i) {
    i = this.skip(IS_WHITESPACE, i);
    var chr = at$1(this.source, i);
    for (var j = 0; j < array.length; j++) if (array[j] === chr) return i;
    throw new SyntaxError$1('Unexpected character: "' + chr + '" at: ' + i);
  }
};

var NO_SOURCE_SUPPORT = fails$1(function () {
  var unsafeInt = '9007199254740993';
  var source;
  nativeParse(unsafeInt, function (key, value, context) {
    source = context.source;
  });
  return source !== unsafeInt;
});

var PROPER_BASE_PARSE = NATIVE_SYMBOL && !fails$1(function () {
  // Safari 9 bug
  return 1 / nativeParse('-0 \t') !== -Infinity;
});

// `JSON.parse` method
// https://tc39.es/ecma262/#sec-json.parse
// https://github.com/tc39/proposal-json-parse-with-source
$$l({ target: 'JSON', stat: true, forced: NO_SOURCE_SUPPORT }, {
  parse: function parse(text, reviver) {
    return PROPER_BASE_PARSE && !isCallable$2(reviver) ? nativeParse(text) : $parse(text, reviver);
  }
});

var $$k = _export;
var FREEZING = freezing;
var NATIVE_RAW_JSON = nativeRawJson;
var getBuiltIn$2 = getBuiltIn$C;
var call$9 = functionCall;
var uncurryThis$3 = functionUncurryThis;
var isCallable$1 = isCallable$D;
var isRawJSON = isRawJson;
var toString = toString$F;
var createProperty = createProperty$b;
var parseJSONString = parseJsonString;
var getReplacerFunction = getJsonReplacerFunction;
var uid = uid$7;
var setInternalState$1 = internalState.set;

var $String = String;
var $SyntaxError = SyntaxError;
var parse = getBuiltIn$2('JSON', 'parse');
var $stringify = getBuiltIn$2('JSON', 'stringify');
var create$1 = getBuiltIn$2('Object', 'create');
var freeze = getBuiltIn$2('Object', 'freeze');
var at = uncurryThis$3(''.charAt);
var slice$1 = uncurryThis$3(''.slice);
var push$2 = uncurryThis$3([].push);

var MARK = uid();
var MARK_LENGTH = MARK.length;
var ERROR_MESSAGE = 'Unacceptable as raw JSON';

var isWhitespace = function (it) {
  return it === ' ' || it === '\t' || it === '\n' || it === '\r';
};

// `JSON.parse` method
// https://tc39.es/proposal-json-parse-with-source/#sec-json.israwjson
// https://github.com/tc39/proposal-json-parse-with-source
$$k({ target: 'JSON', stat: true, forced: !NATIVE_RAW_JSON }, {
  rawJSON: function rawJSON(text) {
    var jsonString = toString(text);
    if (jsonString === '' || isWhitespace(at(jsonString, 0)) || isWhitespace(at(jsonString, jsonString.length - 1))) {
      throw new $SyntaxError(ERROR_MESSAGE);
    }
    var parsed = parse(jsonString);
    if (typeof parsed == 'object' && parsed !== null) throw new $SyntaxError(ERROR_MESSAGE);
    var obj = create$1(null);
    setInternalState$1(obj, { type: 'RawJSON' });
    createProperty(obj, 'rawJSON', jsonString);
    return FREEZING ? freeze(obj) : obj;
  }
});

// `JSON.stringify` method
// https://tc39.es/ecma262/#sec-json.stringify
// https://github.com/tc39/proposal-json-parse-with-source
if ($stringify) $$k({ target: 'JSON', stat: true, arity: 3, forced: !NATIVE_RAW_JSON }, {
  stringify: function stringify(text, replacer, space) {
    var replacerFunction = getReplacerFunction(replacer);
    var rawStrings = [];

    var json = $stringify(text, function (key, value) {
      // some old implementations (like WebKit) could pass numbers as keys
      var v = isCallable$1(replacerFunction) ? call$9(replacerFunction, this, $String(key), value) : value;
      return isRawJSON(v) ? MARK + (push$2(rawStrings, v.rawJSON) - 1) : v;
    }, space);

    if (typeof json != 'string') return json;

    var result = '';
    var length = json.length;

    for (var i = 0; i < length; i++) {
      var chr = at(json, i);
      if (chr === '"') {
        var end = parseJSONString(json, ++i).end - 1;
        var string = slice$1(json, i, end);
        result += slice$1(string, 0, MARK_LENGTH) === MARK
          ? rawStrings[slice$1(string, MARK_LENGTH)]
          : '"' + string + '"';
        i = end;
      } else result += chr;
    }

    return result;
  }
});

var $$j = _export;
var globalThis$1 = globalThis_1;
var apply = functionApply$1;
var slice = arraySlice$a;
var newPromiseCapabilityModule = newPromiseCapability$2;
var aCallable$4 = aCallable$F;
var perform$1 = perform$7;

var Promise$3 = globalThis$1.Promise;

var ACCEPT_ARGUMENTS = false;
// Avoiding the use of polyfills of the previous iteration of this proposal
// that does not accept arguments of the callback
var FORCED$1 = !Promise$3 || !Promise$3['try'] || perform$1(function () {
  Promise$3['try'](function (argument) {
    ACCEPT_ARGUMENTS = argument === 8;
  }, 8);
}).error || !ACCEPT_ARGUMENTS;

// `Promise.try` method
// https://github.com/tc39/proposal-promise-try
$$j({ target: 'Promise', stat: true, forced: FORCED$1 }, {
  'try': function (callbackfn /* , ...args */) {
    var args = arguments.length > 1 ? slice(arguments, 1) : [];
    var promiseCapability = newPromiseCapabilityModule.f(this);
    var result = perform$1(function () {
      return apply(aCallable$4(callbackfn), undefined, args);
    });
    (result.error ? promiseCapability.reject : promiseCapability.resolve)(result.value);
    return promiseCapability.promise;
  }
});

var $$i = _export;
var uncurryThis$2 = functionUncurryThis;
var aString = aString$4;
var hasOwn$1 = hasOwnProperty_1;
var padStart = stringPad.start;
var WHITESPACES = whitespaces$5;

var $Array$1 = Array;
var $escape = RegExp.escape;
var charAt = uncurryThis$2(''.charAt);
var charCodeAt = uncurryThis$2(''.charCodeAt);
var numberToString = uncurryThis$2(1.1.toString);
var join = uncurryThis$2([].join);
var FIRST_DIGIT_OR_ASCII = /^[0-9a-z]/i;
var SYNTAX_SOLIDUS = /^[$()*+./?[\\\]^{|}]/;
var OTHER_PUNCTUATORS_AND_WHITESPACES = RegExp('^[!"#%&\',\\-:;<=>@`~' + WHITESPACES + ']');
var exec = uncurryThis$2(FIRST_DIGIT_OR_ASCII.exec);

var ControlEscape = {
  '\u0009': 't',
  '\u000A': 'n',
  '\u000B': 'v',
  '\u000C': 'f',
  '\u000D': 'r'
};

var escapeChar = function (chr) {
  var hex = numberToString(charCodeAt(chr, 0), 16);
  return hex.length < 3 ? '\\x' + padStart(hex, 2, '0') : '\\u' + padStart(hex, 4, '0');
};

// Avoiding the use of polyfills of the previous iteration of this proposal
var FORCED = !$escape || $escape('ab') !== '\\x61b';

// `RegExp.escape` method
// https://github.com/tc39/proposal-regex-escaping
$$i({ target: 'RegExp', stat: true, forced: FORCED }, {
  escape: function escape(S) {
    aString(S);
    var length = S.length;
    var result = $Array$1(length);

    for (var i = 0; i < length; i++) {
      var chr = charAt(S, i);
      if (i === 0 && exec(FIRST_DIGIT_OR_ASCII, chr)) {
        result[i] = escapeChar(chr);
      } else if (hasOwn$1(ControlEscape, chr)) {
        result[i] = '\\' + ControlEscape[chr];
      } else if (exec(SYNTAX_SOLIDUS, chr)) {
        result[i] = '\\' + chr;
      } else if (exec(OTHER_PUNCTUATORS_AND_WHITESPACES, chr)) {
        result[i] = escapeChar(chr);
      } else {
        var charCode = charCodeAt(chr, 0);
        // single UTF-16 code unit
        if ((charCode & 0xF800) !== 0xD800) result[i] = chr;
        // unpaired surrogate
        else if (charCode >= 0xDC00 || i + 1 >= length || (charCodeAt(S, i + 1) & 0xFC00) !== 0xDC00) result[i] = escapeChar(chr);
        // surrogate pair
        else {
          result[i] = chr;
          result[++i] = charAt(S, i);
        }
      }
    }

    return join(result, '');
  }
});

var bind$1 = functionBindContext;
var uncurryThis$1 = functionUncurryThis;
var IndexedObject$1 = indexedObject;
var toObject$2 = toObject$y;
var toPropertyKey = toPropertyKey$9;
var lengthOfArrayLike$2 = lengthOfArrayLike$w;
var objectCreate = objectCreate$1;
var arrayFromConstructorAndList = arrayFromConstructorAndList$6;

var $Array = Array;
var push$1 = uncurryThis$1([].push);

var arrayGroup = function ($this, callbackfn, that, specificConstructor) {
  var O = toObject$2($this);
  var self = IndexedObject$1(O);
  var boundFunction = bind$1(callbackfn, that);
  var target = objectCreate(null);
  var length = lengthOfArrayLike$2(self);
  var index = 0;
  var Constructor, key, value;
  for (;length > index; index++) {
    value = self[index];
    key = toPropertyKey(boundFunction(value, index, O));
    // in some IE versions, `hasOwnProperty` returns incorrect result on integer keys
    // but since it's a `null` prototype object, we can safely use `in`
    if (key in target) push$1(target[key], value);
    else target[key] = [value];
  }
  // TODO: Remove this block from `core-js@4`
  if (specificConstructor) {
    Constructor = specificConstructor(O);
    if (Constructor !== $Array) {
      for (key in target) target[key] = arrayFromConstructorAndList(Constructor, target[key]);
    }
  } return target;
};

// TODO: Remove from `core-js@4`
var $$h = _export;
var $group$1 = arrayGroup;
var arrayMethodIsStrict$1 = arrayMethodIsStrict$b;
var addToUnscopables$3 = addToUnscopables$i;

// `Array.prototype.groupBy` method
// https://github.com/tc39/proposal-array-grouping
// https://bugs.webkit.org/show_bug.cgi?id=236541
$$h({ target: 'Array', proto: true, forced: !arrayMethodIsStrict$1('groupBy') }, {
  groupBy: function groupBy(callbackfn /* , thisArg */) {
    var thisArg = arguments.length > 1 ? arguments[1] : undefined;
    return $group$1(this, callbackfn, thisArg);
  }
});

addToUnscopables$3('groupBy');

var bind = functionBindContext;
var uncurryThis = functionUncurryThis;
var IndexedObject = indexedObject;
var toObject$1 = toObject$y;
var lengthOfArrayLike$1 = lengthOfArrayLike$w;
var MapHelpers = mapHelpers;

var Map$1 = MapHelpers.Map;
var mapGet = MapHelpers.get;
var mapHas = MapHelpers.has;
var mapSet = MapHelpers.set;
var push = uncurryThis([].push);

// `Array.prototype.groupToMap` method
// https://github.com/tc39/proposal-array-grouping
var arrayGroupToMap = function groupToMap(callbackfn /* , thisArg */) {
  var O = toObject$1(this);
  var self = IndexedObject(O);
  var boundFunction = bind(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  var map = new Map$1();
  var length = lengthOfArrayLike$1(self);
  var index = 0;
  var key, value;
  for (;length > index; index++) {
    value = self[index];
    key = boundFunction(value, index, O);
    if (mapHas(map, key)) push(mapGet(map, key), value);
    else mapSet(map, key, [value]);
  } return map;
};

// TODO: Remove from `core-js@4`
var $$g = _export;
var arrayMethodIsStrict = arrayMethodIsStrict$b;
var addToUnscopables$2 = addToUnscopables$i;
var $groupToMap$1 = arrayGroupToMap;

// `Array.prototype.groupByToMap` method
// https://github.com/tc39/proposal-array-grouping
// https://bugs.webkit.org/show_bug.cgi?id=236541
$$g({ target: 'Array', proto: true, name: 'groupToMap', forced: !arrayMethodIsStrict('groupByToMap') }, {
  groupByToMap: $groupToMap$1
});

addToUnscopables$2('groupByToMap');

var $$f = _export;
var $group = arrayGroup;
var addToUnscopables$1 = addToUnscopables$i;

// `Array.prototype.group` method
// https://github.com/tc39/proposal-array-grouping
$$f({ target: 'Array', proto: true }, {
  group: function group(callbackfn /* , thisArg */) {
    var thisArg = arguments.length > 1 ? arguments[1] : undefined;
    return $group(this, callbackfn, thisArg);
  }
});

addToUnscopables$1('group');

var $$e = _export;
var addToUnscopables = addToUnscopables$i;
var $groupToMap = arrayGroupToMap;
var IS_PURE$8 = isPure;

// `Array.prototype.groupToMap` method
// https://github.com/tc39/proposal-array-grouping
$$e({ target: 'Array', proto: true, forced: IS_PURE$8 }, {
  groupToMap: $groupToMap
});

addToUnscopables('groupToMap');

// TODO: Remove from `core-js@4`
var ArrayBufferViewCore = arrayBufferViewCore;
var lengthOfArrayLike = lengthOfArrayLike$w;
var isBigIntArray = isBigIntArray$3;
var toAbsoluteIndex = toAbsoluteIndex$a;
var toBigInt = toBigInt$4;
var toIntegerOrInfinity = toIntegerOrInfinity$n;
var fails = fails$1z;

var aTypedArray = ArrayBufferViewCore.aTypedArray;
var getTypedArrayConstructor = ArrayBufferViewCore.getTypedArrayConstructor;
var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;
var max = Math.max;
var min = Math.min;

// some early implementations, like WebKit, does not follow the final semantic
var PROPER_ORDER = !fails(function () {
  // eslint-disable-next-line es/no-typed-arrays -- required for testing
  var array = new Int8Array([1]);

  var spliced = array.toSpliced(1, 0, {
    valueOf: function () {
      array[0] = 2;
      return 3;
    }
  });

  return spliced[0] !== 2 || spliced[1] !== 3;
});

// `%TypedArray%.prototype.toSpliced` method
// https://tc39.es/proposal-change-array-by-copy/#sec-%typedarray%.prototype.toSpliced
exportTypedArrayMethod('toSpliced', function toSpliced(start, deleteCount /* , ...items */) {
  var O = aTypedArray(this);
  var C = getTypedArrayConstructor(O);
  var len = lengthOfArrayLike(O);
  var actualStart = toAbsoluteIndex(start, len);
  var argumentsLength = arguments.length;
  var k = 0;
  var insertCount, actualDeleteCount, thisIsBigIntArray, convertedItems, value, newLen, A;
  if (argumentsLength === 0) {
    insertCount = actualDeleteCount = 0;
  } else if (argumentsLength === 1) {
    insertCount = 0;
    actualDeleteCount = len - actualStart;
  } else {
    actualDeleteCount = min(max(toIntegerOrInfinity(deleteCount), 0), len - actualStart);
    insertCount = argumentsLength - 2;
    if (insertCount) {
      convertedItems = new C(insertCount);
      thisIsBigIntArray = isBigIntArray(convertedItems);
      for (var i = 2; i < argumentsLength; i++) {
        value = arguments[i];
        // FF30- typed arrays doesn't properly convert objects to typed array values
        convertedItems[i - 2] = thisIsBigIntArray ? toBigInt(value) : +value;
      }
    }
  }
  newLen = len + insertCount - actualDeleteCount;
  A = new C(newLen);

  for (; k < actualStart; k++) A[k] = O[k];
  for (; k < actualStart + insertCount; k++) A[k] = convertedItems[k - actualStart];
  for (; k < newLen; k++) A[k] = O[k + actualDeleteCount - insertCount];

  return A;
}, !PROPER_ORDER);

var $$d = _export;
var anInstance = anInstance$e;
var getPrototypeOf = objectGetPrototypeOf$2;
var createNonEnumerableProperty$1 = createNonEnumerableProperty$j;
var hasOwn = hasOwnProperty_1;
var wellKnownSymbol$2 = wellKnownSymbol$O;
var AsyncIteratorPrototype$2 = asyncIteratorPrototype;
var IS_PURE$7 = isPure;

var TO_STRING_TAG$1 = wellKnownSymbol$2('toStringTag');

var $TypeError$1 = TypeError;

var AsyncIteratorConstructor = function AsyncIterator() {
  anInstance(this, AsyncIteratorPrototype$2);
  if (getPrototypeOf(this) === AsyncIteratorPrototype$2) throw new $TypeError$1('Abstract class AsyncIterator not directly constructable');
};

AsyncIteratorConstructor.prototype = AsyncIteratorPrototype$2;

if (!hasOwn(AsyncIteratorPrototype$2, TO_STRING_TAG$1)) {
  createNonEnumerableProperty$1(AsyncIteratorPrototype$2, TO_STRING_TAG$1, 'AsyncIterator');
}

if (!hasOwn(AsyncIteratorPrototype$2, 'constructor') || AsyncIteratorPrototype$2.constructor === Object) {
  createNonEnumerableProperty$1(AsyncIteratorPrototype$2, 'constructor', AsyncIteratorConstructor);
}

// `AsyncIterator` constructor
// https://github.com/tc39/proposal-async-iterator-helpers
$$d({ global: true, constructor: true, forced: IS_PURE$7 }, {
  AsyncIterator: AsyncIteratorConstructor
});

var call$8 = functionCall;
var perform = perform$7;
var anObject$8 = anObject$11;
var create = objectCreate$1;
var createNonEnumerableProperty = createNonEnumerableProperty$j;
var defineBuiltIns = defineBuiltIns$a;
var wellKnownSymbol$1 = wellKnownSymbol$O;
var InternalStateModule = internalState;
var getBuiltIn$1 = getBuiltIn$C;
var getMethod$1 = getMethod$j;
var AsyncIteratorPrototype$1 = asyncIteratorPrototype;
var createIterResultObject$5 = createIterResultObject$d;
var iteratorClose = iteratorClose$8;

var Promise$2 = getBuiltIn$1('Promise');

var TO_STRING_TAG = wellKnownSymbol$1('toStringTag');
var ASYNC_ITERATOR_HELPER = 'AsyncIteratorHelper';
var WRAP_FOR_VALID_ASYNC_ITERATOR = 'WrapForValidAsyncIterator';
var setInternalState = InternalStateModule.set;

var createAsyncIteratorProxyPrototype = function (IS_ITERATOR) {
  var IS_GENERATOR = !IS_ITERATOR;
  var getInternalState = InternalStateModule.getterFor(IS_ITERATOR ? WRAP_FOR_VALID_ASYNC_ITERATOR : ASYNC_ITERATOR_HELPER);

  var getStateOrEarlyExit = function (that) {
    var stateCompletion = perform(function () {
      return getInternalState(that);
    });

    var stateError = stateCompletion.error;
    var state = stateCompletion.value;

    if (stateError || (IS_GENERATOR && state.done)) {
      return { exit: true, value: stateError ? Promise$2.reject(state) : Promise$2.resolve(createIterResultObject$5(undefined, true)) };
    } return { exit: false, value: state };
  };

  return defineBuiltIns(create(AsyncIteratorPrototype$1), {
    next: function next() {
      var stateCompletion = getStateOrEarlyExit(this);
      var state = stateCompletion.value;
      if (stateCompletion.exit) return state;
      var handlerCompletion = perform(function () {
        return anObject$8(state.nextHandler(Promise$2));
      });
      var handlerError = handlerCompletion.error;
      var value = handlerCompletion.value;
      if (handlerError) state.done = true;
      return handlerError ? Promise$2.reject(value) : Promise$2.resolve(value);
    },
    'return': function () {
      var stateCompletion = getStateOrEarlyExit(this);
      var state = stateCompletion.value;
      if (stateCompletion.exit) return state;
      state.done = true;
      var iterator = state.iterator;
      var returnMethod, result;
      var completion = perform(function () {
        if (state.inner) try {
          iteratorClose(state.inner.iterator, 'normal');
        } catch (error) {
          return iteratorClose(iterator, 'throw', error);
        }
        return getMethod$1(iterator, 'return');
      });
      returnMethod = result = completion.value;
      if (completion.error) return Promise$2.reject(result);
      if (returnMethod === undefined) return Promise$2.resolve(createIterResultObject$5(undefined, true));
      completion = perform(function () {
        return call$8(returnMethod, iterator);
      });
      result = completion.value;
      if (completion.error) return Promise$2.reject(result);
      return IS_ITERATOR ? Promise$2.resolve(result) : Promise$2.resolve(result).then(function (resolved) {
        anObject$8(resolved);
        return createIterResultObject$5(undefined, true);
      });
    }
  });
};

var WrapForValidAsyncIteratorPrototype = createAsyncIteratorProxyPrototype(true);
var AsyncIteratorHelperPrototype = createAsyncIteratorProxyPrototype(false);

createNonEnumerableProperty(AsyncIteratorHelperPrototype, TO_STRING_TAG, 'Async Iterator Helper');

var asyncIteratorCreateProxy = function (nextHandler, IS_ITERATOR) {
  var AsyncIteratorProxy = function AsyncIterator(record, state) {
    if (state) {
      state.iterator = record.iterator;
      state.next = record.next;
    } else state = record;
    state.type = IS_ITERATOR ? WRAP_FOR_VALID_ASYNC_ITERATOR : ASYNC_ITERATOR_HELPER;
    state.nextHandler = nextHandler;
    state.counter = 0;
    state.done = false;
    setInternalState(this, state);
  };

  AsyncIteratorProxy.prototype = IS_ITERATOR ? WrapForValidAsyncIteratorPrototype : AsyncIteratorHelperPrototype;

  return AsyncIteratorProxy;
};

var $$c = _export;
var call$7 = functionCall;
var anObject$7 = anObject$11;
var getIteratorDirect$7 = getIteratorDirect$o;
var notANaN$1 = notANan;
var toPositiveInteger$1 = toPositiveInteger$5;
var createAsyncIteratorProxy$5 = asyncIteratorCreateProxy;
var createIterResultObject$4 = createIterResultObject$d;
var IS_PURE$6 = isPure;

var AsyncIteratorProxy$4 = createAsyncIteratorProxy$5(function (Promise) {
  var state = this;

  return new Promise(function (resolve, reject) {
    var doneAndReject = function (error) {
      state.done = true;
      reject(error);
    };

    var loop = function () {
      try {
        Promise.resolve(anObject$7(call$7(state.next, state.iterator))).then(function (step) {
          try {
            if (anObject$7(step).done) {
              state.done = true;
              resolve(createIterResultObject$4(undefined, true));
            } else if (state.remaining) {
              state.remaining--;
              loop();
            } else resolve(createIterResultObject$4(step.value, false));
          } catch (err) { doneAndReject(err); }
        }, doneAndReject);
      } catch (error) { doneAndReject(error); }
    };

    loop();
  });
});

// `AsyncIterator.prototype.drop` method
// https://github.com/tc39/proposal-async-iterator-helpers
$$c({ target: 'AsyncIterator', proto: true, real: true, forced: IS_PURE$6 }, {
  drop: function drop(limit) {
    anObject$7(this);
    var remaining = toPositiveInteger$1(notANaN$1(+limit));
    return new AsyncIteratorProxy$4(getIteratorDirect$7(this), {
      remaining: remaining
    });
  }
});

var $$b = _export;
var $every = asyncIteratorIteration.every;

// `AsyncIterator.prototype.every` method
// https://github.com/tc39/proposal-async-iterator-helpers
$$b({ target: 'AsyncIterator', proto: true, real: true }, {
  every: function every(predicate) {
    return $every(this, predicate);
  }
});

var $$a = _export;
var call$6 = functionCall;
var aCallable$3 = aCallable$F;
var anObject$6 = anObject$11;
var isObject$3 = isObject$J;
var getIteratorDirect$6 = getIteratorDirect$o;
var createAsyncIteratorProxy$4 = asyncIteratorCreateProxy;
var createIterResultObject$3 = createIterResultObject$d;
var closeAsyncIteration$3 = asyncIteratorClose;
var IS_PURE$5 = isPure;

var AsyncIteratorProxy$3 = createAsyncIteratorProxy$4(function (Promise) {
  var state = this;
  var iterator = state.iterator;
  var predicate = state.predicate;

  return new Promise(function (resolve, reject) {
    var doneAndReject = function (error) {
      state.done = true;
      reject(error);
    };

    var ifAbruptCloseAsyncIterator = function (error) {
      closeAsyncIteration$3(iterator, doneAndReject, error, doneAndReject);
    };

    var loop = function () {
      try {
        Promise.resolve(anObject$6(call$6(state.next, iterator))).then(function (step) {
          try {
            if (anObject$6(step).done) {
              state.done = true;
              resolve(createIterResultObject$3(undefined, true));
            } else {
              var value = step.value;
              try {
                var result = predicate(value, state.counter++);

                var handler = function (selected) {
                  selected ? resolve(createIterResultObject$3(value, false)) : loop();
                };

                if (isObject$3(result)) Promise.resolve(result).then(handler, ifAbruptCloseAsyncIterator);
                else handler(result);
              } catch (error3) { ifAbruptCloseAsyncIterator(error3); }
            }
          } catch (error2) { doneAndReject(error2); }
        }, doneAndReject);
      } catch (error) { doneAndReject(error); }
    };

    loop();
  });
});

// `AsyncIterator.prototype.filter` method
// https://github.com/tc39/proposal-async-iterator-helpers
$$a({ target: 'AsyncIterator', proto: true, real: true, forced: IS_PURE$5 }, {
  filter: function filter(predicate) {
    anObject$6(this);
    aCallable$3(predicate);
    return new AsyncIteratorProxy$3(getIteratorDirect$6(this), {
      predicate: predicate
    });
  }
});

var $$9 = _export;
var $find = asyncIteratorIteration.find;

// `AsyncIterator.prototype.find` method
// https://github.com/tc39/proposal-async-iterator-helpers
$$9({ target: 'AsyncIterator', proto: true, real: true }, {
  find: function find(predicate) {
    return $find(this, predicate);
  }
});

var call$5 = functionCall;
var isCallable = isCallable$D;
var anObject$5 = anObject$11;
var getIteratorDirect$5 = getIteratorDirect$o;
var getIteratorMethod = getIteratorMethod$8;
var getMethod = getMethod$j;
var wellKnownSymbol = wellKnownSymbol$O;
var AsyncFromSyncIterator$1 = asyncFromSyncIterator;

var ASYNC_ITERATOR = wellKnownSymbol('asyncIterator');

var getAsyncIteratorFlattenable$2 = function (obj) {
  var object = anObject$5(obj);
  var alreadyAsync = true;
  var method = getMethod(object, ASYNC_ITERATOR);
  var iterator;
  if (!isCallable(method)) {
    method = getIteratorMethod(object);
    alreadyAsync = false;
  }
  if (method !== undefined) {
    iterator = call$5(method, object);
  } else {
    iterator = object;
    alreadyAsync = true;
  }
  anObject$5(iterator);
  return getIteratorDirect$5(alreadyAsync ? iterator : new AsyncFromSyncIterator$1(getIteratorDirect$5(iterator)));
};

var $$8 = _export;
var call$4 = functionCall;
var aCallable$2 = aCallable$F;
var anObject$4 = anObject$11;
var isObject$2 = isObject$J;
var getIteratorDirect$4 = getIteratorDirect$o;
var createAsyncIteratorProxy$3 = asyncIteratorCreateProxy;
var createIterResultObject$2 = createIterResultObject$d;
var getAsyncIteratorFlattenable$1 = getAsyncIteratorFlattenable$2;
var closeAsyncIteration$2 = asyncIteratorClose;
var IS_PURE$4 = isPure;

var AsyncIteratorProxy$2 = createAsyncIteratorProxy$3(function (Promise) {
  var state = this;
  var iterator = state.iterator;
  var mapper = state.mapper;

  return new Promise(function (resolve, reject) {
    var doneAndReject = function (error) {
      state.done = true;
      reject(error);
    };

    var ifAbruptCloseAsyncIterator = function (error) {
      closeAsyncIteration$2(iterator, doneAndReject, error, doneAndReject);
    };

    var outerLoop = function () {
      try {
        Promise.resolve(anObject$4(call$4(state.next, iterator))).then(function (step) {
          try {
            if (anObject$4(step).done) {
              state.done = true;
              resolve(createIterResultObject$2(undefined, true));
            } else {
              var value = step.value;
              try {
                var result = mapper(value, state.counter++);

                var handler = function (mapped) {
                  try {
                    state.inner = getAsyncIteratorFlattenable$1(mapped);
                    innerLoop();
                  } catch (error4) { ifAbruptCloseAsyncIterator(error4); }
                };

                if (isObject$2(result)) Promise.resolve(result).then(handler, ifAbruptCloseAsyncIterator);
                else handler(result);
              } catch (error3) { ifAbruptCloseAsyncIterator(error3); }
            }
          } catch (error2) { doneAndReject(error2); }
        }, doneAndReject);
      } catch (error) { doneAndReject(error); }
    };

    var innerLoop = function () {
      var inner = state.inner;
      if (inner) {
        try {
          Promise.resolve(anObject$4(call$4(inner.next, inner.iterator))).then(function (result) {
            try {
              if (anObject$4(result).done) {
                state.inner = null;
                outerLoop();
              } else resolve(createIterResultObject$2(result.value, false));
            } catch (error1) { ifAbruptCloseAsyncIterator(error1); }
          }, ifAbruptCloseAsyncIterator);
        } catch (error) { ifAbruptCloseAsyncIterator(error); }
      } else outerLoop();
    };

    innerLoop();
  });
});

// `AsyncIterator.prototype.flaMap` method
// https://github.com/tc39/proposal-async-iterator-helpers
$$8({ target: 'AsyncIterator', proto: true, real: true, forced: IS_PURE$4 }, {
  flatMap: function flatMap(mapper) {
    anObject$4(this);
    aCallable$2(mapper);
    return new AsyncIteratorProxy$2(getIteratorDirect$4(this), {
      mapper: mapper,
      inner: null
    });
  }
});

var $$7 = _export;
var $forEach = asyncIteratorIteration.forEach;

// `AsyncIterator.prototype.forEach` method
// https://github.com/tc39/proposal-async-iterator-helpers
$$7({ target: 'AsyncIterator', proto: true, real: true }, {
  forEach: function forEach(fn) {
    return $forEach(this, fn);
  }
});

var call$3 = functionCall;
var createAsyncIteratorProxy$2 = asyncIteratorCreateProxy;

var asyncIteratorWrap = createAsyncIteratorProxy$2(function () {
  return call$3(this.next, this.iterator);
}, true);

var $$6 = _export;
var toObject = toObject$y;
var isPrototypeOf = objectIsPrototypeOf;
var getAsyncIteratorFlattenable = getAsyncIteratorFlattenable$2;
var AsyncIteratorPrototype = asyncIteratorPrototype;
var WrapAsyncIterator$1 = asyncIteratorWrap;
var IS_PURE$3 = isPure;

// `AsyncIterator.from` method
// https://github.com/tc39/proposal-async-iterator-helpers
$$6({ target: 'AsyncIterator', stat: true, forced: IS_PURE$3 }, {
  from: function from(O) {
    var iteratorRecord = getAsyncIteratorFlattenable(typeof O == 'string' ? toObject(O) : O);
    return isPrototypeOf(AsyncIteratorPrototype, iteratorRecord.iterator)
      ? iteratorRecord.iterator
      : new WrapAsyncIterator$1(iteratorRecord);
  }
});

var call$2 = functionCall;
var aCallable$1 = aCallable$F;
var anObject$3 = anObject$11;
var isObject$1 = isObject$J;
var getIteratorDirect$3 = getIteratorDirect$o;
var createAsyncIteratorProxy$1 = asyncIteratorCreateProxy;
var createIterResultObject$1 = createIterResultObject$d;
var closeAsyncIteration$1 = asyncIteratorClose;

var AsyncIteratorProxy$1 = createAsyncIteratorProxy$1(function (Promise) {
  var state = this;
  var iterator = state.iterator;
  var mapper = state.mapper;

  return new Promise(function (resolve, reject) {
    var doneAndReject = function (error) {
      state.done = true;
      reject(error);
    };

    var ifAbruptCloseAsyncIterator = function (error) {
      closeAsyncIteration$1(iterator, doneAndReject, error, doneAndReject);
    };

    Promise.resolve(anObject$3(call$2(state.next, iterator))).then(function (step) {
      try {
        if (anObject$3(step).done) {
          state.done = true;
          resolve(createIterResultObject$1(undefined, true));
        } else {
          var value = step.value;
          try {
            var result = mapper(value, state.counter++);

            var handler = function (mapped) {
              resolve(createIterResultObject$1(mapped, false));
            };

            if (isObject$1(result)) Promise.resolve(result).then(handler, ifAbruptCloseAsyncIterator);
            else handler(result);
          } catch (error2) { ifAbruptCloseAsyncIterator(error2); }
        }
      } catch (error) { doneAndReject(error); }
    }, doneAndReject);
  });
});

// `AsyncIterator.prototype.map` method
// https://github.com/tc39/proposal-iterator-helpers
var asyncIteratorMap = function map(mapper) {
  anObject$3(this);
  aCallable$1(mapper);
  return new AsyncIteratorProxy$1(getIteratorDirect$3(this), {
    mapper: mapper
  });
};

var $$5 = _export;
var map = asyncIteratorMap;
var IS_PURE$2 = isPure;

// `AsyncIterator.prototype.map` method
// https://github.com/tc39/proposal-async-iterator-helpers
$$5({ target: 'AsyncIterator', proto: true, real: true, forced: IS_PURE$2 }, {
  map: map
});

var $$4 = _export;
var call$1 = functionCall;
var aCallable = aCallable$F;
var anObject$2 = anObject$11;
var isObject = isObject$J;
var getBuiltIn = getBuiltIn$C;
var getIteratorDirect$2 = getIteratorDirect$o;
var closeAsyncIteration = asyncIteratorClose;

var Promise$1 = getBuiltIn('Promise');
var $TypeError = TypeError;

// `AsyncIterator.prototype.reduce` method
// https://github.com/tc39/proposal-async-iterator-helpers
$$4({ target: 'AsyncIterator', proto: true, real: true }, {
  reduce: function reduce(reducer /* , initialValue */) {
    anObject$2(this);
    aCallable(reducer);
    var record = getIteratorDirect$2(this);
    var iterator = record.iterator;
    var next = record.next;
    var noInitial = arguments.length < 2;
    var accumulator = noInitial ? undefined : arguments[1];
    var counter = 0;

    return new Promise$1(function (resolve, reject) {
      var ifAbruptCloseAsyncIterator = function (error) {
        closeAsyncIteration(iterator, reject, error, reject);
      };

      var loop = function () {
        try {
          Promise$1.resolve(anObject$2(call$1(next, iterator))).then(function (step) {
            try {
              if (anObject$2(step).done) {
                noInitial ? reject(new $TypeError('Reduce of empty iterator with no initial value')) : resolve(accumulator);
              } else {
                var value = step.value;
                if (noInitial) {
                  noInitial = false;
                  accumulator = value;
                  loop();
                } else try {
                  var result = reducer(accumulator, value, counter);

                  var handler = function ($result) {
                    accumulator = $result;
                    loop();
                  };

                  if (isObject(result)) Promise$1.resolve(result).then(handler, ifAbruptCloseAsyncIterator);
                  else handler(result);
                } catch (error3) { ifAbruptCloseAsyncIterator(error3); }
              }
              counter++;
            } catch (error2) { reject(error2); }
          }, reject);
        } catch (error) { reject(error); }
      };

      loop();
    });
  }
});

var $$3 = _export;
var $some = asyncIteratorIteration.some;

// `AsyncIterator.prototype.some` method
// https://github.com/tc39/proposal-async-iterator-helpers
$$3({ target: 'AsyncIterator', proto: true, real: true }, {
  some: function some(predicate) {
    return $some(this, predicate);
  }
});

var $$2 = _export;
var call = functionCall;
var anObject$1 = anObject$11;
var getIteratorDirect$1 = getIteratorDirect$o;
var notANaN = notANan;
var toPositiveInteger = toPositiveInteger$5;
var createAsyncIteratorProxy = asyncIteratorCreateProxy;
var createIterResultObject = createIterResultObject$d;
var IS_PURE$1 = isPure;

var AsyncIteratorProxy = createAsyncIteratorProxy(function (Promise) {
  var state = this;
  var iterator = state.iterator;
  var returnMethod;

  if (!state.remaining--) {
    var resultDone = createIterResultObject(undefined, true);
    state.done = true;
    returnMethod = iterator['return'];
    if (returnMethod !== undefined) {
      return Promise.resolve(call(returnMethod, iterator, undefined)).then(function () {
        return resultDone;
      });
    }
    return resultDone;
  } return Promise.resolve(call(state.next, iterator)).then(function (step) {
    if (anObject$1(step).done) {
      state.done = true;
      return createIterResultObject(undefined, true);
    } return createIterResultObject(step.value, false);
  }).then(null, function (error) {
    state.done = true;
    throw error;
  });
});

// `AsyncIterator.prototype.take` method
// https://github.com/tc39/proposal-async-iterator-helpers
$$2({ target: 'AsyncIterator', proto: true, real: true, forced: IS_PURE$1 }, {
  take: function take(limit) {
    anObject$1(this);
    var remaining = toPositiveInteger(notANaN(+limit));
    return new AsyncIteratorProxy(getIteratorDirect$1(this), {
      remaining: remaining
    });
  }
});

var $$1 = _export;
var $toArray = asyncIteratorIteration.toArray;

// `AsyncIterator.prototype.toArray` method
// https://github.com/tc39/proposal-async-iterator-helpers
$$1({ target: 'AsyncIterator', proto: true, real: true }, {
  toArray: function toArray() {
    return $toArray(this, undefined, []);
  }
});

var $ = _export;
var anObject = anObject$11;
var AsyncFromSyncIterator = asyncFromSyncIterator;
var WrapAsyncIterator = asyncIteratorWrap;
var getIteratorDirect = getIteratorDirect$o;
var IS_PURE = isPure;

// `Iterator.prototype.toAsync` method
// https://github.com/tc39/proposal-async-iterator-helpers
$({ target: 'Iterator', proto: true, real: true, forced: IS_PURE }, {
  toAsync: function toAsync() {
    return new WrapAsyncIterator(getIteratorDirect(new AsyncFromSyncIterator(getIteratorDirect(anObject(this)))));
  }
});

var createUpdateStepwise = createUpdateStepwiseFactory(translateTimingStateVector);
var updateMediaElement = createUpdateMediaElement(pause, play, createSetCurrentTime(new WeakMap()), createSetPlaybackRate(881 / 882, new WeakMap(), 882 / 881));
var setTimingsrcWithCustomUpdateFunction = createSetTimingsrcWithCustomUpdateFunction(animationFrame, clearInterval, document, on, setInterval, updateMediaElement);
var setTimingsrc = createDefaultSetTimingsrc(createComputeVelocity, createSetTimingsrc, createUpdateGradually, createUpdateStepwise, determineSupportedPlaybackRateValues, setTimingsrcWithCustomUpdateFunction, createWindow());

exports.createSetTimingsrc = createSetTimingsrc;
exports.createUpdateGradually = createUpdateGradually;
exports.createUpdateStepwise = createUpdateStepwise;
exports.setTimingsrc = setTimingsrc;
exports.setTimingsrcWithCustomUpdateFunction = setTimingsrcWithCustomUpdateFunction;
