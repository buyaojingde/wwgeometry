import BackTrack from '../../src/utils/Math/geometry/algorithm/BackTrack';

/*
 * @Author: lianbo
 * @Date: 2021-03-29 00:13:08
 * @LastEditors: lianbo
 * @LastEditTime: 2021-03-29 00:24:33
 * @Description:
 */
describe('backtrack', () => {
  it('bbBacktrack', () => {
    const capa = 16;
    const w = [10, 8, 5];
    const v = [5, 4, 1];
    const result = BackTrack.bbBacktrack(w, v, capa);
    console.log(result);

    expect(result.BestValue).toBe(6);
  });
});
