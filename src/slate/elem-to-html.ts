/**
 * @description elem to html
 * @author wangfupeng
 */

import { SlateElement } from '@wangeditor/editor'
import { CustomLabelElement } from './custom-types'

// 生成 html 的函数
function customLabelToHtml(elem: SlateElement, childrenHtml: string): string {
  const { value = '', info = {} } = elem as CustomLabelElement
  const infoStr = encodeURIComponent(JSON.stringify(info))
  return `<span data-w-e-type="customLabel" data-w-e-is-void data-w-e-is-inline data-value="${value}" data-info="${infoStr}">${value}</span>`
}

// 配置
const conf = {
  type: 'customLabel', // 节点 type ，重要！！！
  elemToHtml: customLabelToHtml,
}

export default conf
