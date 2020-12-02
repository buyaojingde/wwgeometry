import MathUtils from "../math/MathUtils";

export default class Constant {
  public static colorMap = {
    GREEN: 0x00bb88,
    BLUE: 0x0af3ff,
    BLACK: 0x000000,
    RED: 0xff0000,
    GRAY: 0x333333,
    WHITE: 0xffffff,
    DeepPink: 0xff1493,
    MidnightBlue: 0x191970,
    Yellow: 0xffff00,
  };

  /**
   * @author lianbo
   * @date 2020-11-11 14:58:35
   * @Description: 16进制的颜色转换为#开头的字符串
   */
  public static colorHex(colorNumber: number) {
    const colorStr = colorNumber.toString(16);
    return "#" + colorStr;
  }

  /**
   * @author lianbo
   * @date 2020-11-11 14:59:08
   * @Description: 以#开头的字符串转16进制的数字
   */
  public static colorHexNumber(color: string) {
    const reg: RegExp = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
    let result = 0x000000;
    if (reg.test(color)) {
      result = Number.parseInt(color.slice(1), 16);
    }
    return result;
  }

  /**
   * @author lianbo
   * @date 2020-11-11 14:59:42
   * @Description: rgb开头额转16进制的数字
   */
  public static rgbToHex(color: string): string {
    const reg = /^(rgb|RGB)/;
    if (reg.test(color)) {
      let strHex = "#";
      // 把RGB的3个数值变成数组
      const colorArr = color.replace(/(?:\(|\)|rgb|RGB)*/g, "").split(",");
      // 转成16进制
      for (let i = 0; i < colorArr.length; i++) {
        let hex = Number(colorArr[i]).toString(16);
        if (hex === "0") {
          hex += hex;
        }
        strHex += hex;
      }
      return strHex;
    } else {
      return String(color);
    }
  }

  /**
   * @author lianbo
   * @date 2020-11-11 15:00:40
   * @Description:转化RGB形式的字符串
   */
  public static colorRgb(colorI: string): string {
    // 16进制颜色值的正则
    const reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
    // 把颜色值变成小写
    let color = colorI.toLowerCase();
    if (reg.test(color)) {
      // 如果只有三位的值，需变成六位，如：#fff => #ffffff
      if (color.length === 4) {
        let colorNew = "#";
        for (let i = 1; i < 4; i += 1) {
          colorNew += color.slice(i, i + 1).concat(color.slice(i, i + 1));
        }
        color = colorNew;
      }
      // 处理六位的颜色值，转为RGB
      const colorChange = [];
      for (let i = 1; i < 7; i += 2) {
        colorChange.push(parseInt("0x" + color.slice(i, i + 2)));
      }
      return "RGB(" + colorChange.join(",") + ")";
    } else {
      return color;
    }
  }

  /**
   * @author lianbo
   * @date 2020-11-25 20:36:19
   * @Description: 随机颜色
   */
  public static colorRandom() {
    return (
      MathUtils.getRandomInt(0, 255) * 10000 +
      MathUtils.getRandomInt(0, 255) * 100 +
      MathUtils.getRandomInt(0, 255)
    );
  }
}
