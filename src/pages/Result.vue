<template>
  <div class="card" style="height: 100%">
    <div>
      <Button
        icon="pi pi-angle-left"
        class="p-button-rounded p-button-text"
        @click="$router.go(-1)"
      />
    </div>
    <h5>The result of your search</h5>
    <DataTable
      :value="customers"
      :scrollable="true"
      :loading="loading"
      style="height: 100%"
    >
      <Column
        field="id"
        header="Id"
        headerStyle="width: 250px"
        bodyStyle="width: 250px"
        columnKey="id"
      ></Column>
      <Column
        field="name"
        header="Name"
        headerStyle="width: 250px"
        bodyStyle="width: 250px"
        columnKey="name"
      ></Column>
      <Column
        field="country.name"
        header="Country"
        headerStyle="width: 250px"
        bodyStyle="width: 250px"
        columnKey="country"
      ></Column>
      <Column
        field="date"
        header="Date"
        headerStyle="width: 250px"
        bodyStyle="width: 250px"
        columnKey="date"
      ></Column>
      <Column
        field="company"
        header="Company"
        headerStyle="width: 250px"
        bodyStyle="width: 250px"
        columnKey="company"
      ></Column>
      <Column
        field="status"
        header="Status"
        headerStyle="width: 250px"
        bodyStyle="width: 250px"
        columnKey="status"
      ></Column>
      <Column
        field="activity"
        header="Activity"
        headerStyle="width: 250px"
        bodyStyle="width: 250px"
        columnKey="activity"
      ></Column>
      <Column
        field="representative.name"
        header="Representative"
        headerStyle="width: 250px"
        bodyStyle="width: 250px"
        columnKey="representative"
      ></Column>
    </DataTable>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  data() {
    return {
      columns: [
        { field: 'code', header: 'Code' },
        { field: 'name', header: 'Name' },
        { field: 'category', header: 'Category' },
        { field: 'quantity', header: 'Quantity' },
      ],
    }
  },
})
</script>
