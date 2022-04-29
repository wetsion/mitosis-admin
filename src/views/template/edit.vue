<template>
  <el-row :gutter="20" style="padding-left: 5px">
    <el-col :span="16">
      <el-tabs v-model="activeTab" type="card" @tab-click="clickTabs">
        <el-tab-pane label="编辑器模式" name="editorMode">
          <div style="border: 1px solid #ccc;margin-left: 10px;">
            <Toolbar
              style="border-bottom: 1px solid #ccc"
              :editor="editor"
              :defaultConfig="toolbarConfig"
              :mode="mode"
            />
            <Editor
              style="height: 500px; overflow-y: hidden;"
              v-model="html"
              :defaultConfig="editorConfig"
              :mode="mode"
              @onCreated="onCreated"
            />
            <MentionModal
              v-if="isShowModal"
              @hideMentionModal="hideMentionModal"
              @insertMention="insertMention"
            ></MentionModal>
          </div>
        </el-tab-pane>
        <el-tab-pane label="源码模式" name="sourceMode">
          <div style="width: 100%">
            <el-input
              type="textarea"
              :rows="100"
              placeholder="请输入内容"
              v-model="htmlSource">
            </el-input>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-col>
    <el-col :span="8">
      <div style="border: 1px solid #ccc;margin-left: 10px;height: 500px">
        <el-autocomplete
          v-model="queryLabelInput"
          placeholder="请输入标签名称"
          :fetch-suggestions="querySearchAsync"
          @select="handleSelect"
          style="position: center">
          <template slot="prepend">输入选择标签：</template>
        </el-autocomplete>
      </div>
    </el-col>
  </el-row>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import { queryLabels } from '@/api/template';
import { Boot } from '@wangeditor/editor';
import '@wangeditor/editor/dist/css/style.css';
import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
import mentionModule from '@wangeditor/plugin-mention';
import MentionModal from './MentionModal.vue';

Boot.registerModule(mentionModule);

@Component({
  name: 'TemplateEdit',
  components: {
    Editor,
    Toolbar,
    MentionModal
  }
})
export default class extends Vue {

  private editor = null;
  private html = '<p>hello</p>';
  private toolbarConfig = { };
  private editorConfig = {
    placeholder: '请输入内容...',
    EXTEND_CONF: {
      mentionConfig: {
        showModal: this.showMentionModal,
        hideModal: this.hideMentionModal,
      },
    }
  };
  private mode = 'default';
  private isShowModal = false;
  private activeTab = '';
  private htmlSource = '';
  private queryLabelInput = '';
  private queryLabelResult = [];

  private onCreated(editor: object) {
    this.editor = Object.seal(editor) // 一定要用 Object.seal() ，否则会报错
  }
  private showMentionModal() {
    this.isShowModal = true
  }
  private hideMentionModal() {
    this.isShowModal = false
  }
  private insertMention(id: string, name: string) {
    const mentionNode = {
      type: 'mention', // 必须是 'mention'
      value: name,
      info: { id },
      children: [{ text: '' }], // 必须有一个空 text 作为 children
    }
    const editor = this.editor
    if (editor) {
      editor.restoreSelection() // 恢复选区
      editor.deleteBackward('character') // 删除 '@'
      editor.insertNode(mentionNode) // 插入 mention
      editor.move(1) // 移动光标
    }
    console.log(this.editor.getHtml())
  }
  private clickTabs(tab) {
    console.log(tab)
    if (tab.name === 'editorMode') {
      const editor = this.editor
      if (editor) {
        // editor.focus()
      }
      this.htmlSource = ''
    } else if (tab.name === 'sourceMode') {
      const editor = this.editor
      if (editor) {
        this.htmlSource = editor.getHtml()
      }
    }
  }
  private loadAllLabels() {

  }
  private querySearchAsync(queryString: string, cb) {
    queryLabels({name: queryString}).then(response => {
      console.log(response)
      const data = response.data;
      let r = []
      for (const d of data) {
        r.push({value: d.name, id: d.id, code: d.code})
      }
      console.log(r)
      cb(r)
    })
  }
  private handleSelect(item) {
    console.log(item)
    const customLabelNode = {
      type: 'customLabel', // 必须是 'mention'
      value: item.code,
      info: { id: item.id },
      children: [{ text: '' }], // 必须有一个空 text 作为 children
    }
    const editor = this.editor
    if (editor) {
      editor.restoreSelection()
      editor.insertNode(customLabelNode) // 插入
      editor.move(1) // 移动光标
    }
  }

  mounted() {
    // 模拟 ajax 请求，异步渲染编辑器
    // setTimeout(() => {
    //   this.html = '<p>模拟 Ajax 异步设置内容 HTML</p>'
    // }, 1500)
    this.activeTab = 'editorMode'
    this.loadAllLabels()
  }

  public beforeDestroy() {
    const editor = this.editor
    if (editor == null) return
    editor.destroy() // 组件销毁时，及时销毁编辑器
  }

}
</script>

<style scoped>

</style>
