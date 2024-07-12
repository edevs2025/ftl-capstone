# Project Plan

Pod Members: **Christopher Adeniji, Bailey Williams, Kenneth Jiang** 

Project Name: **muso.ai by reverie**

## Problem Statement and Description

Many individuals, particularly young adults, experience significant anxiety and stress when preparing for behavioral interviews. Traditional mock interview resources often lack real-time, personalized feedback and are not always accessible or effective in reducing interview-related anxiety. The primary target audience for this project is young adults who are entering the job market or transitioning to new career opportunities. This includes recent graduates, individuals preparing for internships, and young professionals seeking career advancement. Additionally, the platform aims to be inclusive and beneficial for anyone who needs interview pra

## User Roles and Personas

Interviewee: Person coming to the website to practice their interviewing skills and learn what they do well/need to improve on.

Bailey is an unemployed person (of any age) looking to get a Job. While his resume is good enough to get past the screens, he hasn't been able to get past the behavioral interviews. He came to this site because he wants on-demand practice with interviewing that gives him feedback immediately. He doesn't if his shortcombings are rooting in his anxiety caused by the human interviewer or the fact that he just needs interviewing practice. This site will help him develop a routine with interviewing that allows him to get past the cause of his failures whatever they may be.

## User Stories

As an interviewee, I want to be able to save my progress, so that I can see whether or not I'm making improvements.
As an interviewee, I want to see my cumulative interview stats in a dashboard so I can understand what I need (or don't need) to focus on.
As an interviewee, I want to practice my speaking skills, so that I feel comfortable talking out loud in an actual interview.
As an interviewee, I want to have accessibility to mock interviews, so I can practice on my own time.
As an interviewee, I want to choose interview questions to my liking, so I can focus on improving in my own career path.
As an interviewee, I want to simulate talking with a person, so I understand the flow of an interview better.
As an interviewee, I want the option to receive instant feedback on my responses, so I can immediately correct any mistakes and improve my answers.
As an interviewee, I want to be able to record my practice sessions, so I can review them later and observe my body language and speech patterns.
As an interviewee, I want to access expert tips and strategies, so I can learn the best practices for answering common interview questions.
As an interviewee, I want to receive tailored question sets based on the job roles I am applying for, so I can practice with the most relevant and challenging questions for my field.

## Pages/Screens

* Landing (Home) Page: https://drive.google.com/file/d/1yPR9y0QN6V_G6kjdpFdFjoBQFs6y_Zdz/view?usp=sharing 
* Questions List Page: https://drive.google.com/file/d/1aJOAUaj2OLUV-sffOUWWqS-Xaop25jbO/view?usp=sharing , https://drive.google.com/file/d/19TmQZSFx0Hf6x548XQq80Cm9BioQljnF/view?usp=sharing
* AI Mock Interview Page: https://drive.google.com/file/d/19HShyfpUXsYFe-TPe113wRnUpgssx142/view?usp=sharing
* User profile Page: https://drive.google.com/file/d/19DUVrg1_9YcntgbG7Fd6UOETRWwG8RK7/view?usp=sharing
* Login / Signup Page: https://drive.google.com/file/d/19Ato3KcyaAayaqJhUt3-BzBno0YtrVP_/view?usp=sharing

## Data Model

model User {
 userId  Int    @id @default(autoincrement())
 username String  @unique
 name   String
 email   String  @unique
 password String
 age    Int?
 employed Boolean?
 createdAt DateTime @default(now())
 updatedAt DateTime @updatedAt
 industries Industry[] @relation("userIndustries")
 questions Question[] @relation("userQuestions")
 sessions  Session[]
}

model Industry {
 industryId  Int    @id @default(autoincrement())
 industryName String
 users    User[] @relation("userIndustries")
 questions  Question[] @relation("questionIndustries")
}

Figure out @relation for many to many session -> question
Check how to track question order in session

model Session {
  sessionId Int       @id @default(autoincrement())
  user      User      @relation(fields: [userId], references: [userId])
  userId    Int
  createdAt DateTime  @default(now())
  questions SessionQuestion[]
  feedback  Feedback[]
}

model Question {
  questionId      Int       @id @default(autoincrement())
  questionContent String
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  users           User[] @relation("userQuestion")
  industries      Industry[] @relation("questionIndustries")
  sessions        SessionQuestion[]
  feedback        Feedback[]
}

model SessionQuestion {
  session    Session  @relation(fields: [sessionId], references: [sessionId])
  sessionId  Int
  question   Question? @relation(fields: [questionId], references: [questionId])
  questionId Int
  askedAt  DateTime
  isGenerated Boolean @default(false)

  @@id(name: "sessionQuestionId",[sessionId, questionId])
}

model Feedback {
 feedbackId Int   @id @default(autoincrement())
 score    Float
 gptResponse String
 userAnswer String
 sessionQuestion  SessionQuestion @relation(fields: [sessionQuestionId], references: [sessionQuestionId])
 sessionQuestionId Int
 session   Session @relation(fields: [sessionId], references: [sessionId])
 sessionId  Int
}

## Endpoints

| CRUD         | HTTP Verb    | Description                             | Model this applies to  |
| ------------ | ------------ | --------------------------------------- | ---------------------- |
| Create       | POST         | Create a new user                       | User                   |
| Read         | GET          | Get a user by ID                        | User                   |
| Read         | GET          | Get all users                           | User                   |
| Update       | PUT          | Update a user by ID                     | User                   |
| Delete       | DELETE       | Delete a user by ID                     | User                   |
| Create       | POST         | Create a new industry                   | Industry               |
| Read         | GET          | Get an industry by ID                   | Industry               |
| Read         | GET          | Get all industries                      | Industry               |
| Update       | PUT          | Update an industry by ID                | Industry               |
| Delete       | DELETE       | Delete an industry by ID                | Industry               |
| Create       | POST         | Create a new session                    | Session                |
| Read         | GET          | Get a session by ID                     | Session                |
| Read         | GET          | Get all sessions                        | Session                |
| Update       | PUT          | Update a session by ID                  | Session                |
| Delete       | DELETE       | Delete a session by ID                  | Session                |
| Create       | POST         | Create a new question                   | Question               |
| Read         | GET          | Get a question by ID                    | Question               |
| Read         | GET          | Get all questions                       | Question               |
| Update       | PUT          | Update a question by ID                 | Question               |
| Delete       | DELETE       | Delete a question by ID                 | Question               |
| Create       | POST         | Create a new session question           | SessionQuestion        |
| Read         | GET          | Get a session question by session ID    | SessionQuestion        |
| Read         | GET          | Get all session questions               | SessionQuestion        |
| Update       | PUT          | Update a session question by session ID | SessionQuestion        |
| Delete       | DELETE       | Delete a session question by session ID | SessionQuestion        |
| Create       | POST         | Create a new feedback                   | Feedback               |
| Read         | GET          | Get feedback by ID                      | Feedback               |
| Read         | GET          | Get all feedbacks                       | Feedback               |
| Update       | PUT          | Update feedback by ID                   | Feedback               |
| Delete       | DELETE       | Delete feedback by ID                   | Feedback               |


***Don't forget to set up your Issues, Milestones, and Project Board!***
