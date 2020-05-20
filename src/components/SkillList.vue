<template>
  <div>
    <vue-scrolling-table>
      <template slot="thead">
        <tr>
          <th class="skill-index text-right">#</th>
          <th class="skill-name text-left">スキル</th>
        </tr>
      </template>
      <template slot="tbody">
        <tr v-for="(skill, index) in skills" v-bind:key="skill.id" v-on:click="setSelectedId(skill.id)" v-bind:class="{ selected: skill.id === selectedId }">
          <td class="skill-index text-right">{{ index + 1 }}</td>
          <td class="skill-name">{{ skill.name }}</td>
        </tr>
      </template>
    </vue-scrolling-table>
    <v-row justify="center">
      <v-col class="text-center" cols="2">
        <v-btn v-on:click="addSkill">追加</v-btn>
      </v-col>
      <v-col class="text-center" cols="2">
        <v-btn v-on:click="moveSkillUp" v-bind:disabled="isMoveSkillUpDisabled">▲</v-btn>
      </v-col>
      <v-col class="text-center" cols="2">
        <v-btn v-on:click="moveSkillDown" v-bind:disabled="isMoveSkillDownDisabled">▼</v-btn>
      </v-col>
      <v-col class="text-center" cols="2">
        <v-btn v-on:click="deleteSkill" v-bind:disabled="!selectedId">削除</v-btn>
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
    skills: function () {
      return this.$store.state.skills
    },

    isMoveSkillUpDisabled: function () {
      return !this.selectedId || this.skills.findIndex(skill => skill.id === this.selectedId) === 0
    },

    isMoveSkillDownDisabled: function () {
      return !this.selectedId || this.skills.findIndex(skill => skill.id === this.selectedId) === this.skills.length - 1
    }
  },
  methods: {
    setSelectedId: function (id) {
      if (id !== this.selectedId) {
        this.$emit('skill-select', { id: id })
      }

      this.selectedId = id
    },

    addSkill: async function (event) {
      const id = await this.$store.dispatch('addSkill')

      this.setSelectedId(id)
    },

    deleteSkill: function (event) {
      const id = this.selectedId

      this.setSelectedId(null)

      this.$store.commit('deleteSkill', { id: id })
    },

    moveSkillUp: function (event) {
      this.$store.commit('moveSkillUp', { id: this.selectedId })
    },

    moveSkillDown: function (event) {
      this.$store.commit('moveSkillDown', { id: this.selectedId })
    }
  }
}
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

.skill-index {
  width: 3em;
  min-width: 3em;
  max-width: 3em;
}

.skill-name {
  width: 10em;
  min-width: 10em;
  max-width: 10em;
}
</style>
