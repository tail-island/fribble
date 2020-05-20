<template>
  <v-container fluid>
    <div>
      <task-list v-on:task-select="({ id }) => { this.selectedTaskId = id }" />
    </div>
    <v-divider />
    <task-form v-bind:task-id="selectedTaskId" />
  </v-container>
</template>

<script>
import TaskForm from '@/components/TaskForm.vue'
import TaskList from '@/components/TaskList.vue'

export default {
  name: 'Task',
  data: () => ({
    selectedTaskId: null
  }),
  components: {
    TaskForm,
    TaskList
  }
}
</script>

// この方式だと、コントロールにバインドされたデータは変更されるけど、コントロールの状態はリセットされません。なので、ごめんなさい、悪いやり方でした……
