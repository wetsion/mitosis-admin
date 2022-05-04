import request from '@/utils/request';

export const queryLabels = (data: any) =>
  request({
    url: '/label/query',
    method: 'post',
    data
  })

export const pageTemplates = (data: any) =>
  request({
    url: '/template/page?title=' + data.title + '&page=' + data.page + '&pageSize=' + data.limit,
    method: 'get'
  })

export const previewTemplates = (data: any) =>
  request({
    url: '/template/preview?templateId=' + data,
    method: 'get'
  })

export const createTemplate = (data: any) =>
  request({
    url: '/template/create',
    method: 'post',
    data
  })

export const saveTemplate = (data: any) =>
  request({
    url: '/template/save',
    method: 'post',
    data
  })
