/**
* * by lianbo.guo
 **/
import { Application } from 'pixi.js';
import HomePlan2D from '../2D/Layer/HomePlan';
import Stage = PIXI.display.Stage;
import DOMEventManager from '../3D/Manager/DOMEventManager';
import Home from '../Model/Home/Home';

export interface IScene2D {
  renderer();
  render();
  startRender();
  stopRender();
  getStage(): Stage;
  homePlan: HomePlan2D;
  DOMEventListener: DOMEventManager;
  pickupController: any;

  getApplication(): Application;
  home: Home;

  scaleNumber: number;
}
