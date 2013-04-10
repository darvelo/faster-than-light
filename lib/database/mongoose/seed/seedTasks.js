/*
    {
      projectIdx: 1,
      path: [],
      children: [],
      type: 1,
      folOpen: 1,
      depOpen: 1,
      order: 0,
      tags: [],
    },
*/

var appearancesByTask = [
  // task 0
  [
    // appearances
    {
      projectIdx: 0,
      path: [],
      children: [4, 7],
      type: 1,
      folOpen: 1,
      depOpen: 1,
      order: 0,
      tags: ['sample', 'tag'],
    },
  ],
  // task 1
  [
    {
      projectIdx: 1,
      path: [],
      children: [5, 6],
      type: 1,
      folOpen: 1,
      depOpen: 1,
      order: 0,
      tags: ['tag', 'yoyo'],
    },
  ],
  // task 2
  [
    {
      projectIdx: 2,
      path: [],
      children: [7],
      type: 1,
      folOpen: 1,
      depOpen: 1,
      order: 0,
      tags: [],
    },
    {
      projectIdx: 1,
      path: [1, 6],
      children: [],
      type: 1,
      folOpen: 1,
      depOpen: 1,
      order: 0,
      tags: [],
    },
    {
      projectIdx: 6,
      path: [],
      children: [9, 10],
      type: 1,
      folOpen: 1,
      depOpen: 1,
      order: 0,
      tags: [],
    },
  ],
  // task 3
  [
    {
      projectIdx: 4,
      path: [],
      children: [13],
      type: 1,
      folOpen: 1,
      depOpen: 1,
      order: 0,
      tags: [],
    },
  ],
  // task 4
  [
    {
      projectIdx: 0,
      path: [0],
      children: [11],
      type: 1,
      folOpen: 1,
      depOpen: 1,
      order: 1,
      tags: [],
    },
  ],
  // task 5
  [
    {
      projectIdx: 1,
      path: [1],
      children: [11, 12],
      type: 1,
      folOpen: 1,
      depOpen: 1,
      order: 0,
      tags: [],
    },
  ],
  // task 6
  [
    {
      projectIdx: 1,
      path: [1],
      children: [2, 13],
      type: 1,
      folOpen: 1,
      depOpen: 1,
      order: 1,
      tags: [],
    },
  ],
  // task 7
  [
    {
      projectIdx: 2,
      path: [2],
      children: [],
      type: 1,
      folOpen: 1,
      depOpen: 1,
      order: 0,
      tags: [],
    },
    {
      projectIdx: 0,
      path: [0],
      children: [],
      type: 1,
      folOpen: 1,
      depOpen: 1,
      order: 0,
      tags: [],
    },
    {
      projectIdx: 4,
      path: [3, 13],
      children: [],
      type: 1,
      folOpen: 1,
      depOpen: 1,
      order: 0,
      tags: [],
    },
    {
      projectIdx: 3,
      path: [],
      children: [],
      type: 1,
      folOpen: 1,
      depOpen: 1,
      order: 0,
      tags: [],
    },
  ],
  // task 8
  [
    {
      projectIdx: 5,
      path: [12],
      children: [],
      type: 1,
      folOpen: 1,
      depOpen: 1,
      order: 0,
      tags: [],
    },
  ],
  // task 9
  [
    {
      projectIdx: 6,
      path: [2],
      children: [],
      type: 1,
      folOpen: 1,
      depOpen: 1,
      order: 0,
      tags: [],
    },
  ],
  // task 10
  [
    {
      projectIdx: 6,
      path: [2],
      children: [14],
      type: 1,
      folOpen: 1,
      depOpen: 1,
      order: 1,
      tags: [],
    },
  ],
  // task 11
  [
    {
      projectIdx: 0,
      path: [0, 4],
      children: [],
      type: 1,
      folOpen: 1,
      depOpen: 1,
      order: 0,
      tags: [],
    },
    {
      projectIdx: 1,
      path: [1, 5],
      children: [],
      type: 1,
      folOpen: 1,
      depOpen: 1,
      order: 0,
      tags: [],
    },
  ],
  // task 12
  [
    {
      projectIdx: 1,
      path: [1, 5],
      children: [],
      type: 1,
      folOpen: 1,
      depOpen: 1,
      order: 1,
      tags: [],
    },
    {
      projectIdx: 5,
      path: [],
      children: [8],
      type: 1,
      folOpen: 1,
      depOpen: 1,
      order: 0,
      tags: [],
    },
  ],
  // task 13
  [
    {
      projectIdx: 1,
      path: [1, 6],
      children: [],
      type: 1,
      folOpen: 1,
      depOpen: 1,
      order: 1,
      tags: [],
    },
    {
      projectIdx: 4,
      path: [3],
      children: [7],
      type: 1,
      folOpen: 1,
      depOpen: 1,
      order: 0,
      tags: [],
    },
  ],
  // task 14
  [
    {
      projectIdx: 6,
      path: [2, 10],
      children: [],
      type: 1,
      folOpen: 1,
      depOpen: 1,
      order: 0,
      tags: [],
    },
  ],
];

exports.numTasks = appearancesByTask.length;
exports.appearances = appearancesByTask;
