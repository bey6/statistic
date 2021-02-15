<template>
  <div class="p-grid nested-grid">
    <div class="p-col-fixed" style="width: 200px">
      <Listbox
        :options="packages"
        optionLabel="name"
        style="min-height: 256px; height: 100%"
        v-model="pkg"
      />
    </div>
    <div class="p-col">
      <div class="p-d-flex p-flex-column" style="height: 100%">
        <div class="border">
          <Tags :conditions="conditions" v-model="condition" />
        </div>
        <div class="p-d-flex border" style="padding: 12px 20px">
          <div class="p-mr-2">
            <Dropdown
              v-model="relation"
              :options="relations"
              optionLabel="name"
              style="height: 32px"
              placeholder="选择一个关系"
            />
          </div>
          <div class="p-mr-2">
            <span style="line-height: 32px">{{ condition.name }}</span>
          </div>
          <div class="p-mr-2">
            <Dropdown
              v-model="operation"
              :options="operations"
              optionLabel="name"
              style="height: 32px"
              placeholder="选择一个比较符"
            />
          </div>
          <div class="p-mr-2">
            <!-- :multiple="true"
              v-model="selectedCountries"
              :suggestions="filteredCountries"
              @complete="searchCountry($event)" -->
            <AutoComplete field="name" />
          </div>
          <div class="p-mr-2">
            <Button label="添加" icon="pi pi-plus" class="p-button-sm" />
          </div>
        </div>
        <div class="border">
          <ol>
            <li>并且 病案号 等于 2021982</li>
            <li>并且 年龄 介于 18-50</li>
          </ol>
        </div>
        <div style="text-align: right">
          <Button
            label="选好了"
            icon="pi pi-arrow-right"
            iconPos="right"
            @click="onSearch"
          />
        </div>
      </div>
    </div>

    <Dialog
      header="您希望查看哪些首页字段项？"
      v-model:visible="displayModal"
      :style="{ width: '80vw' }"
      :modal="true"
    >
      <div class="border">
        <Tags :conditions="conditions" v-model="condition" />
      </div>
      <template #footer>
        <Button
          label="取消"
          icon="pi pi-times"
          @click="onModalClose"
          class="p-button-text"
        />
        <Button
          label="选好了"
          icon="pi pi-check"
          @click="onModalConfirm"
          autofocus
        />
      </template>
    </Dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapGetters, mapMutations } from 'vuex'
import Tags from '../components/Tags.vue'
import AutoComplete from 'primevue/autocomplete'
import Listbox from 'primevue/listbox'

export default defineComponent({
  components: {
    Tags,
    AutoComplete,
    Listbox,
  },
  computed: {
    ...mapGetters(['getMenuStatus']),
  },
  data() {
    return {
      pkg: null,
      packages: [
        { name: '常用查询包', code: 'NY' },
        { name: '顺位表统计', code: 'RM' },
      ],
      relations: [
        { name: '并且', code: 'and' },
        { name: '或者', code: 'or' },
      ],
      relation: { name: '并且', code: 'and' },
      operations: [
        { name: '等于', code: '=' },
        { name: '大于', code: '>' },
        { name: '小于', code: '<' },
      ],
      operation: { name: '等于', code: '=' },
      tabs: [
        {
          title: '常用',
          content: 'basic',
        },
        {
          title: '住院',
          content: 'inpatient',
        },
      ],
      conditions: [],
      condition: {},
      displayModal: false,
    }
  },
  methods: {
    ...mapMutations(['setMenuStatus']),
    onSearch() {
      this.displayModal = true
    },
    onModalClose() {
      this.displayModal = false
    },
    onModalConfirm() {
      this.$router.push('/result')
    },
  },
  mounted() {
    this.setMenuStatus(!this.getMenuStatus)
  },
  created() {
    fetch('conditions.json').then((http) =>
      http.json().then((res) => {
        this.conditions = res.conditions
      })
    )
  },
})
</script>

<style lang="scss" scoped>
.border:last-of-type {
  margin-bottom: 0;
}
.condition-list {
  display: flex;
  padding: 8px;
  margin: 0;
  flex-wrap: wrap;
  list-style: none;

  li {
    margin: 0 8px 8px 0;
    padding: 0 12px;
    border: 1px solid #ced4da;
    background-color: #fafafa;
    border-radius: 3px;
    height: 32px;
    line-height: 32px;

    &:hover {
      background-color: #e6e8ec;
      cursor: default;
    }
  }
}
</style>
