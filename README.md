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

- Virtualization

    `Docker`

- Others

    `Vitest` `K6` `GitHub Actions`

## Performance Tuning

With the integration of `Elasticsearch` into the system, **55%** improvement in the efficiency of the autocomplete API has been achieved.

### Before
```
checks.........................: 100.00% ✓ 53541     ✗ 0
data_received..................: 47 MB   52 kB/s
data_sent......................: 34 MB   37 kB/s
http_req_blocked...............: avg=955.14µs min=0s      med=8µs      max=212.53ms p(90)=14µs     p(95)=17µs
http_req_connecting............: avg=407.07µs min=0s      med=0s       max=67.67ms  p(90)=0s       p(95)=0s
http_req_duration..............: avg=121.74ms min=93.17ms med=113.06ms max=849.15ms p(90)=151.06ms p(95)=172.62ms
{ expected_response:true }...: avg=121.74ms min=93.17ms med=113.06ms max=849.15ms p(90)=151.06ms p(95)=172.62ms
http_req_failed................: 0.00%   ✓ 0         ✗ 53541
http_req_receiving.............: avg=141.95µs min=11µs    med=91µs     max=21.27ms  p(90)=203µs    p(95)=288µs
http_req_sending...............: avg=60.92µs  min=5µs     med=38µs     max=20.63ms  p(90)=80µs     p(95)=106µs
http_req_tls_handshaking.......: avg=531.8µs  min=0s      med=0s       max=72.63ms  p(90)=0s       p(95)=0s
http_req_waiting...............: avg=121.54ms min=92.95ms med=112.87ms max=849.06ms p(90)=150.87ms p(95)=172.37ms
http_reqs......................: 53541   59.461853/s
iteration_duration.............: avg=1.12s    min=1.09s   med=1.11s    max=1.85s    p(90)=1.15s    p(95)=1.18s
iterations.....................: 53541   59.461853/s
vus............................: 1       min=1       max=100
vus_max........................: 100     min=100     max=100
```

### After
```
checks.........................: 99.94% ✓ 56308     ✗ 33
data_received..................: 34 MB  34 kB/s
data_sent......................: 35 MB  35 kB/s
http_req_blocked...............: avg=1.03ms   min=1µs     med=9µs     max=308.76ms p(90)=15µs    p(95)=18µs
http_req_connecting............: avg=429.77µs min=0s      med=0s      max=153.59ms p(90)=0s      p(95)=0s
http_req_duration..............: avg=67.69ms  min=36.27ms med=53.38ms max=2m17s    p(90)=94.92ms p(95)=121.79ms
{ expected_response:true }...: avg=65.09ms  min=38.75ms med=53.37ms max=922.41ms p(90)=94.83ms p(95)=121.47ms
http_req_failed................: 0.05%  ✓ 33        ✗ 56308
http_req_receiving.............: avg=166.2µs  min=0s      med=100µs   max=21.46ms  p(90)=224µs   p(95)=403µs
http_req_sending...............: avg=68.02µs  min=5µs     med=41µs    max=25.36ms  p(90)=79µs    p(95)=109µs
http_req_tls_handshaking.......: avg=583.55µs min=0s      med=0s      max=184.98ms p(90)=0s      p(95)=0s
http_req_waiting...............: avg=67.46ms  min=36.18ms med=53.14ms max=2m17s    p(90)=94.7ms  p(95)=121.55ms
http_reqs......................: 56341  55.952534/s
iteration_duration.............: avg=1.06s    min=1.03s   med=1.05s   max=31.94s   p(90)=1.1s    p(95)=1.13s
iterations.....................: 56341  55.952534/s
vus............................: 1      min=1       max=100
vus_max........................: 100    min=100     max=100
```

## Reference

[API Doc](https://studio.apollographql.com/sandbox/explorer?endpoint=https://mood-journal.holly-hsiao.com/graphql)

## Author

Holly Hsiao: <yahanhsiao@gmail.com>
