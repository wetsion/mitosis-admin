/**
 * @description mention element
 * @author wangfupeng
 */

type CustomLabelEmptyText = {
  text: ''
}
export type CustomLabelElement = {
  type: 'customLabel'
  value: string
  info: any
  children: CustomLabelEmptyText[] // void 元素必须有一个空 text
}
