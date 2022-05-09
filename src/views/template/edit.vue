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
<!--            <el-autocomplete-->
<!--              v-model="queryLabelInput"-->
<!--              placeholder="请输入标签名称"-->
<!--              :fetch-suggestions="querySearchAsync"-->
<!--              @select="handleSelect"-->
<!--              style="position: center">-->
<!--              <template slot="prepend">输入选择标签：</template>-->
<!--            </el-autocomplete>-->
            <el-select style="width: 90%" v-model="searchSelectValue" autocomplete="true" filterable remote :remote-method="querySearchAsync" :loading="searchLabelLoading" @change="handleSelect">
              <el-option v-for="sl in searchLabelResult" :key="sl.id" :value="sl.id">
                <span style="float: left">{{ sl.name }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">{{ dataTypeName(sl.dataType) }}</span>
              </el-option>
            </el-select>
          </el-header>
          <el-main>
            <el-row v-for="sl in selectedLabels" :key="sl._key">
              <el-tooltip class="item" effect="dark" content="点击高亮显示标签的位置，再次点击取消" placement="left-start">
                <el-tag closable @close="closeSelectedLabel(sl)" @click="findMappedLabel(sl._key)">{{$t(sl.name)}}-[{{dataTypeName(sl.dataType)}}]</el-tag>
              </el-tooltip>
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

  private searchLabelLoading = false;

  private searchSelectValue = '';

  private searchLabelResult = [];

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

  private dataTypeName(dataType:number) {
    let name;
    switch (dataType) {
      case 0:
        name = '文本'
        break
      case 1:
        name = '图片'
        break
      default:
        name = '文本'
    }
    return name
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
        rl._key = rl.locationPk
        this.selectedLabels.push(rl)
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
    const relatedLabelList = []
    this.selectedLabels.forEach(sl => {
      relatedLabelList.push({
        labelId: sl.id,
        locationPk: sl._key
      })
    })

    const st = {
      templateId: this.templateId,
      content: this.html,
      relatedLabelList: relatedLabelList
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

  private querySearchAsync(queryString: string) {
    queryLabels({name: queryString}).then(response => {
      console.log(response)
      const data = response.data;
      let r = []
      for (const d of data) {
        r.push(d)
      }
      console.log(r)
      this.searchLabelResult = r;
      // cb(r)
    })
  }

  private handleSelect(id) {
    console.log(id)
    if (id) {
      let item;
      this.searchLabelResult.forEach(slr => {
        if (slr.id === id) {
          item = slr
        }
      })
      if (item) {
        this.createLabelOnEditor(item)
      }
    }
    this.searchSelectValue = ''
  }

  private createLabelOnEditor(item) {
    item._key = new Date().getTime() + '' + (Math.random() * 1000).toFixed(0) + ''
    this.addSelectedLabel(item)
    const infoStr = encodeURIComponent(JSON.stringify(item));
    const ctt = `<span class="customLabel" data-mitosis-type="customLabel" data-mitosis-label-data-type="${item.dataType}" data-mitosis-label-pk="${item._key}" data-mitosis-is-void data-mitosis-is-inline data-value="${item.id}" data-info="${infoStr}">#${item.name}#</span>`;
    (this.$refs.tinymce as Tinymce).insertContent(ctt);
  }

  private addSelectedLabel(item) {
    this.selectedLabels.push(item)
  }

  private closeSelectedLabel(item) {
    this.$confirm('确认删除标签?删除后请清理模版中的占位符', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      this.doRemoveSelectedLabel(item)
    }).catch((e) => {
      console.log(e)
      this.$message({
        type: 'info',
        message: '已取消'
      });
    });
  }

  private doRemoveSelectedLabel(item) {
    (this.$refs.tinymce as Tinymce).removeNode(`span.customLabel[data-mitosis-label-pk="${item._key}"]`)
    const tmpSls = []
    this.selectedLabels.forEach(tsl => {
      if (tsl.id != item.id) {
        tmpSls.push(tsl)
      }
    })
    this.selectedLabels = tmpSls
  }

  private findMappedLabel(item) {
    (this.$refs.tinymce as Tinymce).findMappedNodeOnEditor(`span.customLabel[data-mitosis-label-pk="${item}"]`)
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
