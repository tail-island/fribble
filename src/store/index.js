import { v4 as uuid } from 'uuid'
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const capitalize = string => `${string.charAt(0).toUpperCase()}${string.slice(1)}`

const createEntityStore = (entityName, propertyNames) => ({
  state: () => [],
  getters: {
    [`get${capitalize(entityName)}`]: state => id => state.find(item => item.id === id),
    [`get${capitalize(entityName)}Index`]: state => id => state.findIndex(item => item.id === id)
  },
  mutations: {
    [`add${capitalize(entityName)}`]: (state, { id }) => {
      state.push({
        id: id,
        ...Object.fromEntries(propertyNames.map(propertyName => [propertyName, null]))
      })
    },

    [`move${capitalize(entityName)}Up`]: (state, { id }) => {
      const index = state.findIndex(item => item.id === id)
      const item = state[index]

      state.splice(index, 1)
      state.splice(index - 1, 0, item)
    },

    [`move${capitalize(entityName)}Down`]: (state, { id }) => {
      const index = state.findIndex(item => item.id === id)
      const item = state[index]

      state.splice(index, 1)
      state.splice(index + 1, 0, item)
    },

    [`delete${capitalize(entityName)}`]: (state, { id }) => {
      state.splice(state.findIndex(item => item.id === id), 1)
    },

    [`deleteAll${capitalize(entityName)}`]: (state) => {
      state.splice(0)
    },

    ...Object.fromEntries(propertyNames.map(propertyName => [
      `set${capitalize(entityName)}${capitalize(propertyName)}`, (state, { id, value }) => {
        state.find(item => item.id === id)[propertyName] = value
      }
    ]))
  },
  actions: {
    [`add${capitalize(entityName)}`]: ({ commit }) => {
      const id = uuid()

      commit(`add${capitalize(entityName)}`, { id: id })

      return id
    }
  }
})

const override = (state, section, name, createFunction) => {
  state[section][name] = createFunction(state[section][name])
}

const skills = createEntityStore('skill', ['name'])
const tasks = createEntityStore('task', ['name', 'duration', 'predecessorIds', 'skillIds', 'parentId'])
const members = createEntityStore('member', ['name', 'skillIds'])
const taskSchedules = createEntityStore('taskSchedule', ['taskId', 'memberId', 'startDay', 'endDay'])

override(tasks, 'actions', 'deleteTask', _ => ({ commit, state }, id) => {
  const task = state.find(task => task.id === id)

  for (const child of state.filter(child => child.parentId === task.id)) {
    commit('setTaskParentId', { id: child.id, value: task.parentId })
  }

  for (const successor of state.filter(successor => successor.predecessorIds?.includes(task.id))) {
    commit('setTaskPredecessorIds', { id: successor.id, value: Array.from(new Set(successor.predecessorIds.filter(predecessorId => predecessorId !== task.id).concat(task.predecessorIds ?? []))) })
  }

  commit('deleteTask', { id: id })
})

override(tasks, 'getters', 'orderedTasks', _ => state => {
  if (state.length === 0) {
    return []
  }

  const result = []
  const stack = state.filter(task => !task.parentId).reverse()

  while (stack.length > 0) {
    const task = stack.pop()
    result.push(task)

    for (const child of state.filter(child => child.parentId === task.id).reverse()) {
      stack.push(child)
    }
  }

  return result
})

override(tasks, 'getters', 'getAncestorTasks', _ => (state, getters) => (task, stop = null) => {
  if (task === stop || !task.parentId) {
    return []
  }

  const parent = getters.getTask(task.parentId)
  return [parent].concat(getters.getAncestorTasks(parent))
})

override(tasks, 'getters', 'getDescendantTasks', _ => (state, getters) => (task, stop = null) => {
  if (task === stop) {
    return []
  }

  const children = state.filter(child => child.parentId === task.id)
  return children.concat(children.flatMap(getters.getDescendantTasks))
})

override(tasks, 'getters', 'isValidParent', _ => (state, getters) => (child, parent) => {
  return (
    (() => {
      // parentの先行タスクにchildがあると駄目

      const stack = [parent]
      const visitedSet = new Set(stack)

      while (stack.length > 0) {
        const task = stack.pop()

        for (const predecessor of [task].concat(getters.getAncestorTasks(task, child)).concat(getters.getDescendantTasks(task, parent)).flatMap(successor => state.filter(predecessor => successor.predecessorIds?.includes(predecessor.id)))) {
          if (visitedSet.has(predecessor)) {
            continue
          }

          if (predecessor === child) {
            return false
          }

          visitedSet.add(predecessor)
          stack.push(predecessor)
        }
      }

      return true
    })() &&
    (() => {
      // parentの後続タスクにchildがあると駄目

      const stack = [parent]
      const visitedSet = new Set(stack)

      while (stack.length > 0) {
        const task = stack.pop()

        for (const successor of [task].concat(getters.getAncestorTasks(task, child)).concat(getters.getDescendantTasks(task, parent)).flatMap(predecessor => state.filter(successor => successor.predecessorIds?.includes(predecessor.id)))) {
          if (visitedSet.has(successor)) {
            continue
          }

          if (successor === child) {
            return false
          }

          visitedSet.add(successor)
          stack.push(successor)
        }
      }

      return true
    })() &&
    (() => {
      // childの先行タスクにparentがあると駄目

      const stack = [child]
      const visitedSet = new Set(stack)

      while (stack.length > 0) {
        const task = stack.pop()

        for (const predecessor of [task].concat(getters.getAncestorTasks(task, child)).concat(getters.getDescendantTasks(task, parent)).flatMap(successor => state.filter(predecessor => successor.predecessorIds?.includes(predecessor.id)))) {
          if (visitedSet.has(predecessor)) {
            continue
          }

          if (predecessor === parent) {
            return false
          }

          visitedSet.add(predecessor)
          stack.push(predecessor)
        }
      }

      return true
    })() &&
    (() => {
      // childの後続タスクにparentがあると駄目

      const stack = [child]
      const visitedSet = new Set(stack)

      while (stack.length > 0) {
        const task = stack.pop()

        for (const successor of [task].concat(getters.getAncestorTasks(task, child)).concat(getters.getDescendantTasks(task, parent)).flatMap(predecessor => state.filter(successor => successor.predecessorIds?.includes(predecessor.id)))) {
          if (visitedSet.has(successor)) {
            continue
          }

          if (successor === parent) {
            return false
          }

          visitedSet.add(successor)
          stack.push(successor)
        }
      }

      return true
    })()
  )

  // 無駄に長くてごめんなさい。とりあえず変更しちゃって循環していないか調べる方法なら簡単だったんだけど、Vuexだとできないみたい……
})

override(tasks, 'getters', 'getInvalidPredecessorSet', _ => (state, getters) => task => {
  const result = new Set([task])

  const stack = [task]
  const visitedSet = new Set(stack)

  while (stack.length > 0) {
    const task = stack.pop()

    for (const lineal of [task].concat(getters.getAncestorTasks(task)).concat(getters.getDescendantTasks(task))) {
      result.add(lineal)

      for (const successor of state.filter(successor => successor.predecessorIds?.includes(lineal.id))) {
        if (visitedSet.has(successor)) {
          continue
        }

        visitedSet.add(successor)
        stack.push(successor)
      }
    }
  }

  return result
})

export default new Vuex.Store({
  modules: {
    skills: skills,
    tasks: tasks,
    members: members,
    taskSchedules: taskSchedules
  }
})
