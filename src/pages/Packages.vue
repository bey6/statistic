<template>
  <div class="p-grid nested-grid">
    <div class="p-col-fixed" style="width: 200px">
      <Listbox :options="cities" optionLabel="name" style="height: 100%" />
    </div>
    <div class="p-col">
      <div class="p-d-flex p-flex-column" style="height: 100%">
        <div class="border">
          <TabView>
            <TabPanel v-for="tab in tabs" :key="tab.title" :header="tab.title">
              <p>{{ tab.content }}</p>
            </TabPanel>
          </TabView>
        </div>
        <div class="border">
          <div class="p-grid">
            <div>
              <Dropdown
                v-model="relation"
                :options="relations"
                optionLabel="name"
                placeholder="Select a relations"
              />
            </div>
            <div class="p-col-4">
              <AutoComplete
                :multiple="true"
                v-model="selectedCountries"
                :suggestions="filteredCountries"
                @complete="searchCountry($event)"
                field="name"
              />
            </div>
          </div>
        </div>
        <div class="border">
          <ol>
            <li>1</li>
            <li>1</li>
            <li>1</li>
          </ol>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapGetters, mapMutations } from 'vuex'
import AutoComplete from 'primevue/autocomplete'
import Listbox from 'primevue/listbox'

export default defineComponent({
  components: {
    AutoComplete,
    Listbox,
  },
  computed: {
    ...mapGetters(['getMenuStatus']),
  },
  data() {
    return {
      cities: [
        { name: '常用查询包', code: 'NY' },
        { name: '顺位表统计', code: 'RM' },
      ],
      relations: [
        { name: '并且', code: 'and' },
        { name: '或者', code: 'or' },
      ],
      relation: { name: '并且', code: 'and' },
      tabs: [
        {
          title: '全部',
          content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                            ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,
        },
        {
          title: '常用',
          content: `Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi
                            architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione
                            voluptatem sequi nesciunt. Consectetur, adipisci velit, sed quia non numquam eius modi.`,
        },
        {
          title: '住院',
          content: `At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati
                            cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio.
                            Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus.`,
        },
      ],
    }
  },
  methods: {
    ...mapMutations(['setMenuStatus']),
  },
  mounted() {
    this.setMenuStatus(!this.getMenuStatus)
  },
})
</script>

<style lang="scss" scoped>
.border {
  margin-bottom: 14px;
  border: 1px solid #dee2e6;
}
</style>
