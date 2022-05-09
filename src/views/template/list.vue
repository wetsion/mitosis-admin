<template>
  <div class="app-container">
    <el-button
      type="primary"
      @click="handleCreateTemplate"
    >
      {{ $t('template.createTemplate') }}
    </el-button>
    <el-dialog
      :visible.sync="dialogVisible"
      :title="$t('template.createTemplate')"
    >
      <el-form
        :model="template"
        label-width="80px"
        label-position="left"
      >
        <el-form-item label="Title">
          <el-input
            v-model="template.title"
            placeholder="Role Name"
          />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button
          type="danger"
          @click="dialogVisible=false"
        >
          {{ $t('template.cancelCreate') }}
        </el-button>
        <el-button
          type="primary"
          @click="confirmCreateTemplate"
        >
          {{ $t('template.confirmCreate') }}
        </el-button>
      </div>
    </el-dialog>
    <el-table
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%; margin-top: 30px;"
    >
      <el-table-column
        width="80"
        align="center"
        label="ID"
      >
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>

      <el-table-column
        min-width="300px"
        label="Title"
      >
        <template slot-scope="{row}">
          <span>{{ row.title }}</span>
        </template>
      </el-table-column>

      <el-table-column
        width="180px"
        align="center"
        label="Date"
      >
        <template slot-scope="{row}">
          <span>{{ row.created }}</span>
        </template>
      </el-table-column>

      <el-table-column
        align="center"
        label="Actions"
        width="180"
      >
        <template slot-scope="{row}">
          <router-link :to="'/template/edit/'+row.id">
            <el-button
              type="primary"
              size="small"
              icon="el-icon-edit"
            >
              Edit
            </el-button>
          </router-link>
          <el-button
            type="primary"
            size="small"
            icon="el-icon-edit"
            @click="printTemplate(row.id)"
            :loading="getLoading(row.id)"
          >
            打印
          </el-button>
          <el-button
            type="primary"
            size="small"
            icon="el-icon-edit"
            @click="mockRenderTemplate(row.id)"
          >
            渲染测试
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      :visible.sync="mockRenderDialogVisible"
      :title="$t('template.mockRender')"
    >
      <el-form
        :model="mockRenderModel"
        label-width="100px"
        label-position="left"
      >
        <el-form-item v-for="str in selectedTemplateRelatedLabels" :key="str.id" :label="str.name">
          <el-input
            v-model="mockRenderModel[`${str.code}`]"
            :placeholder="str.name"
          />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button
          type="danger"
          @click="cancelMockRenderTemplate"
        >
          {{ $t('template.cancelMockRender') }}
        </el-button>
        <el-button
          type="primary"
          @click="confirmMockRenderTemplate"
        >
          {{ $t('template.confirmMockRender') }}
        </el-button>
      </div>
    </el-dialog>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { ITemplateData, ILabelData } from '@/api/types'
import { parseTime } from '@/utils'
import { pageTemplates, createTemplate, renderTemplate, mockRenderTemplate, getTemplateRelatedLabels } from '@/api/template'
import Pagination from '@/components/Pagination/index.vue'

const defaultTemplate = {
  title: ''
}

@Component({
  name: 'TemplateList',
  components: {
    Pagination
  }
})
export default class extends Vue{
  private template = Object.assign({}, defaultTemplate)
  private dialogVisible = false
  private total = 0;
  private list: ITemplateData[] = [];
  private listLoading = true;
  private listQuery = {
    title: '',
    page: 1,
    limit: 20
  }

  private printLoading = {}

  private mockRenderDialogVisible = false;

  private selectedTemplateRelatedLabels: ILabelData[] = [];

  private mockRenderModel = {}

  created() {
    this.getList();
  }

  mounted() {
    this.getList();
  }

  private getLoading(id:number) {
    if (this.printLoading[id + '-']) {
      return this.printLoading[id + '-']
    } else {
      return false;
    }
  }

  private async getList() {
    this.listLoading = true
    const { data } = await pageTemplates(this.listQuery)
    this.list = data.data
    this.total = data.total
    this.printLoading = {}
    this.list.forEach(d => {
      d.created = parseTime(d.created)
      this.printLoading[d.id + '-'] = false
    })
    setTimeout(() => {
      this.listLoading = false
    }, 0.5 * 1000)
  }

  private handleCreateTemplate() {
    this.template = Object.assign({}, defaultTemplate)
    this.dialogVisible = true
  }

  private async confirmCreateTemplate() {
    const { data } = await createTemplate(this.template)
    console.log(data)
    if (data) {
      this.dialogVisible = false
      this.$notify({
        title: 'Success',
        dangerouslyUseHTMLString: true,
        message: '创建成功',
        type: 'success'
      })
      await this.getList()
    } else {
      this.$notify({
        title: 'Fail',
        dangerouslyUseHTMLString: true,
        message: '创建失败',
        type: 'error'
      })
    }
  }

  private async printTemplate(id:number) {
    const ntf = this.$notify({
      title: 'Success',
      dangerouslyUseHTMLString: true,
      message: '开始下载',
      type: 'success',
      duration: 0,
      showClose: false
    })
    const {data} = await renderTemplate(id)
    ntf.close()
    this.$notify({
      title: 'Success',
      dangerouslyUseHTMLString: true,
      message: '下载完成',
      type: 'success'
    })
  }

  /**
   * 渲染测试
   * @param id
   * @private
   */
  private async mockRenderTemplate(id:number) {
    const {data} = await getTemplateRelatedLabels(id);
    this.selectedTemplateRelatedLabels = data;
    this.mockRenderModel['templateId'] = id;
    this.selectedTemplateRelatedLabels.forEach(str => {
      // this.mockRenderModel[`${str.code}`] = ''
      this.$set(this.mockRenderModel, str.code, '')
    });
    this.mockRenderDialogVisible = true;
  }

  private cancelMockRenderTemplate() {
    this.mockRenderDialogVisible=false;
    this.mockRenderModel = {}
    this.selectedTemplateRelatedLabels = []
  }

  private async confirmMockRenderTemplate() {
    console.log(this.mockRenderModel);
    const ntf = this.$notify({
      title: 'Success',
      dangerouslyUseHTMLString: true,
      message: '开始下载',
      type: 'success',
      duration: 0,
      showClose: false
    })
    const {data} = await mockRenderTemplate(this.mockRenderModel);
    this.mockRenderDialogVisible = false;
    ntf.close()
    this.$notify({
      title: 'Success',
      dangerouslyUseHTMLString: true,
      message: '下载完成',
      type: 'success'
    })
  }
}
</script>

<style scoped>

</style>
