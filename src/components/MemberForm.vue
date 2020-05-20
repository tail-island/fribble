<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-text-field ref="memberNameTextField" v-model="memberName" v-bind:disabled="disabled" label="氏名" />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-select v-model="memberSkillIds" v-bind:items="skillCandidates" item-text="name" item-value="id" v-bind:disabled="disabled" multiple label="スキル" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  props: {
    memberId: String
  },
  watch: {
    memberId: function (newValue, oldValue) {
      this.$refs.memberNameTextField.focus()

      // TODO: 自動で入力テキストを全選択する。いろいろやってみたけどうまくいかない……。というか、WorkBreakdownStructure.vueにも書いたけど、今回のレイアウトはリアクティブとの相性が悪いんだと思う
    }
  },
  computed: {
    disabled: function () {
      return !this.memberId
    },

    skillCandidates: function () {
      return this.$store.state.skills
    },

    memberName: {
      get () {
        return this.$store.getters.getMember(this.memberId)?.name
      },
      set (value) {
        this.$store.commit('setMemberName', { id: this.memberId, value: value })
      }
    },

    memberSkillIds: {
      get () {
        return this.$store.getters.getMember(this.memberId)?.skillIds
      },
      set (value) {
        this.$store.commit('setMemberSkillIds', { id: this.memberId, value: value })
      }
    }
  }
}
</script>
