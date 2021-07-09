## Attendance Checking Program Backend

### .env
`.env` file have this 6 values
- PORT
- MONGODB_URI: current database is own by Bitna's mongoDB account 
- API_KEY : This value is from `zoomFTW@coderschool.vn` account
- API_SECRET
- JWT_TOKEN
- WEB_HOOK_TOKEN



## Backend API

- https://attendance-checking-app.herokuapp.com
- Backend server is also own by Bitna's heroku 

## End point

- /course : get, post course
- /cohort : get, post cohort
- /attendance: get all attendance
- /attendance/:sessionId : get attendance by session id
- /student : get, post students
- /notification :  Zoom webhook will call this notification when they finish the meeting 

  **how to post student**
  example data

```
{
    "students": [

        {
            "studentId": "003",
            "name": "loi",
            "email": "loi@gmail.com",
            "cohortId": "6035cdb45b7c4e1d5459da61",
            "gender": "M",
            "phone": "4443467433",
            "status": "onGoing",
            "foreigner": true,
            "discordId": "loi",
            "zoomId": "loi@gmail.com",
            "company": "",
            "salary": "",
            "note": "",
            "cvUrl": "",
            "showOnWebsite": true
        },

        {
            "studentId":"005",
            "name":"charles",
            "email":"charles@gmail.com",
            "cohortId":"6035cdb45b7c4e1d5459da60",
            "gender":"M",
            "phone":"5995595959",
            "status":"onGoing",
            "foreigner":true,
            "discordId":"charles",
            "zoomId":"charles@gmail.com",
            "company":"",
            "salary":"",
            "note":"",
            "cvUrl":"",
            "showOnWebsite":true
        }
    ]
}
```

## Logic
1. When Zoom **meeting finish,** it will call our api : **`/notification`** (you can change this endpoint in Zoom api website). It will give you the **meeting Id** information only
2. **generateAttendance** function will call Zoom api **`/report/meetings/:id`** to get the **duration and start_time** information of that meeting 
3. In order to get **participants information,** Zoom api will be
**`/report/meetings/:id/participants`**
4. After we get the participants information, it will check this session is exist in database or not **by date (1 day 1 session only)**
5. If we dont have that session, we create new session
6. When we create the new session, we group the **data by `participant.id`** 
7. When the session is already exist, we check it's duplicate data or not
8. If its same day but different session, then we add this new data to exist session 
9. we have 3 attendnace status so far
- **miss** : someone who doesn't have any record or miss the half of meeting 
-  **late** : someone who show up 20 minutes after the meeting start 
-  **attend** : someone who is not belong to miss or late


 
## Zoom API Rule
- All zoom account **share one webhook,** so you don't need to create the webhook for every single accounts 
- If host join to breakoutroom, zoom create another log 
  ex) class start at 10am and finish at 11am and everyone join to breakoutroom from 10:30am to 10:40am , then your data will look like this
  ```json
  
  {    id: "bitna"
      join_time:10am ,
      leave_time:11am,
  },
  {    id: "bitna"
      join_time:10:30am ,
      leave_time:10:40am,
  },
```

