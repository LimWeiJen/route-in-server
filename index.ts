import { collection, getDocs, getDoc, setDoc, doc } from "firebase/firestore";
import { auth, db } from './firebase';
import { signInAnonymously } from "@firebase/auth";
import { User } from './interfaces';
import express from 'express'

const app = express();

const updateUsersData = async () => {
  const usersDoc = await getDocs(collection(db, 'users'));
  const users: Array<User> = [];
  const userIds: Array<string> = [];
  const todaysDay = new Date().getDay();

  usersDoc.forEach(user => {
    userIds.push(user.id);
    users.push(user.data());
  })


  users.forEach(async (user, i) => {
    let totalTaskCompleted = 0;
    let totalTasks = 0;

    user.taskGroups.forEach((taskGroup: any) => {
      const taskGroupAppearanceDay = taskGroup.dayOfAppearance.flatMap((bool, index) => bool ? index : []);
      if (taskGroupAppearanceDay.includes(todaysDay)) {
        taskGroup.tasks.forEach(task => {
          if (task.status !== 'ignored') {
            totalTasks++;
            task.totalDay++;
            if (task.status === 'checked') {
              task.totalCompletionDay++;
              totalTaskCompleted++;
            }
          }
          task.status = 'unchecked';
        })
      }
      taskGroup.tasks.forEach(task => {
        task.status = 'unchecked';
      })
    })

    if (totalTasks === 0 && totalTaskCompleted === 0) user.analytics.completionRateByDay.push(100);
    else {
      if (totalTasks === 0) totalTasks = 1;
      user.analytics.completionRateByDay.push(totalTaskCompleted / totalTasks * 100);
    }

    user.lastLogInDay = diffBtwDates(new Date(user.analytics.dateOfCreation), new Date());

    await setDoc(doc(db, 'users', userIds[i]), user)
  })
};

const diffBtwDates = (date1: Date, date2: Date) => {
  if (!date1) return 0;
  const diff = Math.abs(date2.getTime() - new Date(date1).getTime());
  return Math.ceil(diff / (1000 * 3600 * 24));
}

setInterval(async () => {
  signInAnonymously(auth).then(() => {
    console.log('signed in');
  }).catch((err) => {
    console.error(err);
  });
  
  const serverSettingsData = await getDoc(doc(db, 'admin', 'serverSettings'));
  const updatedUserData = serverSettingsData!.data()!.updatedUserData;

  console.log(updatedUserData);
  
  // if it is time to update user data
  if (new Date().getUTCHours() === 16 && !updatedUserData) {
    updateUsersData().then(() => {
      console.log('success')
      setDoc(doc(db, 'admin', 'serverSettings'), {updatedUserData : true});
    })
  }
  if (new Date().getUTCHours() !== 16) 
    setDoc(doc(db, 'admin', 'serverSettings'), {updatedUserData : false});
}, 6000);

app.get('/', (req, res) => res.send('hello world'))

app.listen(3000, () => console.log('server running'))

