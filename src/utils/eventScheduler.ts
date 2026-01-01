import { google } from "googleapis";


export function scheduleEventInGoogleCalender(eventDetails: any, oAuthClient: any){
    const calender = google.calendar({
        version:"v3",
        auth: oAuthClient
    });

    return new Promise((resolve, reject) => {
        calender.events.insert({
            calendarId:"primary",
            requestBody: eventDetails
        }, (err:any, res:any) => {
            if(err){
                reject(err);
            }
            else{
                resolve(res?.data);
            }
        })
    })
}
