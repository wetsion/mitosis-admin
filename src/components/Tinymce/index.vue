<template>
  <div>
    <tinymce-editor id="templateEditor" v-model="tinymceContent" :init="initOptions"></tinymce-editor>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { queryLabels, previewTemplates, saveTemplate } from '@/api/template';
import tinymce from 'tinymce';
import TinymceEditor from '@tinymce/tinymce-vue';
import 'tinymce/themes/silver/theme';
import "tinymce/plugins/lists";
import "tinymce/plugins/link";
import "tinymce/plugins/image";
import "tinymce/plugins/table";
import "tinymce/plugins/code";
import "tinymce/plugins/help";
import "tinymce/plugins/wordcount";
import "tinymce/icons/default/icons";

console.log(tinymce);
const defaultId = () => 'vue-tinymce-' + +new Date() + ((Math.random() * 1000).toFixed(0) + '')


@Component({
  name: 'Tinymce',
  components: {
    TinymceEditor
  }
})
export default class extends Vue{

  @Prop({ required: true }) private value!: string
  @Prop({ default: defaultId }) private id!: string


  private hasChange = false
  private hasInit = false

  get initOptions() {
    return {
      selector: "#templateEditor",
      height: 500,
      skin_url: `${process.env.BASE_URL}tinymce/skins/ui/oxide`,
      language: "zh-Hans", //语言
      language_url: `${process.env.BASE_URL}tinymce/zh-Hans.js`,
      plugins: 'lists table code importcss help wordcount',
      content_css: `${process.env.BASE_URL}tinymce/templateEdit.css`,
      hidden_input: false,
      init_instance_callback: (editor: any) => {
        if (this.value) {
          editor.setContent(this.value)
        }
        this.hasInit = true
        editor.on('NodeChange Change KeyUp SetContent', () => {
          this.hasChange = true
          this.$emit('input', editor.getContent())
        })
      },
      setup: (editor: any) => {

      }
    }
  }

  get tinymceContent() {
    return this.value
  }

  set tinymceContent(value) {
    this.$emit('input', value)
  }

  public insertContent(ctt:string) {
    tinymce.activeEditor.insertContent(ctt);
  }

  public removeNode(selector:string) {
    const exist = tinymce.activeEditor.dom.select(selector)
    if (exist) {
      tinymce.activeEditor.dom.remove(exist);
    }
  }

  public findMappedNodeOnEditor(selector:string) {
    const findResult = tinymce.activeEditor.dom.select(selector);
    console.log(findResult)
    if (findResult) {
      if (tinymce.activeEditor.dom.hasClass(findResult[0], 'highlight')) {
        tinymce.activeEditor.dom.removeClass(findResult, 'highlight');
      } else {
        tinymce.activeEditor.dom.addClass(findResult, 'highlight');
      }
    }
  }

};
</script>

<style scoped>

</style>
