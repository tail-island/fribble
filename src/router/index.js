import Vue from 'vue'
import VueRouter from 'vue-router'
import Member from '@/views/Member.vue'
import Schedule from '@/views/Schedule.vue'
import Skill from '@/views/Skill.vue'
import Task from '@/views/Task.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Skill',
    component: Skill
  },
  {
    path: '/task',
    name: 'Task',
    component: Task
  },
  {
    path: '/member',
    name: 'Member',
    component: Member
  },
  {
    path: '/schedule',
    name: 'Schedule',
    component: Schedule
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
