import Container = PIXI.Container;
import {computed, observable} from 'mobx';
import {IScene2D} from '../../Interface/IScene';
import Scene2D from '../index';
import View2DData from '../../../store/View2DData';

const onDrag: any = {
    start(event) {
        this.data = event.data;
        this.startPosition = this.data.getLocalPosition(onDrag.getParent(this));
        this.dragging = true;
        event.localPoint = this.startPosition;
        this.emit('input.start', event);
    },
    end(event) {
        this.dragging = false;
        this.startPosition = null;
        this.data = null;
        this.emit('drag.end', event);
        this.emit('input.end');
    },
    getParent(self) {
        if (self.parentReal || !self.parent) {
            return self;
        }

        return this.getParent(self.parent);
    },
    move(callback) {
        // tslint:disable-next-line:space-before-function-paren
        return function () {
            if (this.dragging) {
                const parent = onDrag.getParent(this);
                const newPosition = this.data.getLocalPosition(parent);

                const startPosition = this.startPosition;

                this.emit('input.move', newPosition);

                callback(newPosition, startPosition);
            }
        };
    },
};
export default class DragContainer extends Container {
    protected _disposeArr: Array<() => void> = [];
    public interactive = true;
    public cursor = 'pointer';

    @observable
    public _parentSelf: Container = null; // 用于事件响应的parent,不能与原有parent重叠，会出现问题

    @observable
    public isHover: boolean = false;

    public constructor() {
        super();

        this.on('added', () => {
            setTimeout(() => {
                this._parentSelf = this.parent;
            });
        });
        this.on('removed', () => {
            setTimeout(() => {
                this._parentSelf = this.parent;
                !this.parent && this.destroy();
            });
        });

        this.on('mouseover', () => {
                this.isHover = true;
                console.log('hover');
            }
        )
            .on('mouseout', () => (this.isHover = false))
            .on('mousedown', onDrag.start)
            .on('touchstart', onDrag.start)
            .on('mouseup', onDrag.end)
            .on('mouseupoutside', onDrag.end)
            .on('touchend', onDrag.end)
            .on('touchendoutside', onDrag.end)
            .on(
                'mousemove',
                onDrag.move((...args) => {
                    this.emit('drag', ...args);
                }),
            )
            .on(
                'touchmove',
                onDrag.move((...args) => {
                    this.emit('drag', ...args);
                }),
            );
    }

    public destroy(...args) {
        super.destroy(...args);
        this._disposeArr.forEach(dispose => dispose());
        this._disposeArr = [];
        this._parentSelf = null;
    }

    public get scene2D(): IScene2D {
        const getScene = instance => {
            if (!instance) {
                return null;
            }
            return instance.name === 'scene2D'
                ? instance
                : getScene(instance._parentSelf || instance.parent);
        };

        return getScene(this._parentSelf);
    }

    @computed
    public get scaleNum() {
        return View2DData.scaleNumber;
    }
}
