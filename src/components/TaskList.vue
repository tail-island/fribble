<template>
  <div>
    <vue-scrolling-table>
      <template slot="thead">
        <tr>
          <th class="task-index text-right">#</th>
          <th class="task-name text-left">タスク</th>
          <th class="task-predecessors text-left">先行</th>
          <th class="task-duration text-left">日数</th>
          <th class="task-skills text-left">スキル</th>
          <th class="task-day" v-for="i in endDay" v-bind:key="i">{{ i }}</th>
        </tr>
      </template>
      <template slot="tbody">
        <tr v-for="(task, index) in tasks" v-bind:key="task.id" v-on:click="setSelectedId(task.id)" v-bind:class="{ selected: task.id === selectedId }">
          <td class="task-index text-right">{{ index + 1 }}</td>
          <td class="task-name"><span v-html="'&nbsp;&nbsp;'.repeat(taskIndentLevels[index])"></span>{{ task.name }}</td>
          <td class="task-predecessors">{{ taskPredecessorStrings[index] }}</td>
          <td class="task-duration text-right">{{ tasks.every(child => child.parentId !== task.id) ? task.duration : "" }}</td>
          <td class="task-skills">{{ tasks.every(child => child.parentId !== task.id) ? taskSkillStrings[index] : "" }}</td>
          <td class="task-day text-center" v-for="i in endDay" v-bind:key="i">{{ (taskScheduleMap.get(task.id).startDay &lt;= i && i &lt;= taskScheduleMap.get(task.id).endDay) ? "*" : "" }}</td>
        </tr>
      </template>
    </vue-scrolling-table>
    <v-row justify="center">
      <v-col class="text-center" cols="2">
        <v-btn v-on:click="addTask">追加</v-btn>
      </v-col>
      <v-col class="text-center" cols="2">
        <v-btn v-on:click="moveTaskUp" v-bind:disabled="isMoveTaskUpDisabled">▲</v-btn>
      </v-col>
      <v-col class="text-center" cols="2">
        <v-btn v-on:click="moveTaskDown" v-bind:disabled="isMoveTaskDownDisabled">▼</v-btn>
      </v-col>
      <v-col class="text-center" cols="2">
        <v-btn v-on:click="moveTaskLeft" v-bind:disabled="isMoveTaskLeftDisabled">◀</v-btn>
      </v-col>
      <v-col class="text-center" cols="2">
        <v-btn v-on:click="moveTaskRight" v-bind:disabled="isMoveTaskRightDisabled">▶</v-btn>
      </v-col>
      <v-col class="text-center" cols="2">
        <v-btn v-on:click="deleteTask" v-bind:disabled="!selectedId">削除</v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import VueScrollingTable from 'vue-scrolling-table'

