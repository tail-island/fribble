<template>
  <v-container fluid>
    <div>
      <skill-list v-on:skill-select="({ id }) => { this.selectedSkillId = id }" />
    </div>
    <v-divider />
    <skill-form v-bind:skill-id="selectedSkillId" />
  </v-container>
</template>

<script>
import SkillForm from '@/components/SkillForm.vue'
import SkillList from '@/components/SkillList.vue'

export default {
  name: 'Skill',
  data: () => ({
    selectedSkillId: null
  }),
  components: {
    SkillForm,
    SkillList
  }
}
</script>

// この方式だと、コントロールにバインドされたデータは変更されるけど、コントロールの状態はリセットされません。なので、ごめんなさい、悪いやり方でした……
