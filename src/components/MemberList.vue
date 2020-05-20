<template>
  <div>
    <vue-scrolling-table>
      <template slot="thead">
        <tr>
          <th class="member-index text-right">#</th>
          <th class="member-name text-left">氏名</th>
          <th class="member-skills text-left">スキル</th>
        </tr>
      </template>
      <template slot="tbody">
        <tr v-for="(member, index) in members" v-bind:key="member.id" v-on:click="setSelectedId(member.id)" v-bind:class="{ selected: member.id === selectedId }">
          <td class="member-index text-right">{{ index + 1 }}</td>
          <td class="member-name">{{ member.name }}</td>
          <td class="member-skills">{{ memberSkillStrings[index] }}</td>
        </tr>
      </template>
    </vue-scrolling-table>
    <v-row justify="center">
      <v-col class="text-center" cols="2">
        <v-btn v-on:click="addMember">追加</v-btn>
      </v-col>
      <v-col class="text-center" cols="2">
        <v-btn v-on:click="moveMemberUp" v-bind:disabled="isMoveMemberUpDisabled">▲</v-btn>
      </v-col>
      <v-col class="text-center" cols="2">
        <v-btn v-on:click="moveMemberDown" v-bind:disabled="isMoveMemberDownDisabled">▼</v-btn>
      </v-col>
      <v-col class="text-center" cols="2">
        <v-btn v-on:click="deleteMember" v-bind:disabled="!selectedId">削除</v-btn>
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
    members: function () {
      return this.$store.state.members
    },

    memberSkillStrings: function () {
      return this.members.map(member => member.skillIds?.map(skillId => this.$store.getters.getSkill(skillId).name).join(', '))
    },

    isMoveMemberUpDisabled: function () {
      return !this.selectedId || this.members.findIndex(member => member.id === this.selectedId) === 0
    },

    isMoveMemberDownDisabled: function () {
      return !this.selectedId || this.members.findIndex(member => member.id === this.selectedId) === this.members.length - 1
    }
  },
  methods: {
    setSelectedId: function (id) {
      if (id !== this.selectedId) {
        this.$emit('member-select', { id: id })
      }

      this.selectedId = id
    },

    addMember: async function (event) {
      const id = await this.$store.dispatch('addMember')

      this.setSelectedId(id)
    },

    deleteMember: function (event) {
      const id = this.selectedId

      this.setSelectedId(null)

      this.$store.commit('deleteMember', { id: id })
    },

    moveMemberUp: function (event) {
      this.$store.commit('moveMemberUp', { id: this.selectedId })
    },

    moveMemberDown: function (event) {
      this.$store.commit('moveMemberDown', { id: this.selectedId })
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

.member-index {
  width: 3em;
  min-width: 3em;
  max-width: 3em;
}

.member-name {
  width: 10em;
  min-width: 10em;
  max-width: 10em;
}

.member-skills {
  width: 10em;
  min-width: 10em;
  max-width: 10em;
}
</style>
