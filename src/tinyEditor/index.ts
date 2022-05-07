import Vue from 'vue';

const componentList = require.context('.', true, /index.vue/);

const hyphenate = (name) => {
  return name.replace(/\B([A-Z])/g, '-$1').toLowerCase()
}

componentList.keys().forEach(item => {
  const componentItem = componentList(item).default
  Vue.component(hyphenate(componentItem.name), componentItem)
});
