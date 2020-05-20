<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-text-field ref="taskNameTextField" v-model="taskName" v-bind:disabled="disabled" label="名称" />
      </v-col>
      <v-col cols="12">
        <v-select v-model="taskPredecessorIds" v-bind:items="predecessorCandidates" item-text="name" item-value="id" v-bind:disabled="disabled" multiple label="先行" />
      </v-col>
      <v-col cols="12">
        <v-select v-model="taskDuration" v-bind:items="durations" v-bind:disabled="disabled" label="日数" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  props: {
    taskId: String
  },
  watch: {
    taskId: function (newValue, oldValue) {
      this.$refs.taskNameTextField.focus()

      // TODO: 自動で入力テキストを全選択する。いろいろやってみたけどうまくいかない……。というか、WorkBreakdownStructure.vueにも書いたけど、今回のレイアウトはリアクティブとの相性が悪いんだと思う
    }
  },
  data: () => ({
    durations: [1, 2, 3, 4, 5]
  }),
  computed: {
    disabled: function () {
      return !this.taskId
    },

    predecessorCandidates: function () {
      const invalidSet = this.taskId ? this.$store.getters.getInvalidPredecessorSet(this.$store.getters.getTask(this.taskId)) : new Set()

      return this.$store.getters.orderedTasks.map(task => {
        task.disabled = invalidSet.has(task)

        return task
      })
    },

    taskName: {
      get () {
        return this.$store.getters.getTask(this.taskId)?.name
      },
      set (value) {
        this.$store.commit('setTaskName', { id: this.taskId, value: value })
      }
    },

    taskPredecessorIds: {
      get () {
        return this.$store.getters.getTask(this.taskId)?.predecessorIds
      },
      set (value) {
        this.$store.commit('setTaskPredecessorIds', { id: this.taskId, value: value })
      }
    },

    taskDuration: {
      get () {
        return this.$store.getters.getTask(this.taskId)?.duration
      },
      set (value) {
        this.$store.commit('setTaskDuration', { id: this.taskId, value: value })
      }
    }
  }
}
</script>
