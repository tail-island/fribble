<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-text-field ref="skillNameTextField" v-model="skillName" v-bind:disabled="disabled" label="名称" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  props: {
    skillId: String
  },
  watch: {
    skillId: function (newValue, oldValue) {
      this.$refs.skillNameTextField.focus()

      // TODO: 自動で入力テキストを全選択する。いろいろやってみたけどうまくいかない……。というか、WorkBreakdownStructure.vueにも書いたけど、今回のレイアウトはリアクティブとの相性が悪いんだと思う
    }
  },
  computed: {
    disabled: function () {
      return !this.skillId
    },

    skillName: {
      get () {
        return this.$store.getters.getSkill(this.skillId)?.name
      },
      set (value) {
        this.$store.commit('setSkillName', { id: this.skillId, value: value })
      }
    }
  }
}
</script>
