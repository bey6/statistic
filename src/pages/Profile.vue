<template>
  <div>
    <div class="p-fluid p-formgrid p-grid">
      <div class="p-field p-col-3" style="text-align: center">
        <img class="avatar" src="img.jpeg" alt="your avatar" />
        <!-- <FileUpload
        mode="basic"
        name="demo[]"
        url="./upload.php"
        accept="image/*"
        :maxFileSize="1000000"
        @upload="onUpload"
        :auto="true"
        chooseLabel="上传你的头像"
      /> -->
      </div>
      <div class="p-field p-col">
        <div class="p-fluid p-formgrid p-grid">
          <div class="p-field p-col">
            <label for="lastname">姓名</label>
            <InputText
              id="lastname"
              type="text"
              :value="getUserInfo.name"
              @change="setUserInfo({ name: $event.target.value })"
            />
          </div>
        </div>
        <div class="p-fluid p-formgrid p-grid">
          <div class="p-field p-col">
            <label for="lastname">性别</label>
            <div
              class="p-fluid p-formgrid p-grid"
              style="padding-left: 12px; vertical-align: middle"
            >
              <div class="p-field-radiobutton" style="margin: 0 12px 0 0">
                <RadioButton
                  id="males"
                  name="gender"
                  value="males"
                  v-model="getUserInfo.gender"
                  @change="setUserInfo({ gender: 'males' })"
                />
                <label for="males">男</label>
              </div>
              <div class="p-field-radiobutton" style="margin: 0">
                <RadioButton
                  id="females"
                  name="gender"
                  value="females"
                  v-model="getUserInfo.gender"
                  @change="setUserInfo({ gender: 'females' })"
                />
                <label for="females">女</label>
              </div>
            </div>
          </div>
        </div>
        <div class="p-fluid p-formgrid p-grid">
          <div class="p-field p-col">
            <label for="lastname">年龄</label>
            <InputText
              id="lastname"
              type="text"
              :value="getUserInfo.age"
              @change="setUserInfo({ age: $event.target.value })"
            />
          </div>
        </div>
        <div class="p-fluid p-formgrid p-grid">
          <div class="p-field p-col">
            <label for="lastname">部门</label>
            <InputText
              id="lastname"
              type="text"
              :value="getUserInfo.department"
              @change="setUserInfo({ department: $event.target.value })"
            />
          </div>
        </div>
        <div class="p-fluid p-formgrid p-grid">
          <div class="p-field p-col">
            <label for="memo">备注</label>
            <Textarea
              id="memo"
              :value="getUserInfo.memo"
              @change="setUserInfo({ memo: $event.target.value })"
              rows="3"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="p-grid">
      <div class="p-col-6 p-offset-3">
        <Button label="保存" icon="pi pi-check" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import FileUpload from 'primevue/fileupload'
import { mapGetters, mapMutations } from 'vuex'

export default defineComponent({
  components: {
    FileUpload,
  },
  computed: {
    ...mapGetters(['getUserInfo']),
  },
  methods: {
    ...mapMutations(['setUserInfo']),
  },
})
</script>

<style lang="scss" scoped>
.avatar {
  border-radius: 50%;
  border: 2px solid rgb(112, 118, 128);
  height: 150px;
}
</style>
