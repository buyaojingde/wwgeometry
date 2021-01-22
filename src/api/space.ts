import request from '../utils/request';

export function getSpcaeListInfo(bimmpaCode: string) {
  return request({
    url: `/map/v2/space/listSpace/${bimmpaCode}`,
    method: 'get',
  });
}

export function editSpaceInfo(data: any) {
  return request({
    url: '/map/v2/space/edit',
    method: 'post',
    data: data,
  });
}