export default {
  data: () => ({
    selectedId: null
  }),
  components: {
    VueScrollingTable
  },
  computed: {
    tasks: function () {
      return this.$store.getters.orderedTasks
    },

    taskScheduleMap: function () {
      const result = new Map(this.tasks.map(task => [[task.id, {}]]))

      const isLeaf = task => this.$store.getters.getDescendantTasks(task).length === 0
      const isNode = task => !isLeaf(task)

      const getPredecessors = task => {
        let result

        result = [task].concat(this.$store.getters.getAncestorTasks(task)).flatMap(successor => this.tasks.filter(predecessor => successor.predecessorIds?.includes(predecessor.id)))
        result = result.concat(result.flatMap(this.$store.getters.getDescendantTasks))

        return Array.from(new Set(result))
      }

      const setToLeaf = (task) => {
        if (!isLeaf(task)) {
          return
        }

        const predecessors = getPredecessors(task).filter(isLeaf)

        for (const predecessor of predecessors) {
          if (!result.has(predecessor.id)) {
            setToLeaf(predecessor)
          }
        }

        const startDay = predecessors.length > 0 ? Math.max(...predecessors.map(predecessor => result.get(predecessor.id).endDay + 1)) : 1

        result.set(task.id, { startDay: startDay, endDay: startDay + task.duration - 1 })
      }

      const setToNode = (task) => {
        if (!isNode(task)) {
          return
        }

        const descendants = this.$store.getters.getDescendantTasks(task).filter(isLeaf)

        const startDay = descendants.length > 0 ? Math.min(...descendants.map(descendant => result.get(descendant.id).startDay)) : 1
        const endDay = descendants.length > 0 ? Math.max(...descendants.map(descendant => result.get(descendant.id).endDay)) : 1

        result.set(task.id, { startDay: startDay, endDay: endDay })
      }

      for (const task of this.tasks) {
        setToLeaf(task)
      }

      for (const task of this.tasks) {
        setToNode(task)
      }

      return result
    },

    endDay: function () {
      return this.tasks.length > 0 ? Math.max(...this.tasks.map(task => this.taskScheduleMap.get(task.id).endDay)) : 1
    },

    taskIndentLevels: function () {
      const getIndentLevel = (task) => {
        if (!task.parentId) {
          return 0
        }

        return getIndentLevel(this.$store.getters.getTask(task.parentId)) + 1
      }

      return this.tasks.map(getIndentLevel)
    },

    taskPredecessorStrings: function () {
      return this.tasks.map(task => task.predecessorIds?.map(predecessorId => this.tasks.findIndex(predecessor => predecessor.id === predecessorId)).map(index => index + 1).sort().join(', '))
    },

    taskSkillStrings: function () {
      return this.tasks.map(task => task.skillIds?.map(skillId => this.$store.getters.getSkill(skillId).name).join(', '))
    },

    isMoveTaskUpDisabled: function () {
      if (!this.selectedId) {
        return true
      }

      const index = this.tasks.findIndex(task => task.id === this.selectedId)

      for (let i = index - 1; i >= 0; --i) {
        if (this.tasks[i].parentId === this.tasks[index].parentId) {
          return false
        }
      }

      return true
    },

    isMoveTaskDownDisabled: function () {
      if (!this.selectedId) {
        return true
      }

      const index = this.tasks.findIndex(task => task.id === this.selectedId)

      for (let i = index + 1; i < this.tasks.length; ++i) {
        if (this.tasks[i].parentId === this.tasks[index].parentId) {
          return false
        }
      }

      return true
    },

    isMoveTaskLeftDisabled: function () {
      const index = this.tasks.findIndex(task => task.id === this.selectedId)

      return !this.selectedId || index === 0 || this.taskIndentLevels[index] === 0
    },

    isMoveTaskRightDisabled: function () {
      const index = this.tasks.findIndex(task => task.id === this.selectedId)

      if (!this.selectedId || index === 0 || this.taskIndentLevels[index] > this.taskIndentLevels[index - 1]) {
        return true
      }

      return !this.$store.getters.isValidParent(
        this.tasks[index],
        (() => {
          for (let i = index - 1; i >= 0; --i) {
            if (this.taskIndentLevels[i] === this.taskIndentLevels[index]) {
              return this.tasks[i]
            }
          }
        })()
      )
    }
  },
  methods: {
    setSelectedId: function (id) {
      if (id !== this.selectedId) {
        this.$emit('task-select', { id: id })
      }

      this.selectedId = id
    },

    addTask: async function (event) {
      const id = await this.$store.dispatch('addTask')

      this.$store.commit('setTaskDuration', { id: id, value: 1 })

      this.setSelectedId(id)
    },

    deleteTask: function (event) {
      const id = this.selectedId

      this.setSelectedId(null)

      this.$store.dispatch('deleteTask', id)
    },

    moveTaskUp: function (event) {
      const index = this.tasks.findIndex(task => task.id === this.selectedId)

      while (this.tasks.findIndex(task => task.id === this.selectedId) >= index) {
        this.$store.commit('moveTaskUp', { id: this.selectedId })
      }
    },

    moveTaskDown: function (event) {
      const index = this.tasks.findIndex(task => task.id === this.selectedId)

      while (this.tasks.findIndex(task => task.id === this.selectedId) <= index) {
        this.$store.commit('moveTaskDown', { id: this.selectedId })
      }
    },

    moveTaskLeft: function (event) {
      const index = this.tasks.findIndex(task => task.id === this.selectedId)

      for (let i = index - 1; i >= 0; --i) {
        if (this.taskIndentLevels[i] === this.taskIndentLevels[index] - 1) {
          this.$store.commit('setTaskParentId', { id: this.selectedId, value: this.tasks[i].parentId })
          break
        }
      }
    },

    moveTaskRight: function (event) {
      const index = this.tasks.findIndex(task => task.id === this.selectedId)

      for (let i = index - 1; i >= 0; --i) {
        if (this.taskIndentLevels[i] === this.taskIndentLevels[index]) {
          this.$store.commit('setTaskParentId', { id: this.selectedId, value: this.tasks[i].id })
          break
        }
      }

      // 戻る場所が予測しづらくてごめんなさい……
    }
  }
}

// コードが無駄に長くて、しかも他のメソッドに依存しまくっていて、本当にごめんなさい……
// Vue.jsはモデル層を自由に書けないので辛い……。Android Jetpackはかなり自由に書けて良かったなぁ……
</script>

<style scoped>
table.scrolling {
  height: 60vh;
}

th {
  font-weight: normal;
}

th, td {
  padding: 0.25em;
}

.selected td {
  background-color: #b5d4f8
}

.task-index {
  width: 3em;
  min-width: 3em;
  max-width: 3em;
}

.task-name {
  width: 10em;
  min-width: 10em;
  max-width: 10em;
}

.task-predecessors {
  width: 4em;
  min-width: 4em;
  max-width: 4em;
}

.task-duration {
  width: 3em;
  min-width: 3em;
  max-width: 3em;
}

.task-skills {
  width: 10em;
  min-width: 10em;
  max-width: 10em;
}

.task-day {
  font-size: 0.75em;
  width: 2em;
  min-width: 2em;
  max-width: 2em;
}
</style>
