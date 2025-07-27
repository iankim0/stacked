import { Workout } from '@/types/workout';

export const sampleWorkouts: Workout[] = [
  {
    id: '1',
    name: 'Push Day',
    date: '2024-01-20',
    blocks: [
      {
        id: '1',
        type: 'single' as const,
        exercises: [
          {
            id: '1',
            name: 'Bench Press',
            weightUnit: 'kg' as const,
            sets: [
              { id: '1', reps: 8, weight: 80 },
              { id: '2', reps: 8, weight: 85 },
              { id: '3', reps: 6, weight: 90 }
            ]
          }
        ]
      },
      {
        id: '1_2',
        type: 'single' as const,
        exercises: [
          {
            id: '2', 
            name: 'Shoulder Press',
            weightUnit: 'kg' as const,
            sets: [
              { id: '4', reps: 10, weight: 45 },
              { id: '5', reps: 10, weight: 45 },
              { id: '6', reps: 8, weight: 50 }
            ]
          }
        ]
      },
      {
        id: '1_3',
        type: 'single' as const,
        exercises: [
          {
            id: '3',
            name: 'Tricep Dips',
            weightUnit: 'kg' as const,
            sets: [
              { id: '7', reps: 12, weight: 0 },
              { id: '8', reps: 10, weight: 0 },
              { id: '9', reps: 8, weight: 0 }
            ]
          }
        ]
      }
    ],
    notes: 'Great session, felt strong on bench press'
  },
  {
    id: '2',
    name: 'Pull Day',
    date: '2024-01-18',
    blocks: [
      {
        id: '2',
        type: 'single' as const,
        exercises: [
          {
            id: '4',
            name: 'Deadlift',
            weightUnit: 'kg' as const,
            sets: [
              { id: '10', reps: 5, weight: 120 },
              { id: '11', reps: 5, weight: 130 },
              { id: '12', reps: 3, weight: 140 }
            ]
          }
        ]
      },
      {
        id: '2_2',
        type: 'single' as const,
        exercises: [
          {
            id: '5',
            name: 'Pull-ups',
            weightUnit: 'kg' as const,
            sets: [
              { id: '13', reps: 8, weight: 0 },
              { id: '14', reps: 6, weight: 0 },
              { id: '15', reps: 5, weight: 0 }
            ]
          }
        ]
      },
      {
        id: '2_3',
        type: 'single' as const,
        exercises: [
          {
            id: '6',
            name: 'Barbell Rows',
            weightUnit: 'kg' as const,
            sets: [
              { id: '16', reps: 10, weight: 70 },
              { id: '17', reps: 10, weight: 75 },
              { id: '18', reps: 8, weight: 80 }
            ]
          }
        ]
      }
    ]
  },
  {
    id: '3',
    name: 'Leg Day',
    date: '2024-01-16',
    blocks: [
      {
        id: '3',
        type: 'superset' as const,
        exercises: [
          {
            id: '7',
            name: 'Squats',
            weightUnit: 'kg' as const,
            sets: [
              { id: '19', reps: 10, weight: 100 },
              { id: '20', reps: 8, weight: 110 },
              { id: '21', reps: 6, weight: 120 }
            ]
          },
          {
            id: '7_2',
            name: 'Tricep Dips',
            weightUnit: 'kg' as const,
            sets: [
              { id: '13', reps: 12, weight: 0 },
              { id: '14', reps: 10, weight: 0 }
            ]
          }
        ]
      },
      {
        id: '3_2',
        type: 'single' as const,
        exercises: [
          {
            id: '8',
            name: 'Romanian Deadlifts',
            weightUnit: 'kg' as const,
            sets: [
              { id: '22', reps: 12, weight: 80 },
              { id: '23', reps: 12, weight: 85 },
              { id: '24', reps: 10, weight: 90 }
            ]
          }
        ]
      }
    ],
    notes: 'Legs feeling sore after this one!'
  }
];

// Initialize sample data if no workouts exist
export const initializeSampleData = () => {
  const existingWorkouts = localStorage.getItem('stacked_workouts');
  if (!existingWorkouts) {
    localStorage.setItem('stacked_workouts', JSON.stringify(sampleWorkouts));
  }
};