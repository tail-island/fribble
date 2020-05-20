<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" app>
      <v-list dense>
        <v-list-item to="/" link>
          <v-list-item-action>
            <v-icon>mdi-wrench</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>スキル</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item to="/task" link>
          <v-list-item-action>
            <v-icon>mdi-file-tree</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>タスク</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item to="/member" link>
          <v-list-item-action>
            <v-icon>mdi-account-multiple</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>メンバー</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item to="/schedule" link>
          <v-list-item-action>
            <v-icon>mdi-calendar</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>スケジュール</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app color="primary" dark>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>fribble</v-toolbar-title>
      <v-spacer />
      <v-btn icon>
        <v-icon v-on:click="saveQuestion">mdi-content-save</v-icon>
      </v-btn>
    </v-app-bar>

    <v-content>
      <router-view />
    </v-content>
  </v-app>
</template>

<script>
import axios from 'axios'

export default {
  name: 'App',
  data: () => ({
    drawer: null
  }),
  methods: {
    readQuestion: async function () {
      const capitalize = string => `${string.charAt(0).toUpperCase()}${string.slice(1)}`

      const addEntities = (entities, entityName, propertyNames) => {
        for (const entity of entities) {
          this.$store.commit(`add${capitalize(entityName)}`, { id: entity.id })

          for (const propertyName of propertyNames) {
            this.$store.commit(`set${capitalize(entityName)}${capitalize(propertyName)}`, { id: entity.id, value: entity[propertyName] })
          }
        }
      }

      const response = await axios.get('/question')

      addEntities(response.data.skills, 'skill', ['name'])
      addEntities(response.data.tasks, 'task', ['name', 'duration', 'predecessorIds', 'skillIds', 'parentId'])
      addEntities(response.data.members, 'member', ['name', 'skillIds'])
      addEntities(response.data.taskSchedules, 'taskSchedules', ['taskId', 'memberId', 'startDay', 'endDay'])
    },

    saveQuestion: async function () {
      await axios.post('/question', this.$store.state)

      console.log('saved!')
    }
  },
  created: function () {
    if (this.$store.state.skills.length > 0) {
      return
    }

    this.readQuestion()
  }
}
</script>
