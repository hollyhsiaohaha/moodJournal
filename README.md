# Mood Journal

## Description

[![Logo](./public/logo.png)](https://mood-journal.holly-hsiao.com/)

[Mood Journal](https://mood-journal.holly-hsiao.com/) is a mood diary application aimed at helping users understand their emotions better through input, linking, and graphical output of journals.

### Test account

    Email: test@test.com
    Password: test

### Demo Video

[![Mood Journal Demo](https://img.youtube.com/vi/gPDw-DbZAw0/mqdefault.jpg)](https://www.youtube.com/watch?v=gPDw-DbZAw0)

## Functions

### Journal Links

Implementing autocomplete using **Elasticsearch** to suggest note titles for users. Developed a customized renderer on **easyMDE** for linking between journals.

![Journal Links](./public/Journal%20Links.gif)

### Voice to Text

User-recorded audio is uploaded to **S3** and subjected to voice-to-text processing. The audio and their corresponding textual content are then embedded into HTML within the journals.

![Voice to Text](./public/Voice%20to%20Text.gif)

### Sentiment Analysis

Integrates **OpenAI API** services to perform sentiment analysis on journal contents. The system returns an emotional score, along with the feelings and influencing factors.

![Sentiment Analysis](./public/Sentiment%20Analysis.gif)

### Mood Calendar

A calendar showing the emotional trends of the month, where warmer and cooler colors represent high and low emotional scores, respectively. Clicking on a date leads to the corresponding diary page.

![Mood Calendar](./public/Mood%20Calendar.gif)

### Dashboard

The dashboard page developed using **Chart.js**, assists users in observing their emotional records to gain insights. It includes emotional scores, influencing factors, feelings, and key keywords.

![Dashboard](./public/Dashboard.gif)

### Force Graph

The Force Graph, crafted using **D3.js**, offers users an intuitive understanding of the interrelationships among journals.

![Force Graph](./public/Force%20Graph.gif)

## Architecture

![System Design](./public/Mood%20Journal%20Visual%20Parad.png)

## Technologies and Tools

- Back-End

    `JavaScript` `Node.js` `Express` `Elasticsearch` `GraphQL`
- Front-End

    `HTML` `CSS` `Primereact` `Chart.js` `D3.js` `EasyMDE`

- Database

    `MongoDB` `Redis`

- AWS Services

    `EC2` `S3` `ElastiCache` `CloudWatch` `CloudFront`

- Others

    `Vitest` `K6` `GitHub Actions`

## Reference

[API Doc](https://studio.apollographql.com/sandbox/explorer?endpoint=https://mood-journal.holly-hsiao.com/graphql)

## Author

Holly Hsiao: <yahanhsiao@gmail.com>
