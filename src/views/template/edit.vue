<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="16"><h2>{{templateTitle}}</h2></el-col>
      <el-col :span="4"><el-button type="primary" @click="confirmSaveTemplate" style="horiz-align: right">{{ $t('template.saveTemplate') }}</el-button></el-col>
    </el-row>
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
          <el-header>
            <el-autocomplete
              v-model="queryLabelInput"
              placeholder="请输入标签名称"
              :fetch-suggestions="querySearchAsync"
              @select="handleSelect"
              style="position: center">
              <template slot="prepend">输入选择标签：</template>
            </el-autocomplete>
          </el-header>
          <el-main>
            <el-row v-for="sl in selectedLabels" :key="sl.id">
              <el-tag closable @close="closeSelectedLabel(sl)" @click="insertSelectedLabelAgain(sl)">{{$t(sl.value)}}</el-tag>
            </el-row>
          </el-main>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import { queryLabels, previewTemplates, saveTemplate } from '@/api/template';
import { Boot, DomEditor, SlateTransforms, SlateElement } from '@wangeditor/editor';
import '@wangeditor/editor/dist/css/style.css';
import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
import mentionModule from '@wangeditor/plugin-mention';
import customLabelModule from '@/slate/index'
import MentionModal from './MentionModal.vue';
import { ElementWithId } from '@wangeditor/core/dist/core/src/editor/interface';

Boot.registerModule(mentionModule);
Boot.registerModule(customLabelModule);

@Component({
  name: 'TemplateEdit',
  components: {
    Editor,
    Toolbar,
    MentionModal
  }
})
export default class extends Vue {

  private templateId = 0;
  private templateTitle = '';
  private templateContent = '';

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

  private selectedLabels = [];

  created() {
    const id = this.$route.params && this.$route.params.id;
    this.fetchTemplateData(parseInt(id))
  }

  private async fetchTemplateData(id:number) {
    const {data} = await previewTemplates(id)
    this.templateId = data.template.id
    this.templateContent = data.template.content
    this.html = this.templateContent
    this.templateTitle = data.template.title
    if (data.relatedLabels && data.relatedLabels.length > 0) {
      this.selectedLabels = []
      data.relatedLabels.forEach(rl => {
        const tl = {
          value: rl.name,
          id: rl.id,
          code: rl.code
        }
        this.selectedLabels.push(tl)
      })
    }
  }

  private confirmSaveTemplate() {
    this.$confirm('确认已完成编辑保存模版?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      this.doSaveTemplate()
    }).catch(() => {
      this.$message({
        type: 'info',
        message: '已取消'
      });
    });
  }

  private async doSaveTemplate() {
    const selectedLabelIdList = []
    this.selectedLabels.forEach(sl => {
      selectedLabelIdList.push(sl.id)
    })
    const st = {
      templateId: this.templateId,
      content: this.html,
      relatedLabels: selectedLabelIdList
    }
    const {data} = await saveTemplate(st)
    if (data) {
      this.$message({
        type: 'success',
        message: '保存成功!'
      });
    } else {
      this.$message({
        type: 'error',
        message: '保存失败!'
      });
    }
  }

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
    this.createLabelOnEditor(item)
  }

  private createLabelOnEditor(item) {
    const customLabelNode = {
      type: 'customLabel', // 必须是 'mention'
      value: item.code,
      info: { id: item.id },
      children: [{ text: '' }], // 必须有一个空 text 作为 children
    }
    const editor = this.editor
    if (editor) {
      this.addSelectedLabel(item)
      editor.restoreSelection()
      editor.insertNode(customLabelNode) // 插入
      editor.move(1) // 移动光标
    }
  }

  private addSelectedLabel(item) {
    let en = this.selectedLabels.filter(sl => {
      return sl.id === item.id
    }).length;
    if (en >= 1) {
      return;
    } else {
      this.selectedLabels.push(item)
    }
  }

  private closeSelectedLabel(item) {
    console.log(item)
    const editor = this.editor;
    if (editor) {
      let nodes: ElementWithId[] =  editor.getElemsByType('customLabel');
      if (nodes.length === 0) {
        return;
      }
      let filteredNodes = nodes.filter(nd => {
        let tnd = JSON.parse(JSON.stringify(nd))
        return tnd.info.id === item.id;
      })
      console.log(filteredNodes)
    }
  }

  private insertSelectedLabelAgain(item) {
    console.log(item)
    this.createLabelOnEditor(item)
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
