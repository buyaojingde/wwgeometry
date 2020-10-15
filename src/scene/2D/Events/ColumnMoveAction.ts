import Container = PIXI.Container;
import {reaction} from 'mobx';
import Model2DActive from '../../../store/Model2DActive';
import BaseEvent from '../../Base/BaseEvent';
import Column from '../../Model/Home/Column';
import PickupController from '../Manager/PickupController';
import Vector2D from '../../Model/Geometry/Vector2D';
import Scene2D from '../index';

/**
 * 构建移动动作
 * * by lianbo.guo
 **/
export default class ColumnMoveAction extends BaseEvent {
    public view: Container; // 墙体移动时所需要显示的一些内容
    private column: Column;
    private pickupCtrl: PickupController;
    private _scene2D: Scene2D;
    private offsetPos: Vector2D;

    private _stage: Container;

    /**判断墙体是否移动，用于区分单纯的墙体点击事件 */
    private isMoved: boolean = false;

    public constructor(scene2D: Scene2D) {
        super(scene2D.DOMEventListener);
        this._scene2D = scene2D;
        this.pickupCtrl = scene2D.pickupController;

        this._stage = scene2D.getStage();

        this.initControllerView();

        reaction(
            () => Model2DActive.dragingColumn,
            editingWall => {
                const enable = editingWall instanceof Column;
                if (enable) {
                    this.column = editingWall;
                    console.log('got you');
                }
                this.enable = enable;
            },
        );
    }

    public initEvents() {
        this.view.visible = true;

        this.on('input.move', event => this.moveAction(event));
        this.on('win.input.end', event => {
            this.moveDone(event);
        });
    }

    public dispose() {
        super.dispose();
        this.view.visible = false;
        this.offsetPos = null;
        // this.startWall = null;
        this.isMoved = false;
    }

    /**
     * 移动动作
     * @param event
     */
    protected moveAction(event) {
        // 只要接收到moveAction事件，是否移动标识就置为false
        // console.profile('moveWall');
        this.column.isMoving = true;
        const {pageX, pageY} = event;
        const position = Scene2D.getInstance().pickupController.getPoint(pageX, pageY);
        const enableAbsorb = !event.ctrlKey && !event.metaKey;

        let v = new Vector2D(position.x, position.y);
    }


    // public moveWall(pos: Vector2D, allowance: number = 10): void {}

    public moveDone(event) {
        // console.profile('move done');
        this.column.isMoving = false;
        if (!this.isMoved) {
            return;
        }

        // console.profileEnd();
    }

    /**
     * 初始化ControllerView
     */
    private initControllerView() {
        this.view = new Container();

        this._scene2D.getStage().addChild(this.view);

        this.view.visible = false;
    }


}
