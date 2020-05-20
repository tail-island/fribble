<template>
  <v-container fluid>
    <div>
      <member-list v-on:member-select="({ id }) => { this.selectedMemberId = id }" />
    </div>
    <v-divider />
    <member-form v-bind:member-id="selectedMemberId" />
  </v-container>
</template>

<script>
import MemberForm from '@/components/MemberForm.vue'
import MemberList from '@/components/MemberList.vue'

export default {
  name: 'Member',
  data: () => ({
    selectedMemberId: null
  }),
  components: {
    MemberForm,
    MemberList
  }
}
</script>

// この方式だと、コントロールにバインドされたデータは変更されるけど、コントロールの状態はリセットされません。なので、ごめんなさい、悪いやり方でした……
