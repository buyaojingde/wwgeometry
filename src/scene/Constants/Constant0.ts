/**
* by lianbo.guo
 * @Description 墙体绘制相关常量
 */
export enum DRAWING_WALL_MODE {
  CENTER, // 墙中线绘制
  INNER, // 前内线绘制
}

export const MIN_ADSORPTION_DISTANCE = 10;

export const FILL_NORMAL_OPTIONS = {
  color: 0x78ceb5,
  alpha: 0.8,
};

export const FILL_ERROR_OPTIONS = {
  color: 0xee6644,
  alpha: 0.1,
};

export const COLOR_MAP = {
  GREEN: 0x00bb88,
  BLUE: 0x0af3ff,
  BLACK: 0x000000,
  RED: 0xff0000,
  GRAY: 0x333333,
  WHITE: 0xffffff,
};

export const KEY_NUMBER_MAP = {
  LEFT_KEY: 0,
  RIGHT_KEY: 2,
  CENTER_KEY: 1,
};

export const KEY_DESC_MAP = {
  ESC: 'Escape',
  TAB: 'Tab',
};

export const CURSOR_STYLE = {
  CROSS_HAIR: 'crosshair',
  INHERIT: 'inherit',
};
