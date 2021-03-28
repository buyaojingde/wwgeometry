/*
 * @Author: lianbo
 * @Date: 2021-03-29 00:02:24
 * @LastEditors: lianbo
 * @LastEditTime: 2021-03-29 00:22:23
 * @Description: 回溯法
 */
class BackTrack {
  /**
   * @Author: lianbo
   * @Date: 2021-03-29 00:03:26
   * @LastEditors: lianbo
   * @Description: 01背包问题
   * @param {number} i
   * @return {*}
   */
  public bbBacktrack(w: any, v: any, capacity: number) {
    const n = w.length;
    const x: any = []; //x[i]=1代表物品i放入背包，0代表不放入

    let CurWeight = 0; //当前放入背包的物品总重量
    let CurValue = 0; //当前放入背包的物品总价值

    let BestValue = 0; //最优值；当前的最大价值，初始化为0
    const BestX: any[] = []; //最优解；BestX[i]=1代表物品i放入背包，0代表不放入
    const backtrack = (t: number) => {
      if (t > n - 1) {
        //如果找到了一个更优的解
        if (CurValue > BestValue) {
          //保存更优的值和解
          BestValue = CurValue;
          for (let i = 0; i < n; ++i) BestX[i] = x[i];
        }
      } else {
        //遍历当前节点的子节点：0 不放入背包，1放入背包
        for (let i = 0; i <= 1; ++i) {
          x[t] = i;

          if (i == 0) {
            //不放入背包
            backtrack(t + 1);
          } //放入背包
          else {
            //约束条件：放的下
            if (CurWeight + w[t] <= capacity) {
              CurWeight += w[t];
              CurValue += v[t];
              backtrack(t + 1);
              CurWeight -= w[t];
              CurValue -= v[t];
            }
          }
        }
      }
      //PS:上述代码为了更符合递归回溯的范式，并不够简洁
    };
    backtrack(0);
    return { BestValue, BestX };
  }
}
export default new BackTrack();
