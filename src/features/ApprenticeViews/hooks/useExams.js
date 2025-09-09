"use client"

import { useState } from "react"

// Datos de ejemplo para las evaluaciones
const exampleExams = [
  {
    id: 1,
    title: "Greeting & Introductions",
    type: "exam",
    timeLimit: 0, // Cambiado a 0 (sin límite)
    questions: [
      {
        id: 101,
        type: "multiple-choice",
        text: "What is the correct greeting for morning?",
        options: ["Good afternoon", "Good morning", "Good evening", "Good night"],
        correctAnswer: 1,
        points: 20,
      },
      {
        id: 102,
        type: "image",
        text: "What is shown in this image?",
        imageUrl: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?q=80&w=500",
        options: ["Sunset", "Sunrise", "Moonlight", "Northern lights"],
        correctAnswer: 0,
        points: 20,
      },
      {
        id: 103,
        type: "audio",
        text: "Listen to the audio and select what the person is saying:",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        options: ["Hello, how are you?", "Good morning!", "Nice to meet you", "See you tomorrow"],
        correctAnswer: 1,
        points: 20,
      },
      {
        id: 104,
        type: "completion",
        title: "Complete the sentence",
        text: "My name [] John and I [] from London.",
        options: ["is", "am", "are", "be", "come", "live", "visit"],
        wordsToComplete: ["is", "am"],
        points: 20,
      },
      {
        id: 105,
        type: "true-false",
        text: "The correct way to introduce yourself is saying 'My name are John'",
        options: ["True", "False"],
        correctAnswer: 1,
        points: 20,
      },
    ],
  },
  {
    id: 2,
    title: "Simple Present",
    type: "activity",
    timeLimit: 0, // Ya estaba en 0
    questions: [
      {
        id: 201,
        type: "multiple-choice",
        text: "Which sentence is in Simple Present?",
        options: ["He is going to school", "He went to school", "He goes to school", "He will go to school"],
        correctAnswer: 2,
        points: 20,
      },
      {
        id: 202,
        type: "image",
        text: "What is this person doing? (Use Simple Present)",
        imageUrl: "https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=500",
        options: ["He sleeps", "He runs", "He smiles", "He sits"],
        correctAnswer: 2,
        points: 20,
      },
      {
        id: 203,
        type: "audio",
        text: "Listen to the audio and select the correct Simple Present form:",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        options: ["She works", "She is working", "She worked", "She will work"],
        correctAnswer: 0,
        points: 20,
      },
      {
        id: 204,
        type: "completion",
        title: "Complete the sentence",
        text: "The cow [] eating a []",
        options: ["is", "was", "grass", "cookie", "meat", "fruit", "hay"],
        wordsToComplete: ["is", "grass"],
        points: 20,
      },
      {
        id: 205,
        type: "true-false",
        text: "In Simple Present, we add -s to the verb with he/she/it",
        options: ["True", "False"],
        correctAnswer: 0,
        points: 20,
      },
    ],
  },
  {
    id: 3,
    title: "Canon Listening",
    type: "activity",
    timeLimit: 0, // Cambiado a 0 (sin límite)
    questions: [
      {
        id: 301,
        type: "audio",
        text: "Listen and select the correct option",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        options: ["Option 1", "Option 2", "Option 3", "Option 4"],
        correctAnswer: 1,
        points: 20,
      },
      {
        id: 302,
        type: "audio",
        text: "Listen and select the correct option",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        options: ["Option 1", "Option 2", "Option 3", "Option 4"],
        correctAnswer: 3,
        points: 20,
      },
    ],
  },
  {
    id: 4,
    title: "Introducing yourself",
    type: "activity",
    timeLimit: 0,
    questions: [
      {
        id: 401,
        type: "multiple-choice",
        text: "Which is the correct way to introduce yourself?",
        options: ["I is John", "My name are John", "I am John", "Me John"],
        correctAnswer: 2,
        points: 20,
      },
      {
        id: 402,
        type: "completion",
        title: "Complete the sentence",
        text: "Hello, [] name is Sarah. [] am from Canada.",
        options: ["my", "I", "your", "we", "they", "she", "he"],
        wordsToComplete: ["my", "I"],
        points: 20,
      },
    ],
  },
  {
    id: 5,
    title: "Support phrases",
    type: "activity",
    timeLimit: 0,
    questions: [
      {
        id: 501,
        type: "multiple-choice",
        text: "Which phrase would you use to ask someone's name?",
        options: ["How old are you?", "What is your name?", "Where do you live?", "What time is it?"],
        correctAnswer: 1,
        points: 20,
      },
      {
        id: 502,
        type: "true-false",
        text: "The phrase 'Nice to meet you' is used when you meet someone for the first time.",
        options: ["True", "False"],
        correctAnswer: 0,
        points: 20,
      },
      {
        id: 503,
        type: "audio",
        text: "Listen to the audio and select the correct greeting:",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        options: ["Good morning", "Good afternoon", "Good evening", "Good night"],
        correctAnswer: 1,
        points: 20,
      },
    ],
  },
]

export const useExams = () => {
  const [exams, setExams] = useState(exampleExams)

  // Función para obtener un examen por su ID
  const getExamById = (id) => {
    return exams.find((exam) => exam.id === id)
  }

  // Función para obtener un examen por su título
  const getExamByTitle = (title) => {
    return exams.find((exam) => exam.title === title)
  }

  // Función para actualizar los resultados de un examen
  const updateExamResults = (examId, score) => {
    // Aquí podrías implementar la lógica para guardar los resultados
    console.log(`Exam ${examId} completed with score: ${score}`)
  }

  return {
    exams,
    getExamById,
    getExamByTitle,
    updateExamResults,
  }
}