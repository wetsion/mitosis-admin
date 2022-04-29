import request from '@/utils/request';

export const queryLabels = (data: any) =>
  request({
    url: '/label/query',
    method: 'post',
    data
  })
