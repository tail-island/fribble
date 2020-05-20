import express from 'express';
import fs from 'fs';

function writeQuestion(data) {
  const question = {}

  question.skills = data.skills.map((skill, index) => ({
    id: index + 1,
    name: skill.name
  }))

  question.tasks = data.tasks.map((task, index) => {
    const result = {
      id: index + 1,
      name: task.name,
      predecessorIds: task.predecessorIds && task.predecessorIds.map(predecessorId => data.tasks.findIndex(predecessor => predecessor.id === predecessorId) + 1)
    }

    const children = data.tasks.filter(child => child.parentId === task.id)

    if (children.length > 0) {
      result.childIds = children.map(child => data.tasks.findIndex(task => task.id === child.id) + 1)
    }

    if (task.duration && children.length == 0) {
      result.duration = task.duration
    }

    if (task.skillIds && children.length == 0) {
      result.skillIds = task.skillIds.map(skillId => data.skills.findIndex(skill => skill.id === skillId) + 1)
    }

    return result
  })

  question.members = data.members.map((member, index) => ({
    id: index + 1,
    name: member.name,
    skillIds: member.skillIds && member.skillIds.map(skillId => data.skills.findIndex(skill => skill.id === skillId) + 1)
  }))

  fs.writeFileSync('./data/question.json', JSON.stringify(question, null, "  "), 'utf-8')
}

export default (app, http) => {
  app.use(express.json());

  app.get('/question', (req, res) => {
    const data = (() => {
      if (!fs.existsSync('./data/data.json')) {
        return (
          {
            skills: [
              {
                id: 'd11f5aab-73de-4ce6-ac40-fe940ca6c551',
                name: 'プログラミング'
              },
              {
                id: 'd2858e8c-328a-4e74-8888-0c204328968d',
                name: 'テスト'
              }
            ],
            tasks: [
              {
                id: '3936d82b-bce8-4c1c-a2a3-b2d3f10da3ec',
                name: '開発',
              },
              {
                id: 'b148b486-d7bc-436e-8824-11b7095862e8',
                name: 'モデル',
                duration: 3,
                skillIds: ['d11f5aab-73de-4ce6-ac40-fe940ca6c551'],
                parentId: '3936d82b-bce8-4c1c-a2a3-b2d3f10da3ec'
              },
              {
                id: '54ac9bef-eeb4-4fd9-991b-17fac1b115e0',
                name: 'ビュー',
                duration: 5,
                skillIds: ['d11f5aab-73de-4ce6-ac40-fe940ca6c551'],
                predecessorIds: ['b148b486-d7bc-436e-8824-11b7095862e8'],
                parentId: '3936d82b-bce8-4c1c-a2a3-b2d3f10da3ec'
              },
              {
                id: 'cde462c7-e240-4b66-86ce-719a55a5864b',
                name: 'テスト',
                duration: 5,
                skillIds: ['d2858e8c-328a-4e74-8888-0c204328968d'],
                predecessorIds: ['3936d82b-bce8-4c1c-a2a3-b2d3f10da3ec']
              }
            ],
            members: [
              {
                id: 'a1a8335f-1d54-4b7f-979a-b54cfeab7051',
                name: 'アリス',
                skillIds: ['d11f5aab-73de-4ce6-ac40-fe940ca6c551']
              },
              {
                id: 'b532a2a4-9583-4a50-bac1-48e67b63f11b',
                name: 'ボブ',
                skillIds: ['d2858e8c-328a-4e74-8888-0c204328968d']
              }
            ],
            taskSchedules: []
          }
        )
      }

      return JSON.parse(fs.readFileSync('./data/data.json', 'utf-8'))
    })()

    res.json(data);
  });

  app.post('/question', (req, res) => {
    const data = req.body

    fs.writeFileSync('./data/data.json', JSON.stringify(data), 'utf-8')
    writeQuestion(data)

    res.send('ok')
  });
}
