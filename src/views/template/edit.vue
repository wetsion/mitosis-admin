<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="16"><h2>{{templateTitle}}</h2></el-col>
      <el-col :span="4"><el-button type="primary" @click="confirmSaveTemplate" style="horiz-align: right">{{ $t('template.saveTemplate') }}</el-button></el-col>
    </el-row>
    <el-row :gutter="20" style="padding-left: 5px">
      <el-col :span="16">
        <el-tabs v-model="activeTab" type="card" @tab-click="clickTabs">
          <el-tab-pane label="编辑器" name="editorMode">
            <div style="border: 1px solid #ccc;margin-left: 10px;">
              <tinymce ref="tinymce" v-if="tinymceActive" v-model="html"/>
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
import { Component, Vue, Prop } from 'vue-property-decorator';
import { queryLabels, previewTemplates, saveTemplate } from '@/api/template';
import Tinymce from '@/components/Tinymce/index.vue'

@Component({
  name: 'testTemplate',
  components: {
    Tinymce
  }
})
export default class extends Vue{
  private templateId = 0;
  private templateTitle = '';
  private templateContent = '';

  private html = '<p>hello</p>';
  private activeTab = '';
  private htmlSource = '';
  private queryLabelInput = '';
  private queryLabelResult = [];

  private selectedLabels = [];

  // created() {
  //   const id = this.$route.params && this.$route.params.id;
  //   this.fetchTemplateData(parseInt(id))
  // }
  private tinymceActive = true

  deactivated() {
    this.tinymceActive = false
  }

  activated() {
    this.tinymceActive = true
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

  private clickTabs(tab) {
    console.log(tab)
    if (tab.name === 'editorMode') {
      this.htmlSource = ''
    } else if (tab.name === 'sourceMode') {
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
    this.addSelectedLabel(item)
    const infoStr = encodeURIComponent(JSON.stringify(item));
    const ctt = `<span style="background: #00ff80;margin-left: 2px" data-mitosis-type="customLabel" data-mitosis-is-void data-mitosis-is-inline data-value="${item.value}" data-info="${infoStr}">#${item.value}#</span>`;
    (this.$refs.tinymce as Tinymce).insertContent(ctt);
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
  }

  private insertSelectedLabelAgain(item) {
    console.log(item)
    this.createLabelOnEditor(item)
  }

  mounted() {
    this.activeTab = 'editorMode'
    this.loadAllLabels()
    const id = this.$route.params && this.$route.params.id;
    this.fetchTemplateData(parseInt(id))
  }

};
</script>

<style scoped>

</style>
