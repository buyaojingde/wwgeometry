import ModelActiveData from '../../../store/ModelActiveData';
/**
 * @author mrdoob / http://mrdoob.com/
 * Source: https://github.com/mrdoob/three.js/blob/master/examples/js/controls/PointerLockControls.js
 *
 * Adopted to common js by Javier Zapata
 *
 * Modified from PointerLockControls
 * Modified by jerry.hu
 *
 */
import debounce from 'lodash/debounce';
import HomeTypeData from '@/model/HomeTypeData';
import KeyMap, { eventAction } from '../../../global/KeyMap';
const CAMERA_MIN_HEIGHT = 20; // 相机可以移动到的最小过度
let THREE = window.THREE || require('three');

let RoamControl = function(camera, element = window.document) {
  var scope = this;

  camera.rotation.set(0, 0, 0);

  var pitchObject = new THREE.Object3D();
  pitchObject.add(camera);

  var yawObject = new THREE.Object3D();
  yawObject.position.y = 10;
  yawObject.add(pitchObject);

  var moveForward = false;
  var moveBackward = false;
  var moveLeft = false;
  var moveRight = false;
  var moveTop = false;
  var moveBottom = false;

  var isOnObject = false;
  var canJump = false;
  var isMouseDown = false;
  var isKeyDown = false;

  var changeEvent = { type: 'change' };

  var prevTime = performance.now();

  var velocity = new THREE.Vector3();

  var PI_2 = Math.PI / 2;

  /** move speed ratio */
  this.moveSpeedRatio = 1.0;

  this.enableUpDown = true;

  this.addEventListener('start', change => this.enabled && ModelActiveData.setChangingCamera(true));
  this.addEventListener('end', change => this.enabled && ModelActiveData.setChangingCamera(false));

  var onTouchMove = function(event) {
    console.log(event);
  };

  var onMouseMove = function(event) {
    if (scope.enabled === false || !isMouseDown) return;

    var movementX = event.deltaX || 0;
    var movementY = event.deltaY || 0;

    if (!scope.startRotation) {
      scope.startRotation = { y: yawObject.rotation.y, x: pitchObject.rotation.x };
    }
    yawObject.rotation.y = scope.startRotation.y + movementX * 0.0015;
    pitchObject.rotation.x = scope.startRotation.x + movementY * 0.0015;

    pitchObject.rotation.x = Math.max(-PI_2, Math.min(PI_2, pitchObject.rotation.x));

    scope.dispatchEvent({ type: 'changeRotation' });
  };

  var endMouseWheel = debounce(function() {
    // moveBackward = false
    // moveForward = false

    if (!isMouseDown && !isKeyDown) {
      scope.dispatchEvent({ type: 'end' });
    }
  }, 200);

  var endKeyDown = debounce(function() {
    isKeyDown = false;
    endMouseWheel();
    moveForward = false;
    moveBackward = false;
    moveLeft = false;
    moveRight = false;
    moveTop = false;
    moveBottom = false;
  }, 500);

  var onMouseWheel = function(event) {
    if (scope.enabled === false) return;

    event.preventDefault();
    event.stopPropagation();
    scope.dispatchEvent({ type: 'start' });

    yawObject.translateZ(event.deltaY * 0.5);
    scope.dispatchEvent(changeEvent);
    scope.dispatchEvent({ type: 'changePosition' });
    // if (event.deltaY < 0) {
    //   moveBackward = true
    // } else if (event.deltaY > 0) {
    //   moveForward = true
    // }

    endMouseWheel();
  };

  var onKeyDown = function(event) {
    if (scope.enabled === false) return;

    isKeyDown = true;

    const action = eventAction(event, KeyMap.viewControl3D);
    if (!action) {
      return;
    }
    switch (action) {
      case 'moveForward': // w
        moveForward = true;
        break;

      case 'moveLeft': // a
        moveLeft = true;
        break;

      case 'moveBackward': // s
        moveBackward = true;
        break;

      case 'moveRight': // d
        moveRight = true;
        break;

      case 'moveTop': // q
        if (scope.enableUpDown) {
          moveTop = true;
        }

        break;

      case 'moveBottom': // e
        if (scope.enableUpDown) {
          moveBottom = true;
        }
      // case 32: // space
      //   // if (canJump === true) velocity.y += 350
      //   // canJump = false
      //   break;
    }

    if (moveTop || moveBottom || moveRight || moveLeft || moveBackward || moveForward) {
      scope.dispatchEvent({ type: 'start' });
      endKeyDown();
    }
  };

  var onKeyUp = function(event) {
    endMouseWheel();
    isKeyDown = false;

    const action = eventAction(event, KeyMap.viewControl3D);
    if (!action) {
      return;
    }

    switch (action) {
      case 'moveForward': // w
        moveForward = false;
        break;

      case 'moveLeft': // a
        moveLeft = false;
        break;

      case 'moveBackward': // s
        moveBackward = false;
        break;

      case 'moveRight': // d
        moveRight = false;
        break;

      case 'moveTop': // q
        moveTop = false;
        break;

      case 'moveBottom': // e
        moveBottom = false;
        break;
    }
  };

  var onMouseDown = function(event) {
    isMouseDown = true;
    scope.startRotation = { y: yawObject.rotation.y, x: pitchObject.rotation.x };
    scope.dispatchEvent({ type: 'start' });
  };

  var onMouseUp = function(event) {
    isMouseDown = false;
    scope.startRotation = null;
    scope.dispatchEvent({ type: 'end' });
  };

  function onContextMenu(event) {
    if (scope.enabled === false) return;

    event.preventDefault();
  }

  element.setAttribute('tabindex', 0);
  element.addEventListener('keydown', onKeyDown, false);
  element.addEventListener('keyup', onKeyUp, false);

  element.addEventListener('wheel', onMouseWheel, false);
  element.addEventListener('contextmenu', onContextMenu, false);

  /** 监听鼠标按下状态，用于方向旋转控制 */
  // element.addEventListener('mousedown', onMouseDown, false);
  // element.addEventListener('mouseup', onMouseUp, false);
  // element.addEventListener('mousemove', onMouseMove, false);
  //
  // element.addEventListener('touchstart', onMouseDown, false);
  // element.addEventListener('touchend', onMouseUp, false);
  // element.addEventListener('touchmove', onMouseMove, false);
  const hammer = new Hammer.Manager(element);
  hammer.add(new Hammer.Pan({ threshold: 0, pointers: 0 }));
  hammer.add(new Hammer.Pinch());
  hammer.on('panstart', onMouseDown);
  hammer.on('panmove', onMouseMove);
  hammer.on('panend', onMouseUp);
  // hammer.on('panup', onMouseUp);

  window.addEventListener('mouseup', onMouseUp, false);
  this.enabled = false;

  this.getObject = function() {
    return yawObject;
  };

  // this.getRotation = function () {
  //   return { x: 0, y: yawObject.rotation.y, z: pitchObject.rotation.z }
  // }

  this.isOnObject = function(boolean) {
    isOnObject = boolean;
    canJump = boolean;
  };

  this.getRotation = function() {
    let rotation = new THREE.Euler(0, 0, 0, 'YXZ');
    rotation.set(pitchObject.rotation.x, yawObject.rotation.y, 0);
    return rotation;
  };

  this.setRotation = function(x, y, z) {
    pitchObject.rotation.x = x;
    yawObject.rotation.y = y;
  };

  this.getDirection = (function() {
    // assumes the camera itself is not rotated

    var direction = new THREE.Vector3(0, 0, -1);
    var rotation = new THREE.Euler(0, 0, 0, 'YXZ');

    return function(v) {
      rotation.set(pitchObject.rotation.x, yawObject.rotation.y, 0);

      v.copy(direction).applyEuler(rotation);

      return v;
    };
  })();

  this.update = function() {
    if (scope.enabled === false) return;

    var time = performance.now();
    var delta = (time - prevTime) / 1000;

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;
    velocity.y -= velocity.y * 10.0 * delta;

    if (moveForward || moveBackward || moveLeft || moveRight || moveTop || moveBottom) {
      if (moveForward) velocity.z -= 200.0 * delta * this.moveSpeedRatio;
      if (moveBackward) velocity.z += 200.0 * delta * this.moveSpeedRatio;

      if (moveLeft) velocity.x -= 200.0 * delta * this.moveSpeedRatio;
      if (moveRight) velocity.x += 200.0 * delta * this.moveSpeedRatio;

      if (moveTop) velocity.y += 200.0 * delta * this.moveSpeedRatio;
      if (moveBottom) velocity.y -= 200.0 * delta * this.moveSpeedRatio;

      scope.dispatchEvent(changeEvent);
      scope.dispatchEvent({ type: 'changePosition' });
    }

    yawObject.translateX(velocity.x * delta * this.moveSpeedRatio);
    yawObject.translateZ(velocity.z * delta * this.moveSpeedRatio);
    yawObject.translateY(velocity.y * delta * this.moveSpeedRatio);

    let yValue = yawObject.position.y;
    yawObject.position.setY(Math.min(Math.max(yValue, CAMERA_MIN_HEIGHT), HomeTypeData.curLevelHeight));

    prevTime = time;
  };
};

RoamControl.prototype = Object.create(THREE.EventDispatcher.prototype);
RoamControl.prototype.constructor = RoamControl;
// return RoamControl

// module.exports = RoamControl
export default RoamControl;
