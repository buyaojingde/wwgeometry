/**
 * * by lianbo.guo
 **/
import { Application } from "pixi.js";
import HomePlan2D from "../2D/Layer/HomePlan";
import DOMEventManager from "../2D/Utils/DOMEventManager";
import Home from "../Model/Home/Home";
// import Stage = PIXI.display.Stage;

export interface IScene2D {
  homePlan: HomePlan2D;
  DOMEventListener: DOMEventManager;
  pickupController: any;
  home: Home;
  scaleNumber: number;

  // @ts-ignore
  renderer();

  // @ts-ignore
  render();

  // @ts-ignore
  startRender();

  // @ts-ignore
  stopRender();

  // @ts-ignore
  getStage(): Stage;

  getApplication(): Application;
}
