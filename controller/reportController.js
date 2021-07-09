const Session = require("../model/session");
const Cohort = require("../model/cohort");
const api = require("../util/api");
const moment = require("moment");
const { report } = require("../routes");
const reportController = {};
let studentsOnTime = [];
let meetingStartTime = null;
/*
{
    "status": "success",
    "data": {
        "participants": [
            {
                "id": "w_SsR7fQTEecvuB-S1ZHEQ",
                "user_id": "16778240",
                "name": "FTW CoderSchool",
                "user_email": "zoomftw@coderschool.vn",
                "join_time": "2021-02-25T04:22:53Z",
                "leave_time": "2021-02-25T04:23:58Z",
                "duration": 65,
                "attentiveness_score": "",
                "cohortList":[],
                "log": [
                    {
                        "join_time": "2021-02-25T04:22:53Z",
                        "leave_time": "2021-02-25T04:23:58Z"
                    }
                ]
            },
            {
                "id": "etTwhJ4kRVuIHqQx17UP3A",
                "user_id": "16787456",
                "name": "CoderSchool Zoom02",
                "user_email": "zoomcs02@coderschool.vn",
                "join_time": "2021-02-25T04:23:08Z",
                "leave_time": "2021-02-25T04:23:23Z",
                "duration": 38,
                "attentiveness_score": "",
                "cohortList":[],
                "log": [
                    {
                        "join_time": "2021-02-25T04:23:08Z",
                        "leave_time": "2021-02-25T04:23:23Z"
                    },
                    {
                        "join_time": "2021-02-25T04:23:35Z",
                        "leave_time": "2021-02-25T04:23:58Z"
                    }
                ]
            }
        ],
        "_id": "6037672f28966541d043c391",
        "meetingId": 87932878161,
        "startDate": "02/25/2021",
        "createdAt": "2021-02-25T09:00:31.612Z",
        "updatedAt": "2021-02-25T09:00:31.612Z",
        "__v": 0
    }
}
*/
reportController.generateAttendance = async (req, res, next) => {
  try {
    if (req.body.payload.object.id) {
      const meetingInfo = await api.get(
        `/report/meetings/${req.body.payload.object.id}`
      );
      console.log("meetingInfo", meetingInfo.data);

      const { duration, start_time } = meetingInfo.data;
      const zoomRes = await api.get(
        `/report/meetings/${req.body.payload.object.id}/participants`,
        { params: { page_size: 150 } }
      );
      console.log("zoomRes", zoomRes.data);
      const existSession = await Session.findOne({
        startDate: moment(req.body.payload.object.start_time).format(
          "MM/DD/YYYY"
        ),
        meetingId: req.body.payload.object.id,
      });
      console.log("existSession", existSession);
      /*
      if the session is already exist, 
      for the exist participants, just add duration and log 
      if its new participants, add new record under the session 
      */
      if (existSession) {
        let newStudentList = existSession.participants;

        for (let i = 0; i < zoomRes.data.participants.length; i++) {
          let participant = zoomRes.data.participants[i];

          let existParticipantIndex = newStudentList.findIndex(
            (item) => item.id == participant.id
          );

          if (existParticipantIndex != -1) {
            let result = newStudentList[existParticipantIndex].log.find(
              // to prevent add same records twice
              (item) => {
                return item.join_time == participant.join_time;
              }
            );

            if (result) {
              continue;
            }

            newStudentList[existParticipantIndex].leave_time = moment(
              newStudentList[existParticipantIndex].leave_time
            ).isAfter(participant.leave_time)
              ? newStudentList[existParticipantIndex].leave_time
              : participant.leave_time;

            newStudentList[existParticipantIndex].duration = moment(
              newStudentList[existParticipantIndex].leave_time
            ).diff(newStudentList[existParticipantIndex].join_time, "seconds");

            newStudentList[existParticipantIndex].log.push({
              join_time: participant.join_time,
              leave_time: participant.leave_time,
            });
            newStudentList[existParticipantIndex].leave_time =
              participant.leave_time;
            if (
              newStudentList[existParticipantIndex].duration <
              duration * 0.5
            ) {
              newStudentList[existParticipantIndex].attendance = "miss";
            } else {
              if (
                moment(newStudentList[existParticipantIndex].join_time).isAfter(
                  moment(start_time).add(20, "minutes")
                )
              ) {
                newStudentList[existParticipantIndex].attendance = "late";
              } else {
                newStudentList[existParticipantIndex].attendance = "attend";
              }
            }
          } else {
            if (
              moment(participant.join_time).isAfter(
                moment(start_time).add(20, "minutes")
              )
            ) {
              participant.attendance = "late";
            } else {
              participant.attendance = "attend";
            }
            if (participant.duration < duration * 0.5) {
              participant.attendance = "miss";
            }

            participant.log = [
              {
                join_time: participant.join_time,
                leave_time: participant.leave_time,
              },
            ];
            newStudentList.push(participant);
          }
        }
        const updateSession = await Session.updateOne(
          { _id: existSession._id },
          { participants: newStudentList }
        );

        return res.status(200).json({ status: "success", data: updateSession });
      } else {
        /*if the session is new, 
        create the new session 
        but before that. for the duplicate participants record, combine it into one record
        */

        let newStudentList = [];

        for (let i = 0; i < zoomRes.data.participants.length; i++) {
          let participant = zoomRes.data.participants[i];

          let existParticipantIndex = newStudentList.findIndex(
            (item) => item.id == participant.id
          );

          if (existParticipantIndex != -1) {
            newStudentList[existParticipantIndex].leave_time = moment(
              newStudentList[existParticipantIndex].leave_time
            ).isAfter(participant.leave_time)
              ? newStudentList[existParticipantIndex].leave_time
              : participant.leave_time;

            newStudentList[existParticipantIndex].duration = moment(
              newStudentList[existParticipantIndex].leave_time
            ).diff(newStudentList[existParticipantIndex].join_time, "seconds");
            if (
              newStudentList[existParticipantIndex].duration <
              duration * 0.5
            ) {
              newStudentList[existParticipantIndex].attendance = "miss";
            } else {
              if (
                moment(newStudentList[existParticipantIndex].join_time).isAfter(
                  moment(start_time).add(20, "minutes")
                )
              ) {
                newStudentList[existParticipantIndex].attendance = "late";
              } else {
                newStudentList[existParticipantIndex].attendance = "attend";
              }
            }

            newStudentList[existParticipantIndex].log.push({
              join_time: participant.join_time,
              leave_time: participant.leave_time,
            });
          } else {
            if (
              moment(participant.join_time).isAfter(
                moment(start_time).add(20, "minutes")
              )
            ) {
              participant.attendance = "late";
            } else {
              participant.attendance = "attend";
            }
            if (participant.duration < duration * 0.5) {
              participant.attendance = "miss";
            }
            participant.log = [
              {
                join_time: participant.join_time,
                leave_time: participant.leave_time,
              },
            ];

            newStudentList.push(participant);
          }
        }

        let session = await Session.create({
          meetingId: req.body.payload.object.id,
          startDate: moment(newStudentList[0].join_time).format("MM/DD/YYYY"),
          participants: newStudentList,
        });
        let cohort = await Cohort.findOne({
          meetingId: req.body.payload.object.id,
        });

        let sessionList = cohort.sessions;
        sessionList.push(session._id);

        let result = await Cohort.updateOne(
          { meetingId: req.body.payload.object.id },
          { sessions: sessionList }
        );

        return res.status(200).json({ status: "success", data: session });
      }
    } else {
      throw new Error("here is no meeting Id at request parameter");
    }
  } catch (err) {
    return res.status(401).json({ status: "fail", message: err.message });
  }
};
reportController.linkCohortAndSession = async (req, res, next) => {
  try {
    const meetingId = req.body.meetingId;
    if (meetingId) {
      const existSession = await Session.find({
        meetingId: meetingId,
      });
      if (existSession.length > 0) {
        const idList = existSession.map((item) => item._id);

        let result = await Cohort.updateOne(
          { meetingId: meetingId },
          { sessions: idList }
        );
        return res.status(200).json({ status: "success", data: result });
      } else {
        throw new Error("There is no any session under this meeting ID");
      }
    } else {
      throw new Error("There is no Meeting Id passed");
    }
  } catch (err) {
    return res.status(401).json({ status: "fail", message: err.message });
  }
};
const sleep = (waitTimeInMs) =>
  new Promise((resolve) => setTimeout(resolve, waitTimeInMs));

reportController.joinedParticipant = async (req, res, next) => {
  try {
    if (
      meetingStartTime.isBefore(
        moment(req.body.payload.participant.join_time).add(10, "minutes")
      )
    ) {
      studentsOnTime.push(req.body.payload.object);
      return res.status(200).json({ status: "success", data: studentsOnTime });
    }
    return res.status(200).json({ status: "success", data: "out of time" });
  } catch (err) {
    return res.status(401).json({ status: "fail", message: err.message });
  }
};

reportController.getCurrentParticipant = async (req, res, next) => {
  try {
    if (req.body.payload.object.id) {
      meetingStartTime = moment(req.body.payload.object.start_time);

      sleep(10000).then(async () => {
        // This will execute 10 seconds from now

        return res.status(200).json({ status: "success", data: "" });
      });
    }
  } catch (err) {
    return res.status(401).json({ status: "fail", message: err.message });
  }
};
module.exports = reportController;
