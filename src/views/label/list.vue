<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.name"
        :placeholder="$t('label.name')"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleQuery"
        clearable
      />
      <el-input
        v-model="listQuery.code"
        :placeholder="$t('label.code')"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleQuery"
        clearable
      />
      <el-button
        type="primary"
        class="filter-item"
        @click="handleQuery"
      >
        {{ $t('label.search') }}
      </el-button>
      <el-button
        type="primary"
        class="filter-item"
        @click="handleCreateLabel"
      >
        {{ $t('label.createLabel') }}
      </el-button>
    </div>
    <el-dialog
      :visible.sync="dialogVisible"
      :title="$t('label.createLabel')"
    >
      <el-form
        :model="label"
        label-width="80px"
        label-position="left"
      >
        <el-form-item label="标签编码">
          <el-input
            v-model="label.code"
            placeholder="唯一的编码"
          />
        </el-form-item>
        <el-form-item label="标签名">
          <el-input
            v-model="label.name"
            placeholder="请输入标签名"
          />
        </el-form-item>
        <el-form-item label="标签类型">
          <el-select v-model="label.dataType" placeholder="请选择标签类型">
            <el-option v-for="item in dataTypes" :key="item.id" :value="item.id" :label="item.name"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button
          type="danger"
          @click="dialogVisible=false"
        >
          {{ $t('label.cancelCreate') }}
        </el-button>
        <el-button
          type="primary"
          @click="confirmCreateLabel"
        >
          {{ $t('label.confirmCreate') }}
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
        label="标签编码"
      >
        <template slot-scope="{row}">
          <span>{{ row.code }}</span>
        </template>
      </el-table-column>

      <el-table-column
        min-width="300px"
        label="标签名"
      >
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column
        width="180px"
        align="center"
        label="创建时间"
      >
        <template slot-scope="{row}">
          <span>{{ row.created }}</span>
        </template>
      </el-table-column>

      <el-table-column
        align="center"
        label="Actions"
        width="120"
      >
        <template slot-scope="{row}">
          <el-button
            type="primary"
            size="small"
            icon="el-icon-edit"
          >
            编辑
          </el-button>
        </template>
      </el-table-column>
    </el-table>

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
import {Vue, Component} from 'vue-property-decorator'
import Pagination from '@/components/Pagination/index.vue'
import { ILabelData } from '@/api/types'
import { pageLabels, createLabel } from '@/api/template'

const defaultLabel = {
  code: '',
  name: '',
  dataType: 0
}

@Component({
  name: 'LabelList',
  components: {
    Pagination
  }
})
export default class extends Vue {

  private label = Object.assign({}, defaultLabel)

  private dialogVisible = false
  private total = 0;
  private list: ILabelData[] = [];
  private listLoading = true;
  private listQuery = {
    name: '',
    code: '',
    page: 1,
    limit: 20
  };

  private dataTypes = [
    {
      id: 0,
      name: '文本'
    }
  ]

  mounted() {
    this.getList();
  }

  private handleQuery() {
    this.listQuery.page = 1
    this.getList()
  }

  private async getList() {
    this.listLoading = true
    const { data } = await pageLabels(this.listQuery)
    this.list = data.data
    this.total = data.total
    setTimeout(() => {
      this.listLoading = false
    }, 0.5 * 1000)
  }

  private handleCreateLabel() {
    this.label = Object.assign({}, defaultLabel)
    this.dialogVisible = true
  }

  private async confirmCreateLabel() {
    const {data} = await createLabel(this.label)
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
}
</script>

<style scoped>

</style>
